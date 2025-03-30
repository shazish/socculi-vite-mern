import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Button, Nav } from "react-bootstrap"
import { Loader2, Trophy } from "lucide-react"
import MatchListLine from "./matchListLine";
import { calculatePredictionScore } from '../../utils/scoring';
import { useAuthStatus } from "../../utils/authStatus";

export default function MatchListRender({
  vsop = false,
  matchList,
  renderedMatchDay,
  existingSubmissions,
  existingOpSubmissions,
  broadcastSubmissionToParent,
}: {
  vsop?: boolean
  matchList: any
  renderedMatchDay: number
  existingSubmissions: any
  existingOpSubmissions: any
  broadcastSubmissionToParent: (data: any) => Promise<boolean>
}) {
  const [formIsDirty, setFormIsDirty] = useState(false)
  const [formIsValid, setFormIsValid] = useState(false)
  const [submitInProgress, setSubmitInProgress] = useState(false)
  const [existingSubmissionsObj, setExistingSubmissionsObj] = useState<Record<string, string>>({})
  const [existingOpSubmissionsObj, setExistingOpSubmissionsObj] = useState<Record<string, string>>({})
  const [existingTimestampsObj, setExistingTimestampsObj] = useState<Record<string, string>>({})
  const [existingImpactsObj, setExistingImpactsObj] = useState<Record<string, string>>({})
  const [changedLines, setChangedLines] = useState<Set<number>>(new Set())

  const allFinished = matchList.every((matchLine: any) => matchLine.status === "FINISHED")
  let isLoggedIn = useAuthStatus();
  function submissionDeadlineStatus(matchDate: string): string {
    if (Date.now() - new Date(matchDate).getTime() > 3600000) return "closed"
    if (Date.now() - new Date(matchDate).getTime() < 0) return "open"
    return "closesSoon"
  }

  function handleChildChange(result: number | null, isHome: boolean, index: number) {
    const newSubmissions = { ...existingSubmissionsObj }

    if (isHome) {
      newSubmissions[`home-input-${index}`] = result?.toString() ?? ""
    } else {
      newSubmissions[`away-input-${index}`] = result?.toString() ?? ""
    }

    // Track which lines have been changed by the user in this session
    setChangedLines((prev) => {
      const newSet = new Set(prev)
      newSet.add(index)
      return newSet
    })

    const inputs = document.forms.namedItem("predictionForm")?.querySelectorAll("input") as NodeListOf<HTMLInputElement>

    const isValid = Array.from(inputs).reduce((valid, input, index, arr) => {
      // Skip hidden inputs and timestamps
      if (input.type === "hidden") return valid

      const value = input.value.trim()

      // If we're on an odd-indexed input, skip (we'll process pairs together)
      if (index % 2 !== 0) return valid

      // Get the related input (assume inputs are in pairs: home, away)
      const relatedInput = arr[index + 1]
      const relatedValue = relatedInput?.value.trim() || ""

      // Check if both inputs have values or both are empty
      const bothHaveValues = value !== "" && relatedValue !== ""
      const bothEmpty = value === "" && relatedValue === ""

      // Valid if both have values or both are empty
      return valid && (bothHaveValues || bothEmpty)
    }, true)

    setFormIsValid(isValid)
    setFormIsDirty(true)

    // Set state with the new objects
    setExistingSubmissionsObj(newSubmissions)
  }

  function calcImpact(submitTime: number, matchStart: number): number {
    const delta = submitTime - matchStart
    if (delta < 0) return 2
    if (delta < 2700000) return ((2700000 - delta) / 2700000) * 2
    if (delta > 2700000 && delta < 3600000) return 1
    else return 0 // should not be happening
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitInProgress(true)
    e.preventDefault()

    // Current timestamp for the submission
    const currentTimestamp = new Date().getTime()

    const formData = new FormData(e.currentTarget)
    formData.append("renderedMatchDay", renderedMatchDay.toString())

    // Add timestamp for each match line
    matchList.forEach((_: any, index: any) => {
      // If this line was changed during this session, use current timestamp
      // Otherwise, use existing timestamp or current timestamp if none exists
      const timestamp = changedLines.has(index)
        ? currentTimestamp
        : existingTimestampsObj[`timestamp-${index}`] || currentTimestamp

      const impact = changedLines.has(index)
        ? calcImpact(currentTimestamp, new Date(matchList[index].utcDate).getTime())
        : existingImpactsObj[`impact-${index}`] || -1

      formData.append(`timestamp-${index}`, timestamp.toString())
      formData.append(`impact-${index}`, impact.toString())
    })

    const result = broadcastSubmissionToParent(convertFormToString(formData))

    result
      .then(() => {
        setSubmitInProgress(false)
        setFormIsDirty(false)
        // Reset changed lines after successful submission
        setChangedLines(new Set())
      })
      .catch((err) => {
        console.error("handleSubmit error", err)
        setSubmitInProgress(false)
        setFormIsDirty(true)
      })
  }

  function convertFormToString(formData: FormData) {
    const formDataString = Array.from(formData.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
      .join("&")
    return formDataString
  }

  function getSubmitButtonText() {
    const atLeastOneSubmittableMatch = matchList.some(
      (matchLine: any) => submissionDeadlineStatus(matchLine["utcDate"]) !== "closed",
    )

    if (!atLeastOneSubmittableMatch) {
      return "No matches to submit"
    } else if (localStorage.getItem("socculi_user_email")) {
      // logged in
      return "Submit Predictions"
    }
    return "Login to Submit"
  }

  const convertStringToObj = useCallback((formDataString: string): any => {
    const formDataObj: any = {}

    // Handle empty string case
    if (!formDataString) {
      return formDataObj
    }

    // Split the string by '&' to get key-value pairs
    const pairs = formDataString.split("&")

    // Process each key-value pair
    pairs.forEach((pair) => {
      // Split pair by '=' to separate key and value
      const [key, value] = pair.split("=").map(decodeURIComponent)

      // Only add if both key and value exist
      if (key && value !== undefined) {
        formDataObj[key] = value
      }
    })

    return formDataObj
  }, [])

  useEffect(() => {
    setExistingSubmissionsObj(convertStringToObj(existingSubmissions))
    setExistingOpSubmissionsObj(convertStringToObj(existingOpSubmissions))

    // Extract any timestamps from existing submissions
    const existingData = convertStringToObj(existingSubmissions)
    const timestamps: Record<string, string> = {}
    const impacts: Record<string, string> = {}

    Object.keys(existingData).forEach((key) => {
      if (key.startsWith("timestamp-")) {
        timestamps[key] = existingData[key]
      }
      if (key.startsWith("impact-")) {
        impacts[key] = existingData[key]
      }
    })

    setExistingTimestampsObj(timestamps)
    setExistingImpactsObj(impacts)
  }, [convertStringToObj, existingSubmissions, existingOpSubmissions])

  function calculateTotalScore(matchList: any[], submissionsObj: Record<string, string>): number {
    return matchList.reduce((total, matchLine, index) => {
      const home = submissionsObj[`home-input-${index}`];
      const away = submissionsObj[`away-input-${index}`];

      if (!home || !away) return total;

      const score = calculatePredictionScore(Number(home), Number(away), matchLine);
      const impact = Number(existingImpactsObj[`impact-${index}`] || 1);
      return total + (score * impact);
    }, 0);
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent">
            Week {renderedMatchDay}
          </span>
        </h1>

        {!vsop && !allFinished && (
          <Button
            type="submit"
            form="predictionForm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!formIsValid || !formIsDirty || !isLoggedIn}
          >
            {submitInProgress ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {getSubmitButtonText()}
          </Button>
        )}
      </div>

      {!vsop && allFinished && (
        <Nav.Link
          href="/vsop"
          className="block w-full mb-6 p-4 bg-gradient-to-r from-green-100 to-green-50 border border-indigo-100 rounded-lg text-center transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            <span className="text-green-700 font-medium">
              See how you performed compared to OP on Week {renderedMatchDay}!
            </span>
          </div>
        </Nav.Link>
      )}

      {vsop && (
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div className="p-2 bg-gray-50 rounded-lg font-medium text-gray-700">OP Predictions</div>
          <div className="p-2 bg-indigo-50 rounded-lg font-medium text-indigo-700">Your Predictions</div>
        </div>
      )}

      {allFinished && (
        <div className="mt-6 mb-3 p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100">
          <div className="flex justify-between items-center">
            {vsop ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">OP Total:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {calculateTotalScore(matchList, existingOpSubmissionsObj).toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Your Total:</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {calculateTotalScore(matchList, existingSubmissionsObj).toFixed(1)}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Your Total Score:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {calculateTotalScore(matchList, existingSubmissionsObj).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}


      <form id="predictionForm" name="predictionForm" onSubmit={handleSubmit}>
        <div className="space-y-1">
          {matchList.map((matchLine: any, index: number) => (
            <MatchListLine
              key={index}
              index={index}
              matchLine={matchLine}
              homePrediction={existingSubmissionsObj?.[`home-input-${index}`]}
              awayPrediction={existingSubmissionsObj?.[`away-input-${index}`]}
              homeOpPrediction={existingOpSubmissionsObj?.[`home-input-${index}`]}
              awayOpPrediction={existingOpSubmissionsObj?.[`away-input-${index}`]}
              predictionImpact={existingImpactsObj?.[`impact-${index}`]}
              submissionDeadlineStatus={submissionDeadlineStatus(matchLine["utcDate"])}
              broadcastChangeToParent={(a, b, i) => handleChildChange(a, b, i)}
              vsop={vsop}
            />
          ))}
        </div>
      </form>
    </div>
  )
}


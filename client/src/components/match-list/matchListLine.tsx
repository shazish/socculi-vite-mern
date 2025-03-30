import { useEffect, useState } from "react"
import { Clock, Trophy } from "lucide-react"
import { calculatePredictionScore } from '../../utils/scoring';
import { useAuthStatus } from "../../utils/authStatus";

export default function MatchListLine({
  index,
  matchLine,
  submissionDeadlineStatus,
  homePrediction,
  awayPrediction,
  homeOpPrediction,
  awayOpPrediction,
  predictionImpact,
  vsop = false,
  broadcastChangeToParent,
}: {
  index: number
  matchLine: any
  submissionDeadlineStatus: string
  homePrediction?: string | null
  awayPrediction?: string | null
  homeOpPrediction?: string | null
  awayOpPrediction?: string | null
  predictionImpact?: string
  vsop?: boolean
  broadcastChangeToParent: (value: number | null, isHome: boolean, index: number) => void
}) {
  const [localHome, setLocalHome] = useState(homePrediction || "")
  const [localAway, setLocalAway] = useState(awayPrediction || "")
  let { isLoggedIn } = useAuthStatus()

  useEffect(() => {
    setLocalHome(homePrediction || "")
    setLocalAway(awayPrediction || "")
  }, [homePrediction, awayPrediction])

  const showOPPrediction = vsop
  const showTeamName = !vsop

  // Improved handle change function to enforce "both or neither" rule
  function handleChange(value: string, isHome: boolean) {
    // Update the local state for the current field
    if (isHome) {
      setLocalHome(value)
    } else {
      setLocalAway(value)
    }

    // Get current values for validation
    const homeValue = isHome ? value : localHome
    const awayValue = isHome ? localAway : value

    // Apply the "both or neither" rule
    if (value !== "") {
      // This field has a value
      if (isHome) {
        // Home field has value, ensure away also has value
        if (awayValue === "") {
          setLocalAway("0")
          broadcastChangeToParent(0, false, index)
        }
        broadcastChangeToParent(Number.parseInt(value) || 0, true, index)
      } else {
        // Away field has value, ensure home also has value
        if (homeValue === "") {
          setLocalHome("0")
          broadcastChangeToParent(0, true, index)
        }
        broadcastChangeToParent(Number.parseInt(value) || 0, false, index)
      }
    } else {
      // This field is empty
      if (isHome) {
        // Home field is empty, clear away too if it has value
        if (awayValue !== "") {
          setLocalAway("")
          broadcastChangeToParent(null, false, index)
        }
        broadcastChangeToParent(null, true, index)
      } else {
        // Away field is empty, clear home too if it has value
        if (homeValue !== "") {
          setLocalHome("")
          broadcastChangeToParent(null, true, index)
        }
        broadcastChangeToParent(null, false, index)
      }
    }
  }

  function predicationScore(home: any, away: any): number {
    return calculatePredictionScore(Number(home), Number(away), matchLine);
  }

  function timeLeftToStartFormatted(): string {
    const timeLeft = new Date(matchLine["utcDate"]).getTime() - Date.now()
    if (timeLeft < 3600000)
      return `Starts in ` + Math.floor(timeLeft / 60000) + ` minute(s)` // less than an hour
    else if (timeLeft < 86400000) return `Starts in ` + Math.floor(timeLeft / 3600000) + ` hour(s)` // less than a day
    return `Starts at ${new Date(matchLine.utcDate).toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    })}`
  }

  // Format the impact value
  function formatImpact(impact: string | undefined): any {
    if (!impact) return { percentage: "0", numeric: "0.0" }
    const numericImpact = Number.parseFloat(impact)
    return {
      percentage: (numericImpact * 50).toFixed(0),
      numeric: numericImpact.toFixed(1),
    }
  }

  const predictionScoreUser = predicationScore(homePrediction, awayPrediction)
  const predictionScoreOp = predicationScore(homeOpPrediction, awayOpPrediction)
  const formattedImpact = formatImpact(predictionImpact)

  return (
    <div className="rounded-lg border border-gray-100 shadow-sm mb-3 overflow-hidden transition-all hover:shadow-md">
      {/* Match header */}
      <div className="flex items-center p-3 bg-gradient-to-r from-gray-50 to-white">
        {showOPPrediction && (
          <div className="flex-1 text-center">
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                predictionScoreOp > 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
              }`}
            >
              {homeOpPrediction} - {awayOpPrediction}
              {predictionScoreOp > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs ml-1">
                  +{predictionScoreOp}
                </span>
              )}
            </div>
          </div>
        )}

        {showTeamName && (
          <div className="hidden md:block flex-1 font-medium text-gray-700 truncate">{matchLine.homeTeam.name}</div>
        )}

        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <img
                className="w-10 h-10 object-contain"
                alt={matchLine.homeTeam.shortName + " crest"}
                src={"./public/crest/" + matchLine.homeTeam.tla + ".png"}
              />
            </div>

            <div className="flex flex-col items-center">
              {submissionDeadlineStatus !== "open" ? (
                <div className="text-xl font-bold">
                  {matchLine.score.fullTime.home} - {matchLine.score.fullTime.away}
                </div>
              ) : (
                <div className="text-xl font-bold text-gray-300">vs</div>
              )}

              <div className="flex items-center gap-1 mt-1">
                {matchLine.status === "IN_PLAY" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                    LIVE
                  </span>
                ) : submissionDeadlineStatus === "open" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {timeLeftToStartFormatted()}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">FINISHED</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start">
              <img
                className="w-10 h-10 object-contain"
                alt={matchLine.awayTeam.shortName + " crest"}
                src={"./public/crest/" + matchLine.awayTeam.tla + ".png"}
              />
            </div>
          </div>
        </div>

        {showTeamName && (
          <div className="hidden md:block flex-1 font-medium text-gray-700 truncate">
            {matchLine.awayTeam.name}
          </div>
        )}

        {showOPPrediction && (
          <div className="flex-1 text-center">
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                predictionScoreUser > 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
              }`}
            >
              {homePrediction} - {awayPrediction}
              {predictionScoreUser > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-green-100 text-green-800 rounded-full text-xs ml-1">
                  +{predictionScoreUser}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Warning banner */}
      {submissionDeadlineStatus === "closesSoon" && (
        <div className="bg-amber-50 text-amber-700 text-xs font-medium text-center py-1">CLOSES SOON</div>
      )}

      {/* Prediction section */}
      {!showOPPrediction && (
        <div className="p-3 bg-white flex items-center justify-center">
          {submissionDeadlineStatus === "closed" ? (
            <div className="flex items-center gap-2">
              {homePrediction && awayPrediction ? (
                <>
                  <span className="text-sm text-gray-600">You predicted:</span>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      predictionScoreUser > 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {homePrediction} - {awayPrediction}
                  </div>

                  {predictionImpact && (
                    <div className="relative w-24 h-4 mx-2">
                      <div className="absolute inset-0 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300"
                          style={{ width: `${formattedImpact.percentage}%` }}
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[9px] text-gray-600 font-medium select-none">
                          IMPACT {formattedImpact.numeric}x
                        </span>
                      </div>
                    </div>
                  )}

                  {predictionScoreUser > 0 && (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      <Trophy className="w-3 h-3" />+{predictionScoreUser}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-sm text-gray-500">No prediction made</span>
              )}
            </div>
          ) : isLoggedIn && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Your prediction:</span>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <input
                  className="w-12 h-10 text-center bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  min={0}
                  type="number"
                  name={`home-input-${index}`}
                  value={localHome}
                  onChange={(e) => handleChange(e.target.value, true)}
                />
                <div className="flex items-center justify-center w-8 bg-gray-50 text-gray-400">-</div>
                <input
                  className="w-12 h-10 text-center bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  min={0}
                  type="number"
                  name={`away-input-${index}`}
                  value={localAway}
                  onChange={(e) => handleChange(e.target.value, false)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useCallback, useEffect, useState } from "react";
import Nav from 'react-bootstrap/Nav';
import MatchListLine from "./matchListLine";
// const loadingAnimation = `./public/loadinganimation.svg`;
const loadingAnimation2 = `./public/loadinganimation2.svg`;
export default function MatchListRender({ vsop = false, matchList, renderedMatchDay, existingSubmissions, existingOpSubmissions, broadcastSubmissionToParent }: {
  vsop?: boolean;
  matchList: any;
  renderedMatchDay: number;
  existingSubmissions: any;
  existingOpSubmissions: any;
  broadcastSubmissionToParent: (data: any) => Promise<boolean>;
}) {
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [existingSubmissionsObj, setExistingSubmissionsObj] = useState<Record<string, string>>({});
  const [existingOpSubmissionsObj, setExistingOpSubmissionsObj] = useState<Record<string, string>>({});
  const [existingTimestampsObj, setExistingTimestampsObj] = useState<Record<string, string>>({});
  const [existingImpactsObj, setExistingImpactsObj] = useState<Record<string, string>>({});
  const [changedLines, setChangedLines] = useState<Set<number>>(new Set());
  
  console.log("--MatchListRender rendered with existingSubmissions---------:", existingSubmissions);

  const allFinished = matchList.every((matchLine: any) => matchLine.status === "FINISHED");

  function submissionDeadlineStatus(matchDate: string): string {
    // Less than an hour since match started, means second half has not started
    // 0: match is in 2nd half, 1: 2nd half starts soon, 2: match is in the future
    // return 2;
    if (Date.now() - new Date(matchDate).getTime() > 3600000) return "closed";
    if (Date.now() - new Date(matchDate).getTime() < 0) return "open";
    return "closesSoon";
  }

  function handleChildChange(result: number | null, isHome: boolean, index: number) {
    const newSubmissions = { ...existingSubmissionsObj };
    
    if (isHome) {
      newSubmissions[`home-input-${index}`] = result?.toString() ?? '';
    } else {
      newSubmissions[`away-input-${index}`] = result?.toString() ?? '';
    }

    // Track which lines have been changed by the user in this session
    setChangedLines(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });

    const inputs = document.forms.namedItem('predictionForm')?.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

    const isValid = Array.from(inputs).reduce((valid, input, index, arr) => {
      // Skip hidden inputs and timestamps
      if (input.type === 'hidden') return valid;
      
      const value = input.value.trim();
      
      // If we're on an odd-indexed input, skip (we'll process pairs together)
      if (index % 2 !== 0) return valid;
      
      // Get the related input (assume inputs are in pairs: home, away)
      const relatedInput = arr[index + 1];
      const relatedValue = relatedInput?.value.trim() || '';
      
      console.log('value, relatedValue', value, relatedValue);
      // Check if both inputs have values or both are empty
      const bothHaveValues = value !== '' && relatedValue !== '';
      const bothEmpty = value === '' && relatedValue === '';
      
      // Valid if both have values or both are empty
      return valid && (bothHaveValues || bothEmpty);
    }, true);

    setFormIsValid(isValid);
    setFormIsDirty(true);

    // Set state with the new objects
    setExistingSubmissionsObj(newSubmissions);
    
    return;
  }

  function calcImpact(submitTime: number, matchStart: number): number {
    let delta = submitTime - matchStart; 
    if (delta < 0) return 2; 
    if (delta < 2700000) return (( 2700000 - delta) / 2700000) * 2;
    if (delta > 2700000 && delta < 3600000) return 1;
    else return 0; // should not be happening
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitInProgress(true);
    e.preventDefault();
    
    // Current timestamp for the submission
    const currentTimestamp = new Date().getTime();
    
    const formData = new FormData(e.currentTarget);
    formData.append("renderedMatchDay", renderedMatchDay.toString());
    
    // Add timestamp for each match line
    matchList.forEach((_:any, index: any) => {
      // If this line was changed during this session, use current timestamp
      // Otherwise, use existing timestamp or current timestamp if none exists
      const timestamp = changedLines.has(index) 
        ? currentTimestamp 
        : (existingTimestampsObj[`timestamp-${index}`] || currentTimestamp);
      
      const impact = changedLines.has(index)
        ? calcImpact(currentTimestamp, new Date(matchList[index].utcDate).getTime()) 
        : (existingImpactsObj[`impact-${index}`] || -1);
        
      formData.append(`timestamp-${index}`, timestamp.toString());
      formData.append(`impact-${index}`, impact.toString());
    });
    const result = broadcastSubmissionToParent(convertFormToString(formData));
    console.log('handleSubmit result', convertFormToString(formData));
    result.then((res) => {
      setSubmitInProgress(false);
      setFormIsDirty(false);
      // Reset changed lines after successful submission
      setChangedLines(new Set());
      console.log('broadcastSubmissionToParent result', res);
    }).catch((err) => {
      setSubmitInProgress(false);
      setFormIsDirty(true);
      console.log('broadcastSubmissionToParent error', err);
    });
  }

  function convertFormToString(formData: FormData) {
    const formDataString = Array.from(formData.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
      .join('&');
    return formDataString;
  }

  function setSubmitBtnText() {
    const atLeastOneSubmittableMatch = matchList.some((matchLine: any) => submissionDeadlineStatus(matchLine["utcDate"]) !== "closed");
    if (!atLeastOneSubmittableMatch) {
      return "NO MATCHES TO SUBMIT";
    } else if (localStorage.getItem("socculi_user_email")) { // logged in
      return "S U B M I T";
    }
    return "LOGIN TO SUBMIT";
  }

  const convertStringToObj = useCallback((formDataString: string): any => {
    let formDataObj: any = {};

    // Handle empty string case
    if (!formDataString) {
      return formDataObj;
    }

    console.log('formDataString::: ', formDataString);
    // Split the string by '&' to get key-value pairs
    const pairs = formDataString.split('&');

    // Process each key-value pair
    pairs.forEach(pair => {
      // Split pair by '=' to separate key and value
      const [key, value] = pair.split('=').map(decodeURIComponent);

      // Only add if both key and value exist
      if (key && value !== undefined) {
        formDataObj[key] = value;
      }
    });
    // console.log('formData', formDataObj);
    return formDataObj;
  }, [])

  useEffect(() => {
    setExistingSubmissionsObj(convertStringToObj(existingSubmissions));
    setExistingOpSubmissionsObj(convertStringToObj(existingOpSubmissions));
    
    // Extract any timestamps from existing submissions
    const existingData = convertStringToObj(existingSubmissions);
    const timestamps: Record<string, string> = {};
    const impacts: Record<string, string> = {};
    
    Object.keys(existingData).forEach(key => {
      if (key.startsWith('timestamp-')) {
        timestamps[key] = existingData[key];
      }
      if (key.startsWith('impact-')) {
        impacts[key] = existingData[key];
      }

    });
    
    setExistingTimestampsObj(timestamps);
    setExistingImpactsObj(impacts);
  }, [convertStringToObj, existingSubmissions, existingOpSubmissions]);

  return (
    <div className="match-list-renderer fade-in w-full max-w-4xl p-3 mx-auto">
      <h1 className="text-2xl font-bold my-3">Week {renderedMatchDay}</h1>

      {(vsop) && (
        <div className="flex flex-row justify-content-around">
          <p>OP</p>
          <p>You</p>
        </div>)}
      <form className="w-full" name="predictionForm" onSubmit={handleSubmit}>
        {(!vsop && !allFinished) && (
          <button type="submit" className="btn submit-btn btn-dark w-50 position-sticky left-0 right-0 top-0 lh-1"
            disabled={!formIsValid || !formIsDirty || !localStorage.getItem("socculi_user_email")}>
            {!submitInProgress &&
              <span className="text-xs">{setSubmitBtnText()}
              </span>}
            {submitInProgress &&
              <div className="flex flex-row">
                <img src={loadingAnimation2} className="flex-1 p-0 m-0 w-10 h-10" alt="Animation logo" />
              </div>}
          </button>
        )}

        {(!vsop && allFinished) &&
          <Nav.Link href='/vsop'>
            <p className="vsop-btn text-md m-3 py-4 text-center">See how you performed compared to OP on Week {renderedMatchDay}!</p>            
          </Nav.Link>
        }

        <div className="flex p-2 flex-col gap-4">
          {/* Match List */}
          <div className="flex flex-col gap-2 m-2">
            {matchList.map((matchLine: any, index: number) => (
              <div key={index}>
                <MatchListLine
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
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
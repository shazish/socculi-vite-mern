/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useCallback, useEffect, useState } from "react";

import MatchListLine from "./matchListLine";
export default function MatchListRender({ matchList, renderedMatchDay, existingSubmissions, broadcastSubmissionToParent }: {
  matchList: any;
  renderedMatchDay: number;
  existingSubmissions: any;
  broadcastSubmissionToParent: (data: any) => void;
}) {

  const [existingSubmissionsObj, setExistingSubmissionsObj] = useState<Record<string, string>>({});
  console.log("MatchListRender rendered with existingSubmissions:", existingSubmissions);
  const [formIsDirty, setFormIsDirty] = useState(false);
  // let formIsDirty = false;

  function isSubmissionAllowed(matchDate: string): boolean {
    // Less than an hour since match started, means second half has not started
    return Date.now() - new Date(matchDate).getTime() < 3600000;
  }

  function handleChildChange(home: number | null, away: number | null) {
    setFormIsDirty(true);
    console.log('>home>away>>>', home, away)
    return;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormIsDirty(false);
    const formData = new FormData(e.currentTarget);
    formData.append("renderedMatchDay", renderedMatchDay.toString())
    // const formValues = Object.fromEntries(formData);
    // console.log("formValues?!", formValues);
    broadcastSubmissionToParent(convertFormToString(formData));
  }

  function convertFormToString(formData: FormData) {
    const formDataString = Array.from(formData.entries())
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
      .join('&');
    // console.log('formDataString', formDataString);
    return formDataString;
  }


  const convertStringToForm = useCallback((formDataString: string): any => {
    let formDataObj: any = {};

    // Handle empty string case
    if (!formDataString) {
      return formDataObj;
    }

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
    console.log('existingSubmissions in useEffect', existingSubmissions);
    setExistingSubmissionsObj(convertStringToForm(existingSubmissions));
    console.log('existingSubmissionsForm in useEffect', existingSubmissionsObj);
  }, [convertStringToForm, existingSubmissions]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Week {renderedMatchDay}</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-row items-center font-semibold">
            <div className="flex-1 text-left">Home</div>
            <div className="w-32 text-center">Result</div>
            <div className="flex-1 text-right">Away</div>
          </div>

{ 
}
          {/* Match List */}
          <div className="flex flex-col gap-2">
            {matchList.map((matchLine: any, index: number) => (
              <div key={index}>
                <MatchListLine
                  index={index}
                  matchLine={matchLine}
                  homePrediction={existingSubmissionsObj?.[`home-input-${index}`]}
                  awayPrediction={existingSubmissionsObj?.[`away-input-${index}`]}
                  userSubmissionAllowed={isSubmissionAllowed(matchLine["utcDate"])}
                  broadcastChangeToParent={(a, b) => handleChildChange(a, b)}
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={!formIsDirty || !isSubmissionAllowed}>Save</button>
          {!isSubmissionAllowed && <p>Sorry, the time for submission has passed.</p>}
          {!formIsDirty && <p>No match predictions entered.</p>}

        </div>
      </form>
    </div>
  );

}
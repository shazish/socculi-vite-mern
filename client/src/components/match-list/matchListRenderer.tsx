/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useState } from "react";

import MatchListLine from "./matchListLine";
export default function MatchListRender({ matchList, renderedMatchDay, broadcastSubmissionToParent }: {
  matchList: any;
  renderedMatchDay: number;
  broadcastSubmissionToParent: (data: any) => void;
}) {
  
  const [formIsDirty, setFormIsDirty] = useState(false);
  // let formIsDirty = false;

  function isSubmissionAllowed(matchDate: string): boolean {
    // Less than an hour since match started, means second half has not started
    return Date.now() - new Date(matchDate).getTime() < 3600000;
  }

  function handleChildChange(home: number | null, away: number | null) {
    setFormIsDirty(true);
    console.log('>>>>>', home, away)
    return;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormIsDirty(false);
    const formData = new FormData(e.currentTarget);
    formData.append("renderedMatchDay", renderedMatchDay.toString())
    // const formValues = Object.fromEntries(formData);
    // console.log("formValues?!", formValues);
    broadcastSubmissionToParent( convertFormToString(formData) );
  }

  function convertFormToString(formData: FormData) {
    const formDataString = Array.from(formData.entries())
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`)
    .join('&');

    console.log('formDataString', formDataString);

    return formDataString;
  }

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
          
          {/* Match List */}
          <div className="flex flex-col gap-2">
            {matchList.map((matchLine: any, index: number) => (
              <div key={index}>
                <MatchListLine 
                  index={index}
                  matchLine={matchLine}
                  userSubmissionAllowed={ isSubmissionAllowed( matchLine["utcDate"] ) }
                  broadcastChangeToParent={(a,b) => handleChildChange(a,b)}                 
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={!formIsDirty || !isSubmissionAllowed}>Save</button>
          { !isSubmissionAllowed && <p>Sorry, the time for submission has passed.</p> }
          { !formIsDirty && <p>No match predictions entered.</p> }

        </div>
      </form>
    </div>
  );

}
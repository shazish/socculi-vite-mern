/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useCallback, useEffect, useState } from "react";
import MatchListLine from "./matchListLine";
// const loadingAnimation = `./public/loadinganimation.svg`;
const loadingAnimation2 = `./public/loadinganimation2.svg`;
export default function MatchListRender({ matchList, renderedMatchDay, existingSubmissions, broadcastSubmissionToParent }: {
  matchList: any;
  renderedMatchDay: number;
  existingSubmissions: any;
  broadcastSubmissionToParent: (data: any) => Promise<boolean>;
}) {
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [formIsValid, setFormIsValid] = useState(false);
  const [submitInProgress, setSubmitInProgress] = useState(false);
  const [existingSubmissionsObj, setExistingSubmissionsObj] = useState<Record<string, string>>({});
  console.log("--MatchListRender rendered with existingSubmissions---------:", existingSubmissions);

  function submissionDeadlineStatus(matchDate: string): number {
    // Less than an hour since match started, means second half has not started
    // 0: match is in 2nd half, 1: 2nd half starts soon, 2: match is in the future
    // return 2;
    if (Date.now() - new Date(matchDate).getTime() > 3600000) return 0;
    if (Date.now() - new Date(matchDate).getTime() < 0) return 2;
    return 1;
  }

  function handleChildChange(result: number | null, isHome: boolean, index: number) {

    const newSubmissions = { ...existingSubmissionsObj };
    if (isHome) {
      newSubmissions[`home-input-${index}`] = result?.toString() ?? '';
    } else {
      newSubmissions[`away-input-${index}`] = result?.toString() ?? '';
    }

    const inputs = document.forms.namedItem('predictionForm')?.querySelectorAll('input[required]') as NodeListOf<HTMLInputElement>;
    // .querySelectorAll('input[required]');

    const isValid = Array.from(inputs).every(input => {
      const value = input.value.trim();
      return value !== '' && parseInt(value) >= 0;
    });

    setFormIsValid(isValid);
    setFormIsDirty(true);

    // Set state with the new object
    setExistingSubmissionsObj(newSubmissions);
    console.log('handleChildChange: result, isHome, index, formIsValid, formIsDirty', result, isHome, index, formIsValid, formIsDirty);
    return;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setSubmitInProgress(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("renderedMatchDay", renderedMatchDay.toString());

    const result = broadcastSubmissionToParent(convertFormToString(formData));
    result.then((res) => {
      setSubmitInProgress(false);
      setFormIsDirty(false);
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
  }, [convertStringToObj, existingSubmissions]);

  return (
    <div className="match-list-renderer fade-in w-full max-w-4xl p-3 mx-auto">
      <h1 className="text-2xl font-bold my-3">Week {renderedMatchDay}</h1>
      <form className="w-full" name="predictionForm" onSubmit={handleSubmit}>
        <button type="submit" className="btn submit-btn btn-dark w-50 position-sticky left-0 right-0 top-0"
          disabled={!formIsValid || !formIsDirty || !localStorage.getItem("socculi_user_email")}>
          {!submitInProgress &&
            <span>{localStorage.getItem("socculi_user_email")
              ? "S U B M I T"
              : "LOGIN TO SUBMIT"}
            </span>}
          {submitInProgress &&
            <div className="flex flex-row">

              <img src={loadingAnimation2} className="flex-1 p-0 m-0 w-10 h-10" alt="Animation logo" />
            </div>}
        </button>
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
                  submissionDeadlineStatus={submissionDeadlineStatus(matchLine["utcDate"])}
                  broadcastChangeToParent={(a, b, i) => handleChildChange(a, b, i)}
                />
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );

}
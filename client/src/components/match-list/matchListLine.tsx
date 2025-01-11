import "./MatchListLine.scss";

export default function MatchListLine({
  index,
  matchLine,
  submissionDeadlineStatus,
  broadcastChangeToParent,
  homePrediction,
  awayPrediction
}: {
  index: number,
  matchLine: any;
  submissionDeadlineStatus: number;
  homePrediction?: string | null;
  awayPrediction?: string | null;
  broadcastChangeToParent: (value: number | null, isHome: boolean, index: number) => void;
}) {

  function handleChange(value: string | null, isHome: boolean) {
    console.log('handleChange', value, isHome);
    if (isHome) {
      broadcastChangeToParent(value ? parseInt(value) : null, true, index);
    } else {
      broadcastChangeToParent(value ? parseInt(value) : null, false, index);
    }
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-row items-center py-2">
        <div className="team flex-1">
          <div>{matchLine["homeTeam"]?.["name"]}</div>
        </div>
        <div
          className={`flex-1 scoreline
            ${matchLine["status"] === "IN_PLAY" ? "scoreline-inplay" : ""}
          `}
        >
          <img className="crest" alt="Home team crest" src={matchLine["homeTeam"]?.["crest"]} />

          <div className="flex flex-col">
            <div>
              {matchLine["score"]?.["winner"] !== null &&
                `${matchLine["score"]?.["fullTime"]["home"]} - ${matchLine["score"]?.["fullTime"]["away"]}`}

            </div>
            <div className="game-status text-xs">{matchLine["status"] === "IN_PLAY" && 'IN PROGRESS'}</div>
          </div>

          <img className="crest" alt="Away team crest" src={matchLine["awayTeam"]?.["crest"]} />
        </div>
        <div className="team flex-1">
          <span>{matchLine["awayTeam"]?.["name"]}</span>
        </div>
      </div>
      <div className="flex flex-row justify-center">

        {submissionDeadlineStatus == 0 && (
          <>
            {(homePrediction && awayPrediction) &&
              <span className="text-sm self-center m-2">You predicted:&nbsp; {homePrediction} - {awayPrediction} </span>
            }
            {!(homePrediction && awayPrediction) &&
              <span className="text-sm self-center m-2">No prediction made</span>
            }
          </>
        )}

        {submissionDeadlineStatus !== 0 && (
          <div className="flex flex-row justify-center">
            <span className="text-sm self-center">Your prediction:&nbsp; </span>
            <div className="input-container border border-gray-200 m-2">
              <input
                className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min={0}
                type="number"
                name={`home-input-${index}`}
                value={homePrediction || ''}
                onChange={(e) => handleChange(e.target.value, true)}
                required
              />
              -
              <input
                type="number"
                min={0}
                className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={awayPrediction || ''}
                name={`away-input-${index}`}
                onChange={(e) => handleChange(e.target.value, false)}
                required
              />
            </div>
          </div>
        )}
      </div>
      {(submissionDeadlineStatus === 1) && <p className="text-xs">Submission window closes soon!</p>}
    </div>
  );
}
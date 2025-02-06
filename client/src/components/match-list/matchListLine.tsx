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

  function predicationScore(): number {
    if (!homePrediction || !awayPrediction) return 0;
    if (Number(homePrediction) - Number(awayPrediction) === matchLine["score"]?.["fullTime"]["home"] - matchLine["score"]?.["fullTime"]["away"]) {
      if (Number(homePrediction) === matchLine["score"]?.["fullTime"]["home"]) {
        return 3;
      }
      return 2; // covers all tie predictions
    } else {
      if ( (Number(homePrediction) - Number(awayPrediction)) * (matchLine["score"]?.["fullTime"]["home"] - matchLine["score"]?.["fullTime"]["away"]) > 0) {
        return 1;
      }
      return 0;
    }
  }

  return (
    <div className="border-b border-gray-200">
      {/* desktop */}
      <div className="flex items-center py-2 bg-light">
        <div className="team d-none d-lg-block flex-1">
          <div>{matchLine["homeTeam"]?.["name"]}</div>
        </div>
        <div
          className={`flex-1 scoreline
            ${matchLine["status"] === "IN_PLAY" ? "scoreline-inplay" : ""}
          `}
        >
          <img className="crest" alt={matchLine["homeTeam"]?.["shortName"] + " crest"} src={"./public/crest/" + matchLine["homeTeam"]?.["tla"] + ".png"} />

          <div className="flex flex-col">
            <div>
              {matchLine["score"]?.["winner"] !== null &&
                `${matchLine["score"]?.["fullTime"]["home"]} - ${matchLine["score"]?.["fullTime"]["away"]}`}

            </div>
            <div className="game-status text-xs">{matchLine["status"] === "IN_PLAY" && 'IN PROGRESS'}</div>
            <div className="game-status text-xs">{matchLine["status"] === "TIMED" &&
              `Starts at ${new Date(matchLine["utcDate"]).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}`}</div>
          </div>

          <img className="crest" alt={matchLine["awayTeam"]?.["shortName"] + " crest"} src={"./public/crest/" + matchLine["awayTeam"]?.["tla"] + ".png"} />

        </div>
        <div className="team d-none d-lg-block flex-1">
          <span>{matchLine["awayTeam"]?.["name"]}</span>
        </div>
      </div>


      {(submissionDeadlineStatus === 1) && <p className="badge text-bg-warning text-xs">CLOSES SOON</p>}

      <div className="flex flex-row justify-center m-1">
        {submissionDeadlineStatus == 0 && (
          <>
            {(homePrediction && awayPrediction) && (
              <>
                <span className="text-sm self-center my-1 mx-3">You predicted:&nbsp; {homePrediction} - {awayPrediction} </span>
                {(predicationScore() > 0) && <p className="badge text-bg-success align-content-center">+{predicationScore()}</p>}
              </>
            )}
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
    </div>
  );
}
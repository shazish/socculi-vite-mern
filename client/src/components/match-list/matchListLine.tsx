import "./MatchListLine.scss";

export default function MatchListLine({
  index,
  matchLine,
  userSubmissionAllowed,
  broadcastChangeToParent,
  homePrediction,
  awayPrediction
}: {
  index: number,
  matchLine: any;
  userSubmissionAllowed: boolean;
  homePrediction?: string | null;
  awayPrediction?: string | null;
  broadcastChangeToParent: (home: number | null, away: number | null, index: number) => void;
}) {

  function handleChange(value: string | null, isHome: boolean) {
    if (isHome) {
      broadcastChangeToParent(value ? parseInt(value) : null, null, index);
    } else {
      broadcastChangeToParent(null, value ? parseInt(value) : null, index);
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
          {matchLine["score"]?.["winner"] !== null &&
            `${matchLine["score"]?.["fullTime"]["home"]} - ${matchLine["score"]?.["fullTime"]["away"]}`}
          <img className="crest" alt="Away team crest" src={matchLine["awayTeam"]?.["crest"]} />
        </div>
        <div className="team flex-1">
          <span>{matchLine["awayTeam"]?.["name"]}</span>
        </div>
      </div>
      <div className="flex flex-row justify-center">
        <span className="text-xs self-center">Your prediction:&nbsp; </span>
        {!userSubmissionAllowed && (
          <span className="text-xs self-center">{homePrediction} - {awayPrediction}</span>
        )}
        {userSubmissionAllowed && (
          <div className="input-container border border-gray-200">
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
        )}
      </div>
    </div>
  );
}
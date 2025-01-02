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
  broadcastChangeToParent: (home: number | null, away: number | null) => void;
}) {
  let homeDirty: boolean;
  let awayDirty: boolean;
  
  function handleChange(home: number | null, away: number | null) {    
    if (home) homeDirty = true;
    if (away) awayDirty = true;
    // todo: no need to send home and away values to parent, just a boolean
    if (homeDirty && awayDirty) broadcastChangeToParent(home, away); 
  }

  return (
    <div className="border-b border-gray-200">
      <div className="flex flex-row items-center py-2">
        <div className="team flex-1">
          <div>{matchLine["homeTeam"]?.["name"]}</div>
        </div>

        <div
          className={`flex-1 scoreline 
            ${matchLine["status"] == "IN_PLAY" ? "scoreline-inplay" : ""}
          `}
        >
          <img className="crest" src={matchLine["homeTeam"]?.["crest"]}></img>


          {/* Match has ended - draw is inclusive here */}
          {matchLine["score"]?.["winner"] !== null &&
            matchLine["score"]?.["fullTime"]["home"] +
              " - " +
              matchLine["score"]?.["fullTime"]["away"]}

          <img className="crest" src={matchLine["awayTeam"]?.["crest"]}></img>
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
              value={homePrediction?.toString()}
              onChange={(e) => handleChange(Number(e.target.value), null)}
              required
            />
            -
            <input
              type="number"
              min={0}
              className="text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={awayPrediction?.toString()}
              name={`away-input-${index}`}
              onChange={(e) => handleChange(null, Number(e.target.value))}
              required
            />
          </div>
        )}
      </div>
    </div>
  );
}

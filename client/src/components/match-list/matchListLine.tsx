import "./MatchListLine.scss";

export default function MatchListLine({
  index,
  matchLine,
  submissionDeadlineStatus,
  homePrediction,
  awayPrediction,
  homeOpPrediction,
  awayOpPrediction,
  vsop = false,
  broadcastChangeToParent,
}: {
  index: number,
  matchLine: any;
  submissionDeadlineStatus: string;
  homePrediction?: string | null;
  awayPrediction?: string | null;
  homeOpPrediction?: string | null;
  awayOpPrediction?: string | null;
  vsop?: boolean;
  broadcastChangeToParent: (value: number | null, isHome: boolean, index: number) => void;
}) {
  
  let showOPPrediction = false;
  let showTeamName = true;
  if (vsop) {
    showTeamName = false;
    showOPPrediction = true;
  }

  function handleChange(value: string | null, isHome: boolean) {
    console.log('handleChange', value, isHome);
    if (isHome) {
      broadcastChangeToParent(value ? parseInt(value) : null, true, index);
    } else {
      broadcastChangeToParent(value ? parseInt(value) : null, false, index);
    }
  }

  function predicationScore(home: any, away: any): number {
    // console.log('predicationScore', home, away, matchLine.score.fullTime.home, matchLine.score.fullTime.away);
    // console.log(!home , !away , !matchLine.score.fullTime.home , !matchLine.score.fullTime.away);
    home = Number(home);
    away = Number(away);

    if (isNaN(home) || isNaN(away) || isNaN(matchLine.score.fullTime.home) || isNaN(matchLine.score.fullTime.away)) return 0;

    if (home - away === matchLine.score.fullTime.home - matchLine.score.fullTime.away) {
      if (home === matchLine.score.fullTime.home) {
        // console.log('exact match');
        return 3; // covers exact matches
      }
      // console.log('tie prediction');
      return 2; // covers all tie predictions
    } else {
      if ((home - away) * (matchLine.score.fullTime.home - matchLine.score.fullTime.away) > 0) {
        // console.log('correct winner prediction');
        return 1; // covers correct winner predictions
      }
      // console.log('whimpers');
      return 0; // covers whimpers :)
    }
  }

  function timeLeftToStartFormatted(): string {
    let timeLeft = new Date(matchLine["utcDate"]).getTime() - Date.now();
    if (timeLeft < 3600000) return `Starts in ` + Math.floor(timeLeft / 60000) + ` minute(s)`; // less than an hour
    else if (timeLeft < 86400000) return `Starts in ` + Math.floor(timeLeft / 3600000) + ` hour(s)`; // less than a day
    return `Starts at ${new Date(matchLine.utcDate).toLocaleString('en-US', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}`;
  }

  let predictionScoreUser = predicationScore(homePrediction, awayPrediction);
  let predictionScoreOp = predicationScore(homeOpPrediction, awayOpPrediction);

  return (
    <div className="border-b border-gray-200">
      {/* desktop */}
      <div className="flex items-center py-2 bg-light">
        {(showOPPrediction) && <div className="flex-1 large-user-prediction fw-semibold">
          <span className={'mx-3 ' + (predictionScoreOp > 0 && 'text-success') }> {homeOpPrediction} - {awayOpPrediction} </span>
          {(predictionScoreOp > 0) &&
            <p className="badge lh-lg fw-normal text-bg-success align-content-center">+{predictionScoreOp}</p>}
        </div>}
        {(showTeamName) && (
          <div className="team d-none d-lg-block flex-1">
            {matchLine.homeTeam.name}
          </div>
        )}
        <div
          className={`flex-1 scoreline
            ${matchLine["status"] === "IN_PLAY" ? "scoreline-inplay" : ""}
          `}
        >
          <img className="crest" alt={matchLine.homeTeam.shortName + " crest"} src={"./public/crest/" + matchLine.homeTeam.tla + ".png"} />

          <div className="flex flex-col">
          {( submissionDeadlineStatus !== "open") && <div>
                {matchLine.score.fullTime.home} - {matchLine.score.fullTime.away}
            </div>}
            <div className="game-status text-xs">
              {matchLine.status === "IN_PLAY" && 'IN PROGRESS'}
              {(submissionDeadlineStatus === "open") && timeLeftToStartFormatted()}  
            </div>
          </div>

          <img className="crest" alt={matchLine.awayTeam.shortName + " crest"} src={"./public/crest/" + matchLine.awayTeam.tla + ".png"} />
        </div>

        {(showTeamName) && (
          <div className="team d-none d-lg-block flex-1">
            {matchLine.awayTeam.name}
          </div>
        )}

        {(showOPPrediction) && <div className="flex-1 large-user-prediction fw-semibold">
          <span className={'mx-3 ' + (predictionScoreOp > 0 && 'text-success') }> {homePrediction} - {awayPrediction} </span>
          {(predictionScoreUser > 0) &&
            <p className="badge lh-lg fw-normal text-bg-success align-content-center">+{predictionScoreUser}</p>}
        </div>}
      </div>

      {(submissionDeadlineStatus === "closesSoon") && <p className="badge text-bg-warning text-xs">CLOSES SOON</p>}

      {(!showOPPrediction) && <div className="solo-prediction-line flex flex-row justify-center m-1">
        {submissionDeadlineStatus == "closed" && (
          <>
            {(homePrediction && awayPrediction) && (
              <>
                <span className="text-sm self-center my-1 mx-3">You predicted:&nbsp; {homePrediction} - {awayPrediction} </span>
                {(predictionScoreUser > 0) &&
                  <p className="badge text-bg-success align-content-center">+{predictionScoreUser}</p>}
              </>
            )}
            {!(homePrediction && awayPrediction) &&
              <span className="text-sm self-center m-2">No prediction made</span>
            }
          </>
        )}

        {submissionDeadlineStatus !== "closed" && (
          <div className="flex flex-row justify-center">
            <span className="text-sm self-center">Your prediction:&nbsp; </span>
            <div className="input-container border border-gray-200 m-2">
              <input
                className="text-center bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                className="text-center bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={awayPrediction || ''}
                name={`away-input-${index}`}
                onChange={(e) => handleChange(e.target.value, false)}
                required
              />
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
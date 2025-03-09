import "./MatchListLine.scss";
import { useEffect, useState } from "react";

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
  
  const [localHome, setLocalHome] = useState(homePrediction || '');
  const [localAway, setLocalAway] = useState(awayPrediction || '');

  useEffect(() => {
    setLocalHome(homePrediction || '');
    setLocalAway(awayPrediction || '');
  }, [homePrediction, awayPrediction]);
  
  let showOPPrediction = false;
  let showTeamName = true;
  if (vsop) {
    showTeamName = false;
    showOPPrediction = true;
  }

  // Improved handle change function to enforce "both or neither" rule
  function handleChange(value: string, isHome: boolean) {
    // Update the local state for the current field
    if (isHome) {
      setLocalHome(value);
    } else {
      setLocalAway(value);
    }

    // Get current values for validation
    const homeValue = isHome ? value : localHome;
    const awayValue = isHome ? localAway : value;

    // Apply the "both or neither" rule
    if (value !== '') {
      // This field has a value
      if (isHome) {
        // Home field has value, ensure away also has value
        if (awayValue === '') {
          setLocalAway('0');
          broadcastChangeToParent(0, false, index);
        }
        broadcastChangeToParent(parseInt(value) || 0, true, index);
      } else {
        // Away field has value, ensure home also has value
        if (homeValue === '') {
          setLocalHome('0');
          broadcastChangeToParent(0, true, index);
        }
        broadcastChangeToParent(parseInt(value) || 0, false, index);
      }
    } else {
      // This field is empty
      if (isHome) {
        // Home field is empty, clear away too if it has value
        if (awayValue !== '') {
          setLocalAway('');
          broadcastChangeToParent(null, false, index);
        }
        broadcastChangeToParent(null, true, index);
      } else {
        // Away field is empty, clear home too if it has value
        if (homeValue !== '') {
          setLocalHome('');
          broadcastChangeToParent(null, true, index);
        }
        broadcastChangeToParent(null, false, index);
      }
    }
  }

  function predicationScore(home: any, away: any): number {
    home = Number(home);
    away = Number(away);

    if (isNaN(home) || isNaN(away) || isNaN(matchLine.score.fullTime.home) || isNaN(matchLine.score.fullTime.away)) return 0;

    if (home - away === matchLine.score.fullTime.home - matchLine.score.fullTime.away) {
      if (home === matchLine.score.fullTime.home) {
        return 3; // covers exact matches
      }
      return 2; // covers all tie predictions
    } else {
      if ((home - away) * (matchLine.score.fullTime.home - matchLine.score.fullTime.away) > 0) {
        return 1; // covers correct winner predictions
      }
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
                value={localHome}
                onChange={(e) => handleChange(e.target.value, true)}
              />
              -
              <input
                type="number"
                min={0}
                className="text-center bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={localAway}
                name={`away-input-${index}`}
                onChange={(e) => handleChange(e.target.value, false)}
              />
            </div>
          </div>
        )}
      </div>}
    </div>
  );
}
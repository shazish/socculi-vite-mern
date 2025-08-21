import { useEffect, useState, memo, useMemo, useCallback } from "react"
import { ChevronRight } from "lucide-react"
import { calculatePredictionScore, getTrashTalkMessage } from '../../utils/scoring';
import { useAuthStatus } from "../../utils/authStatus";
import { MatchListLineProps, FormattedImpact } from "../../types/matchData.interface";
import OptimizedImage from "../OptimizedImage";
import PredictionScore from "./PredictionScore";

function MatchListLineDesign5(props: MatchListLineProps) {
  const {
    index,
    matchLine,
    submissionDeadlineStatus,
    homePrediction,
    awayPrediction,
    homeOpPrediction,
    awayOpPrediction,
    predictionImpact,
    vsop = false,
    broadcastChangeToParent,
  } = props;
  const [localHome, setLocalHome] = useState(homePrediction || "")
  const [localAway, setLocalAway] = useState(awayPrediction || "")
  const [expanded, setExpanded] = useState(false)
  const { isLoggedIn } = useAuthStatus()

  useEffect(() => {
    setLocalHome(homePrediction || "")
    setLocalAway(awayPrediction || "")
  }, [homePrediction, awayPrediction])

  const showOPPrediction = vsop
  const showTeamName = !vsop

  const handleChange = useCallback((value: string, isHome: boolean) => {
    if (isHome) {
      setLocalHome(value)
    } else {
      setLocalAway(value)
    }

    const homeValue = isHome ? value : localHome
    const awayValue = isHome ? localAway : value

    if (value !== "") {
      if (isHome) {
        if (awayValue === "") {
          setLocalAway("0")
          broadcastChangeToParent(0, false, index)
        }
        broadcastChangeToParent(Number.parseInt(value) || 0, true, index)
      } else {
        if (homeValue === "") {
          setLocalHome("0")
          broadcastChangeToParent(0, true, index)
        }
        broadcastChangeToParent(Number.parseInt(value) || 0, false, index)
      }
    } else {
      if (isHome) {
        if (awayValue !== "") {
          setLocalAway("")
          broadcastChangeToParent(null, false, index)
        }
        broadcastChangeToParent(null, true, index)
      } else {
        if (homeValue !== "") {
          setLocalHome("")
          broadcastChangeToParent(null, true, index)
        }
        broadcastChangeToParent(null, false, index)
      }
    }
  }, [localHome, localAway, index, broadcastChangeToParent]);

  const predicationScore = useCallback((home: string | null | undefined, away: string | null | undefined): number => {
    if (!home || !away) return 0;
    return calculatePredictionScore(Number(home), Number(away), matchLine);
  }, [matchLine]);

  const timeLeftToStartFormatted = useMemo(() => {
    const timeLeft = new Date(matchLine.utcDate).getTime() - Date.now()
    if (timeLeft < 3600000)
      return `${Math.floor(timeLeft / 60000)}m`
    else if (timeLeft < 86400000) return `${Math.floor(timeLeft / 3600000)}h`
    return new Date(matchLine.utcDate).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [matchLine.utcDate]);

  const formatImpact = useCallback((impact: string | undefined): FormattedImpact => {
    if (!impact) return { percentage: "0", numeric: "0.0" }
    const numericImpact = Number.parseFloat(impact)
    return {
      percentage: (numericImpact * 100).toFixed(0),
      numeric: numericImpact.toFixed(1),
    }
  }, []);

  const predictionScoreUser = useMemo(() => predicationScore(homePrediction, awayPrediction), [predicationScore, homePrediction, awayPrediction])
  const predictionScoreOp = useMemo(() => predicationScore(homeOpPrediction, awayOpPrediction), [predicationScore, homeOpPrediction, awayOpPrediction])
  const formattedImpact = useMemo(() => formatImpact(predictionImpact), [formatImpact, predictionImpact])
  
  const trashTalkMessage = useMemo(() => {
    if (homePrediction && awayPrediction && matchLine.status === "FINISHED") {
      return getTrashTalkMessage(Number(homePrediction), Number(awayPrediction), matchLine);
    }
    return null;
  }, [homePrediction, awayPrediction, matchLine]);

  const shouldShowScore = useCallback((status: string) => {
    return status === "FINISHED";
  }, []);

  const isPredictionSuccessful = useCallback((score: number) => {
    return score > 0;
  }, []);

  return (
    <div data-testid="match-line" className="border border-gray-200 rounded-lg mb-2 overflow-hidden hover:border-blue-300 transition-colors bg-white">
      
      {/* Compact Main Row */}
      <div 
        className="flex items-center p-3 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        
        {/* Timeline dot and connector */}
        <div className="flex flex-col items-center mr-4">
          <div className={`w-3 h-3 rounded-full border-2 ${
            matchLine.status === "IN_PLAY" || matchLine.status === "PAUSED" 
              ? "bg-red-500 border-red-500 animate-pulse" 
              : submissionDeadlineStatus === "open"
              ? "bg-blue-500 border-blue-500"
              : "bg-gray-400 border-gray-400"
          }`}>
          </div>
          {index !== 0 && <div className="w-0.5 h-4 bg-gray-200 -mt-1"></div>}
        </div>

        {/* Match time/status */}
        <div className="w-20 text-xs text-gray-600 font-medium">
          {matchLine.status === "IN_PLAY" || matchLine.status === "PAUSED" ? (
            <span className="text-red-600 font-bold">● LIVE</span>
          ) : submissionDeadlineStatus === "open" ? (
            timeLeftToStartFormatted
          ) : (
            "FINAL"
          )}
        </div>

        {/* Teams and score */}
        <div className="flex-1 flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <OptimizedImage
              className="w-6 h-6 object-contain"
              alt={matchLine.homeTeam.shortName + " crest"}
              src={"/public/crest/" + matchLine.homeTeam.tla + ".png"}
            />
            <span className="text-sm font-medium text-gray-900">{matchLine.homeTeam.shortName}</span>
          </div>

          <div className="text-center">
            {submissionDeadlineStatus !== "open" ? (
              <span className="text-lg font-bold text-gray-900">
                {matchLine?.score?.fullTime?.home} - {matchLine?.score?.fullTime?.away}
              </span>
            ) : (
              <span className="text-sm text-gray-400 font-medium">vs</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">{matchLine.awayTeam.shortName}</span>
            <OptimizedImage
              className="w-6 h-6 object-contain"
              alt={matchLine.awayTeam.shortName + " crest"}
              src={"/public/crest/" + matchLine.awayTeam.tla + ".png"}
            />
          </div>
        </div>

        {/* Quick prediction display */}
        <div className="w-24 text-center">
          {showOPPrediction ? (
            <div className="text-xs space-y-1">
              <div className={`${isPredictionSuccessful(predictionScoreOp) && shouldShowScore(matchLine.status) ? "text-green-600" : "text-gray-400"}`}>
                OP: {homeOpPrediction}-{awayOpPrediction}
              </div>
              <div className={`${isPredictionSuccessful(predictionScoreUser) && shouldShowScore(matchLine.status) ? "text-blue-600" : "text-gray-400"}`}>
                YOU: {homePrediction}-{awayPrediction}
              </div>
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              {homePrediction && awayPrediction ? (
                <span className={isPredictionSuccessful(predictionScoreUser) && shouldShowScore(matchLine.status) ? "text-green-600 font-medium" : ""}>
                  {homePrediction}-{awayPrediction}
                  {shouldShowScore(matchLine.status) && <PredictionScore score={predictionScoreUser} matchStatus={matchLine.status} variant="inline" />}
                </span>
              ) : submissionDeadlineStatus === "open" && isLoggedIn ? (
                <span className="text-blue-600">Predict</span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </div>
          )}
        </div>

        {/* Expand indicator */}
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`} />
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50">
          
          {/* Team names (if not VSOP) */}
          {showTeamName && (
            <div className="flex justify-between px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
              <span className="truncate max-w-40">{matchLine.homeTeam.name}</span>
              <span className="truncate max-w-40 text-right">{matchLine.awayTeam.name}</span>
            </div>
          )}

          {/* VSOP detailed predictions */}
          {showOPPrediction && (
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-xs text-gray-500 mb-1">Opponent Prediction</div>
                <div className={`text-lg font-bold ${isPredictionSuccessful(predictionScoreOp) && shouldShowScore(matchLine.status) ? "text-green-600" : "text-gray-600"}`}>
                  {homeOpPrediction} - {awayOpPrediction}
                  <PredictionScore score={predictionScoreOp} matchStatus={matchLine.status} variant="text" color="green" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border">
                <div className="text-xs text-gray-500 mb-1">Your Prediction</div>
                <div className={`text-lg font-bold ${isPredictionSuccessful(predictionScoreUser) && shouldShowScore(matchLine.status) ? "text-blue-600" : "text-gray-600"}`}>
                  {homePrediction} - {awayPrediction}
                  <PredictionScore score={predictionScoreUser} matchStatus={matchLine.status} variant="text" color="blue" />
                </div>
              </div>
            </div>
          )}

          {/* Prediction input/details (if not VSOP) */}
          {!showOPPrediction && (
            <div className="p-4">
              {submissionDeadlineStatus === "closed" ? (
                <div className="bg-white rounded-lg p-3 border">
                  {homePrediction && awayPrediction ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Your Prediction</div>
                        <div className="text-lg font-bold text-gray-900">
                          {homePrediction} - {awayPrediction}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {predictionImpact && (
                          <div className="text-center">
                            <div className="text-xs text-gray-500">Impact</div>
                            <div className="text-sm font-bold text-purple-600">
                              {formattedImpact.numeric}x
                            </div>
                          </div>
                        )}
                        
                        <PredictionScore 
                          score={predictionScoreUser} 
                          matchStatus={matchLine.status} 
                          variant="badge" 
                          color="green" 
                          showTrophy={true} 
                        />

                        {/* Trash talk speech bubble positioned near prediction */}
                        {trashTalkMessage && (
                          <div className="relative ml-3">
                            <div className="bg-red-100 border border-red-200 rounded-lg px-3 py-2 text-xs font-medium shadow-sm max-w-60">
                              <div className="flex items-center gap-1">
                                <img src="/public/smirk02.png" alt="Smirky guy" className="w-12 h-12" />
                                <span>{trashTalkMessage}</span>
                              </div>
                              {/* Speech bubble tail */}
                              <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2">
                                <div className="w-2 h-2 bg-red-50 border-l border-b border-red-200 rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <div className="text-sm">No prediction made</div>
                    </div>
                  )}
                </div>
              ) : isLoggedIn && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="text-xs text-gray-500 mb-3 text-center">Make Your Prediction</div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{matchLine.homeTeam.shortName}</div>
                      <input
                        className="w-12 h-10 bg-white text-center text-lg font-bold border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        min={0}
                        type="number"
                        name={`home-input-${index}`}
                        value={localHome}
                        onChange={(e) => handleChange(e.target.value, true)}
                      />
                    </div>
                    
                    <span className="text-xl font-bold text-gray-400 pt-6">-</span>
                    
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">{matchLine.awayTeam.shortName}</div>
                      <input
                        className="w-12 h-10 bg-white text-center text-lg font-bold border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        min={0}
                        type="number"
                        name={`away-input-${index}`}
                        value={localAway}
                        onChange={(e) => handleChange(e.target.value, false)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {submissionDeadlineStatus === "closesSoon" && (
            <div className="bg-amber-100 text-amber-800 px-4 py-2 text-sm font-medium text-center">
              ⚠ Closes soon
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default memo(MatchListLineDesign5);
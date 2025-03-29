export function calculatePredictionScore(
  predictedHome: number, 
  predictedAway: number, 
  matchLine: any
): number {
  const actualHome = Number(matchLine.score.fullTime.home);
  const actualAway = Number(matchLine.score.fullTime.away);

  if (isNaN(predictedHome) || isNaN(predictedAway) || isNaN(actualHome) || isNaN(actualAway)) {
    return 0;
  }

  // Exact score match
  if (predictedHome === actualHome && predictedAway === actualAway) {
    return 3;
  }

  // Goal difference match
  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;
  if (predictedDiff === actualDiff) {
    return 2;
  }

  // Winner match
  if (
    (predictedDiff > 0 && actualDiff > 0) ||
    (predictedDiff < 0 && actualDiff < 0) ||
    (predictedDiff === 0 && actualDiff === 0)
  ) {
    return 1;
  }

  return 0;
}
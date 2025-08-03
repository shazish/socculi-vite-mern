import { Match } from '../types/matchData.interface';

export function calculatePredictionScore(
  predictedHome: number, 
  predictedAway: number, 
  matchLine: Match
): number {
  const actualHome = Number(matchLine?.score?.fullTime?.home);
  const actualAway = Number(matchLine?.score?.fullTime?.away);

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

export function getTrashTalkMessage(
  predictedHome: number,
  predictedAway: number,
  matchLine: Match
): string | null {
  const actualHome = Number(matchLine?.score?.fullTime?.home);
  const actualAway = Number(matchLine?.score?.fullTime?.away);

  if (isNaN(predictedHome) || isNaN(predictedAway) || isNaN(actualHome) || isNaN(actualAway)) {
    return null;
  }

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;
  const goalDifference = Math.abs((predictedHome + predictedAway) - (actualHome + actualAway));

  // Check if winner is wrong AND goal difference is 3 or more
  const wrongWinner = (
    (predictedDiff > 0 && actualDiff <= 0) ||
    (predictedDiff < 0 && actualDiff >= 0) ||
    (predictedDiff === 0 && actualDiff !== 0)
  );

  if (wrongWinner && goalDifference >= 3) {
    const trashTalkMessages = [
      "Ooof, that prediction was way off! 📉",
      "Did you watch the wrong match? 👀",
      "Your crystal ball needs new batteries! 🔮",
      "Even a coin flip would've been better! 🪙",
      "That prediction aged like milk! 🥛",
      "Were you predicting or just making a wish? 🌟",
      "Your prediction and reality live in different universes! 🌌",
      "That's not a prediction, that's wishful thinking! 💭",
      "Did you predict this with your eyes closed? 👁️‍🗨️",
      "Your prediction was more fictional than Marvel movies! 🦸"
    ];
    
    return trashTalkMessages[Math.floor(Math.random() * trashTalkMessages.length)];
  }

  return null;
}
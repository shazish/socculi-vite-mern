import { memo } from "react";
import { Trophy } from "lucide-react";
import { Match } from "../../types/matchData.interface";

interface PredictionScoreProps {
  score: number;
  matchStatus: Match['status'];
  variant?: 'inline' | 'badge' | 'text';
  color?: 'green' | 'blue';
  showTrophy?: boolean;
}

function PredictionScore({ 
  score, 
  matchStatus, 
  variant = 'text', 
  color = 'green',
  showTrophy = false 
}: PredictionScoreProps) {
  if (matchStatus !== "FINISHED") {
    return null;
  }

  const isSuccessful = score > 0;

  const colorClasses = {
    green: {
      text: isSuccessful ? 'text-green-600' : 'text-gray-600',
      badge: isSuccessful ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
    },
    blue: {
      text: isSuccessful ? 'text-blue-600' : 'text-gray-600', 
      badge: isSuccessful ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
    }
  };

  if (variant === 'inline') {
    return <span className="ml-1">+{score}</span>;
  }

  if (variant === 'badge') {
    return (
      <div className={`${colorClasses[color].badge} px-2 py-1 rounded text-sm font-bold flex items-center`}>
        {showTrophy && isSuccessful && <Trophy className="w-3 h-3 mr-1" />}
        +{score}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <span className={`block text-sm ${colorClasses[color].text}`}>
        +{score} points
      </span>
    );
  }

  return null;
}

export default memo(PredictionScore);
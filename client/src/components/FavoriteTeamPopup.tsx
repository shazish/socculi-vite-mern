import { useState } from 'react';
import { X, Heart, Star } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface FavoriteTeamPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamSelect: (teamId: number, teamName: string) => void;
  onSkip: () => void;
  onDisablePermanently: () => void;
}

// Premier League teams list - you can expand this or fetch from your data
const PREMIER_LEAGUE_TEAMS: Team[] = [
  { id: 57, name: "Arsenal FC", shortName: "Arsenal", tla: "ARS", crest: "https://crests.football-data.org/57.png" },
  { id: 58, name: "Aston Villa FC", shortName: "Aston Villa", tla: "AVL", crest: "https://crests.football-data.org/58.png" },
  { id: 1044, name: "AFC Bournemouth", shortName: "Bournemouth", tla: "BOU", crest: "https://crests.football-data.org/1044.png" },
  { id: 402, name: "Brentford FC", shortName: "Brentford", tla: "BRE", crest: "https://crests.football-data.org/402.png" },
  { id: 397, name: "Brighton & Hove Albion FC", shortName: "Brighton", tla: "BHA", crest: "https://crests.football-data.org/397.png" },
  { id: 61, name: "Chelsea FC", shortName: "Chelsea", tla: "CHE", crest: "https://crests.football-data.org/61.png" },
  { id: 354, name: "Crystal Palace FC", shortName: "Crystal Palace", tla: "CRY", crest: "https://crests.football-data.org/354.png" },
  { id: 62, name: "Everton FC", shortName: "Everton", tla: "EVE", crest: "https://crests.football-data.org/62.png" },
  { id: 63, name: "Fulham FC", shortName: "Fulham", tla: "FUL", crest: "https://crests.football-data.org/63.png" },
  { id: 346, name: "Ipswich Town FC", shortName: "Ipswich", tla: "IPS", crest: "https://crests.football-data.org/346.png" },
  { id: 1003, name: "Leicester City FC", shortName: "Leicester", tla: "LEI", crest: "https://crests.football-data.org/1003.png" },
  { id: 64, name: "Liverpool FC", shortName: "Liverpool", tla: "LIV", crest: "https://crests.football-data.org/64.png" },
  { id: 65, name: "Manchester City FC", shortName: "Man City", tla: "MCI", crest: "https://crests.football-data.org/65.png" },
  { id: 66, name: "Manchester United FC", shortName: "Man United", tla: "MUN", crest: "https://crests.football-data.org/66.png" },
  { id: 67, name: "Newcastle United FC", shortName: "Newcastle", tla: "NEW", crest: "https://crests.football-data.org/67.png" },
  { id: 1148, name: "Nottingham Forest FC", shortName: "Nottm Forest", tla: "NFO", crest: "https://crests.football-data.org/1148.png" },
  { id: 340, name: "Southampton FC", shortName: "Southampton", tla: "SOU", crest: "https://crests.football-data.org/340.png" },
  { id: 73, name: "Tottenham Hotspur FC", shortName: "Spurs", tla: "TOT", crest: "https://crests.football-data.org/73.png" },
  { id: 76, name: "West Ham United FC", shortName: "West Ham", tla: "WHU", crest: "https://crests.football-data.org/76.png" },
  { id: 380, name: "Wolverhampton Wanderers FC", shortName: "Wolves", tla: "WOL", crest: "https://crests.football-data.org/380.png" }
];

export default function FavoriteTeamPopup({ 
  isOpen, 
  onClose, 
  onTeamSelect, 
  onSkip, 
  onDisablePermanently 
}: FavoriteTeamPopupProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = PREMIER_LEAGUE_TEAMS.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.tla.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
  };

  const handleConfirm = () => {
    if (selectedTeam) {
      onTeamSelect(selectedTeam.id, selectedTeam.name);
      onClose();
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  const handleDisable = () => {
    onDisablePermanently();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <Heart className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-2xl text-left font-bold text-white">Choose Your Team</h2>
              <p className="text-blue-100">Pick your favorite team so that we can tease you better when the time comes!</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            placeholder="Search for your team..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
          />
        </div>

        {/* Teams Grid */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team)}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all hover:border-blue-300 hover:bg-blue-50 ${
                  selectedTeam?.id === team.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <OptimizedImage
                  src={`/public/crest/${team.tla}.png`}
                  className="w-10 h-10 object-contain"
                  alt={`${team.shortName} crest`}
                />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">{team.shortName}</div>
                  <div className="text-sm text-gray-500">{team.name}</div>
                </div>
                {selectedTeam?.id === team.id && (
                  <Star className="w-5 h-5 text-blue-500 fill-current" />
                )}
              </button>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">No teams found</div>
              <div className="text-gray-500 text-sm mt-1">Try a different search term</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
              >
                Skip for now
              </button>
              <button
                onClick={handleDisable}
                className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
              >
                Don't ask again
              </button>
            </div>
            
            <button
              onClick={handleConfirm}
              disabled={!selectedTeam}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedTeam
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm Choice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
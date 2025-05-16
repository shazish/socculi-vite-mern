import { useState, useEffect, useCallback } from "react";
import { Button } from "react-bootstrap";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import MatchListRender from "../components/match-list/matchListRenderer";
import { fetchUserSubmissions } from '../utils/submissions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const opUserId = 'shaahin@gmail.com';
const loadingAnimation = `./loadinganimation2.svg`;

function ArchivedWeeks() {
  const [currentMatchDay, setCurrentMatchDay] = useState<number>(0);
  const [selectedMatchDay, setSelectedMatchDay] = useState<number>(0);
  const [matchList, setMatchList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [existingSubmissions, setExistingSubmissions] = useState<string>('');
  const [existingOpSubmissions, setExistingOpSubmissions] = useState<string>('');
  const [allMatchData, setAllMatchData] = useState<any[]>([]);

  // Use the same fake data settings as in App.tsx
  const fakeDataEnabled = false;
  const fakeMatchDay = 27;

  // Initialize component with data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch match data
        let matchData;
        let currentWeek;
        
        if (fakeDataEnabled) {
          const fakedata = await import('../assets/data-structure.json');
          matchData = fakedata.default.data.matches;
          currentWeek = fakeMatchDay;
          setAllMatchData(matchData);
          setCurrentMatchDay(currentWeek);
          // Set selected week to previous week
          setSelectedMatchDay(currentWeek - 1);
        } else {
          // In a real environment, you would fetch the data from your API
          const response = await fetch('/wp-admin/admin-ajax.php?action=get_matchday_games');
          const data = await response.json();
          matchData = data.matches;
          currentWeek = matchData[0]?.season?.currentMatchday;
          setAllMatchData(matchData);
          setCurrentMatchDay(currentWeek);
          // Set selected week to previous week
          setSelectedMatchDay(currentWeek - 1);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load match data:", error);
        toast.error("Failed to load archived matches");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update match list when selected match day changes
  useEffect(() => {
    if (selectedMatchDay > 0 && allMatchData.length > 0) {
      const matchesForSelectedDay = allMatchData.filter(
        (match) => match.matchday === selectedMatchDay
      );
      setMatchList(matchesForSelectedDay);
      
      // Fetch user submissions for selected week
      fetchUserSubmissionsForWeek(selectedMatchDay);
    }
  }, [selectedMatchDay, allMatchData]);

  // Fetch user submissions for a specific week
  const fetchUserSubmissionsForWeek = useCallback(async (matchDay: number) => {
    if (matchDay <= 0) return;
    
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("socculi_user_email") ?? "";
      
      // Fetch user's predictions
      const predictions = await fetchUserSubmissions(
        matchDay, 
        userId, 
        fakeDataEnabled
      );
      setExistingSubmissions(predictions);
      
      // Fetch OP's predictions
      const opPredictions = await fetchUserSubmissions(
        matchDay, 
        opUserId, 
        fakeDataEnabled
      );
      setExistingOpSubmissions(opPredictions);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching submissions for week:", error);
      toast.error("Failed to load predictions for this week");
      setIsLoading(false);
    }
  }, []);

  // Navigation functions
  const goToPreviousWeek = () => {
    if (selectedMatchDay > 1) {
      setSelectedMatchDay(selectedMatchDay - 1);
    }
  };

  const goToNextWeek = () => {
    if (selectedMatchDay < currentMatchDay - 1) {
      setSelectedMatchDay(selectedMatchDay + 1);
    }
  };

  // Placeholder function for submission broadcast (required by MatchListRender)
  const placeholderSubmit = async () => {
    return true; // No actual submission in archived view
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-center" autoClose={2000} />
      
      <div className="bg-indigo-50 rounded-lg p-4 text-sm text-indigo-800">
        <p>This page shows archived match results and predictions from previous weeks. 
        You can use the navigation controls to browse through past weeks.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <Button 
            onClick={goToPreviousWeek}
            disabled={selectedMatchDay <= 1 || isLoading}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span className="text-xl font-semibold">
              {isLoading ? "Loading..." : `Week ${selectedMatchDay}`}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {selectedMatchDay === currentMatchDay - 1 ? "Previous Week" : ""}
            </span>
          </div>
          
          <Button 
            onClick={goToNextWeek}
            disabled={selectedMatchDay >= currentMatchDay - 1 || isLoading}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <img src={loadingAnimation} className="w-10 h-10" alt="Loading" />
          </div>
        ) : matchList.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No matches found for this week</p>
          </div>
        ) : (
          <MatchListRender
            vsop={true} // Enable comparison view
            matchList={matchList}
            renderedMatchDay={selectedMatchDay}
            existingSubmissions={existingSubmissions}
            existingOpSubmissions={existingOpSubmissions}
            broadcastSubmissionToParent={placeholderSubmit}
          />
        )}
      </div>    
    </div>
  );
}

export default ArchivedWeeks;
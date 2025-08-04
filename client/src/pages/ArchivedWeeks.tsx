import { useState, useEffect, useCallback } from "react";
import { Button, Dropdown } from "react-bootstrap";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from "lucide-react";
import MatchListRender from "../components/match-list/matchListRenderer";
import { fetchUserSubmissions } from '../utils/submissions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const opUserId = import.meta.env.VITE_OP_USER_ID || 'shaahin@gmail.com';
const loadingAnimation = import.meta.env.VITE_LOADING_ANIMATION_PATH || '/public/loadinganimation2.svg';

function ArchivedWeeks() {
  const [currentMatchDay, setCurrentMatchDay] = useState<number>(0);
  const [selectedMatchDay, setSelectedMatchDay] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [matchList, setMatchList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [existingSubmissions, setExistingSubmissions] = useState<string>('');
  const [existingOpSubmissions, setExistingOpSubmissions] = useState<string>('');
  const [allMatchData, setAllMatchData] = useState<any[]>([]);
  const [availableYears] = useState<number[]>([2024, 2023, 2022, 2021, 2020]);

  // Use the same fake data settings as in App.tsx
  const fakeDataEnabled = false;
  const fakeMatchDay = 27;

  // Initialize component with data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Run database migration to ensure season_year column exists
        if (!fakeDataEnabled) {
          try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const wpAdminUrl = import.meta.env.VITE_WP_ADMIN_URL || '/wp-admin/admin-ajax.php';
            await fetch(`${apiBaseUrl}${wpAdminUrl}?action=migrate_submissions_table`);
          } catch (migrationError) {
            console.warn('Migration check failed:', migrationError);
          }
        }
        
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
          // Fetch data for the selected year
          const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
          const wpAdminUrl = import.meta.env.VITE_WP_ADMIN_URL || '/wp-admin/admin-ajax.php';
          
          const formData = new FormData();
          formData.append('year', selectedYear.toString());
          
          const response = await fetch(`${apiBaseUrl}${wpAdminUrl}?action=get_season_matches`, {
            method: 'POST',
            body: formData
          });
          const data = await response.json();
          matchData = data.matches;
          
          if (matchData && matchData.length > 0) {
            // Find the last completed matchday for this season
            const completedMatchdays = [...new Set(matchData
              .filter((match: any) => match.status === 'FINISHED')
              .map((match: any) => match.matchday as number)
            )] as number[];
            completedMatchdays.sort((a, b) => b - a);
            
            currentWeek = completedMatchdays[0] || 1;
            setAllMatchData(matchData);
            setCurrentMatchDay(currentWeek);
            setSelectedMatchDay(currentWeek);
          } else {
            throw new Error('No matches found for this season');
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load match data:", error);
        toast.error("Failed to load archived matches");
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedYear]);

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
        fakeDataEnabled,
        selectedYear
      );
      setExistingSubmissions(predictions);
      
      // Fetch OP's predictions
      const opPredictions = await fetchUserSubmissions(
        matchDay, 
        opUserId, 
        fakeDataEnabled,
        selectedYear
      );
      setExistingOpSubmissions(opPredictions);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching submissions for week:", error);
      toast.error("Failed to load predictions for this week");
      setIsLoading(false);
    }
  }, [selectedYear]);

  // Navigation functions
  const goToPreviousWeek = () => {
    if (selectedMatchDay > 1) {
      setSelectedMatchDay(selectedMatchDay - 1);
    }
  };

  const goToNextWeek = () => {
    // For past seasons, allow navigation to the final matchday (38 for Premier League)
    // For current season, stop at current matchday - 1
    const maxMatchDay = selectedYear === new Date().getFullYear() ? currentMatchDay - 1 : 38;
    if (selectedMatchDay < maxMatchDay) {
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
      
      <div className="bg-indigo-50 rounded-lg p-4 text-sm text-indigo-800 mb-4">
        <p>Browse archived match results and predictions from previous weeks and seasons. 
        Select a year and use the navigation controls to explore past results.</p>
      </div>

      {/* Year Selection */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-center gap-4">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Season:</span>
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary" size="sm" className="d-flex align-items-center gap-2">
              {selectedYear}-{selectedYear + 1}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {availableYears.map(year => (
                <Dropdown.Item 
                  key={year}
                  active={year === selectedYear}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}-{year + 1} Season
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
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
              {selectedYear}-{selectedYear + 1} Season
            </span>
          </div>
          
          <Button 
            onClick={goToNextWeek}
            disabled={selectedMatchDay >= (selectedYear === new Date().getFullYear() ? currentMatchDay - 1 : 38) || isLoading}
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
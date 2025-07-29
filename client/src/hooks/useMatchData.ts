import { useState, useCallback } from 'react';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { toast } from 'react-toastify';
import { Match, FootballDataResponse } from '../types/matchData.interface';

// Configure axios retry globally
axiosRetry(axios, {
  retries: Number(import.meta.env.VITE_AXIOS_RETRY_COUNT) || 3,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry: (err) => console.log(`axiosRetry Retrying request. Error: ${err}`),
  retryCondition: (error) => axiosRetry.isNetworkOrIdempotentRequestError(error)
});

export interface UseMatchDataReturn {
  matchList: Match[];
  renderMatchDay: number;
  errorLoadingMatches: string;
  getMatchDayGames: (day?: number) => Promise<void>;
}

export function useMatchData(fakeDataEnabled = false, fakeMatchDay = 27): UseMatchDataReturn {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [renderMatchDay, setRenderMatchDay] = useState(0);
  const [errorLoadingMatches, setErrorLoadingMatches] = useState('');

  const getMatchDayGames = useCallback(async (day?: number) => {
    console.log('getMatchDayGames', day);
    
    if (fakeDataEnabled) {
      try {
        const fakedata = await import('../assets/data-structure.json');
        console.log('fakedata', fakedata);
        console.log("day: ", day);
        const filteredMatches = fakedata.default.data.matches.filter(
          (match) => match.matchday === fakeMatchDay
        ) as Match[];
        setMatchList(filteredMatches);
        setRenderMatchDay(fakeMatchDay);
        return;
      } catch (error) {
        console.error('Error loading fake data:', error);
        setErrorLoadingMatches('Failed to load fake data');
        return;
      }
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const wpAdminUrl = import.meta.env.VITE_WP_ADMIN_URL || '/wp-admin/admin-ajax.php';
    
    const formData = new FormData();
    
    try {
      const response = await axios.post<FootballDataResponse>(
        `${apiBaseUrl}${wpAdminUrl}?action=get_matchday_games`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log('Match data response:', response);
      const currMatchDay = response.data.matches?.[0]?.season?.currentMatchday;
      
      if (currMatchDay) {
        setRenderMatchDay(currMatchDay);
        const filteredMatches = response.data.matches.filter(
          (match) => match.matchday === currMatchDay
        );
        setMatchList(filteredMatches);
        console.log("football-data for this week: ", filteredMatches);
        setErrorLoadingMatches('');
      } else {
        throw new Error('No current matchday found');
      }
    } catch (error) {
      console.error("getMatchDayGames error", error);
      setErrorLoadingMatches(error instanceof Error ? error.message : 'Unknown error occurred');
      toast.error("Failed to load match data");
    }
  }, [fakeDataEnabled, fakeMatchDay]);

  return {
    matchList,
    renderMatchDay,
    errorLoadingMatches,
    getMatchDayGames,
  };
}
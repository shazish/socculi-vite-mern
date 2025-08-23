import { useState, useCallback, useEffect, useRef } from 'react';
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
  isRefreshing: boolean;
}

export function useMatchData(fakeDataEnabled = false, fakeMatchDay = 27): UseMatchDataReturn {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [renderMatchDay, setRenderMatchDay] = useState(0);
  const [errorLoadingMatches, setErrorLoadingMatches] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getMatchDayGames = useCallback(async (day?: number, isBackgroundRefresh = false) => {
    console.log('getMatchDayGames', day, 'backgroundRefresh:', isBackgroundRefresh);
    
    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    }
    
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
        if (isBackgroundRefresh) {
          // Ensure minimum fade duration of 2 seconds for visual effect
          if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
          }
          fadeTimeoutRef.current = setTimeout(() => {
            setIsRefreshing(false);
          }, 2000);
        }
        return;
      } catch (error) {
        console.error('Error loading fake data:', error);
        setErrorLoadingMatches('Failed to load fake data');
        if (isBackgroundRefresh) {
          // Ensure minimum fade duration of 2 seconds for visual effect
          if (fadeTimeoutRef.current) {
            clearTimeout(fadeTimeoutRef.current);
          }
          fadeTimeoutRef.current = setTimeout(() => {
            setIsRefreshing(false);
          }, 2000);
        }
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
      if (!isBackgroundRefresh) {
        toast.error("Failed to load match data");
      }
    } finally {
      if (isBackgroundRefresh) {
        // Ensure minimum fade duration of 2 seconds for visual effect
        if (fadeTimeoutRef.current) {
          clearTimeout(fadeTimeoutRef.current);
        }
        fadeTimeoutRef.current = setTimeout(() => {
          setIsRefreshing(false);
        }, 2000);
      }
    }
  }, [fakeDataEnabled, fakeMatchDay]);

  // Setup background refresh interval
  useEffect(() => {
    // Start interval for background refresh every 2 minutes (120000 ms)
    intervalRef.current = setInterval(() => {
      getMatchDayGames(undefined, true);
    }, Number(import.meta.env.VITE_BACKGROUND_REFRESH_INTERVAL) || 120000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };
  }, [getMatchDayGames]);

  return {
    matchList,
    renderMatchDay,
    errorLoadingMatches,
    getMatchDayGames,
    isRefreshing,
  };
}
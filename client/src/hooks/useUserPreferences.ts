import { useState, useEffect, useCallback } from 'react';
import { useAuthStatus } from '../utils/authStatus';
import axios from 'axios';

interface UserPreferences {
  favoriteTeamId: number | null;
  favoriteTeamName: string | null;
  showFavoriteTeamPopup: boolean;
  disableFavoriteTeamPopup: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteTeamId: null,
  favoriteTeamName: null,
  showFavoriteTeamPopup: true,
  disableFavoriteTeamPopup: false,
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const wpAdminUrl = import.meta.env.VITE_WP_ADMIN_URL || '/wp-admin/admin-ajax.php';

export function useUserPreferences() {
  const { isLoggedIn } = useAuthStatus();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Get username for API calls
  const getUsername = useCallback(() => {
    return localStorage.getItem("socculi_user_email") || '';
  }, []);

  // Load preferences from database
  const loadPreferences = useCallback(async () => {
    if (!isLoggedIn) {
      setPreferences(DEFAULT_PREFERENCES);
      setHasLoaded(true);
      return;
    }

    try {
      const username = getUsername();
      if (!username) {
        setPreferences(DEFAULT_PREFERENCES);
        setHasLoaded(true);
        return;
      }

      const formData = new FormData();
      formData.append('action', 'get_user_preferences');
      formData.append('username', username);

      const response = await axios.post(`${apiBaseUrl}${wpAdminUrl}`, formData);

      if (response.data.success) {
        const dbPrefs = response.data.data;
        const hasFavoriteTeam = dbPrefs.favorite_team_id !== null && dbPrefs.favorite_team_id !== 0;
        const isPopupDisabled = !!dbPrefs.disable_favorite_popup;
        
        const newPrefs = {
          favoriteTeamId: dbPrefs.favorite_team_id || null,
          favoriteTeamName: dbPrefs.favorite_team_name || null,
          showFavoriteTeamPopup: !isPopupDisabled && !hasFavoriteTeam,
          disableFavoriteTeamPopup: isPopupDisabled,
        };
        
        console.log('Loading preferences from DB:', {
          dbPrefs,
          hasFavoriteTeam,
          isPopupDisabled,
          newPrefs
        });
        
        setPreferences(newPrefs);
      } else {
        // Default preferences for new user
        setPreferences({
          ...DEFAULT_PREFERENCES,
          showFavoriteTeamPopup: true
        });
      }
      setHasLoaded(true);
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      setPreferences({
        ...DEFAULT_PREFERENCES,
        showFavoriteTeamPopup: isLoggedIn
      });
      setHasLoaded(true);
    }
  }, [isLoggedIn, getUsername]);

  // Update preferences in database
  const updatePreferencesInDB = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    const username = getUsername();
    if (!username) return;

    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      setPreferences(updatedPrefs);
      
      // Don't await - fire and forget for UI responsiveness
      // Individual methods will handle their specific API calls
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }, [preferences, getUsername]);

  // Load preferences when component mounts or user logs in/out
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  // Specific methods for favorite team management
  const setFavoriteTeam = useCallback(async (teamId: number, teamName: string) => {
    const username = getUsername();
    if (!username) return;

    try {
      console.log('Setting favorite team:', { teamId, teamName, username });
      
      // Update local state immediately
      const newPrefs = {
        favoriteTeamId: teamId,
        favoriteTeamName: teamName,
        showFavoriteTeamPopup: false,
        disableFavoriteTeamPopup: false
      };
      
      setPreferences(prev => ({
        ...prev,
        ...newPrefs
      }));

      // Update database
      const formData = new FormData();
      formData.append('action', 'update_user_favorite_team');
      formData.append('username', username);
      formData.append('favorite_team_id', teamId.toString());
      formData.append('favorite_team_name', teamName);

      const response = await axios.post(`${apiBaseUrl}${wpAdminUrl}`, formData);
      console.log('Favorite team update response:', response.data);
    } catch (error) {
      console.error('Failed to set favorite team:', error);
    }
  }, [getUsername]);

  const skipFavoriteTeamSelection = useCallback(() => {
    // Just hide popup locally for this session - don't persist to database
    setPreferences(prev => ({
      ...prev,
      showFavoriteTeamPopup: false,
    }));
  }, []);

  const disableFavoriteTeamPopupPermanently = useCallback(async () => {
    const username = getUsername();
    if (!username) return;

    try {
      // Update local state immediately
      setPreferences(prev => ({
        ...prev,
        showFavoriteTeamPopup: false,
        disableFavoriteTeamPopup: true,
      }));

      // Update database
      const formData = new FormData();
      formData.append('action', 'disable_favorite_team_popup');
      formData.append('username', username);

      await axios.post(`${apiBaseUrl}${wpAdminUrl}`, formData);
    } catch (error) {
      console.error('Failed to disable popup permanently:', error);
    }
  }, [getUsername]);

  const resetFavoriteTeamPreferences = useCallback(async () => {
    const username = getUsername();
    if (!username) return;

    try {
      // Update local state immediately
      setPreferences({
        favoriteTeamId: null,
        favoriteTeamName: null,
        showFavoriteTeamPopup: true,
        disableFavoriteTeamPopup: false,
      });

      // Reset in database by updating with null values
      const formData = new FormData();
      formData.append('action', 'update_user_favorite_team');
      formData.append('username', username);
      formData.append('favorite_team_id', '');
      formData.append('favorite_team_name', '');

      await axios.post(`${apiBaseUrl}${wpAdminUrl}`, formData);
    } catch (error) {
      console.error('Failed to reset favorite team preferences:', error);
    }
  }, [getUsername]);

  // Check if popup should be shown
  const shouldShowFavoriteTeamPopup = useCallback(() => {
    return (
      hasLoaded &&
      isLoggedIn &&
      preferences.showFavoriteTeamPopup &&
      !preferences.disableFavoriteTeamPopup &&
      preferences.favoriteTeamId === null
    );
  }, [hasLoaded, isLoggedIn, preferences]);

  return {
    preferences,
    hasLoaded,
    setFavoriteTeam,
    skipFavoriteTeamSelection,
    disableFavoriteTeamPopupPermanently,
    resetFavoriteTeamPreferences,
    shouldShowFavoriteTeamPopup,
    updatePreferencesInDB,
  };
}
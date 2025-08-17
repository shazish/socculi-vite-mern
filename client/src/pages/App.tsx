import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import axios from "axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMatchData } from '../hooks/useMatchData';
import { useSubmissions } from '../hooks/useSubmissions';
// import { useUserPreferences } from '../hooks/useUserPreferences';
import { ErrorBoundary } from '../components/ErrorBoundary';
import OptimizedImage from '../components/OptimizedImage';
// import FavoriteTeamPopup from '../components/FavoriteTeamPopup';

// Lazy load components
const MatchListRender = lazy(() => import("../components/match-list/matchListRenderer"));
// todo:
// *done* 1. add a loading spinner
// 2. add caching of match data
// *done* 3. add a save success/fail toast
// 4. archived match days
// *done* 5. add a button to switch between users
// 6. add a button to switch between leagues
// 7. selective game predictions
// 8. continuous prediction submission

// Environment variables
const brandLogo = import.meta.env.VITE_BRAND_LOGO_PATH || '/public/socculi.jpg';
const loadingAnimation2 = import.meta.env.VITE_LOADING_ANIMATION_PATH || '/public/loadinganimation2.svg';
const fakeDataEnabled = import.meta.env.VITE_FAKE_DATA_ENABLED === 'true';
const fakeMatchDay = Number(import.meta.env.VITE_FAKE_MATCH_DAY) || 27;
const toastAutoClose = Number(import.meta.env.VITE_TOAST_AUTO_CLOSE) || 2000;

interface AppProps {
  vsop?: boolean;
}

function App({ vsop = false }: AppProps) {
  const [appLoaded, setAppLoaded] = useState(false);
  
  // Custom hooks for data management
  const { matchList, renderMatchDay, errorLoadingMatches, getMatchDayGames } = useMatchData(fakeDataEnabled, fakeMatchDay);
  const { existingSubmissions, existingOpSubmissions, submitToBackend } = useSubmissions(renderMatchDay, fakeDataEnabled, new Date().getFullYear());
  // const { 
  //   setFavoriteTeam, 
  //   skipFavoriteTeamSelection, 
  //   disableFavoriteTeamPopupPermanently,
  //   shouldShowFavoriteTeamPopup 
  // } = useUserPreferences();

  const initPredictionTable = useCallback(async () => {
    if (fakeDataEnabled) {
      return 'fake data enabled';
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const wpAdminUrl = import.meta.env.VITE_WP_ADMIN_URL || '/wp-admin/admin-ajax.php';

    try {
      const response = await axios.get(
        `${apiBaseUrl}${wpAdminUrl}?action=create_submissions_table`
      );
      console.log('no error spotted creating table', response);
    } catch (error) {
      console.error("Failed to initialize prediction table:", error);
    }
  }, []);

  // Initialize app data on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initPredictionTable();
        await getMatchDayGames();
        setAppLoaded(true);
      } catch (error) {
        console.error("Failed to initialize app:", error);
      }
    };

    if (!appLoaded) {
      initializeApp();
    }
  }, [appLoaded, initPredictionTable, getMatchDayGames]);

  console.log("app.tsx ran!", window.location.origin);

  return (
    <ErrorBoundary>
      <div className="flex flex-row justify-around bg-light">

        <div className="content-center d-none d-lg-block">
          <h1 className="display-1">Socculi</h1>
          <h3 className="display-5">{import.meta.env.VITE_APP_DESCRIPTION}</h3>

        </div>
        <div className="logo-container flex">
          <OptimizedImage src={brandLogo} className="brand-logo rounded-xl fade-in" alt="Socculi logo" loading="eager" />
        </div>
      </div>

      <div className="card p-0">
        {!appLoaded && (
          <div className="flex flex-row justify-around">
            <OptimizedImage src={loadingAnimation2} className="flex-1 p-0 m-0 w-10 h-10" alt="Animation logo" loading="eager" />
          </div>
        )}
        <ToastContainer
          position="top-center"
          autoClose={toastAutoClose} />

        {errorLoadingMatches?.length > 0 && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {errorLoadingMatches}
          </div>
        )}

        {matchList && matchList.length > 0 && (
          <Suspense fallback={
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading match list...</span>
            </div>
          }>
            <MatchListRender
              vsop={vsop}
              matchList={matchList}
              existingSubmissions={existingSubmissions}
              existingOpSubmissions={existingOpSubmissions}
              renderedMatchDay={renderMatchDay}
              broadcastSubmissionToParent={submitToBackend}
            />
          </Suspense>
        )}
      </div>

      {/* <FavoriteTeamPopup
        isOpen={shouldShowFavoriteTeamPopup()}
        onClose={skipFavoriteTeamSelection}
        onTeamSelect={setFavoriteTeam}
        onSkip={skipFavoriteTeamSelection}
        onDisablePermanently={disableFavoriteTeamPopupPermanently}
      /> */}
    </ErrorBoundary>
  );
}

export default App;

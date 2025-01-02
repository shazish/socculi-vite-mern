import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MatchListRender from "../components/match-list/matchListRenderer";

import { FootballDataResponse, Match } from '../types/matchData.interface';
import './App.scss'

// place resources inside shaziblues.io/public folder
const viteLogo = `./public/vite.svg`;
const reactLogo = `./public/react.svg`;
const brandLogo = `./public/2ndhalflogo.webp`;

function App() {
  const [count, setCount] = useState(0);
  const [currentMatchDay, setCurrentMatchDay] = useState(0);
  const [renderedMatchDay, setRenderedMatchDay] = useState(0);
  const [matchList, setMatchList] = useState<Match[]>();
  const [appLoaded, setAppLoaded] = useState(false);
  const [existingSubmissions, setExistingSubmissions] = useState<string>('');

  // ______ FAKE DATA TESTER ______
  const fakeDataEnabled = true;
  // ______ FAKE DATA TESTER ______

  // We used useCallback here because: The function is used in a useEffect dependency array.
  // We want to prevent unnecessary recreations of this function on every render
  const getCurrentMatchDay = useCallback(async () => {
    if (fakeDataEnabled) {
      setCurrentMatchDay(6);
      return;
    }

    try {
      const response = await axios.get(
        "/wp-admin/admin-ajax.php?action=current_matchday_endpoint"
      );
      setCurrentMatchDay(response.data.currentSeason.currentMatchday);
    } catch (error) {
      console.error("Failed to fetch match day:", error);
      // Consider adding error state handling here
    }
  }, []);

  const initPredictionTable = useCallback(async () => {
    if (fakeDataEnabled) return 'fake data enabled';
    try {
      const response = await axios.get(
        "/wp-admin/admin-ajax.php?action=create_submissions_table"
      );
      console.log('no error spotted creating table', response);
    } catch (error) {
      console.error("Failed to fetch match day:", error);
      // Consider adding error state handling here
    }
  }, []);

  useEffect(() => {
    initPredictionTable().then((res) => {
      console.log(res);
    })
      .catch((err) => {
        console.log(err)
      });

    if (!appLoaded) {
      getCurrentMatchDay()
        .then(() => {
          setAppLoaded(true);
          setRenderedMatchDay(currentMatchDay);
          // fetchUserSubmissionsFromWP(currentMatchDay);
        })
        .catch((error) => {
          console.error("Failed to load match day:", error);
        });
    }
  }, [appLoaded, getCurrentMatchDay]);

  // Suggested by Claude, so that we fetch user submissions only after the matchday is set
  useEffect(() => {
    if (currentMatchDay && appLoaded) {
      setRenderedMatchDay(currentMatchDay);
      fetchUserSubmissionsFromWP(currentMatchDay);
    }
  }, [currentMatchDay, appLoaded]);


  async function submitToBackend(formDataStr: string) {
    console.log('submitToBackend', formDataStr);
    const formData = new FormData();
    formData.append("dataStr", formDataStr);
    formData.append("matchDay", currentMatchDay.toString());
    formData.append("userId", '1'); // TODO: add multi users

    await axios
      .post(
        `/wp-admin/admin-ajax.php?action=submit_user_predictions`,
        // WP has issues with receiving JSON format OOB, therefore we use formData
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log(res);
        // setMatchList(fakedata);
      })
      .catch((err) => {
        console.log("submitToBackend err", err);
      });
    return;
  }

  async function fetchUserSubmissionsFromWP(matchDay: number) {
    if (fakeDataEnabled) return;
    if (!matchDay || matchDay === 0) return;

    console.log('fetchUserSubmissionsFromWP', matchDay)
    const formData = new FormData();
    formData.append("week_id", matchDay.toString());
    formData.append("user_id", '0'); // TODO: add multi users

    await axios
      .post(
        `/wp-admin/admin-ajax.php?action=get_user_week_submission`,
        // WP has issues with receiving JSON format OOB, therefore we use formData
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log("fetchUserSubmissionsFromWP result ", res);
        setExistingSubmissions(res.data.data.predictions);

        // console.log("existingSubmissions: ", existingSubmissions);
        // setMatchList(res.data.matches);
        // console.log("football-data: ", matchList);
      })
      .catch((err) => {
        console.log("fetchUserSubmissionsFromWP err", err);
      });
  }

  useEffect(() => {
    console.log("existingSubmissions updated to: ", existingSubmissions);
  }, [existingSubmissions]);

  async function getSpecificMatchDayGames(day: number) {
    console.log('getSpecificMatchDayGames', day);
    if (fakeDataEnabled) {
      const fakedata = await import('../assets/data-structure.json')
      console.log(fakedata)
      console.log("day: ", day);
      setMatchList(fakedata.matches as any);
      return;
    }

    const formData = new FormData();
    formData.append("day", day.toString());

    await axios
      .post<FootballDataResponse>(
        `/wp-admin/admin-ajax.php?action=get_matchday_games`,
        // WP has issues with receiving JSON format OOB, therefore we use formData
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        console.log(res);
        setMatchList(res.data.matches);
        console.log("football-data: ", matchList);
      })
      .catch((err) => {
        console.log("getSpecificMatchDayGames err", err);
      });

    // resume reminder: need to create an interface for matchlist so that the above works
    console.log(matchList)
  }

  console.log("we ran!", window.location.origin);

  return (
    <>
      <div className="logo-container flex justify-center">
        <img src={brandLogo} className="brand-logo fade-in" alt="Socc'nd logo" />
      </div>
      <h1 className="text-xl">Socc'nd</h1>
      <h3>Second Half Shenanigans</h3>
      <h3>A small passion project, powered by React/Vite</h3>

      <div className="flex justify-center">
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}, currentMatchDay {currentMatchDay}
        </button>

        {currentMatchDay > 0 && (
          <p>
            <button className="border-black border-2 px-2" onClick={() => void getSpecificMatchDayGames(currentMatchDay)}>
              Load this week's matches
            </button>
          </p>
        )}

        {matchList && matchList.length > 0 && (
          <>
            <p>!!!</p>
            <MatchListRender
              matchList={matchList}
              existingSubmissions={existingSubmissions}
              renderedMatchDay={renderedMatchDay}
              broadcastSubmissionToParent={(data) => submitToBackend(data)}
            />
          </>

        )}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;

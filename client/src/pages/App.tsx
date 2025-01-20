import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MatchListRender from "../components/match-list/matchListRenderer";
import { FootballDataResponse, Match } from '../types/matchData.interface';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// todo:
// done 1. add a loading spinner
// 2. add caching of match data
// 3. add a save success/fail toast
// 4. archived match days
// 5. add a button to switch between users
// 6. add a button to switch between leagues

// place resources inside shaziblues.io/public folder
const brandLogo = `./public/socculi.jpg`;

function App() {
  // const [allMatchData, setAllMatchData] = useState<Match[]>();
  const [renderMatchDay, setRenderMatchDay] = useState(0);
  const [matchList, setMatchList] = useState<Match[]>();
  const [appLoaded, setAppLoaded] = useState(false);
  const [existingSubmissions, setExistingSubmissions] = useState<string>('');

  // ______ FAKE DATA TESTER ______
  const fakeDataEnabled = false;
  // ______ FAKE DATA TESTER ______

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
      getMatchDayGames()
        .then(() => {
          setAppLoaded(true);
          // setRenderedMatchDay(currentMatchDay);
          fetchUserSubmissionsFromWP(renderMatchDay);
        })
        .catch((error) => {
          console.error("Failed to load match day:", error);
        });
    }
  }, [appLoaded, renderMatchDay]);

  // Suggested by Claude, so that we fetch user submissions only after the matchday is set
  useEffect(() => {
    if (renderMatchDay && appLoaded) {
      fetchUserSubmissionsFromWP(renderMatchDay);
    }
  }, [renderMatchDay, appLoaded]);


  async function submitToBackend(formDataStr: string) {
    console.log('submitToBackend', formDataStr);
    const formData = new FormData();
    formData.append("dataStr", formDataStr);
    formData.append("matchDay", renderMatchDay.toString());
    formData.append("userId", '1'); // TODO: add multi users

    try {
      const res = await axios.post(
        `/wp-admin/admin-ajax.php?action=submit_user_predictions`,
        // WP has issues with receiving JSON format OOB, therefore we use formData
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(res);
      toast.success("Predictions submitted successfully.");
      return true;
    } catch (err) {
      console.log("submitToBackend error", err);
      toast.error("Error occured while submitting predictions. Please try again.");
      return false;
    }
  }

  async function fetchUserSubmissionsFromWP(matchDay: number) {
    if (fakeDataEnabled) return;
    if (!matchDay || matchDay === 0) return;

    console.log('fetchUserSubmissionsFromWP', matchDay)
    const formData = new FormData();
    formData.append("week_id", matchDay.toString());
    formData.append("user_id", '1'); // TODO: add multi users

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

  async function getMatchDayGames(day?: number) {
    console.log('getMatchDayGames', day);
    if (fakeDataEnabled) {
      const fakedata = await import('../assets/data-structure.json')
      console.log(fakedata)
      console.log("day: ", day);
      setMatchList(fakedata.default.data.matches.filter((match) => match.matchday === 23) as Match[]);
      return;
    }

    const formData = new FormData();
    // formData.append("day", day.toString());

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
        let currMatchDay = res.data.matches?.[0].season?.currentMatchday;
        setRenderMatchDay(currMatchDay);
        // setAllMatchData(res.data.matches);
        setMatchList(res.data.matches.filter((match) => match.matchday == currMatchDay));
        console.log("football-data for this week: ", matchList);
      })
      .catch((err) => {
        console.log("getMatchDayGames err", err);
      });

    // resume reminder: need to create an interface for matchlist so that the above works
    console.log(matchList)
  }

  console.log("we ran!", window.location.origin);

  return (
    <>
      <div className="flex flex-row justify-around bg-light">

        <div className="content-center d-none d-lg-block">
          <h1 className="display-1">Socculi</h1>
          <h3 className="display-5">Second Half Fantasy League</h3>

        </div>
        <div className="logo-container flex">
          <img src={brandLogo} className="brand-logo fade-in" alt="Socc'nd logo" />
        </div>
      </div>

      <div className="card p-0">
        {!appLoaded && (
          <div className="flex flex-row justify-around">
            <div className="loader"></div>
          </div>
        )}
        <ToastContainer
          position="top-center" />
        {matchList && matchList.length > 0 && (
          <>
            <MatchListRender
              matchList={matchList}
              existingSubmissions={existingSubmissions}
              renderedMatchDay={renderMatchDay}
              broadcastSubmissionToParent={(data) => submitToBackend(data)}
            />
          </>
        )}
      </div>
    </>
  );
}

export default App;

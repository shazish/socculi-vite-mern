import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import MatchListRender from "../components/match-list/matchListRenderer";
// import './App.css'

// place resources inside shaziblues.io/public folder
const viteLogo = `/vite.svg`;
const reactLogo = `/react.svg`;

function App() {
  const [count, setCount] = useState(0);
  const [currentMatchDay, setCurrentMatchDay] = useState(0);
  const [renderedMatchDay, setRenderedMatchDay] = useState(0);
  const [matchList, setMatchList] = useState<[]>([]);
  const [appLoaded, setAppLoaded] = useState(false);


  // We used useCallback here because: The function is used in a useEffect dependency array.
  // We want to prevent unnecessary recreations of this function on every render
  const getCurrentMatchDay = useCallback(async () => {
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
        })
        .catch((error) => {
          console.error("Failed to load match day:", error);
        });
    }
  }, [appLoaded, getCurrentMatchDay]);

  async function getSpecificMatchDayGames(day: number) {
    const fakedata = await import('../assets/data-structure.json') 
    console.log(fakedata)
    const formData = new FormData();
    formData.append("day", day.toString());
    console.log("day: ", day);
    
    // await axios
    //   .post(
    //     `/wp-admin/admin-ajax.php?action=get_matchday_games`,
    //     // WP has issues with receiving JSON format OOB, therefore we use formData
    //     formData,
    //     {
    //       headers: {
    //         "Content-Type": "multipart/form-data",
    //       },
    //     }
    //   )
    //   .then((res) => {
    //     console.log(res);
    //     // setMatchList(fakedata);
    //     console.log("football-data: ", matchList);
    //   })
    //   .catch((err) => {
    //     console.log("err", err);
    //   });
      setMatchList(fakedata.matches as any);
      console.log(matchList)
  }

  console.log("we ran!", window.location.origin);

  return (
    <>
      <div>
        currentMatchDay: {currentMatchDay}
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Second Half Shenanigans</h1>
      <h3>A small passion project</h3>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}, currentMatchDay {currentMatchDay}
        </button>

        <button className="border-black border-2 px-2" onClick={() => void getSpecificMatchDayGames(currentMatchDay)}>
          Load this week's matches
        </button>
        
        {matchList?.length > 0 && (
          <>
          <p>!!!</p>
            <MatchListRender
            matchList={matchList}
            renderedMatchDay={renderedMatchDay}
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

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
// import './App.css'

// place resources inside shaziblues.io/public folder
const viteLogo = `/vite.svg`;
const reactLogo = `/react.svg`;

function App() {
  const [count, setCount] = useState(0);
  const [currentMatchDay, setCurrentMatchDay] = useState(0);
  // const [renderedMatchDay, setRenderedMatchDay] = useState(0);
  // const [matchList, updateMatchList] = useState([]);
  const [appLoaded, setAppLoaded] = useState(false);

  // We used useCallback here because: The function is used in a useEffect dependency array.
  // We want to prevent unnecessary recreations of this function on every render
  const getCurrentMatchDay = useCallback(async () => {
    try {
      // const response = await axios.get('/wp-admin/admin-ajax.php?action=current_matchday_endpoint');
      setCurrentMatchDay(0 && response.data.currentSeason.currentMatchday);
    } catch (error) {
      console.error("Failed to fetch match day:", error);
      // Consider adding error state handling here
    }
  }, []);

  useEffect(() => {
    if (!appLoaded) {
      getCurrentMatchDay()
        .then(() => {
          setAppLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to load match day:", error);
        });
    }
  }, [appLoaded, getCurrentMatchDay]);

  async function getSpecificMatchDayGames(day: number) {
    let matchList;
    console.log("day: ", day);
    await axios
      .get(`/wp-admin/admin-ajax.php?action=get_matchday_games?day=${day}`)
      .then((res) => {
        matchList = res.data;
        console.log("football-data: ", matchList);
      })
      .catch((err) => {
        console.log("err", err);
      });
    return matchList;
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

        <button onClick={() => void getSpecificMatchDayGames(currentMatchDay)}>
          Load this week's matches
        </button>
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

// async function getSpecificMatczchDayGames(day) {
//   console.log("getSpecificMatchDayGames", day);
//   let url = "http://localhost:3000/day/" + day;
//   axios.get(url, { crossdomain: true }).then((response) => {
//     console.log("response", response);
//     updateMatchList((matchList) => {
//       return [...response.data.matchList.matches];
//     });
//     setRenderedMatchDay((RenderedMatchDay) => day);
//   });
// }

export default App;

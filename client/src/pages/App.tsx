import { useState, useEffect } from 'react'
import axios from 'axios';
// import './App.css'

// place resources inside shaziblues.io/public folder
const viteLogo = `/vite.svg`;
const reactLogo = `/react.svg`;

function App() {
  const [count, setCount] = useState(0);
  const [currentMatchDay, setCurrentMatchDay] = useState(0);
  // const [renderedMatchDay, setRenderedMatchDay] = useState(0);
  // const [matchList, updateMatchList] = useState([]);
  const [appLoaded, setAppLoaded] = useState(0);

  useEffect(() => {
    // determine
    console.log("appLoaded", appLoaded);
    if (appLoaded !== 1) getCurrentMatchDay();
    setAppLoaded(() => 1);
  });

  async function getCurrentMatchDay() {
    // let currentMatchDay; // the state variable does not get updated in time for the axios call so we need to use a local variable

    await axios
      .get('/wp-admin/admin-ajax.php?action=current_matchday_endpoint')
      .then((res) => {
        console.log("getcurrentMatchDay result", res)
        setCurrentMatchDay(
          () => res.data.currentSeason.currentMatchday
        );        
      })
      .catch((err) => {
        console.log("err", err);
      });

    getSpecificMatchDayGames(currentMatchDay);
  }

  async function getSpecificMatchDayGames(day: number) {
    let matchList;
    console.log("day: ", day)
    await axios.get(`/wp-admin/admin-ajax.php?action=get_matchday_games?day=${day}`)
    .then((res) => {
      matchList = res.data;
      console.log("football-data: ", matchList);
    })
    .catch((err) => {
      console.log('err', err)
    })
    return matchList;
  }

  console.log('we ran!', window.location.origin);

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
      <h1>Vite + React</h1>
      <div className="card">

        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}, currentMatchDay {currentMatchDay}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
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



export default App

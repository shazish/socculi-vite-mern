// place resources inside shaziblues.io/public folder
const viteLogo = `./public/vite.svg`;
const reactLogo = `./public/react.svg`;
const brandLogo = `./public/socculi.jpg`;
const footballDataLogo = `./public/football-data-logo.jpg`;
function About() {
    return (
        <div>
            <div className="logo-container flex justify-center">
                <img src={brandLogo} className="brand-logo fade-in" alt="Socc'nd logo" />
            </div>
            <div className="m-4 content-center bg-light">
                <h1 className="display-2">Socculi</h1>
                <h3 className="display-5">Second Half Fantasy League</h3>
                <em>A small passion project by Shaun Shahbazi</em>
            </div>

            <hr></hr>
            <div className="m-4">
                <p>Football-data.org provides football data and statistics (live scores, fixtures, tables, squads, lineups/subs, etc.) in a machine-readable way.</p>
                <p>Socculi is a small passion project that I started in my free time, both to create something new, and to learn React and Wordpress on the Go!</p>
                <p>Socculi is powered by React/Vite. It's currently using Wordpress as backend.</p>
            </div>

            <hr></hr>
            <div className="m-4">
                Rules:
                <ol className="items-start">
                    <li>You have until the beginning of the 2nd half of each game to submit your prediction.</li>
                    <li>Correct winner/tie: 1 point</li>
                    <li>Correct goal difference: 2 points</li>
                    <li>Correct final score: 3 points</li>
                </ol>
            </div>




            <div className="flex justify-center">
                <a href="https://www.football-data.org/" target="_blank">
                    <img src={footballDataLogo} className="logo" alt="Football Data logo" />
                </a>

                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>

                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
            </div>
        </div>
    )
}

export default About
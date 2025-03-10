import { Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/Container";

// place resources inside shaziblues.io/public folder
const viteLogo = `./public/vite.svg`;
const reactLogo = `./public/react.svg`;
const brandLogo = `./public/socculi.jpg`;
const footballDataLogo = `./public/football-data-logo.jpg`;
const auth0Logo = `./public/auth0.png`;
const wpLogo = `./public/wp-logo.png`;

function About() {
    return (
        <div>
            <div className="logo-container flex justify-center">
                <img src={brandLogo} className="brand-logo fade-in" alt="Socc'nd logo" />
            </div>
            <div className="m-4 pb-3 content-center bg-light">
                <h1 className="display-2">Socculi</h1>
                <h3 className="display-5">Second Half Fantasy League</h3>
                <em>A small passion project by Shaun Shahbazi</em>
            </div>

            <Container>
                <Row>
                    <Col className="flex flex-col text-start" md={{ span: 8, offset: 2 }}>
                        <hr />
                        <p className="mt-2"><strong>Socculi</strong> is a small passion project that I started in my free time; because apart from my respect for the English Premier League, I love creating interesting stuff (relatively speaking!), and to have an opportunity to deal with React and Wordpress.</p>
                        <p className="mt-2">Football-data.org is a free service that provides football data and statistics (live scores, fixtures, tables, squads, lineups/subs, etc.) in a machine-readable way.</p>
                        <p className="my-2">Socculi is powered by React/Vite on the frontend, and MySQL and Wordpress on the backend. It's currently using Auth0 for authentication.</p>
                        <hr />
                        <strong className="mt-2">Rules (Subject to change):</strong>
                        <ol className="items-start">
                            <li>You have until the beginning of the 2nd half of each game to submit your prediction.</li>
                            <li>Correct winner/tie: 1 point</li>
                            <li>Correct goal difference: 2 points</li>
                            <li>Correct final score: 3 points</li>
                        </ol>
                    </Col>
                </Row>
            </Container>

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

                <a href="https://wordpress.org/" target="_blank">
                    <img src={wpLogo} className="logo" alt="Wordpress logo" />
                </a>

                <a href="https://auth0.com" target="_blank">
                    <img src={auth0Logo} className="logo" alt="Auth0 logo" />
                </a>
            </div>
        </div>
    )
}

export default About
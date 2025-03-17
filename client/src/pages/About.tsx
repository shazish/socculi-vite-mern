import { Col, Row } from "react-bootstrap";
import Container from "react-bootstrap/Container";

const viteLogo = `./public/vite.svg`;
const reactLogo = `./public/react.svg`;
const brandLogo = `./public/socculi.jpg`;
const footballDataLogo = `./public/football-data-logo.jpg`;
const auth0Logo = `./public/auth0.png`;
const wpLogo = `./public/wp-logo.png`;

function About() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Container className="py-12">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <img 
                        src={brandLogo} 
                        className="w-24 h-24 mx-auto mb-8 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300" 
                        alt="Socculi logo" 
                    />
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Socculi</h1>
                    <p className="text-xl text-gray-600 mb-2">Second Half Fantasy League</p>
                    <p className="text-sm text-gray-500 italic">A passion project by Shaun Shahbazi</p>
                </div>

                {/* Main Content */}
                <Row className="justify-content-center mb-16">
                    <Col md={8} lg={7}>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed mb-6">
                                <strong className="text-gray-900">Socculi</strong> is a unique fantasy league 
                                experience based on the English Premier League. Born from a passion for football 
                                and web development, it offers a fresh take on match predictions with a focus 
                                on second-half gameplay.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Socculi is powered by React and Vite on the frontend, with MySQL and WordPress handling the 
                                backend operations. The football data is sourced from the Football Data API.
                            </p>
                        </div>

                        {/* Rules Section */}
                        <div className="bg-white rounded-xl shadow-sm p-8 mb-12">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
                            <ol className="space-y-4 text-gray-700">
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-semibold mr-3">1</span>
                                    Submit predictions before second half begins
                                </li>
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-semibold mr-3">2</span>
                                    Earn 1 point for correct winner/tie
                                </li>
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-semibold mr-3">3</span>
                                    Get 2 points for correct goal difference
                                </li>
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-semibold mr-3">4</span>
                                    Score 3 points for exact score prediction
                                </li>
                                <li className="flex items-start">
                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-semibold mr-3">5</span>
                                    Impact multiplier: 2.0x to 1.0x based on submission timing
                                </li>
                            </ol>
                        </div>
                    </Col>
                </Row>

                {/* Tech Stack */}
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-700 mb-6">Powered By</h3>
                    <div className="flex flex-wrap justify-center items-center gap-8">
                        {[
                            { src: footballDataLogo, alt: "Football Data", href: "https://www.football-data.org/" },
                            { src: reactLogo, alt: "React", href: "https://react.dev" },
                            { src: viteLogo, alt: "Vite", href: "https://vitejs.dev" },
                            { src: wpLogo, alt: "WordPress", href: "https://wordpress.org/" },
                            { src: auth0Logo, alt: "Auth0", href: "https://auth0.com" }
                        ].map((tech) => (
                            <a 
                                key={tech.alt}
                                href={tech.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="transform hover:scale-110 transition-transform duration-300"
                            >
                                <img 
                                    src={tech.src} 
                                    alt={tech.alt} 
                                    className="h-12 w-auto opacity-75 hover:opacity-100 transition-opacity duration-300" 
                                />
                            </a>
                        ))}
                    </div>
                </div>
            </Container>
        </div>
    );
}

export default About;
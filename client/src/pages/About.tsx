// place resources inside shaziblues.io/public folder
const viteLogo = `./public/vite.svg`;
const reactLogo = `./public/react.svg`;
const brandLogo = `./public/2ndhalflogo.webp`;
function About() {
    return (
        <div>
            <div className="logo-container flex justify-center">
                <img src={brandLogo} className="brand-logo fade-in" alt="Socc'nd logo" />
            </div>
            <h1 className="text-xl">Socc'nd</h1>
            <h3>Second Half Shenanigans</h3>
            <p>Socc'nd is a small passion project that I started in my free time, both to create something new, and to learn React and Wordpress on the Go!</p>
            <p>Socc'nd is powered by React/Vite. It's currently using Wordpress as backend.</p>

            <div className="flex justify-center">
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
        </div>
    )
}

export default About
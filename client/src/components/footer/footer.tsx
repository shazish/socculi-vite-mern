import { Container } from 'react-bootstrap';

declare const __LAST_COMMIT_DATE__: string;

function SocculiFooter() {
  const lastUpdateDate = new Date(__LAST_COMMIT_DATE__).toLocaleDateString('en-US', {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric'
  });

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 py-4 mt-auto">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-semibold">Socculi</span>
            <span className="text-gray-400 text-sm">{import.meta.env.VITE_APP_DESCRIPTION}</span>
          </div>
          
          {/* <div className="flex items-center gap-6 text-gray-400">
            <a href="/privacy" className="text-sm hover:text-blue-400 transition-colors">
              Privacy
            </a>
            <a href="/terms" className="text-sm hover:text-blue-400 transition-colors">
              Terms
            </a>
            <a 
              href="https://github.com/shaunpc/socculi-vite-mern" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:text-blue-400 transition-colors"
            >
              GitHub
            </a>
          </div> */}

          <div className="text-gray-500 text-xs">
            Last updated: {lastUpdateDate}
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default SocculiFooter;
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import SocculiNavbar from './components/navbar/navbar.js'
import About from './pages/About.tsx'
import Vsop from './pages/Vsop.tsx'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App.tsx'
import './style/style.css'
import './index.scss'
import SocculiFooter from './components/footer/footer.js'

import { ReactNode } from 'react';

const TitleManager = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  useEffect(() => {
    const currentRoute = routes.find(route => route.path === location.pathname) || routes[0];
    document.title = currentRoute.title;
  }, [location]);

  return children;
};

const routes = [
  { path: '/', element: <App />, title: 'Home | Socculi' },
  { path: '/about', element: <About />, title: 'About | Socculi' },
  { path: '/vsop', element: <Vsop />, title: 'Vs OP | Socculi' },
  { path: '*', element: <App />, title: 'Home | Socculi' }    
];

// for local login, make sure .env file is in place, bro
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        cacheLocation="localstorage"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
      >
        <SocculiNavbar />
        <TitleManager>
          <Routes>
            {routes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Routes>
        </TitleManager>
        <SocculiFooter />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>,
)

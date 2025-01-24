import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Navbar from './components/navbar/navbar.js'
import About from './pages/About.tsx'
import ThisWeek from './pages/ThisWeek.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App.tsx'
import './style/style.css'
import './index.scss'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-c7t4suh18tfmv2xh.us.auth0.com"
        clientId="U8JAIQuIMg1CdMhDCCG4Omn3CtyjKuRP"
        cacheLocation="localstorage"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: "https://dev-c7t4suh18tfmv2xh.us.auth0.com/api/v2/",
        }}
      >
        <Navbar />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<About />} />
          <Route path="/thisweek" element={<ThisWeek />} />
          <Route path="*" element={<App />} />
        </Routes>
      </Auth0Provider>

    </BrowserRouter>
  </React.StrictMode>,
)

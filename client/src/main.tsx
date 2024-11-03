import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/navbar/navbar.jsx'
import About from './pages/About.tsx'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App.tsx'
import './style/style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
    
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)

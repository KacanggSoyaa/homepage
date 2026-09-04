// main.jsx — application entry point.
// This file boots the React application: it grabs the #root <div> from
// index.html, attaches the React root, and renders the app wrapped in
// the two top-level providers (StrictMode + BrowserRouter).

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // Provides client-side routing
import App from './App.jsx'
import './index.css' // Global styles + Tailwind (v4 CSS-first config)

// Page section components that render on the main "/" route.
// Each section has an `id` (used for anchor scrolling) and a `Component`.
// To add a new section to the main page, import it here and add an entry to
// the `sections` array below.
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Certificates from './pages/Certificates.jsx'
import Achievements from './pages/Achievements.jsx'
import Contact from './pages/Contact.jsx'

// Registry of sections rendered on the home page.
// Order here determines the order they appear when scrolling down the page.
const sections = [
  { id: 'home', Component: Home },
  { id: 'projects', Component: Projects },
  { id: 'certificates', Component: Certificates },
  { id: 'achievements', Component: Achievements },
  { id: 'contact', Component: Contact },
]

// Mount the React app into the #root element in index.html.
//   - StrictMode enables extra development warnings and helps catch bugs.
//   - BrowserRouter enables client-side routing (URL changes without reload).
//   - The `sections` array is passed into <App> so it knows what to render on "/".
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App sections={sections} />
    </BrowserRouter>
  </React.StrictMode>,
)

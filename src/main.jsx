import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Page section components that render on the main "/" route.
// Each section has an `id` (used for anchor scrolling) and a `Component`.
// To add a new section to the main page, import it here and add an entry.
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Certificates from './pages/Certificates.jsx'
import Contact from './pages/Contact.jsx'

// Registry of sections rendered on the home page.
// Order here determines the order they appear when scrolling.
const sections = [
  { id: 'home', Component: Home },
  { id: 'projects', Component: Projects },
  { id: 'certificates', Component: Certificates },
  { id: 'contact', Component: Contact },
]

// Mount the React app into the #root element in index.html.
// StrictMode enables extra development warnings; BrowserRouter enables client-side routing.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App sections={sections} />
    </BrowserRouter>
  </React.StrictMode>,
)

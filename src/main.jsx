import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import Certificates from './pages/Certificates.jsx'
import Contact from './pages/Contact.jsx'

const sections = [
  { id: 'home', Component: Home },
  { id: 'projects', Component: Projects },
  { id: 'certificates', Component: Certificates },
  { id: 'contact', Component: Contact },
]

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App sections={sections} />
    </BrowserRouter>
  </React.StrictMode>,
)

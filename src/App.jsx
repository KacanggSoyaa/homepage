import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import About from './pages/About.jsx'

// App is the root component. It receives the `sections` array from main.jsx
// and renders them on the "/" route. About stays on its own "/about" route.
export default function App({ sections }) {
  // Theme state: reads from localStorage on first render, defaults to "dark".
  // Stored as "dark" | "light" and synced to the <html> class for Tailwind dark mode.
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'dark'
  })

  // Sync the dark/light class on <html> whenever theme changes, and persist to localStorage.
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // On initial page load, if the URL contains a hash (e.g. /#projects),
  // smooth-scroll to that section after the DOM is ready.
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Toggle between dark and light themes.
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky navbar at the top of every page */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Main content area fills remaining vertical space */}
      <main className="flex-1">
        <Routes>
          {/* Home route: renders all sections from the sections array stacked vertically.
              A horizontal divider (<hr>) is placed between each section. */}
          <Route
            path="/"
            element={
              <>
                {sections.map(({ id, Component }, i) => (
                  <div key={id}>
                    <Component />
                    {/* Add a divider between sections, but not after the last one */}
                    {i < sections.length - 1 && (
                      <hr className="border-ink-200/15 dark:border-paper-50/10 mx-6 sm:mx-10" />
                    )}
                  </div>
                ))}
              </>
            }
          />
          {/* About page is on its own route, separate from the main scroll */}
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      {/* Site-wide footer with social links */}
      <Footer />
    </div>
  )
}

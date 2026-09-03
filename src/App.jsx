// App.jsx — root layout component.
// Renders the site chrome (Navbar + Footer) around the routed page content.
// It owns the dark/light theme state and smooth-scroll behavior for anchors.

import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import SpaceBackground from './components/SpaceBackground.jsx'
import About from './pages/About.jsx'

// App is the root component. It receives the `sections` array from main.jsx
// and renders them on the "/" route. About stays on its own "/about" route.
export default function App({ sections }) {
  // ------------------------------------------------------------
  // Theme state: reads from localStorage on first render, defaults to "dark".
  // The value is either "dark" or "light" and is synced to the <html> class
  // so Tailwind's dark-mode variant (`dark:`) knows which theme is active.
  // ------------------------------------------------------------
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'dark'
  })

  // Whenever the theme changes, add/remove the "dark" class on <html>
  // and persist the choice to localStorage so it survives page reloads.
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
  // smooth-scroll to that section once the DOM is ready so users landing
  // on a deep-linked section start at the right place.
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // Flip between dark and light themes (used by the navbar toggle).
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    // Outer wrapper: min-h-screen + flex column keeps the footer pinned to
    // the bottom even on short pages, with main filling the middle.
    // `relative` makes the absolutely-anchored space background scope cleanly.
    <div className="min-h-screen flex flex-col relative overflow-x-clip">
      {/* Global space-themed background (stars, moon, sun, solar system).
          Rendered behind everything and follows the current theme. */}
      <SpaceBackground theme={theme} />

      {/* Sticky navigation bar shown at the top of every page */}
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      {/* Main content area — flex-1 makes it expand to push the footer down.
          relative + z-10 keeps content above the fixed background. */}
      <main className="flex-1 relative z-10">
        <Routes>
          {/* Home route: renders all sections from the `sections` array
              stacked vertically, with a horizontal divider between them. */}
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
          {/* About page lives on its own route, separate from the main scroll */}
          <Route path="/about" element={<About />} />
        </Routes>
      </main>

      {/* Site-wide footer with social links */}
      <Footer />
    </div>
  )
}

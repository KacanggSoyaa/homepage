// Navbar.jsx — sticky top navigation bar.
// Shows the brand logo, section links + About link, and a theme toggle.
// Fully responsive: a horizontal desktop menu (≥640px) and, on smaller
// screens, a hamburger icon that opens a collapsible dropdown menu.

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { SunIcon, MoonIcon } from './Icons.jsx'

// Navigation links for sections on the main page.
// These use anchor hrefs (/#section) to smooth-scroll on the home page.
const sectionLinks = [
  { href: '/#home', label: 'home' },
  { href: '/#projects', label: 'projects' },
  { href: '/#certificates', label: 'certificates' },
  { href: '/#achievements', label: 'achievements' },
  { href: '/#contact', label: 'contact' },
]

export default function Navbar({ theme, toggleTheme }) {
  // Tracks whether the mobile dropdown menu is open.
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    // Sticky header bar that stays at the top of the viewport.
    // Uses backdrop-blur for a frosted-glass effect over content below.
    // In dark mode its translucent black (space) tint blends with the sky.
    <header className="border-b border-ink-200/10 dark:border-paper-50/5 bg-paper-50/80 dark:bg-space-900/70 backdrop-blur-md sticky top-0 z-50">
      {/* Main nav bar: brand logo on the left, links in the center, theme toggle + hamburger on the right */}
      <nav className="container-page flex items-center justify-between h-16">
        {/* Brand logo — links back to home */}
        <NavLink to="/" className="group font-mono text-sm font-semibold tracking-tight">
          <span className="text-amber dark:text-glow-amber transition-all">&lt;</span>
          danis
          <span className="text-amber dark:text-glow-amber transition-all">/&gt;</span>
        </NavLink>

        {/* Desktop navigation: horizontal list of section links + About page link.
            Hidden on mobile (shown from sm breakpoint up). */}
        <ul className="hidden sm:flex items-center gap-1 font-mono text-sm">
          {/* Section links — anchor hrefs that scroll to sections on the main page.
              Each gets a subtle pill highlight on hover for a cleaner UI. */}
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="prompt px-3.5 py-2 rounded-md transition-all text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50 hover:bg-ink-900/5 dark:hover:bg-paper-50/5"
              >
                {link.label}
              </a>
            </li>
          ))}
          {/* About link — uses React Router NavLink for route-based navigation and active state */}
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `prompt px-3.5 py-2 rounded-md transition-all ${
                  isActive
                    ? 'text-amber dark:text-glow-amber bg-ink-900/5 dark:bg-paper-50/5'
                    : 'text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50 hover:bg-ink-900/5 dark:hover:bg-paper-50/5'
                }`
              }
            >
              about
            </NavLink>
          </li>
        </ul>

        {/* Right-side controls: theme toggle (always visible) + hamburger (mobile only) */}
        <div className="flex items-center gap-3">
          {/* Theme toggle button: shows sun icon in dark mode, moon icon in light mode */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="w-9 h-9 flex items-center justify-center rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200 hover:border-amber/60 hover:text-amber hover:shadow-lg hover:shadow-amber/10 transition-all"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Hamburger button — only visible on mobile (below sm). Toggles the
              dropdown menu. The three bars animate into an "X" when open. */}
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="sm:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200 hover:border-amber/60 transition-all"
          >
            <span
              className={`w-5 h-0.5 rounded-full bg-current transition-all ${
                menuOpen ? 'translate-y-1.5 rotate-45' : ''
              }`}
            />
            <span
              className={`w-5 h-0.5 rounded-full bg-current transition-all ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-5 h-0.5 rounded-full bg-current transition-all ${
                menuOpen ? '-translate-y-1.5 -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu: a stacked list of all links + About.
          Shown only on mobile (below sm) and only when the hamburger is open.
          Uses the same frosted styling as the header so it blends in. */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col px-4 pb-4 gap-1 font-mono text-sm">
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block prompt px-3 py-2.5 rounded-md transition-colors text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50 hover:bg-ink-900/5 dark:hover:bg-paper-50/5"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <NavLink
              to="/about"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block prompt px-3 py-2.5 rounded-md transition-colors ${
                  isActive
                    ? 'text-amber dark:text-glow-amber bg-ink-900/5 dark:bg-paper-50/5'
                    : 'text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50 hover:bg-ink-900/5 dark:hover:bg-paper-50/5'
                }`
              }
            >
              about
            </NavLink>
          </li>
        </ul>
      </div>
    </header>
  )
}

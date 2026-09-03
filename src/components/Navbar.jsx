// Navbar.jsx — sticky top navigation bar.
// Shows the brand logo, section links + About link, and a theme toggle.
// Renders a horizontal desktop menu (≥640px) and a scrollable mobile bar.

import { NavLink } from 'react-router-dom'
import { SunIcon, MoonIcon } from './Icons.jsx'

// Navigation links for sections on the main page.
// These use anchor hrefs (/#section) to smooth-scroll on the home page.
const sectionLinks = [
  { href: '/#home', label: 'home' },
  { href: '/#projects', label: 'projects' },
  { href: '/#certificates', label: 'certificates' },
  { href: '/#contact', label: 'contact' },
]

export default function Navbar({ theme, toggleTheme }) {
  return (
    // Sticky header bar that stays at the top of the viewport.
    // Uses backdrop-blur for a frosted-glass effect over content below.
    <header className="border-b border-ink-200/10 dark:border-paper-50/5 bg-paper-50/90 dark:bg-ink-900/90 backdrop-blur sticky top-0 z-50">
      {/* Main nav bar: brand logo on the left, links in the center, theme toggle on the right */}
      <nav className="container-page flex items-center justify-between h-16">
        {/* Brand logo — links back to home */}
        <NavLink to="/" className="font-mono text-sm font-semibold tracking-tight">
          <span className="text-amber">&lt;</span>
          danis
          <span className="text-amber">/&gt;</span>
        </NavLink>

        {/* Desktop navigation: horizontal list of section links + About page link.
            Hidden on mobile (shown below sm breakpoint). */}
        <ul className="hidden sm:flex items-center gap-1 font-mono text-sm">
          {/* Section links — anchor hrefs that scroll to sections on the main page */}
          {sectionLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="prompt px-3 py-2 rounded-md transition-colors text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50"
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
                `prompt px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'text-amber'
                    : 'text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50'
                }`
              }
            >
              about
            </NavLink>
          </li>
        </ul>

        {/* Theme toggle button: shows sun icon in dark mode, moon icon in light mode */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="w-9 h-9 flex items-center justify-center rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200 hover:border-amber/60 hover:text-amber transition-colors"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>

      {/* Mobile navigation: horizontally scrollable list of links.
          Visible only below the sm breakpoint (640px). */}
      <ul className="sm:hidden flex overflow-x-auto gap-1 px-4 pb-3 font-mono text-xs">
        {/* Section links for mobile */}
        {sectionLinks.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="prompt px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50"
            >
              {link.label}
            </a>
          </li>
        ))}
        {/* About link for mobile */}
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `prompt px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-amber'
                  : 'text-ink-600 dark:text-paper-200/70 hover:text-ink-900 dark:hover:text-paper-50'
              }`
            }
          >
            about
          </NavLink>
        </li>
      </ul>
    </header>
  )
}

import { NavLink } from 'react-router-dom'
import { SunIcon, MoonIcon } from './Icons.jsx'

const sectionLinks = [
  { href: '/#home', label: 'home' },
  { href: '/#projects', label: 'projects' },
  { href: '/#certificates', label: 'certificates' },
  { href: '/#contact', label: 'contact' },
]

export default function Navbar({ theme, toggleTheme }) {
  return (
    <header className="border-b border-ink-200/10 dark:border-paper-50/5 bg-paper-50/90 dark:bg-ink-900/90 backdrop-blur sticky top-0 z-50">
      <nav className="container-page flex items-center justify-between h-16">
        <NavLink to="/" className="font-mono text-sm font-semibold tracking-tight">
          <span className="text-amber">&lt;</span>
          danis
          <span className="text-amber">/&gt;</span>
        </NavLink>

        <ul className="hidden sm:flex items-center gap-1 font-mono text-sm">
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

      {/* mobile nav */}
      <ul className="sm:hidden flex overflow-x-auto gap-1 px-4 pb-3 font-mono text-xs">
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

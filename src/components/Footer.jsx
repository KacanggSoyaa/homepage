// Footer.jsx — site-wide footer.
// Shows a copyright notice on the left and social media icon links on the right.

import { GithubIcon, LinkedinIcon, MailIcon, InstagramIcon } from './Icons.jsx'

export default function Footer() {
  // Dynamically get the current year for the copyright notice.
  const year = new Date().getFullYear()

  return (
    // Site-wide footer with a top border line and social icon links.
    // relative + z-10 keeps it above the fixed space background.
    <footer className="relative z-10 border-t border-ink-200/10 dark:border-paper-50/5 mt-24">
      <div className="container-page py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Copyright text on the left */}
        <p className="font-mono text-xs text-ink-600 dark:text-paper-200/60">
          © {year} Danis Nazri — built with React
        </p>

        {/* Social media icon links on the right */}
        <div className="flex items-center gap-4 text-ink-600 dark:text-paper-200/70">
          <a href="https://github.com/KacanggSoyaa" aria-label="GitHub" className="hover:text-amber transition-colors">
            <GithubIcon />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-amber transition-colors">
            <LinkedinIcon />
          </a>
          <a href="mailto:kacanggsoyaa18@gmail.com" aria-label="Email" className="hover:text-amber transition-colors">
            <MailIcon />
          </a>
          <a href="https://www.instagram.com/dnazzry_" aria-label="Instagram" className="hover:text-amber transition-colors">
            <InstagramIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

import { GithubIcon, LinkedinIcon, MailIcon } from './Icons.jsx'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-ink-200/10 dark:border-paper-50/5 mt-24">
      <div className="container-page py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-ink-600 dark:text-paper-200/60">
          © {year} Danis Nazri — built with React
        </p>
        <div className="flex items-center gap-4 text-ink-600 dark:text-paper-200/70">
          <a href="#" aria-label="GitHub" className="hover:text-amber transition-colors">
            <GithubIcon />
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-amber transition-colors">
            <LinkedinIcon />
          </a>
          <a href="#" aria-label="Email" className="hover:text-amber transition-colors">
            <MailIcon />
          </a>
        </div>
      </div>
    </footer>
  )
}

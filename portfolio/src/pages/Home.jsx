import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="container-page py-16 sm:py-24 grid lg:grid-cols-2 gap-14 items-center">
      <div>
        <p className="font-mono text-sm text-amber mb-4">
          $ whoami<span className="caret" />
        </p>
        <h1 className="text-4xl sm:text-5xl font-mono font-semibold leading-tight">
          Danis Nazri
        </h1>
        <p className="mt-3 text-lg text-ink-700 dark:text-paper-200/80 font-mono">
          Software &amp; App Developer
        </p>
        <p className="mt-6 max-w-md text-ink-700 dark:text-paper-200/80 leading-relaxed">
          Passionate about website development — currently growing my skills
          as an IT student focused on building software and applications
          that solve real problems.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/projects"
            className="px-5 py-2.5 rounded-md bg-amber text-ink-950 font-mono text-sm font-medium hover:bg-amber-light transition-colors"
          >
            View projects
          </Link>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-md border border-ink-200/25 dark:border-paper-50/15 font-mono text-sm hover:border-amber/60 hover:text-amber transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </div>

      {/* mock code panel */}
      <div className="rounded-lg border border-ink-200/15 dark:border-paper-50/10 overflow-hidden shadow-sm">
        <div className="flex items-center gap-1.5 px-4 py-3 bg-ink-900/5 dark:bg-paper-50/5 border-b border-ink-200/10 dark:border-paper-50/10">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-teal/70" />
          <span className="ml-3 font-mono text-xs text-ink-600 dark:text-paper-200/60">
            profile.json
          </span>
        </div>
        <pre className="font-mono text-xs sm:text-sm leading-6 p-5 overflow-x-auto">
          <code>
            <span className="text-ink-600 dark:text-paper-200/50">{'{'}</span>{'\n'}
            {'  '}<span className="text-teal">"name"</span>: <span className="text-amber">"Danis Nazri"</span>,{'\n'}
            {'  '}<span className="text-teal">"role"</span>: <span className="text-amber">"Software & App Developer"</span>,{'\n'}
            {'  '}<span className="text-teal">"location"</span>: <span className="text-amber">"Kuala Lumpur, MY"</span>,{'\n'}
            {'  '}<span className="text-teal">"stack"</span>: [<span className="text-amber">"React"</span>, <span className="text-amber">"Node"</span>, <span className="text-amber">"MySQL"</span>],{'\n'}
            {'  '}<span className="text-teal">"status"</span>: <span className="text-amber">"open to opportunities"</span>{'\n'}
            <span className="text-ink-600 dark:text-paper-200/50">{'}'}</span>
          </code>
        </pre>
      </div>
    </section>
  )
}

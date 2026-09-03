import { skillGroups } from '../data/skills.js'
import { projects } from '../data/projects.js'
import { certificates } from '../data/certificates.js'
import ShootingStars from '../components/ShootingStars.jsx'

const allSkills = skillGroups.flatMap((g) => g.items)
const languageCount = skillGroups.find((g) => g.label === 'Languages')?.items.length ?? 0

const stats = [
  { value: `${languageCount}+`, label: 'Languages' },
  { value: `${projects.length}+`, label: 'Projects' },
  { value: `${certificates.length}+`, label: 'Certificates' },
  { value: '1', label: 'IT student, always building' },
]

export default function Home() {
  return (
    <>
      <ShootingStars />

      {/* Hero Section */}
      <section id="home" className="container-page pt-16 sm:pt-24 pb-10 grid lg:grid-cols-2 gap-14 items-center relative z-10">
        <div>
          <p className="font-mono text-sm text-amber mb-4">
            $ whoami<span className="caret" />
          </p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-mono font-semibold leading-[0.98] tracking-tight">
            Danis
            <br />
            Nazri
          </h1>
          <p className="mt-4 text-lg text-ink-700 dark:text-paper-200/80 font-mono">
            Software &amp; App Developer
          </p>
          <p className="mt-6 max-w-md text-ink-700 dark:text-paper-200/80 leading-relaxed">
            Passionate about website development — currently growing my skills
            as an IT student focused on building software and applications
            that solve real problems.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="px-5 py-2.5 rounded-md bg-amber text-ink-950 font-mono text-sm font-medium hover:bg-amber-light transition-colors"
            >
              View projects
            </a>
            <a
              href="#contact"
              className="px-5 py-2.5 rounded-md border border-ink-200/25 dark:border-paper-50/15 font-mono text-sm hover:border-amber/60 hover:text-amber transition-colors"
            >
              Get in touch
            </a>
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
              {'  '}<span className="text-teal">"status"</span>: <span className="text-amber">"open to opportunities"</span>,{'\n'}
              {'  '}<span className="text-teal">"Languages"</span>: <span className="inline-block overflow-hidden max-w-[200px] align-bottom"><span className="inline-block whitespace-nowrap animate-marquee-inline">{allSkills.map((s, i) => <span key={i} className="text-amber">{i > 0 ? ', ' : '"'}{s}</span>)}"</span></span>{'\n'}
              <span className="text-ink-600 dark:text-paper-200/50">{'}'}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* stats row */}
      <section className="container-page py-14 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="font-mono text-3xl sm:text-4xl font-semibold text-amber">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-ink-700 dark:text-paper-200/70">
              {stat.label}
            </p>
          </div>
        ))}
      </section>
    </>
  )
}

// Home.jsx — the main landing section rendered on the "/" route.
// Contains a hero section (name, title, bio, CTAs) with a mock terminal/JSON
// "profile" panel, plus a row of stats (languages, projects, certificates)
// derived from the data files.
//
// Note: the animated space background (stars, moon, solar system) is rendered
// globally by SpaceBackground in App.jsx, so it does not need to be mounted here.

import { skillGroups } from '../data/skills.js'
import { projects } from '../data/projects.js'
import { certificates } from '../data/certificates.js'
import ScrollReveal from '../components/ScrollReveal.jsx'

// Flatten all skill items into a single array for the marquee ticker in the hero panel.
const allSkills = skillGroups.flatMap((g) => g.items)

// Count how many programming languages are in the "Languages" skill group.
const languageCount = skillGroups.find((g) => g.label === 'Languages')?.items.length ?? 0

// Stats displayed in the row below the hero section.
// Values are dynamically derived from the data files where possible.
const stats = [
  { value: `${languageCount}+`, label: 'Languages' },
  { value: `${projects.length}+`, label: 'Projects' },
  { value: `${certificates.length}+`, label: 'Certificates' },
  { value: '1', label: 'IT student, always building' },
]

export default function Home() {
  return (
    <>
      {/* Hero Section: two-column layout on large screens.
          Left: name, title, bio, and CTA buttons.
          Right: mock terminal/JSON panel with profile info. */}
      <section id="home" className="container-page pt-16 sm:pt-24 pb-10 grid lg:grid-cols-2 gap-14 items-center relative z-10">
        {/* Left column — introductory text, each block staggered into view */}
        <div>
          {/* Terminal-style "$ whoami" prompt with blinking cursor */}
          <ScrollReveal delay={0}>
            <p className="font-mono text-sm text-amber mb-4">
              $ whoami<span className="caret" />
            </p>
          </ScrollReveal>

          {/* Large name heading with a soft amber space-glow (visible in dark mode) */}
          <ScrollReveal delay={120}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-mono font-semibold leading-[0.98] tracking-tight dark:text-glow-amber">
              Danis
              <br />
              Nazri
            </h1>
          </ScrollReveal>

          {/* Role/title subtitle */}
          <ScrollReveal delay={240}>
            <p className="mt-4 text-lg text-ink-700 dark:text-paper-200/80 font-mono">
              Software &amp; App Developer
            </p>
          </ScrollReveal>

          {/* Short bio paragraph */}
          <ScrollReveal delay={360}>
            <p className="mt-6 max-w-md text-ink-700 dark:text-paper-200/80 leading-relaxed">
              Passionate about website development — currently growing my skills
              as an IT student focused on building software and applications
              that solve real problems.
            </p>
          </ScrollReveal>

          {/* Call-to-action buttons: scroll to projects or contact section */}
          <ScrollReveal delay={480}>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#projects"
                className="px-5 py-2.5 rounded-md bg-amber text-ink-950 font-mono text-sm font-medium hover:bg-amber-light hover:shadow-lg hover:shadow-amber/25 transition-all"
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
          </ScrollReveal>
        </div>

        {/* Right column — mock code/terminal panel showing profile.json.
            In dark mode a translucent dark backdrop keeps the code readable
            over the animated space background. */}
        <ScrollReveal delay={300} y={32}>
          <div className="rounded-lg border border-ink-200/15 dark:border-paper-50/10 dark:bg-space-900/70 dark:backdrop-blur-sm overflow-hidden shadow-sm">
            {/* Window header with macOS-style traffic light dots and filename */}
            <div className="flex items-center gap-1.5 px-4 py-3 bg-ink-900/5 dark:bg-paper-50/5 border-b border-ink-200/10 dark:border-paper-50/10">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal/70" />
              <span className="ml-3 font-mono text-xs text-ink-600 dark:text-paper-200/60">
                profile.json
              </span>
            </div>

            {/* JSON content rendered as formatted code with syntax highlighting.
                The "Languages" field uses an inline marquee to scroll through all skills. */}
            <pre className="font-mono text-xs sm:text-sm leading-6 p-5 overflow-x-auto">
              <code>
                <span className="text-ink-600 dark:text-paper-200/50">{'{'}</span>{'\n'}
                {'  '}<span className="text-teal">"name"</span>: <span className="text-amber">"Danis Nazri"</span>,{'\n'}
                {'  '}<span className="text-teal">"role"</span>: <span className="text-amber">"Software & App Developer"</span>,{'\n'}
                {'  '}<span className="text-teal">"location"</span>: <span className="text-amber">"Kuala Lumpur, MY"</span>,{'\n'}
                {'  '}<span className="text-teal">"stack"</span>: [<span className="text-amber">"React"</span>, <span className="text-amber">"Node"</span>, <span className="text-amber">"MySQL"</span>],{'\n'}
                {'  '}<span className="text-teal">"status"</span>: <span className="text-amber">"open to opportunities"</span>,{'\n'}
                {/* Inline marquee: scrolls horizontally through all skill names */}
                {'  '}<span className="text-teal">"Languages"</span>: <span className="inline-block overflow-hidden max-w-[200px] align-bottom"><span className="inline-block whitespace-nowrap animate-marquee-inline">{allSkills.map((s, i) => <span key={i} className="text-amber">{i > 0 ? ', ' : '"'}{s}</span>)}"</span></span>{'\n'}
                <span className="text-ink-600 dark:text-paper-200/50">{'}'}</span>
              </code>
            </pre>
          </div>
        </ScrollReveal>
      </section>

      {/* Scroll-to-explore hint: a small animated chevron prompting the user
          to scroll down to see the rest of the portfolio. */}
      <ScrollReveal delay={700} y={10}>
        <div className="flex flex-col items-center gap-2 pb-4">
          <span className="font-mono text-xs text-ink-600 dark:text-paper-200/50 tracking-widest uppercase">
            explore
          </span>
          <a href="#projects" aria-label="Scroll to projects" className="text-amber animate-bounce">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </ScrollReveal>

      {/* Stats row: four columns showing key numbers (languages, projects, certificates, etc.).
          Each stat card is revealed with a small stagger as it scrolls into view. */}
      <section className="container-page py-14 sm:py-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <ScrollReveal key={stat.label} delay={i * 100}>
            <div>
              {/* Large amber number */}
              <p className="font-mono text-3xl sm:text-4xl font-semibold text-amber dark:text-glow-amber">
                {stat.value}
              </p>
              {/* Small description label below the number */}
              <p className="mt-1 text-sm text-ink-700 dark:text-paper-200/70">
                {stat.label}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </section>
    </>
  )
}

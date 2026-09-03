// About.jsx — the "A bit about me" page on the "/about" route.
// Displays a bio, skill groups (loaded from data/skills.js), and an education
// section. Skills render as bordered pill badges grouped by category label.

import { skillGroups } from '../data/skills.js'
import ScrollReveal from '../components/ScrollReveal.jsx'

export default function About() {
  return (
    <section className="container-page py-16 sm:py-20 max-w-3xl">
      {/* Section heading with terminal-style "~/about" prompt */}
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">about</p>
        <h1 className="text-3xl font-mono font-semibold mb-6 dark:text-glow-amber">A bit about me</h1>
      </ScrollReveal>

      {/* Bio paragraph introducing who I am */}
      <ScrollReveal delay={100}>
        <p className="text-ink-700 dark:text-paper-200/80 leading-relaxed">
          I'm Danis Nazri, an IT student based in Kuala Lumpur, Malaysia,
          focused on software and app development. I'm passionate about
          website development and enjoy turning ideas into working products —
          from backend logic to interfaces people actually enjoy using.
        </p>
      </ScrollReveal>

      {/* Skills section: iterates over skill groups from data/skills.js */}
      <ScrollReveal delay={150}>
        <h2 className="font-mono text-xl font-semibold mt-12 mb-5">Skills</h2>
      </ScrollReveal>
      <div className="space-y-6">
        {skillGroups.map((group, gi) => (
          <ScrollReveal key={group.label} delay={gi * 100}>
            <div>
              {/* Group label (e.g. "LANGUAGES", "FRAMEWORKS & TOOLS") */}
              <p className="font-mono text-xs uppercase tracking-wide text-ink-600 dark:text-paper-200/50 mb-2">
                {group.label}
              </p>
              {/* Skill pills rendered as bordered badges */}
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="font-mono text-xs px-3 py-1.5 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Education section with a left border accent */}
      <ScrollReveal delay={100}>
        <h2 className="font-mono text-xl font-semibold mt-12 mb-5">Education</h2>
        {/* TODO: replace with real education/experience */}
        <div className="border-l-2 border-ink-200/20 dark:border-paper-50/15 pl-5">
          <p className="font-mono text-sm font-medium">School / Course Name</p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-1">
            Expected graduation — replace with your details
          </p>
          <p className="text-sm text-ink-700 dark:text-paper-200/70 mt-2">
            Relevant coursework, internships, or certifications go here.
          </p>
        </div>
      </ScrollReveal>
    </section>
  )
}

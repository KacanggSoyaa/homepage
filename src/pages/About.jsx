import { skillGroups } from '../data/skills.js'

export default function About() {
  return (
    <section className="container-page py-16 sm:py-20 max-w-3xl">
      {/* Section heading with terminal-style "~/about" prompt */}
      <p className="prompt font-mono text-sm text-amber mb-2">about</p>
      <h1 className="text-3xl font-mono font-semibold mb-6">A bit about me</h1>

      {/* Bio paragraph introducing who I am */}
      <p className="text-ink-700 dark:text-paper-200/80 leading-relaxed">
        I'm Danis Nazri, an IT student based in Kuala Lumpur, Malaysia,
        focused on software and app development. I'm passionate about
        website development and enjoy turning ideas into working products —
        from backend logic to interfaces people actually enjoy using.
      </p>

      {/* Skills section: iterates over skill groups from data/skills.js */}
      <h2 className="font-mono text-xl font-semibold mt-12 mb-5">Skills</h2>
      <div className="space-y-6">
        {skillGroups.map((group) => (
          <div key={group.label}>
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
        ))}
      </div>

      {/* Education section with a left border accent */}
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
    </section>
  )
}

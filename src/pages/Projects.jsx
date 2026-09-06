// Projects.jsx — the projects grid section (anchored at #projects).
// Loads project data from data/projects.js and renders each one as a
// ProjectCard in a responsive 1/2/3-column grid.

import { projects } from '../data/projects.js'
import ProjectCard from '../components/ProjectCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

export default function Projects() {
  return (
    // Section with id="projects" for anchor scrolling from the navbar
    <section id="projects" className="container-page py-16 sm:py-20">
      {/* Section heading with terminal-style "~/projects" prompt */}
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">projects</p>
        <h1 className="text-3xl font-mono font-semibold mb-3 dark:text-glow-amber">Things I've built</h1>
        <p className="text-ink-700 dark:text-paper-200/80 max-w-xl mb-10">
          A selection of projects — replace these placeholders with your real
          work in <code className="font-mono text-xs bg-ink-900/5 dark:bg-paper-50/10 px-1.5 py-0.5 rounded">src/data/projects.js</code>.
        </p>
      </ScrollReveal>

      {/* Responsive grid: 1 column on mobile, 2 on sm, 3 on lg.
          Each card is staggered into view as the grid scrolls in. */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={(i % 3) * 100}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

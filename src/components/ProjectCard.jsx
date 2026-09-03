// ProjectCard.jsx — displays a single project in the projects grid.
// Props: { project } — an object with title, description, stack, github, and demo.

import { GithubIcon, ExternalLinkIcon } from './Icons.jsx'

export default function ProjectCard({ project }) {
  return (
    // Card with border that highlights amber on hover
    <article className="group border border-ink-200/15 dark:border-paper-50/10 rounded-lg p-6 flex flex-col gap-4 hover:border-amber/50 transition-colors">
      {/* Header row: project title on the left, GitHub + demo icons on the right */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-mono text-lg font-semibold">{project.title}</h3>
        <div className="flex items-center gap-3 text-ink-600 dark:text-paper-200/70 shrink-0">
          <a href={project.github} aria-label={`${project.title} on GitHub`} className="hover:text-amber transition-colors">
            <GithubIcon width="18" height="18" />
          </a>
          <a href={project.demo} aria-label={`${project.title} live demo`} className="hover:text-amber transition-colors">
            <ExternalLinkIcon />
          </a>
        </div>
      </div>

      {/* Project description */}
      <p className="text-sm leading-relaxed text-ink-700 dark:text-paper-200/80">
        {project.description}
      </p>

      {/* Tech stack tags: pushed to the bottom with mt-auto */}
      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-[11px] px-2 py-1 rounded bg-ink-900/5 dark:bg-paper-50/5 text-teal"
          >
            {tech}
          </span>
        ))}
      </div>
    </article>
  )
}

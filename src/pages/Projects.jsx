// Projects.jsx — the projects section (anchored at #projects).
// Shows at most 6 projects per slide; additional projects slide in on the
// next slide to the right. Uses a CSS-transform sliding track with prev/next
// arrows, clickable dots, and touch swipe.

import { useRef, useState } from 'react'
import { projects } from '../data/projects.js'
import ProjectCard from '../components/ProjectCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

const PER_SLIDE = 6

export default function Projects() {
  const slides = []
  for (let i = 0; i < projects.length; i += PER_SLIDE) {
    slides.push(projects.slice(i, i + PER_SLIDE))
  }
  const count = slides.length

  const [index, setIndex] = useState(0)
  const touchX = useRef(null)
  const dragX = useRef(null)

  const go = (i) => setIndex(((i % count) + count) % count)

  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const delta = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1))
    touchX.current = null
  }

  return (
    <section id="projects" className="container-page py-16 sm:py-20">
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">projects</p>
        <h1 className="text-3xl font-mono font-semibold mb-3 dark:text-glow-amber">Things I've built</h1>
        <p className="text-ink-700 dark:text-paper-200/80 max-w-xl mb-10">
          A selection of real projects, stored in{' '}
          <code className="font-mono text-xs bg-ink-900/5 dark:bg-paper-50/10 px-1.5 py-0.5 rounded">src/data/projects.js</code>
          . Add new ones there to grow this grid.
        </p>
      </ScrollReveal>

      <div
        className="relative overflow-hidden cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={(e) => { dragX.current = e.clientX }}
        onMouseUp={(e) => {
          if (dragX.current === null) return
          const delta = e.clientX - dragX.current
          if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1))
          dragX.current = null
        }}
        onMouseLeave={() => { dragX.current = null }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(index + 1)
          if (e.key === 'ArrowLeft') go(index - 1)
        }}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ width: `${count * 100}%`, transform: `translateX(-${(index * 100) / count}%)` }}
        >
          {slides.map((slide, s) => (
            <div key={s} className="shrink-0" style={{ width: `${100 / count}%` }}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {slide.map((project, i) => (
                  <ScrollReveal key={project.id} delay={(i % 3) * 100}>
                    <ProjectCard project={project} />
                  </ScrollReveal>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation via swipe (touch) + clickable dots below; no arrow buttons. */}
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to projects slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === index ? 'bg-amber' : 'bg-ink-900/20 dark:bg-paper-50/40 hover:bg-amber/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

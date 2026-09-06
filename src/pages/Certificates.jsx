// Certificates.jsx — the certifications grid section (anchored at #certificates).
// Loads certificate data from data/certificates.js and renders each one as a
// CertificateCard in a responsive 1/2/3-column grid.

import { certificates } from '../data/certificates.js'
import CertificateCard from '../components/CertificateCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

export default function Certificates() {
  return (
    // Section with id="certificates" for anchor scrolling from the navbar
    <section id="certificates" className="container-page py-16 sm:py-20">
      {/* Section heading with terminal-style "~/certificates" prompt */}
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">certificates</p>
        <h1 className="text-3xl font-mono font-semibold mb-3 dark:text-glow-amber">Certifications</h1>
        <p className="text-ink-700 dark:text-paper-200/80 max-w-xl mb-10">
          Courses and certifications I've completed <code className="font-mono text-xs bg-ink-900/5 dark:bg-paper-50/10 px-1.5 py-0.5 rounded">src/data/certificates.js</code>.
        </p>
      </ScrollReveal>

      {/* Responsive grid: 1 column on mobile, 2 on sm, 3 on lg.
          Each card is staggered into view as the grid scrolls in. */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, i) => (
          <ScrollReveal key={cert.id} delay={(i % 3) * 100}>
            <CertificateCard certificate={cert} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

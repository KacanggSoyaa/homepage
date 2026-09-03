import { certificates } from '../data/certificates.js'
import CertificateCard from '../components/CertificateCard.jsx'

export default function Certificates() {
  return (
    <section id="certificates" className="container-page py-16 sm:py-20">
      <p className="prompt font-mono text-sm text-amber mb-2">certificates</p>
      <h1 className="text-3xl font-mono font-semibold mb-3">Certifications</h1>
      <p className="text-ink-700 dark:text-paper-200/80 max-w-xl mb-10">
        Courses and certifications I've completed — replace these
        placeholders in <code className="font-mono text-xs bg-ink-900/5 dark:bg-paper-50/10 px-1.5 py-0.5 rounded">src/data/certificates.js</code>.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <CertificateCard key={cert.id} certificate={cert} />
        ))}
      </div>
    </section>
  )
}

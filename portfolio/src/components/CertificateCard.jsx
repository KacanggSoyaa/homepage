import { AwardIcon, ExternalLinkIcon } from './Icons.jsx'

export default function CertificateCard({ certificate }) {
  return (
    <article className="border border-ink-200/15 dark:border-paper-50/10 rounded-lg p-6 flex flex-col gap-4 hover:border-amber/50 transition-colors">
      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-amber/10 text-amber">
        <AwardIcon />
      </div>

      <div className="flex-1">
        <h3 className="font-mono text-base font-semibold leading-snug">{certificate.name}</h3>
        <p className="text-sm text-ink-700 dark:text-paper-200/80 mt-1">{certificate.issuer}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink-200/10 dark:border-paper-50/10">
        <span className="font-mono text-xs text-ink-600 dark:text-paper-200/60">{certificate.date}</span>
        <a
          href={certificate.link}
          className="font-mono text-xs flex items-center gap-1 text-teal hover:text-amber transition-colors"
        >
          view credential <ExternalLinkIcon width="13" height="13" />
        </a>
      </div>
    </article>
  )
}

// CertificateCard.jsx — displays a single certificate in the certificates grid.
// Props: { certificate } — an object with name, issuer, date, and link.

import { AwardIcon, ExternalLinkIcon } from './Icons.jsx'

export default function CertificateCard({ certificate }) {
  return (
    // Card with border that highlights amber on hover.
    // A translucent dark backdrop in dark mode keeps text readable over the
    // animated space background. Hover lifts the card + adds a soft shadow for
    // a more polished, tactile feel.
    <article className="border border-ink-200/15 dark:border-paper-50/10 dark:bg-space-900/60 dark:backdrop-blur-sm rounded-lg p-6 flex flex-col gap-4 hover:border-amber/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber/10">
      {/* Amber-tinted award icon in a rounded square */}
      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-amber/10 text-amber">
        <AwardIcon />
      </div>

      {/* Certificate name and issuing organization */}
      <div className="flex-1">
        <h3 className="font-mono text-base font-semibold leading-snug">{certificate.name}</h3>
        <p className="text-sm text-ink-700 dark:text-paper-200/80 mt-1">{certificate.issuer}</p>
      </div>

      {/* Bottom row: date on the left, "view credential" link on the right.
          Separated from the content above by a thin border line. */}
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

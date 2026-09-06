// AchievementCard.jsx — displays a single achievement in the achievements grid.
// Props: { achievement } — an object with title, description, date, and link.

import { TrophyIcon, ExternalLinkIcon } from './Icons.jsx'

export default function AchievementCard({ achievement }) {
  return (
    <article className="glass border border-ink-200/15 dark:border-paper-50/10 rounded-lg p-6 flex flex-col gap-4 hover:border-amber/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber/10">
      <div className="w-12 h-12 rounded-md flex items-center justify-center bg-amber/10 text-amber">
        <TrophyIcon />
      </div>

      <div className="flex-1">
        <h3 className="font-mono text-base font-semibold leading-snug">{achievement.title}</h3>
        <p className="text-sm text-ink-700 dark:text-paper-200/80 mt-1">{achievement.description}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-ink-200/10 dark:border-paper-50/10">
        <span className="font-mono text-xs text-ink-600 dark:text-paper-200/60">{achievement.date}</span>
        {achievement.link && (
          <a
            href={achievement.link}
            className="font-mono text-xs flex items-center gap-1 text-teal hover:text-amber transition-colors"
          >
            view details <ExternalLinkIcon width="13" height="13" />
          </a>
        )}
      </div>
    </article>
  )
}

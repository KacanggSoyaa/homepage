export default function SkillBadge({ label }) {
  return (
    <span className="font-mono text-xs px-3 py-1.5 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80 hover:border-amber/50 hover:text-amber transition-colors">
      {label}
    </span>
  )
}

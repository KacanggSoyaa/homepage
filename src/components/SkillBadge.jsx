// SkillBadge is a reusable pill/badge component for displaying a skill name.
// Props: { label } — the skill name string to display.
// Note: This component exists but is currently unused; the About page renders
// skill badges with inline JSX instead. It can be used in the future to
// replace the inline rendering for consistency.
export default function SkillBadge({ label }) {
  return (
    <span className="font-mono text-xs px-3 py-1.5 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80 hover:border-amber/50 hover:text-amber transition-colors">
      {label}
    </span>
  )
}

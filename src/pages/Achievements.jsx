// Achievements.jsx — the achievements grid section (anchored at #achievements).
// Loads achievement data from data/achievements.js and renders each one as an
// AchievementCard in a responsive 1/2/3-column grid.

import { achievements } from '../data/achievements.js'
import AchievementCard from '../components/AchievementCard.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

export default function Achievements() {
  return (
    <section id="achievements" className="container-page py-16 sm:py-20">
      <ScrollReveal>
        <p className="prompt font-mono text-sm text-amber mb-2 dark:text-amber">achievements</p>
        <h1 className="text-3xl font-mono font-semibold mb-3 dark:text-glow-amber">Achievements</h1>
        <p className="text-ink-700 dark:text-paper-200/80 max-w-xl mb-10">
          Milestones and accomplishments I've reached <code className="font-mono text-xs bg-ink-900/5 dark:bg-paper-50/10 px-1.5 py-0.5 rounded">src/data/achievements.js</code>.
        </p>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, i) => (
          <ScrollReveal key={achievement.id} delay={(i % 3) * 100}>
            <AchievementCard achievement={achievement} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}

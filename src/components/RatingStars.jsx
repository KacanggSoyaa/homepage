// RatingStars.jsx — 1-5 star rating for blog threads.
// Renders `rating` filled stars out of `max` (default 5), with hollow stars for
// the remainder. Used on the feed card and the thread detail page.

import { StarIcon } from './Icons.jsx'

export default function RatingStars({ rating = 0, max = 5, size = 14 }) {
  const clamped = Math.max(0, Math.min(max, rating))
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`${clamped} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <StarIcon
          key={i}
          width={size}
          height={size}
          filled={i < clamped}
          className={i < clamped ? 'text-amber' : 'text-ink-400 dark:text-paper-200/40'}
        />
      ))}
    </span>
  )
}
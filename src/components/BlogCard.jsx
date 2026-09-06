// BlogCard.jsx — displays a single blog post in a social-media thread style.
// Shown in the scrollable feed on the About page. If the post has attached
// photos they render as a swipeable carousel thumbnail, and an "open thread"
// button links to the post's full detail page (/blog/:id).

import { Link } from 'react-router-dom'
import ImageCarousel from './ImageCarousel.jsx'
import RatingStars from './RatingStars.jsx'

// Format a date string (YYYY-MM-DD) into a short, human-readable label like
// "Sep 6, 2026" — keeps the source data simple while displaying cleanly.
const formatDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export default function BlogCard({ post }) {
  return (
    <article className="py-3 px-2 sm:px-3">
      {/* Header row: avatar + handle + timestamp, like a social post */}
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-semibold leading-tight">danis</p>
          <p className="font-mono text-xs text-ink-600 dark:text-paper-200/60 leading-tight">
            {formatDate(post.date)}
          </p>
        </div>
        {post.tag && (
          <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-teal/40 text-teal">
            {post.tag}
          </span>
        )}
      </div>

      {/* Post preview text */}
      <p className="mt-4 text-sm sm:text-base text-ink-800 dark:text-paper-200/90 leading-relaxed">
        {post.text}
      </p>

      {/* Attached photo carousel (if any) — supports multiple images */}
      {post.images?.length > 0 && (
        <div className="mt-3">
          <ImageCarousel
            images={post.images}
            alt={`Photo for thread ${post.id}`}
            className="h-44 sm:h-56"
          />
        </div>
      )}

      {/* Footer: star rating + "open thread" button */}
      <div className="mt-4 pt-3 border-t border-ink-200/10 dark:border-paper-50/10 flex items-center justify-between text-ink-600 dark:text-paper-200/60">
        <RatingStars rating={post.rating} />
        <Link
          to={`/blog/${post.id}`}
          className="font-mono text-xs px-3 py-1.5 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80 hover:text-amber dark:hover:text-glow-amber hover:border-amber/60 transition-all"
        >
          open thread
        </Link>
      </div>
    </article>
  )
}
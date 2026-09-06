// BlogCard.jsx — displays a single blog post in a social-media thread style.
// Showed in the scrollable feed on the About page. If the post has an attached
// image it renders as a thumbnail, and an "open thread" button links to the
// post's full detail page (/blog/:id).

import { Link } from 'react-router-dom'
import { HeartIcon } from './Icons.jsx'

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
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-amber to-teal text-ink-950 font-mono font-bold text-sm shrink-0">
          D
        </div>
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

      {/* Attached picture (if any) — click opens the full thread page */}
      {post.image && (
        <Link
          to={`/blog/${post.id}`}
          className="mt-3 block rounded-md overflow-hidden border border-ink-200/15 dark:border-paper-50/10 hover:border-amber/50 transition-colors"
        >
          <img
            src={post.image}
            alt={`Attachment for thread ${post.id}`}
            className="w-full h-44 object-cover hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </Link>
      )}

      {/* Footer: like count + "open thread" button */}
      <div className="mt-4 pt-3 border-t border-ink-200/10 dark:border-paper-50/10 flex items-center justify-between text-ink-600 dark:text-paper-200/60">
        <span className="flex items-center gap-1.5">
          <HeartIcon />
          <span className="font-mono text-xs">{post.likes}</span>
        </span>
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
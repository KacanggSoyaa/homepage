// Thread.jsx — full detail page for a single blog thread (/blog/:id).
// Shows the post's full content, any attached picture, and a back link to the
// Threads feed on the About page. Unknown ids get a friendly fallback.

import { Link, useParams } from 'react-router-dom'
import { blogPosts } from '../data/blog.js'
import { ExternalLinkIcon } from '../components/Icons.jsx'
import ImageCarousel from '../components/ImageCarousel.jsx'
import RatingStars from '../components/RatingStars.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'

// Format a date string (YYYY-MM-DD) into a short, human-readable label.
const formatDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export default function Thread() {
  // Grab the :id from the URL (e.g. /blog/3) and find the matching post.
  const { id } = useParams()
  const post = blogPosts.find((p) => p.id === Number(id))

  // If the id doesn't match any post, show a friendly "not found" card.
  if (!post) {
    return (
      <section className="container-page py-20 sm:py-28">
        <ScrollReveal>
          <div className="glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 p-10 text-center">
            <p className="font-mono text-3xl mb-4">404</p>
            <h1 className="font-mono text-xl font-semibold mb-2 dark:text-glow-amber">Thread not found</h1>
            <p className="text-sm text-ink-700 dark:text-paper-200/80 mb-6">
              This thread doesn't exist (or was removed).
            </p>
            <Link
              to="/about#threads"
              className="font-mono text-xs px-4 py-2 rounded-md border border-ink-200/20 dark:border-paper-50/10 text-ink-700 dark:text-paper-200/80 hover:text-amber dark:hover:text-glow-amber hover:border-amber/60 transition-all"
            >
              ← back to threads
            </Link>
          </div>
        </ScrollReveal>
      </section>
    )
  }

  return (
    <section className="container-page py-16 sm:py-20 max-w-2xl">
      {/* Back link to the Threads feed on the About page */}
      <ScrollReveal>
        <Link
          to="/about#threads"
          className="font-mono text-xs font-medium flex items-center gap-1.5 text-ink-600 dark:text-paper-200/60 hover:text-amber dark:hover:text-glow-amber transition-colors"
        >
          <span aria-hidden>←</span> back to threads
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        {/* Header: avatar + handle + date, matching the feed card style */}
        <div className="flex items-center gap-3 mt-8 mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-amber to-teal text-ink-950 font-mono font-bold text-lg shrink-0">
            D
          </div>
          <div>
            <p className="font-mono text-base font-semibold leading-tight">danis</p>
            <p className="font-mono text-xs text-ink-600 dark:text-paper-200/60 leading-tight mt-1">
              {formatDate(post.date)}
            </p>
          </div>
          {post.tag && (
            <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-teal/40 text-teal">
              {post.tag}
            </span>
          )}
        </div>

        {/* Full content: render line breaks so paragraphs in `content` stay intact */}
        <div className="glass rounded-lg border border-ink-200/15 dark:border-paper-50/10 p-6 sm:p-8">
          {/* Full text (content falls back to the short preview text) */}
          <div className="text-sm sm:text-base text-ink-800 dark:text-paper-200/90 leading-relaxed whitespace-pre-line">
            {post.content || post.text}
          </div>

          {/* Attached photos — shown as a square, Instagram-style carousel */}
          {post.images?.length > 0 && (
            <div className="mt-6">
              <ImageCarousel
                images={post.images}
                alt={`Photo for thread ${post.id}`}
                className="aspect-3/4 mx-auto w-full max-w-[28rem]"
              />
            </div>
          )}

          {/* Footer: my rating of the thread */}
          <div className="mt-6 pt-4 border-t border-ink-200/10 dark:border-paper-50/10 flex items-center gap-2 text-ink-600 dark:text-paper-200/60">
            <RatingStars rating={post.rating} size={16} />
            <span className="font-mono text-xs">my rating</span>
          </div>
        </div>

        {/* Share / back strip */}
        <div className="mt-6 font-mono text-xs text-ink-600 dark:text-paper-200/50">
          danis/good-things <ExternalLinkIcon width="12" height="12" className="inline mb-0.5" />
        </div>
      </ScrollReveal>
    </section>
  )
}
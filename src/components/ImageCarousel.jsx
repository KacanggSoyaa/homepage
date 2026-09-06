// ImageCarousel.jsx — swipeable carousel for thread attachments.
// Slides horizontally through the images with a smooth CSS transition, with
// prev/next arrows, clickable dots, and a "1 / 3" counter, in the style of
// Instagram/Threads. Supports touch swiping and a per-slide retry-on-error.
//
// Props:
//   - images    : array of image sources (URLs or imported files)
//   - alt       : base alt text (a number suffix is appended per image)
//   - className : controls the visual shape (e.g. "aspect-3/4" on the detail
//                 page, a fixed height like "h-44" in the feed)

import { useRef, useState } from 'react'

export default function ImageCarousel({ images = [], alt = 'attachment', className = 'aspect-4/3' }) {
  const [index, setIndex] = useState(0)
  const [attempts, setAttempts] = useState({})
  const [failed, setFailed] = useState({})
  const pending = useRef({})
  const touchX = useRef(null)
  const count = images.length

  // If there are no images, render nothing.
  if (count === 0) return null

  // Some CDNs (Google Photos' lh3 host) occasionally refuse a request at first
  // (429/403, referer checks, rate limits) but serve it fine a moment later.
  // Give each slide ONE automatic retry before showing the "unavailable"
  // placeholder — bumping `attempts` remounts the img and re-requests it.
  const handleError = (i) => {
    if (attempts[i]) {
      setFailed((f) => (f[i] ? f : { ...f, [i]: true }))
    } else if (!pending.current[i]) {
      pending.current[i] = true
      setTimeout(() => {
        pending.current[i] = false
        setAttempts((a) => ({ ...a, [i]: (a[i] || 0) + 1 }))
      }, 1200)
    }
  }

  // Wrap-around navigation: clicking next on the last photo returns to the first.
  const go = (i) => setIndex(((i % count) + count) % count)

  // Minimal horizontal swipe support so mobile feels native.
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    if (touchX.current === null) return
    const delta = e.changedTouches[0].clientX - touchX.current
    if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1))
    touchX.current = null
  }

  return (
    <figure
      className={`relative select-none overflow-hidden rounded-md border border-ink-200/15 dark:border-paper-50/10 ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Sliding track — every slide sits side-by-side and the track translates,
          which gives the smooth Instagram-style slide when you navigate. */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ width: `${count * 100}%`, transform: `translateX(-${(index * 100) / count}%)` }}
      >
        {images.map((src, i) => {
          const slideWidth = 100 / count
          return (
            <div key={`${i}-${attempts[i] || 0}`} className="h-full shrink-0" style={{ width: `${slideWidth}%` }}>
              {!failed[i] ? (
                <img
                  src={src}
                  alt={`${alt} ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  draggable={false}
                  referrerPolicy="no-referrer"
                  onError={() => handleError(i)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-ink-900/5 dark:bg-space-800 text-ink-600 dark:text-paper-200/50 font-mono text-xs p-4 text-center">
                  image unavailable
                  <br />
                  check the link
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Counter badge in the top-right corner */}
      {count > 1 && (
        <span className="absolute top-2 right-2 font-mono text-[11px] px-2 py-0.5 rounded-full bg-space-950/60 dark:bg-space-950/70 text-paper-50 backdrop-blur-sm">
          {index + 1} / {count}
        </span>
      )}

      {/* Prev / next arrows — only meaningful when there is more than one photo */}
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-space-950/55 dark:bg-space-950/60 text-paper-50 backdrop-blur-sm hover:bg-amber/80 hover:text-ink-950 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
              <path d="m14.5 5.5-6 6.5 6 6.5" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-space-950/55 dark:bg-space-950/60 text-paper-50 backdrop-blur-sm hover:bg-amber/80 hover:text-ink-950 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="16" height="16">
              <path d="m9.5 5.5 6 6.5-6 6.5" />
            </svg>
          </button>
        </>
      )}

      {/* Dot indicators — reflects current photo, clickable to jump */}
      {count > 1 && (
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === index ? 'bg-amber' : 'bg-paper-50/50 hover:bg-paper-50/80'
              }`}
            />
          ))}
        </div>
      )}
    </figure>
  )
}
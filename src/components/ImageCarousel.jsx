// ImageCarousel.jsx — swipeable carousel for thread attachments.
// Renders one image at a time with prev/next arrows, clickable dots, and a
// "1 / 3" counter, in the style of Instagram/Threads. Supports touch swiping.
//
// Props:
//   - images    : array of image sources (URLs or imported files)
//   - alt       : base alt text (a number suffix is appended per image)
//   - className : controls the visual height (e.g. "h-44" in the feed,
//                 a taller value on the detail page)

import { useEffect, useRef, useState } from 'react'

export default function ImageCarousel({ images = [], alt = 'attachment', className = 'h-64' }) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState(false)
  const [retry, setRetry] = useState(0)
  const touchX = useRef(null)
  const count = images.length

  // If there are no images (or just one), fall back to whatever is useful.
  if (count === 0) return null

  // Reset the failure flag and retry counter whenever we switch photos (e.g. a
  // link that was erroring on one slide may load fine again on the next).
  useEffect(() => {
    setFailed(false)
    setRetry(0)
  }, [index])

  // Some CDNs (Google Photos' lh3 host) occasionally refuse a request at first
  // (429/403, referer checks, rate limits) but serve it fine a moment later.
  // Give it ONE automatic retry before showing the "unavailable" placeholder.
  const handleError = () => {
    if (retry < 1) {
      setTimeout(() => setRetry((r) => r + 1), 1200)
    } else {
      setFailed(true)
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
      {/* Current image — animates in slightly when switching.
          If a hosted link fails to load, show a neat placeholder instead. */}
      {!failed ? (
        <img
          key={`${index}-${retry}`}
          src={images[index]}
          alt={`${alt} ${index + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-ink-900/5 dark:bg-space-800 text-ink-600 dark:text-paper-200/50 font-mono text-xs p-4 text-center">
          image unavailable
          <br />
          check the link
        </div>
      )}

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
                i === index
                  ? 'bg-amber'
                  : 'bg-paper-50/50 hover:bg-paper-50/80'
              }`}
            />
          ))}
        </div>
      )}
    </figure>
  )
}
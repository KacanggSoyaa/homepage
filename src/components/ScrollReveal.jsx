// ScrollReveal.jsx — reusable scroll-triggered reveal animation wrapper.
// Wraps any element and fades/slides it into view the first time it scrolls
// into the viewport, giving the portfolio a polished, professional feel.
//
// Props:
//   - as        : tag to render (default "div") — accepts any HTML element
//   - delay     : optional transition-delay in ms (stagger children)
//   - y         : vertical offset in px for the entrance slide (default 24)
//   - className : extra classes merged onto the wrapper
//   - children  : content to reveal
//
// Uses IntersectionObserver (with a CSS fallback so content is always visible
// if the API is unavailable). `prefers-reduced-motion` users see elements
// immediately without animation.

import { useEffect, useRef, useState, createElement } from 'react'

export default function ScrollReveal({
  as = 'div',
  delay = 0,
  y = 24,
  duration = 600,
  className = '',
  children,
}) {
  const ref = useRef(null)
  // Whether this element has entered the viewport (and been revealed)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current

    // Respect prefers-reduced-motion: show content immediately with no animation.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // If IntersectionObserver is unavailable or the user prefers reduced motion,
    // just show the content immediately without any scroll animation.
    if (!node || typeof IntersectionObserver === 'undefined' || prefersReducedMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            // Once revealed, stop observing (animate only the first time)
            observer.unobserve(entry.target)
          }
        })
      },
      // Trigger slightly before the element fully enters view
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Inline style: initial hidden state, then a smooth transition to visible.
  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
    transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1), transform ${duration}ms cubic-bezier(0.22,1,0.36,1)`,
    transitionDelay: `${delay}ms`,
    willChange: 'opacity, transform',
  }

  return createElement(
    as,
    { ref, style, className: className },
    children,
  )
}

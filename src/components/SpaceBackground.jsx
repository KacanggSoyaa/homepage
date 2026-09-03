// SpaceBackground.jsx — global animated space-themed background.
// Renders a full-screen <canvas> behind the entire site with:
//   - a static field of twinkling stars,
//   - soft nebula color glows,
//   - a glowing moon with craters (top-right),
//   - a glowing sun/star with a faint solar system (orbiting planets + rings),
//   - the occasional shooting star streaking across the sky.
//
// Everything is drawn in a single requestAnimationFrame loop for performance.
// The scene is brighter/more intense in dark mode (space theme) and softened
// in light mode so the site's dark/light toggle still reads as a daytime sky.
// `prefers-reduced-motion` disables movement, leaving a static starfield.

import { useEffect, useRef } from 'react'

export default function SpaceBackground({ theme = 'dark' }) {
  // Ref to the <canvas> DOM element so we can draw on it each frame
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // ---- Reusable star/object state (rebuilt whenever the canvas resizes) ----
    let dpr = 1 // devicePixelRatio — keeps the scene crisp on hi-DPI screens
    let width = 0
    let height = 0
    let stars = [] // static twinkling background stars
    let clouds = [] // soft drifting clouds (light mode / daylight sky)
    let birds = [] // animated 2D birds flying across the sky (light mode)
    let meteors = [] // active shooting stars
    let reducedMotion = false // respect prefers-reduced-motion
    let animationId = null // requestAnimationFrame handle (for cleanup)
    let timer = 0 // frame counter used to drive twinkle + meteor spawning
    let scrollY = 0 // current vertical scroll position (drives parallax)
    let parallaxTarget = 0 // smoothed scroll value for smooth parallax motion

    // Color palette — reads the current theme so the scene adapts.
    // Returns resusable color strings computed per theme.
    const palette = {
      // Dark mode = deep space (bright, glowing). Light mode = daytime sky (soft).
      star: theme === 'dark' ? '255,255,255' : '90,120,180',
      nebula: theme === 'dark' ? '142,100,255' : '180,200,240',
      nebula2: theme === 'dark' ? '0,160,255' : '140,190,220',
      meteor: theme === 'dark' ? '160,220,255' : '120,160,220',
      moon: theme === 'dark' ? '235,238,245' : '240,240,244',
      sun: theme === 'dark' ? '232,163,61' : '232,163,61',
    }

    // Whether the current theme should render the full space (dark) scene.
    const isSpace = theme === 'dark'

    // Size the canvas to fill the viewport, scaling for devicePixelRatio.
    // Also rebuild the star field so stars are spread across the new size.
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      buildStars()
      buildClouds()
    }

    // Generate a star field with random positions, sizes, and twinkle phases.
    // Density is scaled to the viewport area (more stars on big screens).
    // Each star gets a `depth` parallax factor: depth 0 = farthest/slowest,
    // depth 1 = closest/fastest. Split them into 3 visual layers so scrolling
    // creates a natural sense of depth (near stars drift up faster than far ones).
    const buildStars = () => {
      const count = Math.min(300, Math.floor((width * height) / 5500))
      stars = Array.from({ length: count }, (_, i) => {
        const depthLayer = i % 3 // 0 = far, 1 = mid, 2 = near
        // Parallax factor per layer (how much a star moves when you scroll)
        const parallax =
          depthLayer === 0 ? 0.03 :
          depthLayer === 1 ? 0.08 :
          0.16
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.4,
          // Each star twinkles at its own speed and phase
          speed: Math.random() * 0.02 + 0.005,
          phase: Math.random() * Math.PI * 2,
          // A few brighter "feature" stars for variety
          brightness: Math.random() < 0.08 ? 0.9 : 0.35,
          parallax,
        }
      })
    }

    // Generate a field of soft clouds for the daylight (light) theme.
    // Each cloud is a cluster of overlapping translucent white puffs that
    // drift slowly across the sky (a gentle "windy" feel). Only used in light
    // mode — dark mode keeps a clear starry sky.
    const buildClouds = () => {
      const count = Math.min(7, Math.floor(width / 360))
      clouds = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.85 + height * 0.05,
        scale: Math.random() * 40 + 20, // puff size (cloud "thickness")
        w: Math.random() * 90 + 60, // horizontal puff spacing
        puffCount: Math.floor(Math.random() * 3) + 3, // puffs per cloud
        speed: Math.random() * 0.12 + 0.05, // horizontal wind speed
        phase: Math.random() * Math.PI * 2, // wobble phase
        alpha: Math.random() * 0.16 + 0.08, // translucency (soft, not stark white)
      }))
    }

    // Draw the drifting clouds. Each cloud moves horizontally at its own speed
    // (wind) and wobbles gently up/down for a light, airy feel. When a cloud
    // exits the right edge it wraps around to the left, keeping the sky flowing.
    const drawClouds = () => {
      if (isSpace) return // no clouds in the dark space scene
      clouds.forEach((c) => {
        // Horizontal wind drift + a subtle vertical wobble
        const x = c.x + timer * c.speed
        const wobble = Math.sin(timer * 0.004 + c.phase) * 4
        // Wrap clouds left→right as they drift off the right edge
        const wrapped = x > width + c.w * 2 ? -(c.w * 2) : x

        // Draw the cloud as several overlapping soft puffs
        for (let i = 0; i < c.puffCount; i++) {
          const px = wrapped + i * c.w * 0.6
          const py = c.y + wobble + Math.sin(i * 1.3 + c.phase) * 6
          drawGlow(px, py, c.scale, '255,255,255', c.alpha)
        }
      })
    }

    // Create a new flying bird for the light-mode sky. Birds fly left→right
    // across the scene with a small per-bird speed and vertical bob so a small
    // flock feels alive and "windy". Only spawned in light mode.
    const createBird = () => ({
      x: -40, // start just off the left edge
      y: height * (0.1 + Math.random() * 0.3), // fly in the upper sky band
      size: 4 + Math.random() * 3, // bird body size
      speed: 0.5 + Math.random() * 1.2, // horizontal wind speed
      bob: Math.random() * 0.02 + 0.01, // vertical bob frequency
      phase: Math.random() * Math.PI * 2, // flapping/wobble phase offset
      flap: Math.random() * 0.12 + 0.08, // wing-flap frequency
    })

    // Draw a single 2D bird as a minimal "M" / wing-shaped silhouette. Each
    // wing rises and falls over time to simulate flapping while the whole bird
    // bobs gently — the classic simple "flying bird" look used in 2D sky scenes.
    const drawBird = (b) => {
      const flap = Math.sin(timer * b.flap + b.phase) // -1..1 wing position
      const wing = b.size * (0.6 + flap * 0.6) // wing lift (higher = drawn up)
      const bobY = Math.sin(timer * b.bob + b.phase) * 4 // gentle vertical float
      const y = b.y + bobY

      ctx.strokeStyle = '#3A4A5C'
      ctx.lineWidth = 1.4
      ctx.lineCap = 'round'

      // Two mirrored wings. Each is a two-segment line forming a soft "M" —
      // the tip lifts up as it flaps, then comes back down.
      ;[0, 1].forEach((side) => {
        const dir = side === 0 ? -1 : 1 // mirror the two wings
        ctx.beginPath()
        ctx.moveTo(b.x, y - 1)
        ctx.lineTo(b.x + dir * b.size * 0.6, y - wing)
        ctx.lineTo(b.x + dir * b.size * 1.2, y - wing * 0.3)
        ctx.stroke()
      })

      // Tiny dot for the body/head
      ctx.fillStyle = '#3A4A5C'
      ctx.beginPath()
      ctx.arc(b.x, y - 1, 1.4, 0, Math.PI * 2)
      ctx.fill()
    }

    // Advance and draw every active bird. Each moves horizontally on the wind;
    // birds that fly off the right edge are removed. New birds are spawned by
    // renderScene (light mode only) to keep a gentle flock in the sky.
    const updateAndDrawBirds = () => {
      birds.forEach((b, i) => {
        b.x += b.speed * (isSpace ? 0.1 : 1) // (speed only matters in light mode)
        drawBird(b)
        if (b.x > width + 60) birds.splice(i, 1)
      })
    }

    // The smoothed value gives a gentle, non-jerky parallax drift.
    const updateScroll = () => {
      parallaxTarget = window.scrollY || window.pageYOffset || 0
    }

    // Scroll handler (throttled by the animation loop via smoothing)
    const onScroll = () => {
      parallaxTarget = window.scrollY || window.pageYOffset || 0
    }

    // Create a new shooting star with random position, speed, and trajectory.
    const createMeteor = () => ({
      x: Math.random() * width * 0.8 + width * 0.1,
      y: Math.random() * height * 0.4,
      length: Math.random() * 130 + 80,
      speed: Math.random() * 9 + 5,
      // Slightly random downward angle
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.5,
      trail: [],
    })

    // Draw a radial "glow" (soft halo) around a point.
    const drawGlow = (x, y, radius, rgb, alpha) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
      g.addColorStop(0, `rgba(${rgb}, ${alpha})`)
      g.addColorStop(1, `rgba(${rgb}, 0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw the glowing moon (top-right area) with craters and a halo.
    // `parallaxOffset` shifts the moon vertically so it drifts on scroll.
    const drawMoon = (parallaxOffset = 0) => {
      const rad = Math.min(width, height) * 0.09 // ~9% of viewport
      const cx = width * 0.86
      const cy = height * 0.16 + parallaxOffset

      // Soft outer halo glow around the moon
      drawGlow(cx, cy, rad * 3.2, palette.moon, isSpace ? 0.16 : 0.08)

      // Moon body — layered radial gradient for a "lit" spherical look
      const grad = ctx.createRadialGradient(
        cx - rad * 0.3, cy - rad * 0.3, rad * 0.1,
        cx, cy, rad,
      )
      grad.addColorStop(0, `rgba(255,255,255,${isSpace ? 0.95 : 0.5})`)
      grad.addColorStop(0.5, `rgba(${palette.moon},${isSpace ? 0.9 : 0.55})`)
      grad.addColorStop(1, `rgba(150,158,175,${isSpace ? 0.9 : 0.5})`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fill()

      // Craters — darker circles on the moon face for realism
      const craters = [
        { dx: -0.25, dy: -0.1, r: 0.16 },
        { dx: 0.28, dy: 0.18, r: 0.22 },
        { dx: 0.05, dy: 0.34, r: 0.12 },
        { dx: -0.18, dy: 0.33, r: 0.1 },
        { dx: 0.36, dy: -0.28, r: 0.13 },
        { dx: -0.02, dy: -0.36, r: 0.09 },
      ]
      craters.forEach((c) => {
        const cw = cx + c.dx * rad
        const ch = cy + c.dy * rad
        const cr = c.r * rad
        // Slight shadow tone for each crater
        ctx.fillStyle = `rgba(120,128,150,${isSpace ? 0.35 : 0.2})`
        ctx.beginPath()
        ctx.arc(cw, ch, cr, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw a glowing central sun/star with orbit rings + planets (solar system).
    // `parallaxOffset` shifts the whole system vertically so it drifts on scroll.
    const drawSunSystem = (parallaxOffset = 0) => {
      const cx = width * 0.16
      const cy = height * 0.78 + parallaxOffset
      const base = Math.min(width, height)
      const sunR = base * 0.03 // sun radius

      // Large warm glow behind the sun
      drawGlow(cx, cy, sunR * 6, palette.sun, isSpace ? 0.4 : 0.15)

      // The sun body — bright amber with a white-hot core
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR)
      g.addColorStop(0, 'rgba(255,255,255,0.95)')
      g.addColorStop(0.4, `rgba(255,214,120,${isSpace ? 0.95 : 0.5})`)
      g.addColorStop(1, `rgba(${palette.sun},${isSpace ? 0.95 : 0.5})`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, sunR, 0, Math.PI * 2)
      ctx.fill()

      // Orbit rings (ellipses): faint arcs tracing the planets' paths
      const orbits = [1.9, 2.6, 3.3].map((f) => base * 0.012 * f + sunR * 1.2)
      ctx.lineWidth = 1
      orbits.forEach((r) => {
        ctx.strokeStyle = `rgba(${palette.sun},${isSpace ? 0.18 : 0.08})`
        ctx.beginPath()
        ctx.ellipse(cx, cy, r, r * 0.4, -0.2, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Three orbiting planets drifting along their rings at different speeds.
      // timer/200 gives a slow orbital motion.
      const planets = [
        { r: orbits[0], speed: 0.02, size: 2.5, color: '150,170,220' },
        { r: orbits[1], speed: -0.014, size: 3.5, color: '255,150,120' },
        { r: orbits[2], speed: 0.009, size: 4.5, color: '120,220,190' },
      ]
      planets.forEach((p) => {
        const a = timer * p.speed
        const px = cx + Math.cos(a) * p.r
        const py = cy + Math.sin(a) * p.r * 0.4 - Math.sin(a) * 4
        // Small glow + planet dot
        drawGlow(px, py, p.size * 3, p.color, isSpace ? 0.5 : 0.2)
        ctx.fillStyle = `rgba(${p.color},${isSpace ? 1 : 0.5})`
        ctx.beginPath()
        ctx.arc(px, py, p.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // Draw a bright, soft "daylight" sun for light mode. It sits high in the
    // sky with a gentle warm halo, so the light theme keeps a celestial focal
    // point without the dramatic glow of the dark-mode sun.
    const drawDaylightSun = () => {
      const rad = Math.min(width, height) * 0.05
      const cx = width * 0.82
      const cy = height * 0.2

      // Very soft outer halo (light, airy)
      drawGlow(cx, cy, rad * 4, '255,214,150', 0.35)
      drawGlow(cx, cy, rad * 2.2, '255,235,180', 0.5)

      // Sun body — pale warm white with a soft amber rim
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
      g.addColorStop(0, 'rgba(255,255,255,0.95)')
      g.addColorStop(0.6, 'rgba(255,224,160,0.9)')
      g.addColorStop(1, 'rgba(255,190,110,0.85)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fill()
    }

    // Draw one complete scene. When `animate` is true the stars twinkle and
    // meteors move (used by the animation loop); when false a single static
    // frame is drawn (used for prefers-reduced-motion).
    const renderScene = (t, animate) => {
      timer += 1

      // Smoothly ease the parallax scroll value toward its target so the
      // background drifts fluidly instead of snapping to each scroll position.
      scrollY += (parallaxTarget - scrollY) * 0.08
      if (Math.abs(parallaxTarget - scrollY) < 0.05) scrollY = parallaxTarget

      // Clear the canvas (transparent so the CSS body background shows through)
      ctx.clearRect(0, 0, width, height)

      // ---- Nebula glows (soft galaxy color patches) ----
      // Nebula barely moves (deep background) — factor ~0.02 for subtle depth.
      const nebulaDrift = reducedMotion ? 0 : scrollY * 0.02
      drawGlow(width * 0.75, height * 0.75 - nebulaDrift, Math.min(width, height) * 0.5, palette.nebula, isSpace ? 0.05 : 0.03)
      drawGlow(width * 0.2, height * 0.2 - nebulaDrift, Math.min(width, height) * 0.4, palette.nebula2, isSpace ? 0.04 : 0.02)

      // ---- Drifting clouds (light mode only) — the "windy" daylight sky ----
      drawClouds()

      // ---- Twinkling background stars (each on its own parallax layer) ----
      stars.forEach((star) => {
        // Opacity oscillates over time for a gentle "twinkle" effect
        const twinkle = animate
          ? 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(star.phase + timer * star.speed))
          : star.brightness * 0.8
        // In dark mode stars are bright and twinkling; in light mode they are
        // extremely faint pinpricks so the daylight sky stays clean.
        const alpha = isSpace ? twinkle : twinkle * 0.12
        // Apply the star's parallax: its y-position shifts up as you scroll down
        const y = reducedMotion ? star.y : star.y - scrollY * star.parallax
        // Wrap around so stars leave the top edge and re-enter from the bottom
        const wrappedY = y < -10 ? height + 10 : y > height + 10 ? -10 : y
        ctx.fillStyle = `rgba(${palette.star},${alpha})`
        ctx.beginPath()
        ctx.arc(star.x, wrappedY, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // ---- Solar system (sun, orbits, planets) — slow parallax layer.
      // In dark mode the sun glows warmly in space; in light mode it becomes
      // a soft "daylight" sun that still fits the sky. ----
      if (isSpace) {
        const sunDrift = reducedMotion ? 0 : scrollY * 0.1
        drawSunSystem(-sunDrift)
      } else {
        drawDaylightSun()
      }

      // ---- Moon — dark space mode only (in light mode the sun takes the sky) ----
      if (isSpace) {
        const moonDrift = reducedMotion ? 0 : scrollY * 0.12
        drawMoon(-moonDrift)
      }

      // ---- Flying birds (light mode only — the animated, "windy" sky) ----
      if (animate && !isSpace) {
        // Occasionally add a new bird while fewer than 5 are in the sky, so a
        // small flock keeps flapping across the daylight scene.
        if (Math.random() < 0.02 && birds.length < 5) {
          birds.push(createBird())
        }
      }
      updateAndDrawBirds()

      // ---- Shooting stars (only move when animating) ----
      if (animate && isSpace) {
        // Occasional chance to spawn a new meteor while fewer than 4 exist
        if (Math.random() < 0.008 && meteors.length < 4) {
          meteors.push(createMeteor())
        }
      }
      meteors.forEach((m, i) => {
        // Move along its trajectory
        m.x += Math.cos(m.angle) * m.speed
        m.y += Math.sin(m.angle) * m.speed
        m.trail.unshift({ x: m.x, y: m.y, opacity: m.opacity })
        if (m.trail.length > 20) m.trail.pop()

        // Draw the fading trail
        m.trail.forEach((point, j) => {
          const fade = 1 - j / m.trail.length
          ctx.lineWidth = 2 * fade
          ctx.strokeStyle = `rgba(${palette.meteor},${fade * m.opacity * 0.7})`
          ctx.beginPath()
          ctx.moveTo(point.x, point.y)
          ctx.lineTo(
            point.x + Math.cos(m.angle) * 4,
            point.y + Math.sin(m.angle) * 4,
          )
          ctx.stroke()
        })

        // Glowing head
        drawGlow(m.x, m.y, 3.5, palette.meteor, m.opacity)

        // Remove meteors that flew off-screen
        if (m.x > width + 120 || m.y > height + 120) meteors.splice(i, 1)
      })
    }

    // The main animation loop: draw the scene, then schedule the next frame.
    const loop = (t) => {
      renderScene(t, true)
      animationId = requestAnimationFrame(loop)
    }

    // ---- Setup: respect reduced-motion, size canvas, start loop ----
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    resize()
    updateScroll()

    if (reducedMotion) {
      // Reduced motion: draw a single static frame without the animation loop
      renderScene(0, false)
    } else {
      animationId = requestAnimationFrame(loop)
    }

    // Rebuild on window resize and track scroll for parallax
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Cleanup: stop the loop and remove listeners when the component unmounts
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
    }
    // Re-run the effect only when the theme changes (so colors update)
  }, [theme])

  return (
    // Fixed, full-screen canvas positioned behind all content.
    // pointer-events-none lets clicks pass through to the page below.
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}

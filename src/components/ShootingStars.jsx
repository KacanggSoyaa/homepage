import { useEffect, useRef } from 'react'

// ShootingStars renders a full-screen canvas with animated amber shooting stars.
// It runs a requestAnimationFrame loop and cleans up on unmount.
export default function ShootingStars() {
  // Ref to the <canvas> DOM element
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId   // Stores the requestAnimationFrame ID for cleanup
    let stars = []    // Array of active star objects

    // Resize the canvas to fill the entire viewport
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Create a new star object with random position, length, speed, and opacity.
    // Stars spawn in the top 50% of the screen and travel at a 45-degree angle.
    const createStar = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 4,
      angle: Math.PI / 4,
      opacity: Math.random() * 0.7 + 0.3,
      trail: [],
    })

    // Main animation loop: clears canvas, spawns new stars, updates positions,
    // draws trails and glowing heads, and removes off-screen stars.
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 5% chance per frame to spawn a new star, max 7 on screen at once
      if (Math.random() < 0.05 && stars.length < 7) {
        stars.push(createStar())
      }

      stars.forEach((star, i) => {
        // Move the star along its 45-degree trajectory
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed

        // Add current position to the front of the trail, remove oldest if too long
        star.trail.unshift({ x: star.x, y: star.y, opacity: star.opacity })
        if (star.trail.length > 20) star.trail.pop()

        // Draw the fading trail behind the star
        star.trail.forEach((point, j) => {
          const fade = 1 - j / star.trail.length
          ctx.beginPath()
          ctx.strokeStyle = `rgba(232, 163, 61, ${fade * star.opacity * 0.6})`
          ctx.lineWidth = 2 * fade
          ctx.moveTo(point.x, point.y)
          const nextX = point.x + Math.cos(star.angle) * 4
          const nextY = point.y + Math.sin(star.angle) * 4
          ctx.lineTo(nextX, nextY)
          ctx.stroke()
        })

        // Draw a radial gradient glow at the star's head (white center, amber edge)
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, 4
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`)
        gradient.addColorStop(1, `rgba(232, 163, 61, 0)`)

        ctx.beginPath()
        ctx.arc(star.x, star.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Remove stars that have moved off-screen (with a 100px buffer)
        if (star.x > canvas.width + 100 || star.y > canvas.height + 100) {
          stars.splice(i, 1)
        }
      })

      // Schedule the next frame
      animationId = requestAnimationFrame(draw)
    }

    // Initialize canvas size and start the animation loop
    resize()
    draw()

    // Keep canvas resized when the browser window changes size
    window.addEventListener('resize', resize)

    // Cleanup: stop animation and remove resize listener when component unmounts
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}

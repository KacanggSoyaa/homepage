import { useEffect, useRef } from 'react'

export default function ShootingStars() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let stars = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createStar = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 8 + 4,
      angle: Math.PI / 4,
      opacity: Math.random() * 0.7 + 0.3,
      trail: [],
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (Math.random() < 0.05 && stars.length < 7) {
        stars.push(createStar())
      }

      stars.forEach((star, i) => {
        star.x += Math.cos(star.angle) * star.speed
        star.y += Math.sin(star.angle) * star.speed

        star.trail.unshift({ x: star.x, y: star.y, opacity: star.opacity })
        if (star.trail.length > 20) star.trail.pop()

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

        if (star.x > canvas.width + 100 || star.y > canvas.height + 100) {
          stars.splice(i, 1)
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)

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

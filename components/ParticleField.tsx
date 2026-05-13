'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
  baseAlpha: number
  hue: number
  life: number
  maxLife: number
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    // ── Cria partícula ────────────────────────────────────────────────
    const makeParticle = (canvasW: number, canvasH: number): Particle => {
      // Concentra as partículas na faixa central-superior (onde fica o texto)
      const bandCenter = canvasH * 0.42
      const bandSpread = canvasH * 0.38
      const maxLife = 180 + Math.random() * 300

      return {
        x: Math.random() * canvasW,
        y: bandCenter + (Math.random() - 0.5) * bandSpread * 2,
        r: Math.random() * 1.1 + 0.15,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.09,
        alpha: 0,
        baseAlpha: Math.random() * 0.55 + 0.1,
        hue: 32 + Math.random() * 18,   // âmbar: 32–50°
        life: Math.random() * maxLife,   // começa em ponto aleatório do ciclo
        maxLife,
      }
    }

    // ── Pool de partículas ─────────────────────────────────────────────
    const NUM = 2800
    let particles: Particle[] = []
    const initParticles = () => {
      particles = Array.from({ length: NUM }, () =>
        makeParticle(canvas.width, canvas.height)
      )
    }
    initParticles()

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bandCenter = canvas.height * 0.42
      const bandSpread = canvas.height * 0.38

      for (const p of particles) {
        // Avança ciclo de vida
        p.life += 1
        if (p.life >= p.maxLife) {
          // Reinicia a partícula
          Object.assign(p, makeParticle(canvas.width, canvas.height))
          p.life = 0
          p.alpha = 0
          continue
        }

        // Fade in / sustain / fade out
        const lifeRatio = p.life / p.maxLife
        let lifeFade: number
        if (lifeRatio < 0.15) {
          lifeFade = lifeRatio / 0.15
        } else if (lifeRatio > 0.82) {
          lifeFade = (1 - lifeRatio) / 0.18
        } else {
          lifeFade = 1
        }

        // Fade por distância do centro da banda (gaussiano suave)
        const dy = (p.y - bandCenter) / bandSpread
        const bandFade = Math.exp(-dy * dy * 2.2)

        // Fade pelas bordas horizontais
        const dx = Math.min(p.x, canvas.width - p.x) / (canvas.width * 0.12)
        const edgeFade = Math.min(1, dx)

        p.alpha = p.baseAlpha * lifeFade * bandFade * edgeFade

        // Move
        p.x += p.vx
        p.y += p.vy

        // Wrap suave
        if (p.x < -5) p.x = canvas.width + 5
        if (p.x > canvas.width + 5) p.x = -5
        if (p.y < -5) p.y = canvas.height + 5
        if (p.y > canvas.height + 5) p.y = -5

        if (p.alpha <= 0.005) continue

        // Desenha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 75%, 58%, ${p.alpha.toFixed(3)})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

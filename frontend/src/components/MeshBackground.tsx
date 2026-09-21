import { useEffect, useRef, useState } from 'react'

/**
 * Reactive light surface. Final z-order:
 *   z-0  -> mesh SVG (opacity 0.2)
 *   z-1  -> grain layer (new, opacity 0.035, soft-light, cheapest layer — never removed)
 *   z-2  -> cursor-light canvas (dpr capped, 60fps max, lerps toward cursor)
 *   z-10 -> AppShell content
 * prefers-reduced-motion -> static only. FPS fallback: avg <30 over 3s ->
 * static gradient at 50% 30%, no pointer tracking (grain stays).
 */
const GRAIN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
  "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='1' stitchTiles='stitch'/>" +
  "<feColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/></filter>" +
  "<rect width='120' height='120' filter='url(#n)'/></svg>"
const GRAIN_URI = 'url("data:image/svg+xml,' + encodeURIComponent(GRAIN_SVG) + '")'
export function MeshBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [degraded, setDegraded] = useState(false)
  const [reduced] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let raf = 0
    let last = 0
    const target = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.3 }
    const cur = { ...target }
    let frames = 0
    let winStart = performance.now()
    let cancelled = false

    function resize() {
      if (!canvas || !wrap) return
      const r = wrap.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(r.width * dpr))
      canvas.height = Math.max(1, Math.floor(r.height * dpr))
    }
    resize()
    window.addEventListener('resize', resize)

    function drawStatic() {
      if (!canvas || !ctx) return
      const w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)
      const cx = w * 0.5, cy = h * 0.3
      const r = Math.max(w, h) * 0.4
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, 'rgba(255,255,255,0.06)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    }

    if (reduced) { drawStatic(); return () => window.removeEventListener('resize', resize) }

    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      target.x = (e.clientX - r.left) * dpr
      target.y = (e.clientY - r.top) * dpr
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    function loop(t: number) {
      if (cancelled) return
      // throttle to 60fps
      if (t - last < 16.6) { raf = requestAnimationFrame(loop); return }
      last = t
      // lerp -> trail
      cur.x += (target.x - cur.x) * 0.08
      cur.y += (target.y - cur.y) * 0.08
      const w = canvas!.width, h = canvas!.height
      ctx!.clearRect(0, 0, w, h)
      const r = Math.max(w, h) * 0.4
      const g = ctx!.createRadialGradient(cur.x, cur.y, 0, cur.x, cur.y, r)
      g.addColorStop(0, 'rgba(255,255,255,0.06)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx!.fillStyle = g
      ctx!.fillRect(0, 0, w, h)

      frames++
      const now = performance.now()
      if (now - winStart >= 3000) {
        const fps = (frames * 1000) / (now - winStart)
        if (fps < 30) {
          setDegraded(true)
          cancelled = true
          window.removeEventListener('mousemove', onMove)
          window.removeEventListener('resize', resize)
          return
        }
        frames = 0; winStart = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelled = true; cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', resize) }
  }, [reduced])

  return (
    <div ref={wrapRef} className="mesh-root" aria-hidden="true" style={{ zIndex: 0 }}>
      <img
        src="/assets/mesh-texture.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ opacity: 0.2, zIndex: 0 }}
        draggable={false}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          zIndex: 1,
          opacity: 0.035,
          mixBlendMode: 'soft-light',
          backgroundImage: GRAIN_URI,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
        }}
      />
      {!degraded && !reduced && (
        <canvas ref={canvasRef} className="mesh-canvas" style={{ zIndex: 2 }} aria-hidden="true" />
      )}
      {(degraded || reduced) && <div className="mesh-fallback visible" />}
    </div>
  )
}

import { useCallback, useRef } from 'react'

const SIZE = 180
const RADIUS = SIZE / 2

/**
 * ColorWheel — molecule. Hue = angle (clockwise from top), saturation =
 * distance from center, at a fixed visual lightness of 50% (actual
 * lightness is controlled separately by a slider next to this wheel).
 * Props: h, s (current position), onChange({ h, s }), harmonyPoints
 * (optional array of { h, s } to render as extra markers).
 */
export default function ColorWheel({ h, s, onChange, harmonyPoints = [] }) {
  const wheelRef = useRef(null)
  const dragging = useRef(false)

  const updateFromPointer = useCallback(
    (clientX, clientY) => {
      const rect = wheelRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = clientX - cx
      const dy = clientY - cy
      const maxRadius = rect.width / 2
      const radius = Math.min(Math.hypot(dx, dy), maxRadius)
      let hue = (Math.atan2(dx, -dy) * 180) / Math.PI
      if (hue < 0) hue += 360
      const saturation = (radius / maxRadius) * 100
      onChange({ h: hue, s: saturation })
    },
    [onChange],
  )

  function handlePointerDown(e) {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromPointer(e.clientX, e.clientY)
  }
  function handlePointerMove(e) {
    if (!dragging.current) return
    updateFromPointer(e.clientX, e.clientY)
  }
  function handlePointerUp(e) {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  function pointFor(hue, sat) {
    const radius = (sat / 100) * RADIUS
    const rad = (hue * Math.PI) / 180
    return {
      x: RADIUS + radius * Math.sin(rad),
      y: RADIUS - radius * Math.cos(rad),
    }
  }

  const pointer = pointFor(h, s)

  return (
    <div
      ref={wheelRef}
      role="slider"
      aria-label="Hue and saturation"
      aria-valuetext={`hue ${Math.round(h)}, saturation ${Math.round(s)}%`}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={(e) => {
        const step = 5
        if (e.key === 'ArrowRight') onChange({ h: (h + step) % 360, s })
        if (e.key === 'ArrowLeft') onChange({ h: (h - step + 360) % 360, s })
        if (e.key === 'ArrowUp') onChange({ h, s: Math.min(100, s + step) })
        if (e.key === 'ArrowDown') onChange({ h, s: Math.max(0, s - step) })
      }}
      className="relative rounded-full cursor-crosshair shrink-0 touch-none select-none"
      style={{
        width: SIZE,
        height: SIZE,
        backgroundImage:
          'radial-gradient(circle at center, hsl(0 0% 50%) 0%, hsla(0, 0%, 50%, 0) 100%), ' +
          'conic-gradient(from 0deg, hsl(0 100% 50%), hsl(60 100% 50%), hsl(120 100% 50%), hsl(180 100% 50%), hsl(240 100% 50%), hsl(300 100% 50%), hsl(360 100% 50%))',
      }}
    >
      {harmonyPoints.map((p, i) => {
        const pos = pointFor(p.h, p.s)
        return (
          <span
            key={i}
            aria-hidden="true"
            className="absolute w-3 h-3 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: pos.x, top: pos.y, backgroundColor: `hsl(${p.h} ${p.s}% 50%)` }}
          />
        )
      })}
      <span
        aria-hidden="true"
        className="absolute w-4 h-4 rounded-full border-2 border-white shadow -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: pointer.x, top: pointer.y, backgroundColor: `hsl(${h} ${s}% 50%)` }}
      />
    </div>
  )
}

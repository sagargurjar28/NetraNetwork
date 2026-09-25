import { useCallback, useEffect, useRef } from 'react'
import { COPILOT_DEFAULT_WIDTH, COPILOT_MAX_WIDTH, COPILOT_MIN_WIDTH, useUIStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'

/**
 * Split-pane copilot aside: docked resizable panel inside the shell.
 * Drag the leading edge to resize (persisted to uiStore.copilotWidth,
 * clamped 320–640). Double-click resets to 420. Arrow keys nudge ±10px.
 */
export function CopilotSplitHandle({ className }: { className?: string }) {
  const setWidth = useUIStore((s) => s.setCopilotWidth)
  const width = useUIStore((s) => s.copilotWidth)
  const drag = useRef<{ startX: number; startW: number } | null>(null)

  const onMove = useCallback(
    (e: MouseEvent) => {
      if (!drag.current) return
      setWidth(drag.current.startW + (drag.current.startX - e.clientX))
    },
    [setWidth],
  )
  const onUp = useCallback(() => {
    drag.current = null
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }, [onMove])

  useEffect(
    () => () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    },
    [onMove, onUp],
  )

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize copilot pane"
      aria-valuenow={width}
      aria-valuemin={COPILOT_MIN_WIDTH}
      aria-valuemax={COPILOT_MAX_WIDTH}
      tabIndex={0}
      className={cn(
        'w-1.5 shrink-0 cursor-col-resize self-stretch touch-none',
        'hover:bg-accent-primary/30 focus-visible:bg-accent-primary/40 focus-visible:outline-none transition-colors',
        className,
      )}
      onMouseDown={(e) => {
        drag.current = { startX: e.clientX, startW: useUIStore.getState().copilotWidth }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
      }}
      onDoubleClick={() => setWidth(COPILOT_DEFAULT_WIDTH)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setWidth(width + 10)
        if (e.key === 'ArrowRight') setWidth(width - 10)
      }}
    />
  )
}

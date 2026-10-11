import { useRef } from 'react'
import type { PointerEvent } from 'react'

const HOLD_MS = 200 // press longer than this = pause, not tap
const SWIPE_PX = 50
const MOVE_TOLERANCE_PX = 10

interface Options {
  next: () => void
  prev: () => void
  onHoldChange: (held: boolean) => void
}

/**
 * Story controls with one set of pointer events (works for mouse and touch):
 * - tap the left third to go back, anywhere else to go forward
 * - press and hold to pause, release to resume
 * - swipe left/right to change slides
 * Buttons and links inside slides are ignored so they still work normally.
 */
export function useStoryGestures({ next, prev, onHoldChange }: Options) {
  const press = useRef<{ x: number; y: number; held: boolean; timer: number } | null>(null)

  const finish = () => {
    const current = press.current
    if (current) clearTimeout(current.timer)
    press.current = null
    onHoldChange(false)
    return current
  }

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if ((e.target as HTMLElement).closest('button, a, input, label')) return
      e.currentTarget.setPointerCapture(e.pointerId)
      const current = { x: e.clientX, y: e.clientY, held: false, timer: 0 }
      current.timer = window.setTimeout(() => {
        current.held = true
        onHoldChange(true)
      }, HOLD_MS)
      press.current = current
    },

    onPointerMove(e: PointerEvent<HTMLElement>) {
      const current = press.current
      // A finger that's moving is swiping, not holding
      if (current && !current.held && Math.hypot(e.clientX - current.x, e.clientY - current.y) > MOVE_TOLERANCE_PX) {
        clearTimeout(current.timer)
      }
    },

    onPointerUp(e: PointerEvent<HTMLElement>) {
      const current = finish()
      if (!current) return
      const dx = e.clientX - current.x
      const dy = e.clientY - current.y

      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) next()
        else prev()
        return
      }
      if (current.held || Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) return

      const rect = e.currentTarget.getBoundingClientRect()
      if (e.clientX - rect.left < rect.width / 3) prev()
      else next()
    },

    onPointerCancel() {
      finish()
    },
  }
}

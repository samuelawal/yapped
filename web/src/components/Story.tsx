import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStoryGestures } from '../hooks/useStoryGestures'
import type { Stats } from '../lib/types'
import { buildSlides } from '../slides/buildSlides'
import { EASE_OUT } from '../lib/ease'
import { ProgressBars } from './ProgressBars'

const SLIDE_MS = 5000

interface Props {
  stats: Stats
  onRestart: () => void
}

export function Story({ stats, onRestart }: Props) {
  const slides = useMemo(() => buildSlides(stats, onRestart), [stats, onRestart])
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState(false)
  const [keyboardPaused, setKeyboardPaused] = useState(false)
  const [tabHidden, setTabHidden] = useState(false)

  const last = slides.length - 1
  const paused = held || keyboardPaused || tabHidden
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])
  const gestures = useStoryGestures({ next, prev, onHoldChange: setHeld })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === ' ' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault()
        setKeyboardPaused((p) => !p)
      } else if (e.key === 'Escape') onRestart()
    }
    const onVisibility = () => setTabHidden(document.hidden)
    window.addEventListener('keydown', onKey)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [next, prev, onRestart])

  const slide = slides[index]

  return (
    <div
      className="absolute inset-0 touch-none select-none [-webkit-touch-callout:none]"
      onContextMenu={(e) => e.preventDefault()}
      {...gestures}
    >
      {/* The old slide fades and shrinks away while the new one fades in
          from slightly larger, so they cross over smoothly. */}
      <AnimatePresence initial={false}>
        <motion.section
          key={slide.id}
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
        >
          {slide.render()}
        </motion.section>
      </AnimatePresence>

      {/* Controls take the slide's text color, so they're visible on every background */}
      <div className={slide.fg}>
        <ProgressBars
          count={slides.length}
          index={index}
          paused={paused}
          durationMs={SLIDE_MS}
          onComplete={() => {
            if (index < last) next()
          }}
        />
        <button
          type="button"
          onClick={onRestart}
          aria-label="Close and start over"
          className="absolute top-[7cqw] right-[3cqw] z-20 grid size-[10cqw] place-items-center rounded-full text-[5cqw] opacity-80 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current"
        >
          ✕
        </button>
        <AnimatePresence>
          {paused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute top-[8.5cqw] left-[3cqw] z-20 rounded-full bg-current/15 px-[3cqw] py-[1cqw] text-[3.2cqw] font-semibold tracking-wide uppercase"
            >
              Paused
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

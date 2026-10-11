import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { formatNumber } from '../lib/format'
import { EASE_OUT } from '../lib/ease'

interface Props {
  value: number
  delay?: number
  duration?: number
  format?: (n: number) => string
}

/**
 * Counts from 0 up to `value`.
 *
 * The number lives in a motion value, not React state: motion updates the
 * text directly ~60 times a second without re-rendering the component.
 * useTransform turns the raw number (e.g. 1234.56) into display text ("1,235").
 */
export function CountUp({ value, delay = 0.3, duration = 1.6, format = formatNumber }: Props) {
  const reduceMotion = useReducedMotion()
  const count = useMotionValue(reduceMotion ? value : 0)
  const text = useTransform(count, (n) => format(Math.round(n)))

  useEffect(() => {
    if (reduceMotion) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { delay, duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [count, value, delay, duration, reduceMotion])

  return (
    // Screen readers get the final number, not every step of the count
    <span aria-label={format(value)}>
      <motion.span aria-hidden className="tabular-nums">
        {text}
      </motion.span>
    </span>
  )
}

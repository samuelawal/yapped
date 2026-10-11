// Reusable entrance animations. <MotionConfig reducedMotion="user"> in App
// turns off the movement (y, scale, rotate) for people who ask for reduced
// motion, leaving only the fades.
import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { EASE_OUT } from '../lib/ease'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
}

/** Text that slides up into place. */
export function Reveal({ children, delay = 0, className, style }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

/** The headline: slides up and scales in, slightly overshooting (a spring). */
export function BigReveal({ children, delay = 0.15, className, style }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 50, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 170, damping: 17 }}
    >
      {children}
    </motion.div>
  )
}

/** Drops in from above and bounces. Lower damping = more bounce. */
export function Bounce({ children, delay = 0, className, style }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: -90, scale: 0.4, rotate: -20 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', stiffness: 420, damping: 11 }}
    >
      {children}
    </motion.div>
  )
}

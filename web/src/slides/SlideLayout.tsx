import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Reveal } from '../components/motion'

interface Props {
  theme: string // background + text color classes, e.g. "bg-tangerine text-ink"
  kicker: string
  children: ReactNode
  footer?: ReactNode
  orb?: 'top' | 'bottom'
}

export function SlideLayout({ theme, kicker, children, footer, orb = 'top' }: Props) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${theme}`}>
      <Orb position={orb} />
      <div className="relative flex h-full flex-col px-[8cqw] pt-[19cqw] pb-[11cqw]">
        <Reveal className="text-[4cqw] font-bold tracking-[0.18em] uppercase opacity-75">{kicker}</Reveal>
        <div className="flex flex-1 flex-col justify-center gap-[5cqw]">{children}</div>
        {footer && (
          <Reveal delay={1.1} className="text-[5cqw] leading-snug font-medium text-balance">
            {footer}
          </Reveal>
        )}
      </div>
    </div>
  )
}

/** A big soft circle in the slide's text color that slowly "breathes". */
function Orb({ position }: { position: 'top' | 'bottom' }) {
  const place = position === 'top' ? '-top-[30cqw] -right-[35cqw]' : '-bottom-[35cqw] -left-[30cqw]'
  return (
    <motion.div
      aria-hidden
      className={`absolute size-[95cqw] rounded-full bg-current opacity-[0.08] ${place}`}
      // An array is a list of keyframes: grow 8%, then shrink back, forever
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
    />
  )
}

export function BigName({ name, size }: { name: string; size: string }) {
  return (
    <span className="block font-display leading-[0.92] font-extrabold tracking-tight break-words" style={{ fontSize: size }}>
      {name}
    </span>
  )
}

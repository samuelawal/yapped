import { motion } from 'motion/react'
import { CountUp } from '../components/CountUp'
import { BigReveal, Reveal } from '../components/motion'
import { EASE_OUT } from '../lib/ease'
import { topSenderQuip } from '../lib/copy'
import { formatNumber, nameSize } from '../lib/format'
import type { Stats } from '../lib/types'
import { BigName, SlideLayout } from './SlideLayout'

export function TopSendersSlide({ stats, theme }: { stats: Stats; theme: string }) {
  const [top] = stats.leaderboard
  const rest = stats.leaderboard.slice(0, 5)
  return (
    <SlideLayout theme={theme} kicker="Top yapper" footer={topSenderQuip(stats)}>
      <BigReveal>
        <BigName name={top.name} size={nameSize(top.name)} />
      </BigReveal>
      <Reveal delay={0.35} className="font-display text-[7cqw] font-semibold">
        sent <CountUp value={top.count} delay={0.5} /> messages.
      </Reveal>

      {rest.length > 1 && (
        <ol className="mt-[2cqw] space-y-[2cqw]">
          {rest.map((person, i) => (
            <li key={person.name} className="flex items-center gap-[3cqw] text-[4cqw] font-semibold">
              <span className="w-[24cqw] truncate">{person.name}</span>
              <span className="h-[3cqw] flex-1">
                {/* Bars grow from the left (scaleX), one after another */}
                <motion.span
                  className="block h-full origin-left rounded-full bg-current"
                  style={{ width: `${(person.count / top.count) * 100}%` }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7 + i * 0.12, duration: 0.8, ease: EASE_OUT }}
                />
              </span>
              <span className="w-[16cqw] text-right tabular-nums">{formatNumber(person.count)}</span>
            </li>
          ))}
        </ol>
      )}
    </SlideLayout>
  )
}

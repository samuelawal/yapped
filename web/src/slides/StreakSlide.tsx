import { CountUp } from '../components/CountUp'
import { BigReveal, Bounce, Reveal } from '../components/motion'
import { streakQuip } from '../lib/copy'
import { formatDate } from '../lib/format'
import type { Stats } from '../lib/types'
import { SlideLayout } from './SlideLayout'

export function StreakSlide({ streak, theme }: { streak: Stats['longestStreak']; theme: string }) {
  return (
    <SlideLayout theme={theme} kicker="Longest streak" footer={streakQuip(streak.days)}>
      <Bounce className="text-[16cqw]">🔥</Bounce>
      <BigReveal className="font-display text-[36cqw] leading-[0.8] font-extrabold tracking-tight">
        <CountUp value={streak.days} delay={0.3} duration={1.2} />
      </BigReveal>
      <Reveal delay={0.35} className="font-display text-[8cqw] font-semibold">
        days in a row without going quiet.
      </Reveal>
      {streak.start && streak.end && (
        <Reveal delay={0.7} className="text-[4.4cqw] opacity-80">
          {formatDate(streak.start)} → {formatDate(streak.end)}
        </Reveal>
      )}
    </SlideLayout>
  )
}

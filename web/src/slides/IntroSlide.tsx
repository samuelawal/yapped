import { CountUp } from '../components/CountUp'
import { BigReveal, Bounce, Reveal } from '../components/motion'
import { formatRange } from '../lib/format'
import type { Stats } from '../lib/types'
import { SlideLayout } from './SlideLayout'

// Speech bubbles scattered around the edges
const BUBBLES = [
  'top-[24%] left-[6%] rotate-[-8deg]',
  'top-[20%] right-[8%] rotate-[10deg]',
  'bottom-[24%] right-[10%] rotate-[-6deg]',
]

export function IntroSlide({ stats, theme }: { stats: Stats; theme: string }) {
  const emojis = stats.topEmojis.length ? stats.topEmojis.map((e) => e.emoji) : ['💬', '👀', '✨']
  return (
    <SlideLayout theme={theme} kicker={formatRange(stats)} footer="Let's look at the receipts." orb="bottom">
      {BUBBLES.map((place, i) => (
        <Bounce key={place} delay={0.9 + i * 0.15} className={`absolute ${place}`}>
          <span className="block rounded-[4cqw] rounded-bl-none bg-current px-[3cqw] py-[2cqw] text-[7cqw]">
            {emojis[i % emojis.length]}
          </span>
        </Bounce>
      ))}
      <Reveal className="font-display text-[8cqw] font-semibold">This chat sent</Reveal>
      <BigReveal className="font-display text-[23cqw] leading-[0.85] font-extrabold tracking-tight">
        <CountUp value={stats.totalMessages} />
      </BigReveal>
      <Reveal delay={0.4} className="font-display text-[8cqw] font-semibold">
        messages.
      </Reveal>
    </SlideLayout>
  )
}

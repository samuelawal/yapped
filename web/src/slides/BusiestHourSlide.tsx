import { CountUp } from '../components/CountUp'
import { BigReveal, Bounce, Reveal } from '../components/motion'
import { hourQuip } from '../lib/copy'
import { formatHour } from '../lib/format'
import type { Stats } from '../lib/types'
import { SlideLayout } from './SlideLayout'

type Hour = NonNullable<Stats['busiestHour']>

export function BusiestHourSlide({ hour, theme }: { hour: Hour; theme: string }) {
  const isNight = hour.hour < 6 || hour.hour >= 21
  return (
    <SlideLayout theme={theme} kicker="Peak hour" footer={hourQuip(hour.hour)}>
      <Bounce delay={0.1} className="text-[16cqw]">
        {isNight ? '🌙' : '☀️'}
      </Bounce>
      <BigReveal className="font-display text-[30cqw] leading-[0.85] font-extrabold tracking-tight">
        {formatHour(hour.hour)}
      </BigReveal>
      <Reveal delay={0.4} className="font-display text-[7cqw] font-semibold">
        is when the chat goes off: <CountUp value={hour.count} delay={0.5} /> messages and counting.
      </Reveal>
    </SlideLayout>
  )
}

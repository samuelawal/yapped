import { CountUp } from '../components/CountUp'
import { BigReveal, Reveal } from '../components/motion'
import { parseDate } from '../lib/format'
import type { Stats } from '../lib/types'
import { SlideLayout } from './SlideLayout'

type Day = NonNullable<Stats['mostActiveDay']>

export function BusiestDaySlide({ day, theme }: { day: Day; theme: string }) {
  const date = parseDate(day.date)
  const part = (options: Intl.DateTimeFormatOptions) => date.toLocaleDateString('en-GB', options)
  return (
    <SlideLayout theme={theme} kicker="Busiest day" footer="What happened?! We need the full gist." orb="bottom">
      <Reveal className="font-display text-[9cqw] font-semibold">{part({ weekday: 'long' })}</Reveal>
      <BigReveal className="font-display leading-[0.85] font-extrabold tracking-tight">
        <span className="block text-[38cqw]">{part({ day: 'numeric' })}</span>
        <span className="block text-[11cqw]">{part({ month: 'long', year: 'numeric' })}</span>
      </BigReveal>
      <Reveal delay={0.4} className="font-display text-[7cqw] font-semibold">
        <CountUp value={day.count} delay={0.5} /> messages in a single day.
      </Reveal>
    </SlideLayout>
  )
}

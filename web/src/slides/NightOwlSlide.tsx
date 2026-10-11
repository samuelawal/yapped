import { CountUp } from '../components/CountUp'
import { BigReveal, Bounce, Reveal } from '../components/motion'
import { nameSize, plural } from '../lib/format'
import type { PersonCount } from '../lib/types'
import { BigName, SlideLayout } from './SlideLayout'

export function NightOwlSlide({ owl, theme }: { owl: PersonCount; theme: string }) {
  return (
    <SlideLayout theme={theme} kicker="Night owl" footer={`Go to bed, ${owl.name}.`} orb="bottom">
      <Bounce className="text-[16cqw]">🦉</Bounce>
      <BigReveal>
        <BigName name={owl.name} size={nameSize(owl.name)} />
      </BigReveal>
      <Reveal delay={0.35} className="font-display text-[7cqw] font-semibold">
        sent <CountUp value={owl.count} delay={0.5} /> {plural(owl.count, 'message')} between midnight and 4am.
      </Reveal>
    </SlideLayout>
  )
}

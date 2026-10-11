import { CountUp } from '../components/CountUp'
import { BigReveal, Bounce, Reveal } from '../components/motion'
import { formatNumber, nameSize, plural } from '../lib/format'
import type { PersonCount } from '../lib/types'
import { BigName, SlideLayout } from './SlideLayout'

export function MediaSlide({ media, theme }: { media: PersonCount[]; theme: string }) {
  const [top, ...others] = media
  return (
    <SlideLayout theme={theme} kicker="Camera roll champion" footer="Basically the group's official photographer.">
      <Bounce className="text-[16cqw]">📸</Bounce>
      <BigReveal>
        <BigName name={top.name} size={nameSize(top.name)} />
      </BigReveal>
      <Reveal delay={0.35} className="font-display text-[7cqw] font-semibold">
        sent <CountUp value={top.count} delay={0.5} /> {plural(top.count, 'photo, video and sticker', 'photos, videos and stickers')}.
      </Reveal>
      {others.length > 0 && (
        <Reveal delay={0.8} className="text-[4.4cqw] opacity-80">
          Runners-up: {others.slice(0, 3).map((p) => `${p.name} (${formatNumber(p.count)})`).join(', ')}
        </Reveal>
      )}
    </SlideLayout>
  )
}

import { BigReveal, Bounce, Reveal } from '../components/motion'
import { replyQuip } from '../lib/copy'
import { formatDuration, nameSize } from '../lib/format'
import type { Stats } from '../lib/types'
import { BigName, SlideLayout } from './SlideLayout'

type Replier = NonNullable<Stats['fastestReplier']>

export function FastestReplierSlide({ replier, theme }: { replier: Replier; theme: string }) {
  return (
    <SlideLayout theme={theme} kicker="Fastest thumbs" footer={replyQuip(replier.typicalMinutes)}>
      <Bounce className="text-[16cqw]">⚡️</Bounce>
      <BigReveal>
        <BigName name={replier.name} size={nameSize(replier.name)} />
      </BigReveal>
      <Reveal delay={0.35} className="font-display text-[7cqw] font-semibold">
        usually replies in <span className="rounded-[2cqw] bg-tangerine px-[2cqw] text-ink">{formatDuration(replier.typicalMinutes)}</span>.
      </Reveal>
    </SlideLayout>
  )
}

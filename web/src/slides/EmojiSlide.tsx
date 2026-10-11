import { CountUp } from '../components/CountUp'
import { Bounce, Reveal } from '../components/motion'
import { emojiQuip } from '../lib/copy'
import { formatNumber } from '../lib/format'
import type { Stats } from '../lib/types'
import { SlideLayout } from './SlideLayout'

export function EmojiSlide({ emojis, theme }: { emojis: Stats['topEmojis']; theme: string }) {
  const [top, ...others] = emojis
  return (
    <SlideLayout theme={theme} kicker="Most used emoji" footer={emojiQuip(top.emoji)}>
      <Bounce delay={0.1} className="text-[42cqw] leading-none">
        {top.emoji}
      </Bounce>
      <Reveal delay={0.4} className="font-display text-[8cqw] font-semibold">
        used <CountUp value={top.count} delay={0.5} /> times.
      </Reveal>
      {others.length > 0 && (
        <div className="flex gap-[4cqw]">
          {others.map((e, i) => (
            // Each one drops in a little after the last
            <Bounce key={e.emoji} delay={0.8 + i * 0.12} className="text-center">
              <span className="block text-[12cqw] leading-none">{e.emoji}</span>
              <span className="text-[3.8cqw] font-semibold tabular-nums">{formatNumber(e.count)}</span>
            </Bounce>
          ))}
        </div>
      )}
    </SlideLayout>
  )
}

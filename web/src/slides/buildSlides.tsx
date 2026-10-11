import type { ReactNode } from 'react'
import type { Stats } from '../lib/types'
import { BusiestDaySlide } from './BusiestDaySlide'
import { BusiestHourSlide } from './BusiestHourSlide'
import { EmojiSlide } from './EmojiSlide'
import { FastestReplierSlide } from './FastestReplierSlide'
import { IntroSlide } from './IntroSlide'
import { MediaSlide } from './MediaSlide'
import { NightOwlSlide } from './NightOwlSlide'
import { StreakSlide } from './StreakSlide'
import { SummarySlide } from './SummarySlide'
import { TopSendersSlide } from './TopSendersSlide'

export interface SlideDef {
  id: string
  bg: string
  fg: string
  render: () => ReactNode
}

/** Only includes slides the chat has data for (e.g. no emojis = no emoji slide). */
export function buildSlides(stats: Stats, onRestart: () => void): SlideDef[] {
  const slides: SlideDef[] = []
  const add = (id: string, bg: string, fg: string, render: (theme: string) => ReactNode) =>
    slides.push({ id, bg, fg, render: () => render(`${bg} ${fg}`) })

  add('intro', 'bg-violet', 'text-acid', (t) => <IntroSlide stats={stats} theme={t} />)
  if (stats.leaderboard.length) add('top', 'bg-tangerine', 'text-ink', (t) => <TopSendersSlide stats={stats} theme={t} />)
  if (stats.busiestHour) add('hour', 'bg-butter', 'text-ink', (t) => <BusiestHourSlide hour={stats.busiestHour!} theme={t} />)
  if (stats.media.length) add('media', 'bg-bubblegum', 'text-ink', (t) => <MediaSlide media={stats.media} theme={t} />)
  if (stats.topEmojis.length) add('emoji', 'bg-acid', 'text-plum', (t) => <EmojiSlide emojis={stats.topEmojis} theme={t} />)
  if (stats.mostActiveDay) add('day', 'bg-lagoon', 'text-cream', (t) => <BusiestDaySlide day={stats.mostActiveDay!} theme={t} />)
  if (stats.longestStreak.days > 1) add('streak', 'bg-sky', 'text-ink', (t) => <StreakSlide streak={stats.longestStreak} theme={t} />)
  if (stats.nightOwl) add('night', 'bg-plum', 'text-butter', (t) => <NightOwlSlide owl={stats.nightOwl!} theme={t} />)
  if (stats.fastestReplier) add('reply', 'bg-cream', 'text-ink', (t) => <FastestReplierSlide replier={stats.fastestReplier!} theme={t} />)
  add('summary', 'bg-ink', 'text-cream', (t) => <SummarySlide stats={stats} theme={t} onRestart={onRestart} />)

  return slides
}

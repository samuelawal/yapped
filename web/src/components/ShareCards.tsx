// The summary images people save and post. Each card is its own `@container`,
// so all sizes are in cqw (% of the card's width): the same card looks
// identical as a small preview and as a 1080px-wide export.
import { formatDuration, formatHour, formatNumber, formatRange } from '../lib/format'
import type { Stats } from '../lib/types'
import { Wordmark } from './Wordmark'

interface Tile {
  label: string
  value: string
  tone: string
}

function tiles(stats: Stats): Tile[] {
  const list: (Tile | false)[] = [
    stats.leaderboard[0] && { label: 'Top yapper', value: stats.leaderboard[0].name, tone: 'bg-tangerine text-ink' },
    !!stats.busiestHour && { label: 'Peak hour', value: formatHour(stats.busiestHour.hour), tone: 'bg-butter text-ink' },
    stats.longestStreak.days > 1 && { label: 'Longest streak', value: `${stats.longestStreak.days} days`, tone: 'bg-sky text-ink' },
    !!stats.nightOwl && { label: 'Night owl', value: stats.nightOwl.name, tone: 'bg-plum text-butter' },
    !!stats.fastestReplier && {
      label: 'Fastest thumbs',
      value: `${stats.fastestReplier.name} · ${formatDuration(stats.fastestReplier.typicalMinutes)}`,
      tone: 'bg-bubblegum text-ink',
    },
    stats.topEmojis.length > 0 && { label: 'Top emojis', value: stats.topEmojis.slice(0, 3).map((e) => e.emoji).join(' '), tone: 'bg-acid text-plum' },
  ]
  return list.filter((t): t is Tile => !!t).slice(0, 6)
}

function TileView({ tile, labelSize, valueSize }: { tile: Tile; labelSize: string; valueSize: string }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between rounded-[3cqw] p-[3.2cqw] ${tile.tone}`}>
      <p className="font-bold tracking-wider uppercase opacity-70" style={{ fontSize: labelSize }}>
        {tile.label}
      </p>
      <p className="mt-[0.6cqw] line-clamp-2 font-display leading-tight font-bold break-words" style={{ fontSize: valueSize }}>
        {tile.value}
      </p>
    </div>
  )
}

/** 9:16, for WhatsApp status / Instagram stories. */
export function StoryCard({ stats }: { stats: Stats }) {
  return (
    <div className="@container aspect-[9/16] w-full overflow-hidden bg-violet font-sans text-cream">
      <div className="flex h-full flex-col p-[7cqw]">
        <div className="flex items-baseline justify-between gap-[3cqw]">
          <Wordmark className="text-[8cqw] text-cream" />
          <span className="text-right text-[3.4cqw] opacity-80">{formatRange(stats)}</span>
        </div>
        <div className="mt-[9cqw]">
          <p className="font-display text-[22cqw] leading-[0.85] font-extrabold tracking-tight text-acid">{formatNumber(stats.totalMessages)}</p>
          <p className="mt-[1cqw] font-display text-[7cqw] font-semibold">messages. The receipts:</p>
        </div>
        {/* auto-rows-fr: the tiles stretch to fill the space, like a bento box */}
        <div className="mt-[8cqw] grid flex-1 auto-rows-fr grid-cols-2 gap-[3cqw]">
          {tiles(stats).map((tile) => (
            <TileView key={tile.label} tile={tile} labelSize="3cqw" valueSize="6.4cqw" />
          ))}
        </div>
        <p className="mt-[5cqw] text-center text-[3cqw] opacity-70">Counted on-device with yapped. Nothing uploaded.</p>
      </div>
    </div>
  )
}

/** 16:9, for X / Twitter posts. */
export function WideCard({ stats }: { stats: Stats }) {
  return (
    <div className="@container aspect-[16/9] w-full overflow-hidden bg-violet font-sans text-cream">
      <div className="flex h-full gap-[4cqw] p-[4.5cqw]">
        <div className="flex w-[36%] flex-col">
          <Wordmark className="text-[4.6cqw] text-cream" />
          <p className="mt-auto font-display text-[12cqw] leading-[0.85] font-extrabold tracking-tight text-acid">{formatNumber(stats.totalMessages)}</p>
          <p className="mt-[1cqw] font-display text-[3.4cqw] font-semibold">messages.</p>
          <p className="mt-[2cqw] text-[1.8cqw] opacity-75">{formatRange(stats)}</p>
        </div>
        <div className="grid flex-1 grid-cols-2 content-center gap-[1.8cqw]">
          {tiles(stats).map((tile) => (
            <TileView key={tile.label} tile={tile} labelSize="1.5cqw" valueSize="3cqw" />
          ))}
        </div>
      </div>
    </div>
  )
}

import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Reveal } from '../components/motion'
import { StoryCard, WideCard } from '../components/ShareCards'
import { saveNodeAsImage } from '../lib/exportImage'
import type { Stats } from '../lib/types'
import { SlideLayout } from './SlideLayout'

interface Props {
  stats: Stats
  theme: string
  onRestart: () => void
}

export function SummarySlide({ stats, theme, onRestart }: Props) {
  const storyRef = useRef<HTMLDivElement>(null)
  const wideRef = useRef<HTMLDivElement>(null)
  const [saving, setSaving] = useState<'story' | 'wide' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function save(kind: 'story' | 'wide') {
    const node = kind === 'story' ? storyRef.current : wideRef.current
    if (!node || saving) return
    setSaving(kind)
    setError(null)
    try {
      // 360px × 3 = 1080×1920 (status); 800px × 2 = 1600×900 (X)
      await saveNodeAsImage(node, `yapped-${kind}.png`, kind === 'story' ? 3 : 2)
    } catch {
      setError("Couldn't make the image. Try again?")
    } finally {
      setSaving(null)
    }
  }

  const button =
    'w-full rounded-full px-[4cqw] py-[3.4cqw] text-[4cqw] font-bold transition active:scale-95 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream'

  return (
    <SlideLayout theme={theme} kicker="That's the lot">
      <Reveal className="text-center font-display text-[8cqw] leading-none font-bold">Your chat, on one card.</Reveal>

      {/* The preview card tilts in, then settles slightly crooked */}
      <motion.div
        className="mx-auto w-[46cqw] overflow-hidden rounded-[3cqw] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]"
        initial={{ opacity: 0, y: 60, rotate: -12 }}
        animate={{ opacity: 1, y: 0, rotate: -2 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 14 }}
      >
        <StoryCard stats={stats} />
      </motion.div>

      <Reveal delay={0.5} className="space-y-[3cqw]">
        <div className="space-y-[2.5cqw]">
          <button type="button" className={`${button} bg-acid text-ink`} onClick={() => save('story')} disabled={!!saving}>
            {saving === 'story' ? 'Saving…' : 'Download for Status'}
          </button>
          <button type="button" className={`${button} bg-cream text-ink`} onClick={() => save('wide')} disabled={!!saving}>
            {saving === 'wide' ? 'Saving…' : 'Download for X'}
          </button>
        </div>
        <p role="status" className="min-h-[4cqw] text-center text-[3.6cqw] text-tangerine">
          {error}
        </p>
        <button type="button" onClick={onRestart} className="mx-auto block text-[3.8cqw] underline underline-offset-4 opacity-75 hover:opacity-100">
          Try another chat
        </button>
      </Reveal>

      {/* Full-size copies for the export, rendered off-screen. Portalled to
          <body> so the slide's animations don't affect them. */}
      {createPortal(
        <div aria-hidden className="pointer-events-none fixed top-0 left-[-10000px]">
          <div ref={storyRef} className="w-[360px]">
            <StoryCard stats={stats} />
          </div>
          <div ref={wideRef} className="w-[800px]">
            <WideCard stats={stats} />
          </div>
        </div>,
        document.body,
      )}
    </SlideLayout>
  )
}

import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import { track } from '../lib/analytics'
import { analyzeText, loadAnalyzer, readChatFile } from '../lib/analyze'
import { makeDemoChat } from '../lib/demoChat'
import type { Stats } from '../lib/types'
import { Reveal } from './motion'
import { Wordmark } from './Wordmark'

export function UploadScreen({ onStats }: { onStats: (stats: Stats) => void }) {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Start downloading the WASM while the user finds their file
  useEffect(() => {
    loadAnalyzer()
  }, [])

  async function run(getText: () => Promise<string>, source: 'txt' | 'zip' | 'demo') {
    setBusy(true)
    setError(null)
    try {
      const stats = await analyzeText(await getText())
      if (stats.totalMessages === 0) {
        setError("We couldn't find any messages in that file. Is it a WhatsApp chat export?")
        if (source !== 'demo') track('upload_failed', { source, reason: 'no_messages' })
      } else {
        track('chat_analyzed', { source })
        onStats(stats)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong reading that file.')
      if (source !== 'demo') track('upload_failed', { source, reason: 'read_error' })
    } finally {
      setBusy(false)
    }
  }

  const onFile = (file: File | undefined) =>
    file && run(() => readChatFile(file), file.name.toLowerCase().endsWith('.zip') ? 'zip' : 'txt')

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onFile(e.dataTransfer.files[0])
  }

  return (
    <div className="absolute inset-0 overflow-y-auto bg-cream text-ink">
      <div className="flex min-h-full flex-col px-[7cqw] pt-[9cqw] pb-[8cqw]">
        <Reveal>
          <Wordmark className="text-[9cqw]" />
        </Reveal>
        <Reveal delay={0.1} className="mt-[4cqw] font-display text-[10.5cqw] leading-[0.95] font-extrabold tracking-tight">
          The receipts for your <span className="text-violet">group chat</span>.
        </Reveal>
        <Reveal delay={0.2} className="mt-[3cqw] text-[4.4cqw] leading-snug opacity-80">
          Top yappers, night owls, emoji addicts. Drop in a WhatsApp export and see who's really carrying the chat.
        </Reveal>

        <Reveal delay={0.3} className="mt-[6cqw]">
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center gap-[2cqw] rounded-[6cqw] border-[0.7cqw] border-dashed px-[6cqw] py-[6cqw] text-center transition focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-violet ${
              dragging ? 'scale-[1.02] border-violet bg-violet/10' : 'border-ink/30 bg-white/60 hover:border-violet'
            }`}
          >
            <motion.span
              className="text-[12cqw]"
              animate={dragging ? { scale: 1.2, rotate: -8 } : { scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            >
              💬
            </motion.span>
            <span className="font-display text-[6cqw] font-bold">{busy ? 'Reading your chat…' : 'Drop your chat here'}</span>
            <span className="text-[4cqw] opacity-70">or tap to choose a .txt or .zip file</span>
            <input
              ref={inputRef}
              type="file"
              accept=".txt,.zip,text/plain,application/zip"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                onFile(e.target.files?.[0])
                e.target.value = '' // so choosing the same file again still works
              }}
            />
          </label>
        </Reveal>

        <p role="alert" className="mt-[2cqw] min-h-[4cqw] text-[4cqw] font-medium text-tangerine">
          {error}
        </p>

        <Reveal delay={0.4} className="flex items-start gap-[3cqw] rounded-[4cqw] bg-ink px-[5cqw] py-[4cqw] text-cream">
          <span className="text-[6cqw] leading-none">🔒</span>
          <p className="text-[4cqw] leading-snug">
            <strong className="text-acid">Your chat never leaves your phone.</strong> Everything is counted right here in your browser.
            Nothing from your chat is uploaded, ever. We only count anonymous visits and button taps.
          </p>
        </Reveal>

        <Reveal delay={0.5} className="mt-[5cqw]">
          <details className="group rounded-[4cqw] bg-white/60 px-[5cqw] py-[4cqw] text-[4cqw]">
            <summary className="cursor-pointer list-none font-bold">
              How do I export a chat? <span className="float-right transition group-open:rotate-45">+</span>
            </summary>
            <div className="mt-[3cqw] space-y-[3cqw] leading-snug">
              <p>
                <strong>Android:</strong> open the chat → tap ⋮ → More → Export chat → <em>Without media</em>. Save the .txt file.
              </p>
              <p>
                <strong>iPhone:</strong> open the chat → tap the name at the top → Export Chat → <em>Without Media</em>. You'll get a
                .zip. Drop it in as it is.
              </p>
            </div>
          </details>
        </Reveal>

        <Reveal delay={0.6} className="mt-auto pt-[6cqw] text-center">
          <button
            type="button"
            disabled={busy}
            onClick={() => run(async () => makeDemoChat(), 'demo')}
            className="text-[4cqw] font-semibold underline decoration-violet decoration-2 underline-offset-4 hover:text-violet"
          >
            No chat handy? Try a demo
          </button>
        </Reveal>
      </div>
    </div>
  )
}

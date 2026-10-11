interface Props {
  count: number
  index: number
  paused: boolean
  durationMs: number
  onComplete: () => void
}

/**
 * One bar per slide. The current bar is a CSS animation rather than a JS timer:
 * pausing is just `animation-play-state: paused`, and `onAnimationEnd` tells us
 * when to advance. `key={index}` remounts the bar so it restarts from empty.
 * Bars use `currentColor`, so they match each slide's text color.
 */
export function ProgressBars({ count, index, paused, durationMs, onComplete }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex gap-[1.2cqw] px-[3cqw] pt-[3cqw]">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-current/25">
          {i < index && <div className="h-full w-full bg-current" />}
          {i === index && (
            <div
              key={index}
              className="h-full w-full origin-left bg-current"
              style={{
                animation: `progress-fill ${durationMs}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
              onAnimationEnd={onComplete}
            />
          )}
        </div>
      ))}
    </div>
  )
}

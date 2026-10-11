import type { ReactNode } from 'react'

/**
 * Full screen on phones; a centered 9:16 "phone" on bigger screens.
 * `@container` lets everything inside size itself with `cqw` units
 * (1cqw = 1% of the frame's width), so slides scale with the frame,
 * not the browser window.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-ink sm:bg-[radial-gradient(circle_at_20%_10%,#5a2cff55,transparent_45%),radial-gradient(circle_at_80%_90%,#ff5b2644,transparent_45%)] sm:p-6">
      <main className="@container relative h-dvh w-full overflow-hidden bg-ink sm:aspect-[9/16] sm:h-[min(860px,calc(100dvh-3rem))] sm:w-auto sm:rounded-[2.25rem] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] sm:ring-1 sm:ring-white/10">
        {children}
      </main>
    </div>
  )
}

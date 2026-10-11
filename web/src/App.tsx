import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { Story } from './components/Story'
import { UploadScreen } from './components/UploadScreen'
import type { Stats } from './lib/types'

export default function App() {
  const [stats, setStats] = useState<Stats | null>(null)
  const restart = useCallback(() => setStats(null), [])

  return (
    // reducedMotion="user": if the OS asks for less motion, every motion
    // component drops its movement (slides, scales, bounces) and just fades.
    <MotionConfig reducedMotion="user">
      <PhoneFrame>
        <AnimatePresence mode="wait">
          <motion.div
            key={stats ? 'story' : 'upload'}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {stats ? <Story stats={stats} onRestart={restart} /> : <UploadScreen onStats={setStats} />}
          </motion.div>
        </AnimatePresence>
      </PhoneFrame>
    </MotionConfig>
  )
}

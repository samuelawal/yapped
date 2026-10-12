/// <reference types="vite/client" />

// Build-time settings (set in .env.local or in Vercel's Environment Variables)
interface ImportMetaEnv {
  readonly VITE_TRACEIQ_PROJECT_ID?: string
  readonly VITE_TRACEIQ_WRITE_KEY?: string
}

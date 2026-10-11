import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

// Link previews on X/WhatsApp need full URLs (https://...), not "/og.png".
// Vercel sets VERCEL_PROJECT_PRODUCTION_URL during builds; set SITE_URL
// yourself to use a custom domain.
function siteUrl(): Plugin {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = process.env.SITE_URL ?? (host ? `https://${host}` : '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
  // The Rust package is linked from ../wrapped/pkg. Vite's pre-bundling would
  // break how it finds its .wasm file, so skip it, and let the dev server
  // read files from the parent folder.
  optimizeDeps: { exclude: ['wrapped'] },
  server: { fs: { allow: ['..'] } },
})

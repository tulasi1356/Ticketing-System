import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Same-origin `/api/...` (and legacy `/attachments/disk/...`) in dev avoids mixed origins and flaky file flows.
const RAILS_TARGET = process.env.VITE_PROXY_API ?? 'http://127.0.0.1:3000'

/** Browser navigations send `Accept: text/html`; XHR/fetch for the API do not — so we can serve the SPA instead of proxying. */
function bypassSpaHtml(
  req: { method?: string; headers: { accept?: string }; url?: string },
  pathnameMatch: (pathname: string) => boolean,
): string | undefined {
  if (req.method !== 'GET') return undefined
  const accept = req.headers.accept ?? ''
  if (!accept.includes('text/html')) return undefined
  const pathname = (req.url ?? '').split('?')[0] ?? ''
  return pathnameMatch(pathname) ? '/index.html' : undefined
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': { target: RAILS_TARGET, changeOrigin: true },
      '/attachments': { target: RAILS_TARGET, changeOrigin: true },
      '/tickets': {
        target: RAILS_TARGET,
        changeOrigin: true,
        bypass(req) {
          return bypassSpaHtml(req, (p) => p === '/tickets' || /^\/tickets\/\d+$/.test(p))
        },
      },
      '/users': {
        target: RAILS_TARGET,
        changeOrigin: true,
        bypass(req) {
          return bypassSpaHtml(req, (p) => p === '/users/all')
        },
      },
      '/projects': {
        target: RAILS_TARGET,
        changeOrigin: true,
        bypass(req) {
          return bypassSpaHtml(req, (p) => p === "/projects/all" || p === "/projects/mine")
        },
      },
    },
  },
})

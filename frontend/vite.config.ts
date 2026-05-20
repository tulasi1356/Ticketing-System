// import tailwindcss from "@tailwindcss/vite"
// import react from "@vitejs/plugin-react"
// import { defineConfig } from "vite"

// // Same-origin `/api/...` in dev so the browser sends httpOnly cookies to the same host as the SPA.
// const RAILS_TARGET = process.env.VITE_PROXY_API ?? "http://127.0.0.1:3000"

// /**
//  * Keep the browser's `Host` (e.g. `localhost:5173`) when proxying to Rails.
//  * `changeOrigin: true` sends `Host: 127.0.0.1:3000`, which can break `Set-Cookie` scoping for
//  * `http://localhost:5173/...` so the session JWT is never stored or sent → 401.
//  */
// const proxyToRails = { target: RAILS_TARGET, changeOrigin: false }

// /** Browser navigations send `Accept: text/html`; fetch for the API does not — serve the SPA instead of proxying. */
// function bypassSpaHtml(
//   req: { method?: string; headers: { accept?: string }; url?: string },
//   pathnameMatch: (pathname: string) => boolean,
// ): string | undefined {
//   if (req.method !== "GET") return undefined
//   const accept = req.headers.accept ?? ""
//   if (!accept.includes("text/html")) return undefined
//   const pathname = (req.url ?? "").split("?")[0] ?? ""
//   return pathnameMatch(pathname) ? "/index.html" : undefined
// }

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     proxy: {
//       "/api": proxyToRails,
//       "/attachments": proxyToRails,
//       "/tickets": {
//         ...proxyToRails,
//         bypass(req) {
//           return bypassSpaHtml(req, (p) => p === "/tickets" || /^\/tickets\/\d+$/.test(p))
//         },
//       },
//       "/users": {
//         ...proxyToRails,
//         bypass(req) {
//           return bypassSpaHtml(req, (p) => p === "/users/all")
//         },
//       },
//       "/projects": {
//         ...proxyToRails,
//         bypass(req) {
//           return bypassSpaHtml(req, (p) => p === "/projects/all" || p === "/projects/mine")
//         },
//       },
//     },
//   },
// })

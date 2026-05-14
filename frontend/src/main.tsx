import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CookiesProvider } from "react-cookie"
import { Toaster } from "sonner"
import "./i18n/config"
import "./index.css"
import { AppRouter } from "./router"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookiesProvider defaultSetOptions={{ path: "/", sameSite: "lax" }}>
      <QueryClientProvider client={queryClient}>
        <AppRouter />
        <Toaster richColors closeButton position="top-center" />
      </QueryClientProvider>
    </CookiesProvider>
  </StrictMode>,
)
    
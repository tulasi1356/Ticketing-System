import { useState } from "react"
import { toast } from "sonner"
import { requestTicketExport, type TicketExportParams } from "../api/ticketApi"

export function useAdminTicketExport() {
  const [busy, setBusy] = useState(false)

  const run = async (params: TicketExportParams) => {
    setBusy(true)
    try {
      const res = await requestTicketExport(params)
      const title = res.message ?? "Export queued."
      const lines = [
        res.jobId ? `Job ID: ${res.jobId} (check Sidekiq / Redis if the email is slow).` : null,
        "The CSV matches this board: same project, sprint/view, and filters as on screen.",
        import.meta.env.DEV
          ? "In dev, Rails often saves mail under tmp/mail (unless SMTP env vars are set)."
          : null,
      ].filter(Boolean) as string[]
      toast.success(title, {
        description: lines.join(" "),
        duration: 12_000,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not queue export")
    } finally {
      setBusy(false)
    }
  }

  return { busy, run }
}

import { apiClient } from "./client"
import type { TicketComment } from "../types/ticketing"

export type CreateCommentBody = {
  ticket_id: number
  message: string
  attachment_urls?: string[]
}

export async function fetchTicketComments(ticketId: number): Promise<TicketComment[]> {
  return apiClient(`/tickets/${ticketId}/comments`) as Promise<TicketComment[]>
}

export async function createComment(body: CreateCommentBody): Promise<TicketComment> {
  return apiClient(`/tickets/${body.ticket_id}/comments`, {
    method: "POST",
    body: JSON.stringify({
      message: body.message,
      attachment_urls: body.attachment_urls ?? [],
    }),
  }) as Promise<TicketComment>
}

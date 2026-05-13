import { useQuery } from "@tanstack/react-query"

import { fetchTicketComments } from "../../api/commentApi"

export function useTicketComments(ticketId: number | null) {
  return useQuery({
    queryKey: ["comments", ticketId],
    queryFn: () => fetchTicketComments(ticketId!),
    enabled: ticketId != null,
  })
}

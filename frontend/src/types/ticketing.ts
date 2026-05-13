/**
 * Ticketing / sprint board domain — mirrors Rails JSON (`snake_case`) for API use.
 * Board list responses normalize pagination `meta` / `stats` in `ticketApi.ts`.
 */

import type { BoardView, TicketIssueType, TicketPriority, TicketStatus } from "../constants/domain-enums"

export type { BoardView }

export interface ProjectUser {
  id: number
  name: string
  email?: string
  role?: string
}

export interface Project {
  id: number
  name: string
  description: string
  users?: ProjectUser[]
}

export interface Sprint {
  id: number
  name: string
  project_id: number
  status?: string
  end_date?: string | null
}

export interface TicketAssignee {
  id: number
  name: string
  email?: string
}

export interface Ticket {
  id: number
  title: string
  sprint_id: number
  project_id?: number
  description?: string | null
  assignee?: TicketAssignee
  status: TicketStatus
  priority: TicketPriority
  issue_type: TicketIssueType
  start_date?: string | null
  end_date?: string | null
  attachment_urls?: string[] | null
}

export interface TicketCommentUser {
  id: number
  name: string
  email?: string
}

export interface TicketComment {
  id: number
  ticket_id: number
  user_id: number
  message?: string | null
  attachment_urls?: string[] | null
  created_at: string
  user?: TicketCommentUser | null
}


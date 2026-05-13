/**
 * Domain string unions and labels — single source for Zod `z.enum(...)`, selects, and filters.
 */

export const TICKET_STATUSES = ["todo", "in_progress", "test", "done"] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_ISSUE_TYPES = ["bug", "feature", "task"] as const
export type TicketIssueType = (typeof TICKET_ISSUE_TYPES)[number]

export const TICKET_PRIORITIES = ["low", "medium", "high"] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

/** Priority filter chips: high → low (matches common triage ordering). */
export const TICKET_PRIORITIES_HIGH_FIRST = ["high", "medium", "low"] as const satisfies readonly TicketPriority[]

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  todo: "Todo",
  in_progress: "In progress",
  test: "Test",
  done: "Done",
}

export const TICKET_ISSUE_TYPE_LABELS: Record<TicketIssueType, string> = {
  bug: "Bug",
  feature: "Feature",
  task: "Task",
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

export const TICKET_STATUS_SELECT_OPTIONS = TICKET_STATUSES.map((value) => ({
  value,
  label: TICKET_STATUS_LABELS[value],
}))

export const TICKET_PRIORITY_SELECT_OPTIONS = TICKET_PRIORITIES.map((value) => ({
  value,
  label: TICKET_PRIORITY_LABELS[value],
}))

export const TICKET_ISSUE_TYPE_SELECT_OPTIONS = TICKET_ISSUE_TYPES.map((value) => ({
  value,
  label: TICKET_ISSUE_TYPE_LABELS[value],
}))

export const BOARD_VIEWS = ["sprint", "all", "mine", "backlog"] as const
export type BoardView = (typeof BOARD_VIEWS)[number]

export const USER_ROLES = ["normal", "admin"] as const
export type UserRole = (typeof USER_ROLES)[number]

export function issueTypeDisplayLabel(issueType: string): string {
  if (TICKET_ISSUE_TYPES.includes(issueType as TicketIssueType)) {
    return TICKET_ISSUE_TYPE_LABELS[issueType as TicketIssueType]
  }
  return issueType
}

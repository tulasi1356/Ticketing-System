import { z } from "zod"
import {
  TICKET_ISSUE_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../constants/domain-enums"

export const ticketFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  projectId: z.number().min(1, "Project ID is required"),
  sprintId: z.number().min(1, "Sprint ID is required"),
  assigneeId: z.number().min(1, "Assignee is required"),
  issueType: z.enum(TICKET_ISSUE_TYPES),
  priority: z.enum(TICKET_PRIORITIES),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(TICKET_STATUSES),
  comments: z.array(
    z.object({
      content: z.string().min(1, "Comment is required"),
      userId: z.number().min(1, "User ID is required"),
    }),
  ),
  attachments: z.array(
    z.object({
      url: z.string().min(1, "Attachment URL is required"),
      userId: z.number().min(1, "User ID is required"),
    }),
  ),
})

export type TicketForm = z.infer<typeof ticketFormSchema>

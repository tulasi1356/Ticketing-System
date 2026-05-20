import { z } from "zod"

export const sprintFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.date(),
  endDate: z.date(),
  projectId: z.number().min(1, "Project ID is required"),
})

export type SprintFormValues = z.infer<typeof sprintFormSchema>

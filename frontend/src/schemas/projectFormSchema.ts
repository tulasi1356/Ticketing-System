import { z } from "zod"

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  user_ids: z.array(z.number()).optional(),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>

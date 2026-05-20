import { z } from "zod"
import { USER_ROLES } from "../constants/domain-enums"

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.email(),
  role: z.enum(USER_ROLES),
})

export type User = z.infer<typeof userSchema>

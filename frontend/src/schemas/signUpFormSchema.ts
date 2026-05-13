import type { TFunction } from "i18next"
import { z } from "zod"
import { createLoginSchema } from "./loginFormSchema"

export function createSignUpSchema(t: TFunction) {
  return createLoginSchema(t).extend({
    name: z.string().min(1, t("auth.signUp.validation.nameRequired")),
  })
}

export type SignUpFormValues = z.infer<ReturnType<typeof createSignUpSchema>>

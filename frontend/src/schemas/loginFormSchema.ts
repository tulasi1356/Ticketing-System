import type { TFunction } from "i18next"
import { z } from "zod"

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z
      .email(t("auth.validation.emailInvalid"))
      .min(1, t("auth.validation.emailRequired")),
    password: z.string().min(8, t("auth.validation.passwordMin")),
  })
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>

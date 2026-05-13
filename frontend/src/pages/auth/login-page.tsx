import { useMemo } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { FormProvider, useForm, useFormContext } from "react-hook-form"
import { FormInput } from "../../components/form/formInput"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "../../components/ui/button"
import { findUserByEmail } from "../../api/userApi"
import { useAuthStore } from "../../stores/authStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  createLoginSchema,
  type LoginFormValues,
} from "../../schemas/loginFormSchema"

function LoginFields() {
  const { t } = useTranslation()
  const { control } = useFormContext<LoginFormValues>()

  return (
    <>
      <FormInput
        name="email"
        control={control}
        label={t("auth.email")}
        placeholder={t("auth.emailPlaceholder")}
        size="lg"
      />
      <FormInput
        type="password"
        name="password"
        control={control}
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholder")}
        size="lg"
      />
    </>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const loginSchema = useMemo(() => createLoginSchema(t), [t])
  const setUser = useAuthStore((s) => s.setUser)

  const loginForm = useForm<LoginFormValues>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const navigate = useNavigate()
  const { isValid, isSubmitting } = loginForm.formState

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const user = await findUserByEmail(data.email)
      if (!user) {
        toast.error(t("auth.login.noAccount"))
        return
      }
      setUser(user)
      navigate({ to: "/tickets" })
    } catch (e) {
      console.error("Login error:", e)
      toast.error(t("auth.login.genericError"))
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <LoginFields />
              <Button
                id="login-button"
                aria-label={t("auth.login.submit")}
                size="lg"
                variant="primary"
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-sm text-gray-600">
            {t("auth.login.newHere")}{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              {t("auth.login.createAccount")}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form"
import { useCreateUser } from "../../hooks/users/useCreateUser"
import { Button } from "../../components/ui/button"
import { FormInput } from "../../components/form/formInput"
import { useAuthStore } from "../../stores/authStore"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { createSignUpSchema, type SignUpFormValues } from "../../schemas/signUpFormSchema"

function SignUpFields() {
  const { t } = useTranslation()
  const signUpForm = useFormContext<SignUpFormValues>()

  return (
    <>
      <FormInput
        name="name"
        control={signUpForm.control}
        label={t("auth.name")}
        placeholder={t("auth.namePlaceholder")}
        size="lg"
      />
      <FormInput
        name="email"
        control={signUpForm.control}
        label={t("auth.email")}
        placeholder={t("auth.emailPlaceholder")}
        size="lg"
      />
      <FormInput
        type="password"
        name="password"
        control={signUpForm.control}
        label={t("auth.password")}
        placeholder={t("auth.passwordPlaceholder")}
        size="lg"
      />
    </>
  )
}

export default function SignUpPage() {
  const { t } = useTranslation()
  const signUpSchema = useMemo(() => createSignUpSchema(t), [t])
  const { mutateAsync: createUser } = useCreateUser()
  const setUser = useAuthStore((s) => s.setUser)
  const navigate = useNavigate()

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      const newUser = await createUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setUser(newUser)
      navigate({ to: "/tickets" })
    } catch (error) {
      console.error("Error signing up:", error)
      toast.error(t("auth.signUp.genericError"))
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.signUp.title")}</CardTitle>
          <CardDescription>{t("auth.signUp.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...signUpForm}>
            <form
              onSubmit={signUpForm.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
              noValidate
            >
              <SignUpFields />
              <SignUpButton />
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-sm text-gray-600">
            {t("auth.signUp.hasAccount")}{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              {t("auth.signUp.loginLink")}
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}

function SignUpButton() {
  const { t } = useTranslation()
  const signUpForm = useFormContext<SignUpFormValues>()
  const { isSubmitting } = useFormState({ control: signUpForm.control })

  return (
    <Button
      id="sign-up-button"
      aria-label={t("auth.signUp.submit")}
      size="lg"
      variant="primary"
      type="submit"
    >
      {isSubmitting ? t("auth.signUp.submitting") : t("auth.signUp.submit")}
    </Button>
  )
}

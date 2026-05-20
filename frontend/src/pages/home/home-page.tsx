import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { useAuthStore } from "../../stores/authStore"
import { FolderKanban, TicketIcon, UsersIcon } from "lucide-react"

export default function HomePage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === "admin"

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-xs text-gray-500">{t("home.label")}</p>
          <h1 className="text-lg font-semibold text-gray-900">{t("home.title")}</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-6">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>{t("home.signInRequiredTitle")}</CardTitle>
              <CardDescription>{t("home.signInRequiredDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {t("home.logIn")}
              </Link>
              <Link
                to="/signup"
                className="inline-flex rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                {t("home.signUp")}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs text-gray-500">{t("home.label")}</p>
          <h1 className="text-lg font-semibold text-gray-900">{t("home.title")}</h1>
          <p className="mt-0.5 text-sm text-gray-600">{t("home.welcomeBack", { name: user.name })}</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                {t("home.quickLinksTitle")}
              </CardTitle>
              <CardDescription>
                {t("home.quickLinksDescription")}
                {isAdmin ? t("home.quickLinksDescriptionAdmin") : "."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <li>
                  <Link
                    to="/tickets"
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <TicketIcon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-medium text-gray-900">{t("home.allTicketsTitle")}</span>
                      <span className="text-sm text-gray-600">{t("home.allTicketsSubtitle")}</span>
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={isAdmin ? "/projects/all" : "/projects/mine"}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <FolderKanban className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-medium text-gray-900">
                        {isAdmin ? t("home.projectsTitle") : t("home.myProjectsTitle")}
                      </span>
                      <span className="text-sm text-gray-600">{t("home.projectsSubtitle")}</span>
                    </span>
                  </Link>
                </li>
                {isAdmin ? (
                  <li>
                    <Link
                      to="/users/all"
                      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                        <UsersIcon className="size-5" aria-hidden />
                      </span>
                      <span>
                        <span className="block font-medium text-gray-900">{t("home.usersTitle")}</span>
                        <span className="text-sm text-gray-600">{t("home.usersSubtitle")}</span>
                      </span>
                    </Link>
                  </li>
                ) : null}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

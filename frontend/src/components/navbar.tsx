import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useAuthStore } from "../stores/authStore"
import { LogOutIcon, TicketIcon } from "lucide-react"
import { Tooltip } from "./ui/tooltip"
import { AssigneeAvatar } from "./ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"


export function Navbar() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logOut)

  return (
    <header className="border-b bg-white">
      <div className=" flex items-center justify-between gap-4 p-4">
        <Link to="/" className="font-semibold tracking-tight">
          <div className="flex items-center gap-2">
            <TicketIcon className="size-6 text-blue-500" />
            <span className="text-xl font-bold">{t("app.name")}</span>
          </div>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-3 text-sm">
              {user.role === "admin" ? (
                <>
                  <Link id = "users-link" aria-label={t("nav.usersAria")} to="/users/all" className="hover:underline">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t("nav.users")}</span>
                    </div>
                  </Link>
                  <Link to="/projects/all" id = "projects-link" aria-label={t("nav.projectsAria")} className="hover:underline">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{t("nav.projects")}</span>
                    </div>
                  </Link>
                  <Link to="/tickets" id = "all-tickets-link" aria-label={t("nav.allTicketsAria")} className="hover:underline">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{t("nav.allTickets")}</span>
                    </div>
                  </Link>
                </>
              ) : (
                <Link  to="/projects/mine" id = "my-projects-link" aria-label={t("nav.myProjectsAria")} className="hover:underline">
                  {t("nav.myProjects")}
                </Link>
              )}
            </nav>

            <div className="hidden items-center gap-2 sm:flex">
              {user.role === "admin" ? (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {t("nav.admin")}
                    </span>
                  ) : null}
              <Tooltip content={user.name}>
                <div className="flex items-center gap-1 cursor-pointer"> 
                  <Popover >
                    <PopoverTrigger>
                      <AssigneeAvatar name={user.name} size="sm" />
                    </PopoverTrigger>
                    <PopoverContent>
                    <button
                      id = "logout-button"
                      aria-label={t("nav.logoutAria")}
                      onClick={logout}
                      className="text-sm flex items-center gap-1"
                    >
                      <LogOutIcon className="size-4" />
                      <span className="text-sm">{t("nav.logout")}</span>
                    </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </Tooltip>
            </div>

          
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link to="/login" className="rounded-md px-3 py-1.5 hover:bg-gray-50">
              {t("nav.login")}
            </Link>
            <Link
              to="/signup"
              className="rounded-md border px-3 py-1.5 hover:bg-gray-50"
            >
              {t("nav.signup")}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
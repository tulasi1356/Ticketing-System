import { useState } from "react"
import { Button } from "../../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { useProjects } from "../../hooks/projects/useProjects"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { useAuthStore } from "../../stores/authStore"
import { useAssignUsersToProject } from "../../hooks/projects/useAssignUsersToProject"
import { useUsers } from "../../hooks/users/useUsers"
import { Input } from "../../components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { UserMultiSelect } from "../../components/UserMultiSelect"
import { DeleteIcon, Eye } from "lucide-react"
import { useDeleteProject } from "../../hooks/projects/useDeleteProject"
import { router } from "../../router"
import { toast } from "sonner"

import { CreateOrEditProjectPopover } from "./create-or-edit-project-popover"
import type { ProjectListItem, ProjectListUser } from "../../types/projects"

/**
 * `/projects/all` — project directory (admin: CRUD + assign; others: view + open board).
 */
export default function ProjectsListPage() {
  const [assignUsersProjectId, setAssignUsersProjectId] = useState<number | null>(null)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === "admin"
  const { data, error, isLoading } = useProjects()

  const { data: users, error: erroruser, isLoading: isuserdataLoading } = useUsers()

  const { mutateAsync: assignUsersToProject, isPending: isAssigning } = useAssignUsersToProject()

  const [assignSelectedUserIds, setAssignSelectedUserIds] = useState<number[]>([])

  const { mutateAsync: deleteProject } = useDeleteProject()

  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProject(id)
      toast.success("Project deleted")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong"
      toast.error(message)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-6">
          <Card className="w-full max-w-xl">
            <CardHeader>
              <CardTitle>Sign in required</CardTitle>
              <CardDescription>You must be logged in to view this page.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading || (isAdmin && isuserdataLoading)) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-6 text-sm text-gray-500">
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    console.error("Error fetching projects:", error)
    return (
      <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load projects.
          </div>
        </div>
      </div>
    )
  }

  if (isAdmin && erroruser) {
    console.error("Error fetching users:", erroruser)
    return (
      <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
        <header className="border-b border-gray-200 bg-white px-6 py-4">
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load users.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
          <p className="mt-0.5 text-sm text-gray-600">
            {isAdmin ? "Create projects and manage team access." : "View your projects."}
          </p>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2">
            <CreateOrEditProjectPopover isEdit={false} onClose={() => {}} />
          </div>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Card className="overflow-visible">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                {isAdmin ? "All projects" : "My projects"}
              </CardTitle>
              <CardDescription>
                {isAdmin ? "View existing projects and assign users." : "Projects you have access to."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {data && data.length > 0 ? (
                <Table size="sm">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Description
                      </TableHead>
                      {isAdmin ? (
                        <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Assign users
                        </TableHead>
                      ) : null}
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((project: ProjectListItem) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell className="text-gray-700">{project.description}</TableCell>
                        {isAdmin ? (
                          <TableCell>
                            <Popover
                              open={assignUsersProjectId === project.id}
                              onOpenChange={(nextOpen) => {
                                if (!nextOpen) {
                                  setAssignUsersProjectId(null)
                                  setAssignSelectedUserIds([])
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <button
                                  id="assign-users-button"
                                  aria-label="Assign users"
                                  type="button"
                                  className="w-full"
                                  onClick={() => {
                                    setAssignUsersProjectId(project.id)
                                    setAssignSelectedUserIds((project.users ?? []).map((u) => u.id))
                                  }}
                                >
                                  <Input
                                    readOnly
                                    size="sm"
                                    type="text"
                                    placeholder="Assign users..."
                                    className="rounded-lg border-gray-200 bg-gray-50 text-sm focus:bg-white"
                                    value={
                                      assignUsersProjectId === project.id
                                        ? assignSelectedUserIds.length
                                          ? `${assignSelectedUserIds.length} selected`
                                          : ""
                                        : (project.users ?? []).length
                                          ? `${(project.users ?? []).length} assigned`
                                          : ""
                                    }
                                  />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent size="lg" align="start">
                                <div className="flex flex-col gap-3">
                                  <div className="text-sm font-medium text-gray-900">Assign users</div>
                                  <UserMultiSelect
                                    value={assignSelectedUserIds}
                                    onChange={setAssignSelectedUserIds}
                                    browseWhenEmpty={(users ?? []) as ProjectListUser[]}
                                    resolveUsers={(users ?? []) as ProjectListUser[]}
                                    placeholder="Search users..."
                                  />
                                  <div className="flex justify-end gap-2 pt-1">
                                    <Button
                                      id="cancel-assign-users-button"
                                      aria-label="Cancel assign users"
                                      type="button"
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => setAssignUsersProjectId(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      id="save-assign-users-button"
                                      aria-label="Save assign users"
                                      type="button"
                                      size="sm"
                                      disabled={isAssigning}
                                      onClick={async () => {
                                        try {
                                          await assignUsersToProject({
                                            id: project.id,
                                            user_ids: assignSelectedUserIds,
                                          })
                                          setAssignUsersProjectId(null)
                                          setAssignSelectedUserIds([])
                                        } catch (e) {
                                          console.error("Assign users failed:", e)
                                        }
                                      }}
                                    >
                                      {isAssigning ? "Saving..." : "Save"}
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                        ) : null}
                        <TableCell>
                          {isAdmin ? (
                            <div className="flex items-center gap-2">
                              <CreateOrEditProjectPopover
                                isEdit
                                projectId={project.id}
                                onClose={() => setAssignUsersProjectId(null)}
                              />
                              <button
                                type="button"
                                id="delete-project-button"
                                aria-label="Delete project"
                                onClick={() => handleDeleteProject(project.id)}
                              >
                                <DeleteIcon
                                  className="size-4 cursor-pointer text-gray-500 hover:text-gray-800"
                                  aria-hidden
                                />
                              </button>
                            </div>
                          ) : (
                            <Button
                              id="view-board-button"
                              aria-label="View board"
                              variant="secondary"
                              size="sm"
                              className="gap-1.5 border border-gray-200 bg-white text-gray-700 shadow-none hover:bg-gray-50"
                              onClick={() =>
                                router.navigate({
                                  to: "/tickets",
                                  search: { projectId: project.id },
                                })
                              }
                            >
                              <Eye className="size-4" />
                              View board
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center text-sm text-gray-500">
                  No projects found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

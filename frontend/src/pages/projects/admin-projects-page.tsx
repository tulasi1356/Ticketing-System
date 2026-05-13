import { useEffect, useState } from "react"
import { DeleteIcon, Loader2 } from "lucide-react"
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
import { UserMultiSelect } from "../../components/user-multi-select"
import { useDeleteProject } from "../../hooks/projects/useDeleteProject"
import { toast } from "sonner"

import { CreateOrEditProjectPopover } from "./create-or-edit-project-popover"
import type { ProjectListItem, ProjectListUser } from "../../types/projects"

/** `/projects/all` — admin-only (see router `beforeLoad`). */
export default function AdminProjectsPage() {
  const [assignUsersProjectId, setAssignUsersProjectId] = useState<number | null>(null)
  const { data, error, isLoading } = useProjects()
  const { data: users, error: usersError, isLoading: usersLoading } = useUsers()
  const { mutateAsync: assignUsersToProject, isPending: isAssigning } = useAssignUsersToProject()
  const [assignSelectedUserIds, setAssignSelectedUserIds] = useState<number[]>([])
  const { mutateAsync: deleteProject } = useDeleteProject()

  const listLoading = isLoading || usersLoading

  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProject(id)
      toast.success("Project deleted")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong"
      toast.error(message)
    }
  }

  useEffect(() => {
    if (!error) return
    console.error("Error fetching projects:", error)
    toast.error(error instanceof Error ? error.message : "Could not load projects.")
  }, [error])

  useEffect(() => {
    if (!usersError) return
    console.error("Error fetching users:", usersError)
    toast.error(usersError instanceof Error ? usersError.message : "Could not load users.")
  }, [usersError])

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
          <p className="mt-0.5 text-sm text-gray-600">Create projects and manage team access.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CreateOrEditProjectPopover isEdit={false} onClose={() => {}} />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Card className="overflow-visible">
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">All projects</CardTitle>
              <CardDescription>View existing projects and assign users.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {listLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-gray-400" aria-hidden />
                  <span className="sr-only">Loading projects</span>
                </div>
              ) : error ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center text-sm text-gray-500">
                  Unable to load projects.
                </div>
              ) : data && data.length > 0 ? (
                <Table size="sm">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Description
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Assign users
                      </TableHead>
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
                                type="button"
                                aria-label="Assign users"
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
                                    aria-label="Cancel assign users"
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => setAssignUsersProjectId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreateOrEditProjectPopover
                              isEdit
                              projectId={project.id}
                              onClose={() => setAssignUsersProjectId(null)}
                            />
                            <button
                              type="button"
                              aria-label="Delete project"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <DeleteIcon
                                className="size-4 cursor-pointer text-gray-500 hover:text-gray-800"
                                aria-hidden
                              />
                            </button>
                          </div>
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

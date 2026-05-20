import { useEffect } from "react"
import { Eye, Loader2 } from "lucide-react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { router } from "../../router"
import { toast } from "sonner"
import type { ProjectListItem } from "../../types/projects"

/** `/projects/mine` — projects the signed-in user can access (non-admin). */
export default function MyProjectsPage() {
  const { data, error, isLoading } = useProjects()

  useEffect(() => {
    if (!error) return
    console.error("Error fetching projects:", error)
    toast.error(error instanceof Error ? error.message : "Could not load projects.")
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs text-gray-500">Projects</p>
          <h1 className="text-lg font-semibold text-gray-900">My projects</h1>
          <p className="mt-0.5 text-sm text-gray-600">Projects you have access to.</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">My projects</CardTitle>
              <CardDescription>Open a board from a project you belong to.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
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
                          <Button
                            aria-label="View board"
                            variant="secondary"
                            size="sm"
                            className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 shadow-none hover:bg-gray-50"
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

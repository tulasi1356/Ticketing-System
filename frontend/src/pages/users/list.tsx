import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { useUsers } from "../../hooks/users/useUsers"

/** `/users/all` — admin user directory (route `beforeLoad` enforces admin). */
export default function UsersListPage() {
  const { data, error, isLoading } = useUsers()

  useEffect(() => {
    if (!error) return
    console.error("Error fetching users:", error)
    toast.error(error instanceof Error ? error.message : "Could not load users.")
  }, [error])

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full flex-col bg-gray-50/80">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-gray-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs text-gray-500">Users</p>
          <h1 className="text-lg font-semibold text-gray-900">Users</h1>
          <p className="mt-0.5 text-sm text-gray-600">
            View everyone in the organization and their roles.
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <Card>
            <CardHeader className="border-b border-gray-100 pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">All users</CardTitle>
              <CardDescription>Names, emails, and permission levels.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <Loader2
                    className="size-8 animate-spin text-gray-400"
                    aria-hidden
                  />
                  <span className="sr-only">Loading users</span>
                </div>
              ) : error ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center text-sm text-gray-500">
                  Unable to load users.
                </div>
              ) : data && data.length > 0 ? (
                <Table size="sm">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Name
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Email
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Role
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-gray-700">{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "admin" ? "warning" : "secondary"}
                            size="xs"
                          >
                            {u.role === "normal" ? "Employee" : "Admin"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 text-center text-sm text-gray-500">
                  No users found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

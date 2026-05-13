import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormProvider, useForm } from "react-hook-form"
import { EditIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "../../components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { ProjectFormFields } from "./project-form-fields"
import { UserMultiSelect } from "../../components/UserMultiSelect"
import { useAssignUsersToProject } from "../../hooks/projects/useAssignUsersToProject"
import { useCreateProject } from "../../hooks/projects/useCreateProject"
import { useEditProject } from "../../hooks/projects/useEditProject"
import { useGetProject } from "../../hooks/projects/useGetProject"
import { useUsers } from "../../hooks/users/useUsers"
import { projectFormSchema, type ProjectFormValues } from "../../schemas/projectFormSchema"
import { useAuthStore } from "../../stores/authStore"

import type { ProjectListUser } from "../../types/projects"

export type CreateOrEditProjectPopoverProps = {
  isEdit?: boolean
  projectId?: number
  onClose: () => void
}

export function CreateOrEditProjectPopover({
  isEdit = false,
  projectId,
  onClose,
}: CreateOrEditProjectPopoverProps) {
  const [open, setOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === "admin"
  const methods = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      user_ids: [],
    },
  })
  const { data: users } = useUsers()
  const { mutateAsync: createProject } = useCreateProject()
  const { mutateAsync: editProject } = useEditProject()
  const { mutateAsync: assignUsersMutation } = useAssignUsersToProject()
  const { data: project } = useGetProject(projectId ?? 0)
  const [createSelectedUserIds, setCreateSelectedUserIds] = useState<number[]>([])

  useEffect(() => {
    if (!isEdit || !open) return
    if (!project) return

    const selectedIds = (project.users ?? []).map((u: ProjectListUser) => u.id)
    methods.reset({
      name: project.name ?? "",
      description: project.description ?? "",
      user_ids: selectedIds,
    })
    setCreateSelectedUserIds(selectedIds)
  }, [isEdit, open, project, methods])

  useEffect(() => {
    if (isEdit) return
    if (!open) return
    methods.reset({ name: "", description: "", user_ids: [] })
    setCreateSelectedUserIds([])
  }, [isEdit, open, methods])

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      const created = await createProject(data)
      const pid = Number(created.id)
      if (createSelectedUserIds.length && Number.isFinite(pid)) {
        await assignUsersMutation({
          id: pid,
          user_ids: createSelectedUserIds.map(Number),
        })
      }
      methods.reset()
      setCreateSelectedUserIds([])
      setOpen(false)
      toast.success("Project created")
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong"
      toast.error(message)
    }
  }

  const handleEditSubmit = async (data: ProjectFormValues) => {
    try {
      if (projectId == null || projectId <= 0) {
        toast.error("Missing project id")
        return
      }
      const updated = await editProject({
        id: projectId,
        name: data.name,
        description: data.description,
      })
      const pid = Number(updated.id ?? projectId)
      if (createSelectedUserIds.length && Number.isFinite(pid)) {
        await assignUsersMutation({
          id: pid,
          user_ids: createSelectedUserIds.map(Number),
        })
      }
      methods.reset()
      setCreateSelectedUserIds([])
      setOpen(false)
      onClose()
    } catch (e) {
      console.error("Error editing project:", e)
    }
  }

  if (!isAdmin) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {isEdit ? (
          <button
            type="button"
            id="edit-project-button"
            aria-label="Edit project"
            onClick={() => setOpen(true)}
          >
            <EditIcon className="size-4 cursor-pointer" aria-hidden />
          </button>
        ) : (
          <Button
            id="create-project-button"
            aria-label="Create project"
            size="md"
            variant="primary"
            onClick={() => setOpen(true)}
          >
            Create Project
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        size="lg"
        align="end"
        side={isEdit ? "top" : "bottom"}
        collisionPadding={24}
        className="flex max-h-[min(560px,calc(100dvh-2rem))] flex-col gap-0 overflow-hidden p-0"
      >
        <FormProvider {...methods}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={
              isEdit
                ? methods.handleSubmit(handleEditSubmit)
                : methods.handleSubmit(handleSubmit)
            }
          >
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-3">
              <ProjectFormFields />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Assign users (optional)</span>
                <UserMultiSelect
                  value={createSelectedUserIds}
                  onChange={setCreateSelectedUserIds}
                  browseWhenEmpty={(users ?? []) as ProjectListUser[]}
                  resolveUsers={(users ?? []) as ProjectListUser[]}
                  placeholder="Search and select users..."
                />
              </div>
            </div>
            <div className="shrink-0 border-t border-gray-100 bg-white p-4 pt-3">
              <Button
                id="submit-project-button"
                className="w-full"
                aria-label={isEdit ? "Edit Project" : "Create Project"}
                type="submit"
              >
                {isEdit ? "Edit Project" : "Create Project"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </PopoverContent>
    </Popover>
  )
}

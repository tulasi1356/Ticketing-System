import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteProject } from "../../api/projectApi"

export const useDeleteProject = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: number) => deleteProject(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ["projects"] })
            queryClient.removeQueries({ queryKey: ["project", id] })
        },
    })
}
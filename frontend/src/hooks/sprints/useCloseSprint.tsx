import { useMutation } from "@tanstack/react-query"
import { useQueryClient } from "@tanstack/react-query"
import { closeSprint } from "../../api/sprintApi"


export const useCloseSprint = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: closeSprint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sprints", "board"] })
        }
    })
}
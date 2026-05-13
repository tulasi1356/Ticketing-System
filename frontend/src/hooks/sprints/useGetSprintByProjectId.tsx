import { useQuery } from "@tanstack/react-query"
import { getSprintByProjectId } from "../../api/sprintApi"

export const useGetSprintByProjectId = (projectId: number) => {    
    return useQuery({
        queryKey: ["sprints", projectId],
        queryFn: () => getSprintByProjectId(projectId),
        enabled: !!projectId,
    })
}
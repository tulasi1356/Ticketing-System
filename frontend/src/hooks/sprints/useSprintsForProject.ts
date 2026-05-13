import { useQuery } from "@tanstack/react-query"
import { getSprints } from "../../api/sprintApi"

export function useSprintsForProject(projectId: number) {
  return useQuery({
    queryKey: ["sprints", projectId],
    queryFn: () => getSprints({ projectId }),
    enabled: !!projectId,
  })
}

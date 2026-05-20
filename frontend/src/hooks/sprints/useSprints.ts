import { useQuery } from "@tanstack/react-query"
import { getSprints } from "../../api/sprintApi"

/** All sprints (directory query). */
export function useSprints() {
  return useQuery({
    queryKey: ["sprints"],
    queryFn: () => getSprints(),
  })
}

import { useQuery } from "@tanstack/react-query"
import { getProjects } from "../../api/projectApi"

export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: getProjects,
    })
}
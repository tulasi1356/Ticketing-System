import { apiClient } from "./client"

export const createSprint = (data: unknown) =>
  apiClient("/sprints", {
    method: "POST",
    body: JSON.stringify(data),
  })

export const getSprints = (params?: { projectId?: number }) => {
  const search =
    params?.projectId != null && params.projectId > 0
      ? `?project_id=${params.projectId}`
      : ""
  return apiClient(`/sprints${search}`, {
    method: "GET",
  })
}

export const closeSprint = (sprintId: number) =>
  apiClient(`/sprints/${sprintId}/close`, {
    method: "POST",
  })

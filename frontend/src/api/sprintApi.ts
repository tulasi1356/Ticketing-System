import { apiClient } from "./client"

export const createSprint = (data: any) => apiClient("/sprints", {
    method: "POST",
    body: JSON.stringify(data),
})

export const getSprints = () => apiClient("/sprints", {
    method: "GET",
})

export const getSprintByProjectId = (projectId: number) => apiClient(`/sprints/get_sprint_by_project_id?project_id=${projectId}`, {
    method: "GET",
})

export const closeSprint = (sprintId: number) => apiClient(`/sprints/close/${sprintId}`, {
    method: "POST",
})
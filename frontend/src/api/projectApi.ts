import { apiClient } from "./client";

export const getProjects = () => apiClient("/projects")

export const createProject =  (data: any) => apiClient("/projects", {
    method: "POST",
    body: JSON.stringify(data),
})

export const assignUsersToProject = (data: { id: number; user_ids: number[] }) =>
  apiClient(`/projects/${data.id}/assign_users_to_project`, {
    method: "POST",
    body: JSON.stringify({ user_ids: data.user_ids }),
  })

export const editProject = (data: { id: number; name: string; description: string }) =>
  apiClient(`/projects/${data.id}`, {
    method: "PUT",
    body: JSON.stringify({ name: data.name, description: data.description }),
  })

export const getProject = (id: number) => apiClient(`/projects/${id}`)

export const deleteProject = (id: number) =>
  apiClient(`/projects/${id}`, {
    method: "DELETE",
  })
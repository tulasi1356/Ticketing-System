import { apiClient } from "./client"
import type { User } from "../types/user"

export type AuthResponse = { user: User; token: string }

export const getUsers = (): Promise<User[]> => apiClient("/users")

export const searchUsers = (
  query: string,
  opts?: { projectId?: number | null }
): Promise<User[]> => {
  const params = new URLSearchParams({ query })
  const pid = opts?.projectId
  if (pid != null && Number.isFinite(pid)) {
    params.set("project_id", String(pid))
  }
  return apiClient(`/users/search?${params.toString()}`, {
    method: "GET",
  })
}

export const createUser = (data: { name: string; email: string; password: string }) =>
  apiClient<AuthResponse>("/users", {
    method: "POST",
    body: JSON.stringify(data),
  })

export const loginWithCredentials = (data: { email: string; password: string }) =>
  apiClient<AuthResponse>("/sessions", {
    method: "POST",
    body: JSON.stringify(data),
  })
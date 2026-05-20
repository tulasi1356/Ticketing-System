/** Project list row / assign-users UI (projects directory page). */

export interface ProjectListUser {
  id: number
  name: string
  email?: string
}

export interface ProjectListItem {
  id: number
  name: string
  description: string
  users?: ProjectListUser[]
}

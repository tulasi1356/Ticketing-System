import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useParams, useRouterState } from "@tanstack/react-router"

import { useProjects } from "../../hooks/projects/useProjects"
import { useSprints } from "../../hooks/sprints/useSprints"
import { useAuthStore } from "../../stores/authStore"

import { SprintDashboardPanel } from "./sprint-dashboard-panel"
import { BoardSidebar } from "./board-sidebar"
import type { BoardView, Project, Sprint } from "../../types/ticketing"

export function SprintBoardPage() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const { data, error, isLoading } = useProjects()
  const { data: sprints, error: errorSprints, isLoading: isLoadingSprints } = useSprints()

  const searchProjectId = useRouterState({
    select: (s) => {
      const raw = (s.location.search as Record<string, unknown> | undefined)?.projectId
      const n = typeof raw === "string" ? Number(raw) : typeof raw === "number" ? raw : NaN
      return Number.isFinite(n) ? n : null
    },
  })

  const params = useParams({ strict: false }) as { ticketId?: string }
  const urlTicketId =
    params.ticketId && /^\d+$/.test(params.ticketId)
      ? Number.parseInt(params.ticketId, 10)
      : null

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null)
  const [boardView, setBoardView] = useState<BoardView>("sprint")

  useEffect(() => {
    if (!data?.length) return

    // If we were navigated here from Projects "View", honor that selection.
    if (
      searchProjectId != null &&
      data.some((p: Project) => p.id === searchProjectId) &&
      selectedProjectId !== searchProjectId
    ) {
      setSelectedProjectId(searchProjectId)
      return
    }

    // Otherwise default to first project once.
    if (selectedProjectId === null) setSelectedProjectId(data[0].id)
  }, [data, selectedProjectId, searchProjectId])

  const sprintsForProject = useMemo(() => {
    if (selectedProjectId == null) return []
    return (sprints ?? []).filter((s: Sprint) => s.project_id === selectedProjectId)
  }, [sprints, selectedProjectId])

  /** Resolves immediately on project change; avoids fetching with a stale sprint from the previous project (backend 404). */
  const effectiveSprintId = useMemo(() => {
    if (selectedProjectId == null) return null
    if (!sprintsForProject.length) return null
    if (
      selectedSprintId != null &&
      sprintsForProject.some((s: Sprint) => s.id === selectedSprintId)
    ) {
      return selectedSprintId
    }
    return sprintsForProject[0].id
  }, [selectedProjectId, selectedSprintId, sprintsForProject])

  useEffect(() => {
    if (!selectedProjectId) return
    if (!sprintsForProject.length) {
      setSelectedSprintId(null)
      return
    }
    setSelectedSprintId((prev) => {
      if (prev != null && sprintsForProject.some((s: Sprint) => s.id === prev)) return prev
      return sprintsForProject[0].id
    })
  }, [selectedProjectId, sprintsForProject])

  const selectedProject = data?.find((p: Project) => p.id === selectedProjectId)
  const selectedSprint = sprintsForProject.find((s: Sprint) => s.id === effectiveSprintId)

  const resetFiltersKey = `${boardView}-${selectedProjectId ?? ""}-${effectiveSprintId ?? ""}`

  if (!user) {
    return (
      <div className="p-6 text-muted-foreground">
        {t("ticketing.mustLogin")}
      </div>
    )
  }

  if (isLoading || isLoadingSprints) {
    return (
      <div className="flex min-h-[240px] items-center justify-center text-gray-500">
        {t("ticketing.loading")}
      </div>
    )
  }

  if (error || errorSprints) {
    console.error("Error fetching projects:", error)
    console.error("Error fetching sprints:", errorSprints)
    return (
      <div className="p-6 text-red-600">{t("ticketing.loadError")}</div>
    )
  }

  if (!data?.length) {
    return (
      <div className="p-6 text-muted-foreground">
        {t("ticketing.noProjects")}
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] w-full max-w-full bg-gray-50">
      <BoardSidebar
        projects={data}
        sprints={sprints ?? []}
        selectedProjectId={selectedProjectId}
        selectedSprintId={effectiveSprintId}
        onSelectProject={setSelectedProjectId}
        onSelectSprint={setSelectedSprintId}
        onSprintCreated={setSelectedSprintId}
        boardView={boardView}
        onBoardViewChange={setBoardView}
      />

      <SprintDashboardPanel
        selectedProject={selectedProject}
        selectedSprint={selectedSprint}
        selectedProjectId={selectedProjectId}
        selectedSprintId={effectiveSprintId}
        sprintsForProject={sprintsForProject}
        projectDisplayName={selectedProject?.name ?? ""}
        boardView={boardView}
        resetFiltersKey={resetFiltersKey}
        isAdmin={user.role === "admin"}
        urlTicketId={urlTicketId}
      />
    </div>
  )
}

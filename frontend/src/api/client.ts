const envOrigin = import.meta.env.VITE_API_URL?.replace(/\/$/, "").trim() ?? ""

/** In dev we default to relative URLs so Vite proxies to Rails (`vite.config.ts`). */
export const API_BASE_URL =
  envOrigin || (import.meta.env.DEV ? "" : "http://127.0.0.1:3000")

/** Matches backend `namespace :api` / `:v1` in `config/routes.rb`. */
export const API_V1_PREFIX = "/api/v1"

function resolveApiPath(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  const path = url.startsWith("/") ? url : `/${url}`
  if (path === API_V1_PREFIX || path.startsWith(`${API_V1_PREFIX}/`)) return path
  return `${API_V1_PREFIX}${path}`
}

/** Avoid `http://host:3000/api/v1` + `/api/v1/comments` → double `/api/v1` (404). */
function joinBaseUrlAndPath(base: string, path: string): string {
  if (!base) return path
  const b = base.replace(/\/$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  if (b.endsWith(API_V1_PREFIX) && (p === API_V1_PREFIX || p.startsWith(`${API_V1_PREFIX}/`))) {
    return `${b}${p.slice(API_V1_PREFIX.length) || "/"}`
  }
  return `${b}${p}`
}

import { getAuthUser } from "../lib/authCookies"

/** Legacy header when no session cookie / Bearer (non-browser clients). */
function getStoredUserIdForLegacyHeader(): number | null {
  const user = getAuthUser()
  const id = user?.id
  return typeof id === "number" ? id : null
}

function extractErrorFromBody(text: string, status: number): string {
  const trimmed = text.trim();
  if (!trimmed) return `Request failed (${status})`;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const errMsg = parsed.error;
    if (typeof errMsg === "string" && errMsg.length > 0) return errMsg;

    const errors = parsed.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const parts = errors.map((e) => String(e)).filter(Boolean);
      if (parts.length) return parts.join("; ");
    }
  } catch {
  
  }

  return trimmed.length > 200 ? `${trimmed.slice(0, 200)}…` : trimmed;
}

/** @template T Parsed JSON body (defaults to any for legacy call sites). */
export const apiClient = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  const body = options?.body
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData
  const baseHeaders = new Headers(options?.headers ?? undefined)

  const legacyId = getStoredUserIdForLegacyHeader()
  if (legacyId) baseHeaders.set("X-User-Id", String(legacyId))
  if (!isFormData && !baseHeaders.has("Content-Type")) {
    baseHeaders.set("Content-Type", "application/json")
  }

  const res = await fetch(joinBaseUrlAndPath(API_BASE_URL, resolveApiPath(url)), {
    ...options,
    credentials: "include",
    headers: baseHeaders,
  })

  const raw = await res.text()

  if (!res.ok) {
    throw new Error(extractErrorFromBody(raw, res.status))
  }

  if (raw.trim() === "") return {} as T
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new Error("Unexpected response from server (not JSON)")
  }
}

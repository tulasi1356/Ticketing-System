import { Cookies } from "react-cookie"
import type { User } from "../types/user"

const TOKEN_KEY = "ticketing_auth_token"
const USER_KEY = "ticketing_user"

const jar = new Cookies()

/** Raw cookie values — universal-cookie otherwise JSON-parses values and breaks our own JSON.parse. */
function getRaw(name: string): string | null {
  const v = jar.get(name, { doNotParse: true })
  return typeof v === "string" && v.length > 0 ? v : null
}

function cookieSetOptions() {
  return {
    path: "/" as const,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60,
    secure: import.meta.env.PROD,
  }
}

function removeOpts() {
  return { path: "/" as const }
}

export function getAuthToken(): string | null {
  return getRaw(TOKEN_KEY)
}

export function getAuthUser(): User | null {
  const raw = getRaw(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function readAuthSession(): { user: User | null; token: string | null } {
  const user = getAuthUser()
  const token = getAuthToken()
  if (user && !token) {
    jar.remove(USER_KEY, removeOpts())
    return { user: null, token: null }
  }
  // Token without user can happen briefly or if user cookie failed — never drop a valid JWT here.
  return { user, token }
}

export function writeAuthSession(user: User, token: string): void {
  const opts = cookieSetOptions()
  jar.set(TOKEN_KEY, token, opts)
  jar.set(USER_KEY, JSON.stringify(user), opts)
}

export function clearAuthSession(): void {
  jar.remove(TOKEN_KEY, removeOpts())
  jar.remove(USER_KEY, removeOpts())
}

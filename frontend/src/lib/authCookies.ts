import { Cookies } from "react-cookie"
import type { User } from "../types/user"

const USER_KEY = "ticketing_user"
/** Legacy client-readable JWT cookie — cleared on next login / logout. */
const LEGACY_TOKEN_KEY = "ticketing_auth_token"

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

export function getAuthUser(): User | null {
  const raw = getRaw(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function readAuthSession(): { user: User | null } {
  return { user: getAuthUser() }
}

/** Persist user for UI after login; JWT stays in httpOnly `ticketing_session_jwt` from the API only. */
export function writeAuthUserCookie(user: User): void {
  const opts = cookieSetOptions()
  jar.set(USER_KEY, JSON.stringify(user), opts)
}

export function clearLegacyAuthTokenCookie(): void {
  jar.remove(LEGACY_TOKEN_KEY, removeOpts())
}

export function clearAuthSession(): void {
  jar.remove(USER_KEY, removeOpts())
  jar.remove(LEGACY_TOKEN_KEY, removeOpts())
}

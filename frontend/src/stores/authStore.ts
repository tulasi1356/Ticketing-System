import { create } from "zustand"
import type { User } from "../types/user"
import { immer } from "zustand/middleware/immer"
import {
  clearAuthSession,
  clearLegacyAuthTokenCookie,
  readAuthSession,
  writeAuthUserCookie,
} from "../lib/authCookies"
import { getCurrentSession, logoutSession } from "../api/userApi"

type AuthState = {
  user: User | null
  /** False until the first `GET /sessions/current` finishes (success or failure). */
  sessionChecked: boolean
  setSession: (user: User) => void
  bootstrapSession: () => Promise<void>
  logOut: () => Promise<void>
}

let bootstrapInflight: Promise<void> | null = null

export const useAuthStore = create<AuthState>()(
  immer((set, get) => {
    const initial = readAuthSession()
    return {
      user: initial.user,
      sessionChecked: false,
      setSession: (user) =>
        set((state) => {
          state.user = user
          state.sessionChecked = true
          clearLegacyAuthTokenCookie()
          writeAuthUserCookie(user)
        }),
      bootstrapSession: async () => {
        if (get().sessionChecked) return
        if (bootstrapInflight) {
          await bootstrapInflight
          return
        }
        bootstrapInflight = (async () => {
          try {
            const { user } = await getCurrentSession()
            set((state) => {
              state.user = user
              clearLegacyAuthTokenCookie()
              writeAuthUserCookie(user)
            })
          } catch {
            set((state) => {
              state.user = null
              clearAuthSession()
            })
          } finally {
            set((state) => {
              state.sessionChecked = true
            })
            bootstrapInflight = null
          }
        })()
        await bootstrapInflight
      },
      logOut: async () => {
        try {
          await logoutSession()
        } catch {
          // Still clear local state if the network fails.
        }
        set((state) => {
          state.user = null
          state.sessionChecked = false
          clearAuthSession()
        })
      },
    }
  }),
)

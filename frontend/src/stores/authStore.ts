import { create } from "zustand"
import type { User } from "../types/user"
import { immer } from "zustand/middleware/immer"
import { clearAuthSession, readAuthSession, writeAuthSession } from "../lib/authCookies"

type AuthState = {
  user: User | null
  token: string | null
  setSession: (user: User, token: string) => void
  logOut: () => void
}

export const useAuthStore = create<AuthState>()(
  immer((set) => {
    const initial = readAuthSession()
    return {
      user: initial.user,
      token: initial.token,
      setSession: (user, token) =>
        set((state) => {
          state.user = user
          state.token = token
          writeAuthSession(user, token)
        }),
      logOut: () =>
        set((state) => {
          state.user = null
          state.token = null
          clearAuthSession()
        }),
    }
  }),
)

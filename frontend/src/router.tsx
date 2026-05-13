import {
    Outlet,
    RouterProvider,
    createRootRoute,
    createRoute,
    createRouter,
    redirect,
} from '@tanstack/react-router'
import AllUsers from './pages/users/list'
import Home from './pages/home/home-page'
import SignUp from './pages/auth/sign-up-page'
import Login from './pages/auth/login-page'
import { useAuthStore } from './stores/authStore'
import AllProjects from './pages/projects/list'
import { SprintBoardPage } from './pages/board/sprint-board-page'
import { Navbar } from './components/navbar'

const rootRoute = createRootRoute({
    component: RootLayout,


    beforeLoad: ({ location }) => {
        const user = useAuthStore.getState().user
        const path = location.pathname

        const isAuthPage = path === "/login" || path === "/signup"

        if (!user && !isAuthPage) {
            throw redirect({ to: "/signup" })
        }

        if (user && isAuthPage) {
            throw redirect({ to: "/tickets" })
        }
    },
})




function RootLayout() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex min-h-0 flex-1 flex-col">
                <Outlet />
            </main>
        </div>
    )
}

const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
})

const signUpRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/signup',
    component: SignUp,
})

const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
})

const allUsersRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/users/all',
    component: AllUsers,
    beforeLoad: () => {
        const current = useAuthStore.getState().user
        if (current?.role !== "admin") {
            throw redirect({ to: "/tickets" })
        }
    },
})

const allProjectsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/projects/all',
    component: AllProjects,
})

const ticketsDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tickets/$ticketId',
    component: SprintBoardPage,
})

const ticketsBoardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/tickets',
    component: SprintBoardPage,
})

const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    signUpRoute,
    allUsersRoute,
    allProjectsRoute,
    ticketsDetailRoute,
    ticketsBoardRoute,
])

export const router = createRouter({ routeTree })

export function AppRouter() {
    return <RouterProvider router={router} />
}

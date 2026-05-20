/**
 * English (en) — sole locale for now. Add keys here as you internationalize UI.
 */
export const en = {
  app: {
    name: "Ticket App",
  },
  nav: {
    users: "Users",
    usersAria: "Users",
    projects: "Projects",
    projectsAria: "Projects",
    allTickets: "All Tickets",
    allTicketsAria: "All tickets",
    myProjects: "My Projects",
    myProjectsAria: "My projects",
    admin: "Admin",
    logout: "Logout",
    logoutAria: "Logout",
    login: "Login",
    signup: "Sign up",
  },
  home: {
    label: "Home",
    title: "Ticket Management",
    signInRequiredTitle: "Sign in required",
    signInRequiredDescription:
      "Create an account or sign in to manage tickets and projects.",
    logIn: "Log in",
    signUp: "Sign up",
    welcomeBack: "Welcome back, {{name}}. Pick up where you left off.",
    quickLinksTitle: "Quick links",
    quickLinksDescription: "Jump to boards and projects",
    quickLinksDescriptionAdmin: ", or open the user directory.",
    allTicketsTitle: "All tickets",
    allTicketsSubtitle: "Boards and sprints",
    projectsTitle: "Projects",
    myProjectsTitle: "My projects",
    projectsSubtitle: "Teams and backlogs",
    usersTitle: "Users",
    usersSubtitle: "Organization directory",
  },
  auth: {
    email: "Email",
    password: "Password",
    name: "Name",
    emailPlaceholder: "Enter your email",
    passwordPlaceholder: "Enter your password",
    namePlaceholder: "Enter your name",
    validation: {
      emailInvalid: "Enter a valid email",
      emailRequired: "Email is required",
      passwordMin: "Password must be at least 8 characters",
    },
    login: {
      title: "Welcome back",
      description: "Log in to continue to your projects and tickets.",
      submit: "Login",
      submitting: "Logging in...",
      noAccount: "No account found for that email.",
      genericError: "Could not log you in. Please try again.",
      newHere: "New here?",
      createAccount: "Create an account",
    },
    signUp: {
      title: "Create your account",
      description: "Set up your profile to start managing projects and tickets.",
      submit: "Sign Up",
      submitting: "Creating account...",
      genericError: "Could not create your account. Please try again.",
      hasAccount: "Already have an account?",
      loginLink: "Login",
      validation: {
        nameRequired: "Name is required",
      },
    },
  },
  ticketing: {
    mustLogin: "You must be logged in to view ticketing.",
    loading: "Loading...",
    loadError: "Could not load ticketing data.",
    noProjects: "No projects yet",
    sidebarProjectsHeading: "Projects",
    addProject: "+ Add Project",
  },
} as const

export type EnTranslation = typeof en

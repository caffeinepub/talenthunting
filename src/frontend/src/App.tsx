import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AdminPage } from "@/pages/AdminPage";
import { EmployerDashboardPage } from "@/pages/EmployerDashboardPage";
import { FindTalentPage } from "@/pages/FindTalentPage";
import { HomePage } from "@/pages/HomePage";
import { JobSeekerDashboardPage } from "@/pages/JobSeekerDashboardPage";
import { PortalLoginPage } from "@/pages/PortalLoginPage";
import { PostRolePage } from "@/pages/PostRolePage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster position="top-right" richColors />
    </>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const postRoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post-role",
  component: PostRolePage,
});

const findTalentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/find-talent",
  component: FindTalentPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const portalLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal-login",
  component: PortalLoginPage,
});

const jobSeekerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jobseeker-dashboard",
  component: JobSeekerDashboardPage,
});

const employerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/employer-dashboard",
  component: EmployerDashboardPage,
});

// Router
const routeTree = rootRoute.addChildren([
  indexRoute,
  postRoleRoute,
  findTalentRoute,
  adminRoute,
  portalLoginRoute,
  jobSeekerDashboardRoute,
  employerDashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

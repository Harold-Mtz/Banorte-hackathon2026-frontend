import {
  BrowserRouter,
  useLocation,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./features/auth/AuthContext";
import { AuthPage } from "./features/auth/AuthPage";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { FinancialPage } from "./pages/FinancialPage";
import { GoalsPage } from "./pages/GoalsPage";
import { MortgagesPage } from "./pages/MortgagesPage";
import { LifeEventsPage } from "./pages/LifeEventsPage";
import { ExperiencePage } from "./pages/ExperiencePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ApiError } from "./api/api-client";
const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        count < 1 && (!(error instanceof ApiError) || error.status >= 500),
    },
    mutations: { retry: false },
  },
});
function ProtectedRoute() {
  return useAuth().session ? <Outlet /> : <Navigate to="/login" replace />;
}
function GuestRoute() {
  const location = useLocation();
  return useAuth().session ? (
    <Navigate
      to={location.pathname === "/register" ? "/app/onboarding" : "/app"}
      replace
    />
  ) : (
    <Outlet />
  );
}
export function App() {
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<AuthPage key="login" />} />
              <Route
                path="/register"
                element={<AuthPage key="register" registering />}
              />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="financial-profile" element={<FinancialPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="mortgages" element={<MortgagesPage />} />
                <Route path="life-events" element={<LifeEventsPage />} />
                <Route path="experience" element={<ExperiencePage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="onboarding"
                  element={<FinancialPage onboarding />}
                />
                <Route
                  path="onboarding/focus"
                  element={<ExperiencePage onboarding />}
                />
              </Route>
            </Route>
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>Esta página no está aquí.</h1>
                  <Link className="button primary" to="/app">
                    Volver al inicio
                  </Link>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

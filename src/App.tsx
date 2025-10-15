import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { Dashboard } from "@/pages/Dashboard";
import { EmployeesPage } from "@/pages/EmployeesPage";
import { CompaniesPage } from "@/pages/CompaniesPage";
import { DepartmentsPage } from "@/pages/DepartmentsPage";
import { JobsPage } from "@/pages/JobsPage";
import { NationalitiesPage } from "@/pages/NationalitiesPage";
import { RemindersPage } from "@/pages/RemindersPage";
import { Layout } from "@/components/Layout";
import "@/i18n/config";
import { useTheme } from "@/store/useTheme";

const queryClient = new QueryClient();

function App() {
  const { theme } = useTheme();

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="departments" element={<DepartmentsPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="nationalities" element={<NationalitiesPage />} />
              <Route path="reminders" element={<RemindersPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

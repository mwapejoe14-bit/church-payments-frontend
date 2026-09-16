import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./lib/api";

import { useAuthStore } from "./stores/auth.store";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Members from "./pages/Members";
import Reports from "./pages/Reports";
import PendingUsers from "./pages/PendingUsers";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AppRoutes() {
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Transactions />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Members />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pending-users"
        element={
          <ProtectedRoute adminOnly>
            <Layout>
              <PendingUsers />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
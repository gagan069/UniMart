import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import Dashboard from "./Dashboard.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import Layout from "./layouts/Layout.jsx";
import NotFound from "./pages/NotFound.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { isAdmin } from "./lib/permissions.js";

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  if (!isAdmin(user)) {
    return (
      <Navigate
        to="/"
        replace
        state={{ accessDeniedToast: "You don't have access to that page" }}
      />
    );
  }
  return children;
}

function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/login"
        element={<LoginPage onGoToDashboard={() => navigate("/")} />}
      />
      <Route
        path="/register"
        element={
          <LoginPage
            initialMode="register"
            initialPage={2}
            autoOpenModal={true}
            onGoToDashboard={() => navigate("/")}
          />
        }
      />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard onGoToLogin={() => navigate("/login")} />} />
        <Route
          path="admin"
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

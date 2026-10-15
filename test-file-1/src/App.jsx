import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
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

function MainScreen() {
  // 'dashboard' | 'login'
  const [view, setView] = useState("dashboard");

  return (
    <>
      {view === "login" ? (
        <LoginPage onGoToDashboard={() => setView("dashboard")} />
      ) : (
        <Dashboard onGoToLogin={() => setView("login")} />
      )}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainScreen />} />
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

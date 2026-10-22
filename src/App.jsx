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

function MainScreen({ view: propView, setView: propSetView }) {
  // 'dashboard' | 'login'
  const [internalView, setInternalView] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'landing' || params.get('view') === 'login') return 'login';
        if (window.location.hash === '#landing' || window.location.hash === '#login') return 'login';
      }
    } catch (e) {}
    return "dashboard";
  });

  const view = propView !== undefined ? propView : internalView;
  const setView = propSetView || setInternalView;

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
  const [view, setView] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('view') === 'landing' || params.get('view') === 'login') return 'login';
        if (window.location.hash === '#landing' || window.location.hash === '#login') return 'login';
      }
    } catch (e) {}
    return "dashboard";
  });

  const isLoginPage = view === "login";

  return (
    <Routes>
      <Route path="/" element={<Layout isLoginPage={isLoginPage} />}>
        <Route index element={<MainScreen view={view} setView={setView} />} />
        <Route
          path="login"
          element={
            <LoginPage
              onGoToDashboard={() => {
                setView("dashboard");
              }}
            />
          }
        />
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

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage.jsx";
import Dashboard from "./Dashboard.jsx";
import Layout from "./layouts/Layout.jsx";
import NotFound from "./pages/NotFound.jsx";

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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

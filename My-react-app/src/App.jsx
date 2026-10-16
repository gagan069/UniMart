import React, { useState } from "react";
import LoginPage from "./LoginPage.jsx";
import Dashboard from "./Dashboard.jsx";

function App() {
  // 'dashboard' | 'login'
  const [view, setView] = useState("login");

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

export default App;

import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import FloatingChatButton from "../components/chat/FloatingChatButton.jsx";
import ChatModal from "../components/chat/ChatModal.jsx";

function Layout({ isLoginPage }) {
  const location = useLocation();
  const isLogin = Boolean(
    isLoginPage ||
    location.pathname === "/login" ||
    location.search.includes("view=login") ||
    location.search.includes("view=landing") ||
    location.hash === "#login" ||
    location.hash === "#landing"
  );

  return (
    <>
      <Outlet />
      {!isLogin && (
        <>
          <ChatModal />
          <FloatingChatButton />
        </>
      )}
    </>
  );
}

export default Layout;

import React from "react";
import { Outlet } from "react-router-dom";
import FloatingChatButton from "../components/chat/FloatingChatButton.jsx";
import ChatModal from "../components/chat/ChatModal.jsx";

function Layout() {
  return (
    <>
      <Outlet />
      <ChatModal />
      <FloatingChatButton />
    </>
  );
}

export default Layout;

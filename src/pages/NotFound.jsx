import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        background: "#f8fafc",
        color: "#1e293b",
      }}
    >
      <h1
        style={{
          fontSize: "4.5rem",
          fontWeight: 800,
          margin: 0,
          color: "#70182c",
          letterSpacing: "-1px",
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          margin: "0.5rem 0 0.75rem",
          color: "#0f172a",
        }}
      >
        Page Not Found
      </h2>
      <p
        style={{
          maxWidth: "420px",
          color: "#64748b",
          marginBottom: "1.75rem",
          fontSize: "0.95rem",
          lineHeight: 1.5,
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "#70182c",
          color: "#ffffff",
          textDecoration: "none",
          padding: "0.7rem 1.6rem",
          borderRadius: "999px",
          fontWeight: 600,
          fontSize: "0.9rem",
          boxShadow: "0 4px 12px rgba(112, 24, 44, 0.2)",
        }}
      >
        Back to UniMart
      </Link>
    </div>
  );
}

export default NotFound;

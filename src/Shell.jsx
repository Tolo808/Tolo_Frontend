import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Shell.css";

export default function Shell({ user, setUser, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    setUser(null);
    navigate("/");
  }

  return (
    <div className="shell-container">
      {/* Header */}
      <header className="header">
        <h2>🚚 Tolo Delivery</h2>
        <div>
          <span>{user.name} ({user.role})</span>
          <button onClick={handleLogout} style={{
            marginLeft: "15px",
            padding: "6px 12px",
            background: "#0a0a0a",
            border: "none",
            color: "#f0f0f0",
            borderRadius: "6px",
            cursor: "pointer"
          }}>Logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">{children}</main>

      {/* Footer */}
      <footer className="footer">
        © {new Date().getFullYear()} Tolo Delivery. All rights reserved.
      </footer>
    </div>
  );
}

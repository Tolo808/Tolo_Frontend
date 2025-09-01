import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login({ setUser }) {
  const [role, setRole] = useState("callcenter");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  // Auto-login if remembered
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUser(user);
      if (user.role === "admin") navigate("/statistics");
      else navigate("/dashboard");
    }
  }, []);

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      let user = null;

      if (role === "admin" && username === "admin" && password === "admin123") {
        user = { role: "admin", name: "Admin User" };
        navigate("/statistics");
      } else if (
        role === "callcenter" &&
        username === "call" &&
        password === "call123"
      ) {
        user = { role: "callcenter", name: "Call Center Agent" };
        navigate("/dashboard");
      }

      if (user) {
        setUser(user);
        if (remember) localStorage.setItem("user", JSON.stringify(user));
      } else {
        setError("Invalid credentials. Demo: admin/admin123 or call/call123");
      }

      setLoading(false);
    }, 800); // simulate loading
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">🚚 Tolo Delivery</h1>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="callcenter">Call Center</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={role === "admin" ? "admin" : "call"}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={role === "admin" ? "admin123" : "call123"}
            />
          </div>

          <div className="form-group remember-me">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <label>Remember me</label>
          </div>

          {error && <p className="error">⚠️ {error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

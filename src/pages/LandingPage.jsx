import React from "react";

export default function RoleSelect({ user }) {
  const handleStatistics = () => {
    window.location.href = "https://web-production-e647.up.railway.app/statistics";
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "#0a0a0a",
      color: "#fff"
    }}>
      <h1 style={{ marginBottom: "30px" }}>Choose an Option</h1>
      <div style={{ display: "flex", gap: "20px" }}>
        <button onClick={handleStatistics} style={buttonStyle}>Statistics</button>
        <button onClick={() => window.location.href="/admin"} style={buttonStyle}>Admin Panel</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: "15px 30px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
  background: "#1e3a8a",
  color: "#fff",
  fontWeight: "bold"
};

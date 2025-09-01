import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddDelivery from "./pages/AddDelivery";
import AdminPanel from "./pages/AdminPanel";
import Price from "./pages/Price";
import RoleSelect from "./pages/LandingPage"; // new page to choose Admin/Statistics

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <Routes>
          {/* Role selection page */}
          <Route path="/select" element={<RoleSelect user={user} />} />

          {/* Callcenter role */}
          {user.role === "callcenter" && (
            <>
              <Route path="/dashboard" element={<Dashboard setUser={setUser} />} />
              <Route path="/add-delivery" element={<AddDelivery />} />
              <Route path="/price" element={<Price />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </>
          )}

          {/* Admin role */}
          {user.role === "admin" && (
            <>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </>
          )}
        </Routes>
      )}
    </Router>
  );
}

import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // ✅ Named import

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  try {
    const decoded = jwtDecode(token); // decode token
    const currentTime = Date.now() / 1000; // in seconds

    if (decoded.exp < currentTime) {
      // Token expired
      localStorage.removeItem("token"); // Auto logout
      return <Navigate to="/admin" replace />;
    }
  } catch (err) {
    // Invalid token
    localStorage.removeItem("token");
    return <Navigate to="/admin" replace />;
  }

  return children;
}

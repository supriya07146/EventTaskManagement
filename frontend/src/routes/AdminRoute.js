import React from "react";
import { Navigate } from "react-router-dom";


function AdminRoute({ children }) {

  const token = localStorage.getItem("accessToken");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );


  // Not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }


  // Logged in but not an admin
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }


  return children;
}


export default AdminRoute;
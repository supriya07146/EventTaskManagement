import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, requiredRole }) {

const token = localStorage.getItem("accessToken");
const storedUser = localStorage.getItem("user");

// Not logged in
if (!token || !storedUser) {
return <Navigate to="/login" replace />;
}

let user;

try {
user = JSON.parse(storedUser);
} catch (error) {
localStorage.removeItem("accessToken");
localStorage.removeItem("refreshToken");
localStorage.removeItem("user");


return <Navigate to="/login" replace />;


}

// Check role
if (requiredRole && user.role !== requiredRole) {


if (user.role === "admin") {
  return <Navigate to="/admin" replace />;
}

return <Navigate to="/dashboard" replace />;


}

return children;
}

export default ProtectedRoute;

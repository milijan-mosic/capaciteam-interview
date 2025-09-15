import { Navigate } from "react-router";

export const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("access");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

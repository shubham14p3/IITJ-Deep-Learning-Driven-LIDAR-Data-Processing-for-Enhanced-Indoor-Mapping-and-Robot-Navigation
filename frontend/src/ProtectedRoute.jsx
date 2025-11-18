import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const ok = localStorage.getItem("lidar_auth");
  if (!ok) return <Navigate to="/login" replace />;
  return children;
}

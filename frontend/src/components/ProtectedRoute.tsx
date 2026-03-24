import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../store/useStore";

const ProtectedRoute = () => {
  const { user } = useStore();

  // Check both store and localStorage to handle refresh
  const isAuthenticated = user || localStorage.getItem("user");

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;

import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  if (!token) return <Navigate to="/" replace />;

  if (!user) return <Navigate to="/" replace />;

  const role = user.role?.trim().toLowerCase();
  const allowed = allowedRole?.trim().toLowerCase();

  if (role !== allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
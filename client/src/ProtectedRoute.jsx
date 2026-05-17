import { Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

function ProtectedRoute({ children, allowedRoles }) {
  const { token, user } = useAuth()

  if (!token || !user) return <Navigate to="/" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Login from "./Login"
import Register from "./Register"

import TeacherDashboard from "./TeacherDashboard"
import StudentDashboard from "./StudentDashboard"
import AdminDashboard from "./AdminDashboard"

import ProtectedRoute from "./ProtectedRoute"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="super_admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./ProtectedRoute"

import Login from "./Login"

// Dashboards
import SuperAdminDashboard from "./pages/SuperAdminDashboard"
import InstituteAdminDashboard from "./pages/InstituteAdminDashboard"
import HODDashboard from "./pages/HODDashboard"
import ExamControllerDashboard from "./pages/ExamControllerDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentDashboard from "./pages/StudentDashboard"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />

          <Route path="/dashboard/superadmin" element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/instituteadmin" element={
            <ProtectedRoute allowedRoles={["institute_admin"]}>
              <InstituteAdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/hod" element={
            <ProtectedRoute allowedRoles={["hod"]}>
              <HODDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/examcontroller" element={
            <ProtectedRoute allowedRoles={["exam_controller"]}>
              <ExamControllerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/teacher" element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
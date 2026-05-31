import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./ProtectedRoute"

import Login from "./Login"
import SuperAdminDashboard from "./pages/SuperAdminDashboard"
import InstituteAdminDashboard from "./pages/InstituteAdminDashboard"
import HODDashboard from "./pages/HODDashboard"
import ExamControllerDashboard from "./pages/ExamControllerDashboard"
import TeacherDashboard from "./pages/TeacherDashboard"
import StudentDashboard from "./pages/StudentDashboard"
import QuestionBank from "./pages/QuestionBank"
import ExamManagement from "./pages/ExamManagement"
import TakeExam from "./pages/TakeExam"
import CodeLab from "./pages/CodeLab"
import GradingPanel from "./pages/GradingPanel"
import RecordBook from "./pages/RecordBook"
import VersionControl from "./pages/VersionControl"
import AIAnalysis from "./pages/AIAnalysis"

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

          <Route path="/questions" element={
            <ProtectedRoute allowedRoles={["super_admin", "institute_admin", "hod", "exam_controller", "teacher"]}>
              <QuestionBank />
            </ProtectedRoute>
          } />

          <Route path="/exams" element={
            <ProtectedRoute allowedRoles={["super_admin", "institute_admin", "hod", "exam_controller", "teacher", "student"]}>
              <ExamManagement />
            </ProtectedRoute>
          } />

          <Route path="/exam/take/:examId" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <TakeExam />
            </ProtectedRoute>
          } />

          <Route path="/codelab" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "hod"]}>
              <CodeLab />
            </ProtectedRoute>
          } />

          <Route path="/version-control" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "hod"]}>
              <VersionControl />
            </ProtectedRoute>
          } />

          <Route path="/ai-analysis" element={
            <ProtectedRoute allowedRoles={["teacher", "hod", "exam_controller"]}>
              <AIAnalysis />
            </ProtectedRoute>
          } />

          <Route path="/grading/:examId" element={
           <ProtectedRoute allowedRoles={["teacher", "hod", "exam_controller"]}>
            <GradingPanel />
          </ProtectedRoute>
} />
          <Route path="/records" element={
           <ProtectedRoute allowedRoles={["student", "teacher", "hod"]}>
            <RecordBook />
          </ProtectedRoute>
} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
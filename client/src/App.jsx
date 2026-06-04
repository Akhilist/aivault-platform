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
import VersionControl from "./pages/VersionControl"
import AIAnalysis from "./pages/AIAnalysis"
import GradingPanel from "./pages/GradingPanel"
import RecordBook from "./pages/RecordBook"
import SecurityAudit from "./pages/SecurityAudit"
import Analytics from "./pages/Analytics"
import FeedbackManagement from "./pages/FeedbackManagement"
import LivePoll from "./pages/LivePoll"
import Landing from "./pages/Landing"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

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

          <Route path="/security" element={
            <ProtectedRoute allowedRoles={["institute_admin", "hod", "exam_controller"]}>
              <SecurityAudit />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={["teacher", "hod", "exam_controller", "institute_admin", "student"]}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/feedback" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "hod"]}>
              <FeedbackManagement />
            </ProtectedRoute>
          } />
          <Route path="/poll" element={
            <ProtectedRoute allowedRoles={["student", "teacher", "hod"]}>
              <LivePoll />
            </ProtectedRoute>
} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
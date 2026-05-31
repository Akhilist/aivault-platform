const express = require("express")
const {
  startExam,
  saveAnswers,
  submitExam,
  getExamSubmissions,
  getSubmission,
  gradeAnswer,
  saveAIGrade,
  publishResults,
  getMyResults,
  logViolation,
} = require("../controllers/submissionController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/start",
  protect,
  authorizeRoles("student"),
  startExam
)

router.post(
  "/save",
  protect,
  authorizeRoles("student"),
  saveAnswers
)

router.post(
  "/submit",
  protect,
  authorizeRoles("student"),
  submitExam
)

router.get(
  "/exam/:examId",
  protect,
  authorizeRoles("teacher", "hod", "exam_controller"),
  getExamSubmissions
)

router.get(
  "/my-results",
  protect,
  authorizeRoles("student"),
  getMyResults
)

router.get(
  "/:id",
  protect,
  authorizeRoles("teacher", "hod", "exam_controller", "student"),
  getSubmission
)

router.post(
  "/grade-answer",
  protect,
  authorizeRoles("teacher", "hod"),
  gradeAnswer
)

router.post(
  "/ai-grade",
  protect,
  authorizeRoles("teacher", "hod"),
  saveAIGrade
)

router.put(
  "/publish/:examId",
  protect,
  authorizeRoles("teacher", "hod", "exam_controller"),
  publishResults
)

router.post(
  "/violation",
  protect,
  authorizeRoles("student"),
  logViolation
)

module.exports = router
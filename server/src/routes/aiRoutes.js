const express = require("express")
const {
  gradeAnswer,
  detectPlagiarism,
  reviewCode,
  summariseFeedback,
  generateQuestions,
} = require("../controllers/aiController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/grade",
  protect,
  authorizeRoles("teacher", "hod", "exam_controller"),
  gradeAnswer
)

router.post(
  "/plagiarism",
  protect,
  authorizeRoles("teacher", "hod"),
  detectPlagiarism
)

router.post(
  "/review-code",
  protect,
  authorizeRoles("teacher", "hod", "student"),
  reviewCode
)

router.post(
  "/summarise-feedback",
  protect,
  authorizeRoles("teacher", "hod"),
  summariseFeedback
)

router.post(
  "/generate-questions",
  protect,
  authorizeRoles("teacher", "hod"),
  generateQuestions
)

module.exports = router
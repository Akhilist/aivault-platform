const express = require("express")
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  rejectQuestion,
} = require("../controllers/questionController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "institute_admin", "hod", "exam_controller", "teacher"),
  getQuestions
)

router.post(
  "/",
  protect,
  authorizeRoles("teacher", "hod"),
  createQuestion
)

router.put(
  "/:id",
  protect,
  authorizeRoles("teacher", "hod"),
  updateQuestion
)

router.delete(
  "/:id",
  protect,
  authorizeRoles("teacher", "hod"),
  deleteQuestion
)

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("hod"),
  approveQuestion
)

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("hod"),
  rejectQuestion
)

module.exports = router
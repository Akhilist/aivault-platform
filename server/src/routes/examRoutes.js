const express = require("express")
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  submitForApproval,
  approveExam,
  rejectExam,
  scheduleExam,
  goLive,
  closeExam,
  deleteExam,
} = require("../controllers/examController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.get(
  "/",
  protect,
  authorizeRoles("super_admin", "institute_admin", "hod", "exam_controller", "teacher", "student"),
  getExams
)

router.get(
  "/:id",
  protect,
  authorizeRoles("super_admin", "institute_admin", "hod", "exam_controller", "teacher", "student"),
  getExam
)

router.post(
  "/",
  protect,
  authorizeRoles("teacher", "hod"),
  createExam
)

router.put(
  "/:id",
  protect,
  authorizeRoles("teacher", "hod"),
  updateExam
)

router.put(
  "/:id/submit",
  protect,
  authorizeRoles("teacher"),
  submitForApproval
)

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("hod"),
  approveExam
)

router.put(
  "/:id/reject",
  protect,
  authorizeRoles("hod"),
  rejectExam
)

router.put(
  "/:id/schedule",
  protect,
  authorizeRoles("exam_controller"),
  scheduleExam
)

router.put(
  "/:id/live",
  protect,
  authorizeRoles("exam_controller"),
  goLive
)

router.put(
  "/:id/close",
  protect,
  authorizeRoles("exam_controller"),
  closeExam
)

router.delete(
  "/:id",
  protect,
  authorizeRoles("teacher", "hod"),
  deleteExam
)

module.exports = router
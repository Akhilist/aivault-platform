const express = require("express")
const {
  createOrGetRecord,
  getMyRecords,
  getAllRecords,
  getRecord,
  updateRecord,
  submitRecord,
  addInlineComment,
  resolveComment,
  sendBack,
  approveRecord,
  signRecord,
  verifySignature,
} = require("../controllers/recordBookController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/",
  protect,
  authorizeRoles("student"),
  createOrGetRecord
)

router.get(
  "/my",
  protect,
  authorizeRoles("student"),
  getMyRecords
)

router.get(
  "/all",
  protect,
  authorizeRoles("teacher", "hod", "exam_controller"),
  getAllRecords
)

router.get(
  "/:id",
  protect,
  authorizeRoles("student", "teacher", "hod"),
  getRecord
)

router.put(
  "/:id",
  protect,
  authorizeRoles("student"),
  updateRecord
)

router.put(
  "/:id/submit",
  protect,
  authorizeRoles("student"),
  submitRecord
)

router.post(
  "/:id/comment",
  protect,
  authorizeRoles("teacher", "hod"),
  addInlineComment
)

router.put(
  "/:id/comment/:commentId/resolve",
  protect,
  authorizeRoles("student", "teacher", "hod"),
  resolveComment
)

router.put(
  "/:id/sendback",
  protect,
  authorizeRoles("teacher", "hod"),
  sendBack
)

router.put(
  "/:id/approve",
  protect,
  authorizeRoles("teacher", "hod"),
  approveRecord
)

router.put(
  "/:id/sign",
  protect,
  authorizeRoles("teacher", "hod"),
  signRecord
)

router.get(
  "/:id/verify",
  protect,
  verifySignature
)

module.exports = router
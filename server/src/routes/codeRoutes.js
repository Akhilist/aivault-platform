const express = require("express")
const { runCode, runTestCases } = require("../controllers/codeController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/run",
  protect,
  authorizeRoles("student", "teacher", "hod"),
  runCode
)

router.post(
  "/test",
  protect,
  authorizeRoles("student", "teacher", "hod"),
  runTestCases
)

module.exports = router
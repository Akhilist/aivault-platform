const express = require("express")
const {
  createForm,
  getForms,
  getOpenForms,
  getForm,
  submitResponse,
  closeForm,
  summariseForm,
} = require("../controllers/feedbackController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.post(
  "/",
  protect,
  authorizeRoles("teacher", "hod"),
  createForm
)

router.get(
  "/",
  protect,
  authorizeRoles("teacher", "hod", "institute_admin"),
  getForms
)

router.get(
  "/open",
  protect,
  authorizeRoles("student"),
  getOpenForms
)

router.get(
  "/:id",
  protect,
  getForms
)

router.post(
  "/:id/respond",
  protect,
  authorizeRoles("student"),
  submitResponse
)

router.put(
  "/:id/close",
  protect,
  authorizeRoles("teacher", "hod"),
  closeForm
)

router.post(
  "/:id/summarise",
  protect,
  authorizeRoles("teacher", "hod"),
  summariseForm
)

module.exports = router
const express = require("express")

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware")

const router = express.Router()

router.get(
  "/teacher",
  protect,
  authorizeRoles("teacher"),
  (req, res) => {
    res.json({
      message: "Welcome Teacher",
    })
  }
)

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  (req, res) => {
    res.json({
      message: "Welcome Student",
    })
  }
)

router.get(
  "/admin",
  protect,
  authorizeRoles("super_admin"),
  (req, res) => {
    res.json({
      message: "Welcome Super Admin",
    })
  }
)

module.exports = router
const express = require("express")

const {
  registerUser,
  loginUser,
  createUser,
  getManagedUsers,
  deleteUser,
} = require("../controllers/authController")

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware")

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)

router.post(
  "/users",
  protect,
  authorizeRoles("institute_admin", "hod"),
  createUser
)

router.get(
  "/users",
  protect,
  authorizeRoles("institute_admin", "hod"),
  getManagedUsers
)

router.delete(
  "/users/:id",
  protect,
  authorizeRoles("institute_admin", "hod"),
  deleteUser
)

module.exports = router
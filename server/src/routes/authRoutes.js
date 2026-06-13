const express = require("express")

const {
registerUser,
loginUser,
createUser,
getManagedUsers,
deleteUser,
updateProfile,
changePassword,
} = require("../controllers/authController")

const {
protect,
authorizeRoles,
} = require("../middleware/authMiddleware")

const router = express.Router()

// Auth
router.post("/register", registerUser)
router.post("/login", loginUser)

// User Management
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

// Profile
router.put(
"/profile",
protect,
updateProfile
)

router.put(
"/change-password",
protect,
changePassword
)

module.exports = router

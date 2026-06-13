const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // prevent anyone registering as super_admin from API
    const allowedRoles = [
      "institute_admin",
      "hod",
      "exam_controller",
      "teacher",
      "student",
    ]

    if (role && !allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "You cannot register with this role",
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "student",
    })

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
}
// Admin creates a user (HOD/Institute Admin can create staff/students)
const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, batch, rollNumber } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required" })
    }

    // role-based permission check
    const creatorRole = req.user.role
    const allowedCreations = {
      institute_admin: ["hod", "institute_admin", "exam_controller"],
      hod: ["teacher", "student"],
    }

    if (!allowedCreations[creatorRole]?.includes(role)) {
      return res.status(403).json({ message: `${creatorRole} cannot create ${role} accounts` })
    }

    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: "Email already in use" })

    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department: department || "",
      batch: batch || "",
      rollNumber: rollNumber || "",
    })

    res.status(201).json({
      message: "User created successfully",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error("createUser error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get users created/managed by this role
const getManagedUsers = async (req, res) => {
  try {
    const creatorRole = req.user.role
    let roleFilter = {}

    if (creatorRole === "institute_admin") {
      roleFilter = { role: { $in: ["hod", "institute_admin", "exam_controller"] } }
    } else if (creatorRole === "hod") {
      roleFilter = { role: { $in: ["teacher", "student"] } }
    } else {
      return res.status(403).json({ message: "Access denied" })
    }

    const users = await User.find(roleFilter).select("-password").sort({ createdAt: -1 })
    res.json({ users })
  } catch (error) {
    console.error("getManagedUsers error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete a managed user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const creatorRole = req.user.role
    const allowedDeletions = {
      institute_admin: ["hod", "institute_admin", "exam_controller"],
      hod: ["teacher", "student"],
    }

    if (!allowedDeletions[creatorRole]?.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted" })
  } catch (error) {
    console.error("deleteUser error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
// Update own profile
const updateProfile = async (req, res) => {
  try {
    const { name, department, batch, rollNumber } = req.body
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    if (name) user.name = name
    if (department !== undefined) user.department = department
    if (batch !== undefined) user.batch = batch
    if (rollNumber !== undefined) user.rollNumber = rollNumber

    await user.save()
    res.json({
      message: "Profile updated",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, batch: user.batch, rollNumber: user.rollNumber }
    })
  } catch (error) {
    console.error("updateProfile error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" })
    }

    const bcrypt = require("bcryptjs")
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: "User not found" })

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" })

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("changePassword error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = { 
  registerUser, 
  loginUser, 
  createUser,
  getManagedUsers,
  deleteUser, 
  updateProfile,
  changePassword,
}
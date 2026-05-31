const Exam = require("../models/Exam")
const Question = require("../models/Question")

// Get all exams (role filtered)
const getExams = async (req, res) => {
  try {
    let filter = {}

    if (req.user.role === "teacher") {
      filter.createdBy = req.user.id
    }

    if (req.user.role === "student") {
          filter.status = { $in: ["scheduled", "live", "closed"] }
        }

    if (req.user.role === "hod" || req.user.role === "exam_controller" || req.user.role === "institute_admin") {
          // see all exams except pure drafts
          filter.status = { $in: ["pending_approval", "approved", "scheduled", "live", "closed"] }
        }
        
        if (req.user.role === "institute_admin") {
      filter.status = { $in: ["approved", "scheduled", "live", "closed"] }
        }

        if (req.user.role === "exam_controller") {
          filter.status = { $in: ["approved", "scheduled", "live", "closed"] }
        }

    const exams = await Exam.find(filter)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })

    res.json({ exams })
  } catch (error) {
    console.error("getExams error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get single exam
const getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("questions.questionId")

    if (!exam) return res.status(404).json({ message: "Exam not found" })

    res.json({ exam })
  } catch (error) {
    console.error("getExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create exam
const createExam = async (req, res) => {
  try {
    const {
      title, subject, description,
      duration, passMark, negativeMark,
      questions, assignedBatches,
      instructions, department,
      allowedAttempts, shuffleQuestions,
    } = req.body

    const totalMarks = (questions || []).reduce((sum, q) => sum + (q.marks || 0), 0)

    const exam = await Exam.create({
      title, subject, description,
      duration, passMark, negativeMark,
      questions: questions || [],
      assignedBatches: assignedBatches || [],
      instructions, department,
      allowedAttempts: allowedAttempts || 1,
      shuffleQuestions: shuffleQuestions || false,
      totalMarks,
      createdBy: req.user.id,
      status: "draft",
    })

    res.status(201).json({ message: "Exam created", exam })
  } catch (error) {
    console.error("createExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update exam
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) return res.status(404).json({ message: "Exam not found" })

    if (exam.createdBy.toString() !== req.user.id && req.user.role !== "hod") {
      return res.status(403).json({ message: "Access denied" })
    }

    if (exam.status !== "draft") {
      return res.status(400).json({ message: "Only draft exams can be edited" })
    }

    const totalMarks = (req.body.questions || []).reduce((sum, q) => sum + (q.marks || 0), 0)

    const updated = await Exam.findByIdAndUpdate(
      req.params.id,
      { ...req.body, totalMarks, status: "draft" },
      { new: true }
    )

    res.json({ message: "Exam updated", exam: updated })
  } catch (error) {
    console.error("updateExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Submit for approval
const submitForApproval = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) return res.status(404).json({ message: "Exam not found" })

    if (exam.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (exam.questions.length === 0) {
      return res.status(400).json({ message: "Add at least one question before submitting" })
    }

    exam.status = "pending_approval"
    await exam.save()

    res.json({ message: "Exam submitted for approval", exam })
  } catch (error) {
    console.error("submitForApproval error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Approve exam (HOD)
const approveExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "approved", approvedBy: req.user.id },
      { new: true }
    )
    if (!exam) return res.status(404).json({ message: "Exam not found" })
    res.json({ message: "Exam approved", exam })
  } catch (error) {
    console.error("approveExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Reject exam (HOD)
const rejectExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "draft" },
      { new: true }
    )
    if (!exam) return res.status(404).json({ message: "Exam not found" })
    res.json({ message: "Exam rejected back to draft", exam })
  } catch (error) {
    console.error("rejectExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Schedule exam (Exam Controller)
const scheduleExam = async (req, res) => {
  try {
    const { scheduledStart, scheduledEnd } = req.body

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "scheduled", scheduledStart, scheduledEnd },
      { new: true }
    )
    if (!exam) return res.status(404).json({ message: "Exam not found" })
    res.json({ message: "Exam scheduled", exam })
  } catch (error) {
    console.error("scheduleExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Go live (Exam Controller)
const goLive = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "live" },
      { new: true }
    )
    if (!exam) return res.status(404).json({ message: "Exam not found" })
    res.json({ message: "Exam is now live", exam })
  } catch (error) {
    console.error("goLive error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Close exam (Exam Controller)
const closeExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: "closed" },
      { new: true }
    )
    if (!exam) return res.status(404).json({ message: "Exam not found" })
    res.json({ message: "Exam closed", exam })
  } catch (error) {
    console.error("closeExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) return res.status(404).json({ message: "Exam not found" })

    if (exam.createdBy.toString() !== req.user.id && req.user.role !== "hod") {
      return res.status(403).json({ message: "Access denied" })
    }

    if (exam.status !== "draft") {
      return res.status(400).json({ message: "Only draft exams can be deleted" })
    }

    await Exam.findByIdAndDelete(req.params.id)
    res.json({ message: "Exam deleted" })
  } catch (error) {
    console.error("deleteExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
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
}
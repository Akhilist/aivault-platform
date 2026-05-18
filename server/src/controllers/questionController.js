const Question = require("../models/Question")

const getQuestions = async (req, res) => {
  try {
    const { type, difficulty, topic, subject, status } = req.query
    const filter = {}

    if (type)       filter.type = type
    if (difficulty) filter.difficulty = difficulty
    if (topic)      filter.topic = new RegExp(topic, "i")
    if (subject)    filter.subject = new RegExp(subject, "i")
    if (status)     filter.status = status

    if (req.user.role === "student") {
      return res.status(403).json({ message: "Access denied" })
    }

    const questions = await Question.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })

    res.json({ questions })
  } catch (error) {
    console.error("getQuestions error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const createQuestion = async (req, res) => {
  try {
    const {
      type, text, options, correctAnswer,
      rubric, testCases, matchPairs,
      marks, difficulty, topic, subject
    } = req.body

    // only save testCases if coding question and they have content
    const cleanTestCases = type === "coding"
      ? (testCases || []).filter(tc => tc.expectedOutput && tc.expectedOutput.trim() !== "")
      : []

    // only save matchPairs if matching or dragdrop and they have content
    const cleanMatchPairs = (type === "matching" || type === "dragdrop")
      ? (matchPairs || []).filter(mp => mp.left && mp.left.trim() !== "" && mp.right && mp.right.trim() !== "")
      : []

    const question = await Question.create({
      type,
      text,
      options:       type === "mcq" ? options : [],
      correctAnswer: type === "mcq" ? correctAnswer : null,
      rubric:        (type === "short" || type === "long") ? rubric : null,
      testCases:     cleanTestCases,
      matchPairs:    cleanMatchPairs,
      marks,
      difficulty,
      topic,
      subject,
      createdBy: req.user.id,
      status: "draft",
    })

    res.status(201).json({ message: "Question created", question })
  } catch (error) {
    console.error("createQuestion error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ message: "Question not found" })

    if (
      question.createdBy.toString() !== req.user.id &&
      req.user.role !== "hod"
    ) {
      return res.status(403).json({ message: "Access denied" })
    }

    const {
      type, text, options, correctAnswer,
      rubric, testCases, matchPairs,
      marks, difficulty, topic, subject
    } = req.body

    const cleanTestCases = type === "coding"
      ? (testCases || []).filter(tc => tc.expectedOutput && tc.expectedOutput.trim() !== "")
      : []

    const cleanMatchPairs = (type === "matching" || type === "dragdrop")
      ? (matchPairs || []).filter(mp => mp.left && mp.left.trim() !== "" && mp.right && mp.right.trim() !== "")
      : []

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      {
        type,
        text,
        options:       type === "mcq" ? options : [],
        correctAnswer: type === "mcq" ? correctAnswer : null,
        rubric:        (type === "short" || type === "long") ? rubric : null,
        testCases:     cleanTestCases,
        matchPairs:    cleanMatchPairs,
        marks,
        difficulty,
        topic,
        subject,
        status: "draft",
      },
      { new: true }
    )

    res.json({ message: "Question updated", question: updated })
  } catch (error) {
    console.error("updateQuestion error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ message: "Question not found" })

    if (
      question.createdBy.toString() !== req.user.id &&
      req.user.role !== "hod"
    ) {
      return res.status(403).json({ message: "Access denied" })
    }

    await Question.findByIdAndDelete(req.params.id)
    res.json({ message: "Question deleted" })
  } catch (error) {
    console.error("deleteQuestion error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const approveQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    )
    if (!question) return res.status(404).json({ message: "Question not found" })
    res.json({ message: "Question approved", question })
  } catch (error) {
    console.error("approveQuestion error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const rejectQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    )
    if (!question) return res.status(404).json({ message: "Question not found" })
    res.json({ message: "Question rejected", question })
  } catch (error) {
    console.error("rejectQuestion error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  rejectQuestion,
}
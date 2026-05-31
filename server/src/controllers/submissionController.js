const Submission = require("../models/Submission")
const Exam = require("../models/Exam")

// Start exam — create submission record
const startExam = async (req, res) => {
  try {
    const { examId } = req.body
    const studentId = req.user.id

    const exam = await Exam.findById(examId).populate("questions.questionId")
    if (!exam) return res.status(404).json({ message: "Exam not found" })

    if (exam.status !== "live") {
      return res.status(400).json({ message: "Exam is not live" })
    }

    // check if already submitted
    const existing = await Submission.findOne({ examId, studentId, status: "submitted" })
    if (existing) {
      return res.status(400).json({ message: "You have already submitted this exam" })
    }

    // check if already started
    const started = await Submission.findOne({ examId, studentId, status: "started" })
    if (started) {
      return res.json({ message: "Exam already started", submission: started })
    }

    // create answers array from exam questions
    const answers = exam.questions.map(q => ({
      questionId: q.questionId._id || q.questionId,
      answer: "",
      maxMarks: q.marks,
      marks: null,
      isGraded: false,
    }))

    const submission = await Submission.create({
      examId,
      studentId,
      answers,
      totalMarks: exam.totalMarks,
      startTime: new Date(),
      status: "started",
      violations: 0,
    })

    res.status(201).json({ message: "Exam started", submission })
  } catch (error) {
    console.error("startExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Auto save answers
const saveAnswers = async (req, res) => {
  try {
    const { submissionId, answers } = req.body

    const submission = await Submission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: "Submission not found" })

    if (submission.status === "submitted") {
      return res.status(400).json({ message: "Exam already submitted" })
    }

    // update answers
    answers.forEach(a => {
      const existing = submission.answers.find(
        sa => sa.questionId.toString() === a.questionId
      )
      if (existing) existing.answer = a.answer
    })

    await submission.save()
    res.json({ message: "Answers saved" })
  } catch (error) {
    console.error("saveAnswers error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Submit exam
const submitExam = async (req, res) => {
  try {
    const { submissionId, answers, violations, autoSubmitted } = req.body

    const submission = await Submission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: "Submission not found" })

    if (submission.status === "submitted") {
      return res.json({ message: "Already submitted", submission })
    }

    const exam = await Exam.findById(submission.examId).populate("questions.questionId")

    // update answers
    if (answers) {
      answers.forEach(a => {
        const existing = submission.answers.find(
          sa => sa.questionId.toString() === a.questionId
        )
        if (existing) existing.answer = a.answer
      })
    }

    // auto grade MCQs
    let autoScore = 0
    submission.answers.forEach(sa => {
      const examQ = exam.questions.find(
        q => (q.questionId._id || q.questionId).toString() === sa.questionId.toString()
      )
      if (!examQ) return

      const question = examQ.questionId
      if (question.type === "mcq") {
        if (sa.answer === question.correctAnswer) {
          sa.marks = sa.maxMarks
          autoScore += sa.maxMarks
        } else {
          sa.marks = exam.negativeMark ? -exam.negativeMark : 0
          autoScore += sa.marks
        }
        sa.isGraded = true
      }
    })

    submission.violations    = violations || 0
    submission.autoSubmitted = autoSubmitted || false
    submission.submitTime    = new Date()
    submission.status        = "submitted"

    // calculate score if all MCQ
    const ungradedAnswers = submission.answers.filter(a => !a.isGraded)
    if (ungradedAnswers.length === 0) {
      submission.totalScore = Math.max(0, autoScore)
      submission.percentage = Math.round((submission.totalScore / submission.totalMarks) * 100)
      submission.passed     = submission.totalScore >= exam.passMark
      submission.status     = "graded"
    }

    await submission.save()
    res.json({ message: "Exam submitted successfully", submission })
  } catch (error) {
    console.error("submitExam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all submissions for an exam (teacher)
const getExamSubmissions = async (req, res) => {
  try {
    const { examId } = req.params

    const submissions = await Submission.find({ examId })
      .populate("studentId", "name email rollNumber batch")
      .sort({ submitTime: -1 })

    res.json({ submissions })
  } catch (error) {
    console.error("getExamSubmissions error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get single submission with full details
const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate("studentId", "name email rollNumber batch")
      .populate("examId", "title subject passMark totalMarks")
      .populate("answers.questionId")

    if (!submission) return res.status(404).json({ message: "Submission not found" })

    res.json({ submission })
  } catch (error) {
    console.error("getSubmission error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Grade a single answer (teacher)
const gradeAnswer = async (req, res) => {
  try {
    const { submissionId, questionId, marks, teacherComment } = req.body

    const submission = await Submission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: "Submission not found" })

    const answer = submission.answers.find(
      a => a.questionId.toString() === questionId
    )
    if (!answer) return res.status(404).json({ message: "Answer not found" })

    answer.marks          = marks
    answer.teacherComment = teacherComment || ""
    answer.isGraded       = true

    // recalculate total
    const allGraded = submission.answers.every(a => a.isGraded)
    if (allGraded) {
      const total = submission.answers.reduce((sum, a) => sum + (a.marks || 0), 0)
      const exam  = await Exam.findById(submission.examId)

      submission.totalScore = Math.max(0, total)
      submission.percentage = Math.round((submission.totalScore / submission.totalMarks) * 100)
      submission.passed     = submission.totalScore >= (exam?.passMark || 0)
      submission.status     = "graded"
    }

    await submission.save()
    res.json({ message: "Answer graded", submission })
  } catch (error) {
    console.error("gradeAnswer error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Save AI grade suggestion to answer
const saveAIGrade = async (req, res) => {
  try {
    const { submissionId, questionId, aiScore, aiJustification, aiFeedback } = req.body

    const submission = await Submission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: "Submission not found" })

    const answer = submission.answers.find(
      a => a.questionId.toString() === questionId
    )
    if (!answer) return res.status(404).json({ message: "Answer not found" })

    answer.aiScore         = aiScore
    answer.aiJustification = aiJustification
    answer.aiFeedback      = aiFeedback

    await submission.save()
    res.json({ message: "AI grade saved", submission })
  } catch (error) {
    console.error("saveAIGrade error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Publish results
const publishResults = async (req, res) => {
  try {
    const { examId } = req.params

    await Submission.updateMany(
      { examId, status: "graded" },
      { resultPublished: true, status: "published" }
    )

    res.json({ message: "Results published to all students" })
  } catch (error) {
    console.error("publishResults error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get student's own results
const getMyResults = async (req, res) => {
  try {
    const studentId = req.user.id

    const submissions = await Submission.find({
      studentId,
      resultPublished: true,
    })
      .populate("examId", "title subject totalMarks passMark")
      .sort({ submitTime: -1 })

    res.json({ submissions })
  } catch (error) {
    console.error("getMyResults error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Log violation
const logViolation = async (req, res) => {
  try {
    const { submissionId } = req.body

    const submission = await Submission.findById(submissionId)
    if (!submission) return res.status(404).json({ message: "Submission not found" })

    submission.violations += 1
    await submission.save()

    res.json({ message: "Violation logged", violations: submission.violations })
  } catch (error) {
    console.error("logViolation error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  startExam,
  saveAnswers,
  submitExam,
  getExamSubmissions,
  getSubmission,
  gradeAnswer,
  saveAIGrade,
  publishResults,
  getMyResults,
  logViolation,
}
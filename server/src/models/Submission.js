const mongoose = require("mongoose")

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  answer: {
    type: String,
    default: "",
  },
  marks: {
    type: Number,
    default: null,
  },
  maxMarks: {
    type: Number,
    default: 0,
  },
  aiScore: {
    type: Number,
    default: null,
  },
  aiJustification: {
    type: String,
    default: "",
  },
  aiFeedback: {
    type: String,
    default: "",
  },
  teacherComment: {
    type: String,
    default: "",
  },
  isGraded: {
    type: Boolean,
    default: false,
  },
})

const submissionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    totalScore: {
      type: Number,
      default: null,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: null,
    },
    grade: {
      type: String,
      default: null,
    },
    passed: {
      type: Boolean,
      default: null,
    },
    violations: {
      type: Number,
      default: 0,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
    deviceFingerprint: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },
    submitTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["started", "submitted", "graded", "published"],
      default: "started",
    },
    resultPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Submission", submissionSchema)
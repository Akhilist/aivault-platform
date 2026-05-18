const mongoose = require("mongoose")

const examQuestionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
})

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: Number,
      required: true,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passMark: {
      type: Number,
      default: 0,
    },
    negativeMark: {
      type: Number,
      default: 0,
    },
    questions: {
      type: [examQuestionSchema],
      default: [],
    },
    assignedBatches: {
      type: [String],
      default: [],
    },
    instructions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "draft",
        "pending_approval",
        "approved",
        "scheduled",
        "live",
        "closed",
      ],
      default: "draft",
    },
    scheduledStart: {
      type: Date,
      default: null,
    },
    scheduledEnd: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    department: {
      type: String,
      default: "",
    },
    allowedAttempts: {
      type: Number,
      default: 1,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Exam", examSchema)
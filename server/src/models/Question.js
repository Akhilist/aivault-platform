const mongoose = require("mongoose")

const testCaseSchema = new mongoose.Schema({
  input:          { type: String, default: "" },
  expectedOutput: { type: String, default: "" },
  isHidden:       { type: Boolean, default: false },
})

const matchPairSchema = new mongoose.Schema({
  left:  { type: String, default: "" },
  right: { type: String, default: "" },
})

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["mcq", "short", "long", "coding", "matching", "dragdrop"],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: null,
    },
    rubric: {
      type: String,
      default: null,
    },
    testCases: {
      type: [testCaseSchema],
      default: [],
    },
    matchPairs: {
      type: [matchPairSchema],
      default: [],
    },
    marks: {
      type: Number,
      required: true,
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    topic: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Question", questionSchema)
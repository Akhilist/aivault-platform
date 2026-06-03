const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ["rating", "mcq", "text"], default: "text" },
  options: { type: [String], default: [] },
})

const responseSchema = new mongoose.Schema({
  answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
  submittedAt: { type: Date, default: Date.now },
})

const feedbackSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      default: null,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    questions: { type: [questionSchema], default: [] },
    responses: { type: [responseSchema], default: [] },
    openWindow: { type: Date, default: Date.now },
    closeWindow: { type: Date, default: null },
    isOpen: { type: Boolean, default: true },
    aiSummary: { type: String, default: "" },
    summaryGeneratedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Feedback", feedbackSchema)
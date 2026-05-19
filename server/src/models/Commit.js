const mongoose = require("mongoose")

const commitSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    experimentId: {
      type: String,
      required: true,
    },
    experimentName: {
      type: String,
      required: true,
    },
    stage: {
      type: String,
      enum: ["algorithm", "flowchart", "code"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    commitMessage: {
      type: String,
      default: "",
    },
    commitNumber: {
      type: Number,
      default: 1,
    },
    language: {
      type: String,
      default: null,
    },
    isFinal: {
      type: Boolean,
      default: false,
    },
    teacherNote: {
      type: String,
      default: "",
    },
    isLatest: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("Commit", commitSchema)
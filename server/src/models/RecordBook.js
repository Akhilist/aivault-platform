const mongoose = require("mongoose")

const inlineCommentSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ["algorithm", "code"],
    required: true,
  },
  selectedText: {
    type: String,
    required: true,
  },
  startOffset: {
    type: Number,
    required: true,
  },
  endOffset: {
    type: Number,
    required: true,
  },
  lineNumber: {
    type: Number,
    default: null,
  },
  comment: {
    type: String,
    required: true,
  },
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const recordBookSchema = new mongoose.Schema(
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
    subject: {
      type: String,
      default: "",
    },
    batch: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    aim: {
      type: String,
      default: "",
    },
    theory: {
      type: String,
      default: "",
    },
    algorithmContent: {
      type: String,
      default: "",
    },
    flowchartContent: {
      type: String,
      default: "",
    },
    codeContent: {
      type: String,
      default: "",
    },
    codeLanguage: {
      type: String,
      default: "python",
    },
    output: {
      type: String,
      default: "",
    },
    conclusion: {
      type: String,
      default: "",
    },
    inlineComments: {
      type: [inlineCommentSchema],
      default: [],
    },
    teacherRemarks: {
      type: String,
      default: "",
    },
    sendBackReason: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "sent_back", "approved", "signed"],
      default: "draft",
    },
    signature: {
      signedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      signedAt: { type: Date, default: null },
      documentHash: { type: String, default: null },
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model("RecordBook", recordBookSchema)
const RecordBook = require("../models/RecordBook")
const Commit = require("../models/Commit")
const crypto = require("crypto")

// Create or get record book from experiment
const createOrGetRecord = async (req, res) => {
  try {
    const { experimentId, experimentName, subject, batch } = req.body
    const studentId = req.user.id

    let record = await RecordBook.findOne({ experimentId, studentId })

    if (record) {
      return res.json({ record })
    }

    // pull latest commits
    const commits = await Commit.find({ experimentId, studentId, isLatest: true })

    const algoCommit  = commits.find(c => c.stage === "algorithm")
    const flowCommit  = commits.find(c => c.stage === "flowchart")
    const codeCommit  = commits.find(c => c.stage === "code")

    let algorithmContent = ""
    if (algoCommit) {
      try {
        const steps = JSON.parse(algoCommit.content)
        algorithmContent = Array.isArray(steps)
          ? steps.map((s, i) => `Step ${i + 1}: ${s.text}`).join("\n")
          : algoCommit.content
      } catch {
        algorithmContent = algoCommit.content
      }
    }

    record = await RecordBook.create({
      studentId,
      experimentId,
      experimentName,
      subject:          subject || "",
      batch:            batch || "",
      algorithmContent,
      flowchartContent: flowCommit?.content || "",
      codeContent:      codeCommit?.content || "",
      codeLanguage:     codeCommit?.language || "python",
      status:           "draft",
    })

    res.status(201).json({ record })
  } catch (error) {
    console.error("createOrGetRecord error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all records for a student
const getMyRecords = async (req, res) => {
  try {
    const records = await RecordBook.find({ studentId: req.user.id })
      .sort({ updatedAt: -1 })
    res.json({ records })
  } catch (error) {
    console.error("getMyRecords error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all records (teacher/hod)
const getAllRecords = async (req, res) => {
  try {
    const records = await RecordBook.find()
      .populate("studentId", "name email rollNumber batch")
      .sort({ updatedAt: -1 })
    res.json({ records })
  } catch (error) {
    console.error("getAllRecords error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get single record
//
// Authorization: students may only read their OWN record. Staff roles
// (teacher, hod, exam_controller, institute_admin, super_admin) may read any
// record. Without this check, any authenticated student could read another
// student's record (including signed lab work, code, and inline teacher
// comments) by guessing or scanning `req.params.id` values — an IDOR.
const STAFF_ROLES = new Set([
  "teacher",
  "hod",
  "exam_controller",
  "institute_admin",
  "super_admin",
])

const getRecord = async (req, res) => {
  try {
    const record = await RecordBook.findById(req.params.id)
      .populate("studentId", "name email rollNumber batch")
      .populate("inlineComments.commentedBy", "name role")
      .populate("signature.signedBy", "name role")

    if (!record) return res.status(404).json({ message: "Record not found" })

    // Students: only their own record. Staff: any record.
    const isStaff = STAFF_ROLES.has(req.user.role)
    const isOwner =
      record.studentId &&
      record.studentId._id &&
      record.studentId._id.toString() === req.user.id
    if (!isStaff && !isOwner) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json({ record })
  } catch (error) {
    console.error("getRecord error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update record sections (student)
const updateRecord = async (req, res) => {
  try {
    const record = await RecordBook.findById(req.params.id)
    if (!record) return res.status(404).json({ message: "Record not found" })

    if (record.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (record.status === "signed") {
      return res.status(400).json({ message: "Signed records cannot be edited" })
    }

    if (record.status === "submitted" || record.status === "under_review") {
      return res.status(400).json({ message: "Cannot edit a submitted record. Wait for teacher feedback." })
    }

    const allowedFields = ["aim", "theory", "output", "conclusion", "subject", "batch", "date", "codeContent", "codeLanguage"]
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) record[field] = req.body[field]
    })

    await record.save()
    res.json({ message: "Record updated", record })
  } catch (error) {
    console.error("updateRecord error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Submit for review
const submitRecord = async (req, res) => {
  try {
    const record = await RecordBook.findById(req.params.id)
    if (!record) return res.status(404).json({ message: "Record not found" })

    if (record.studentId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" })
    }

    if (!record.aim.trim()) return res.status(400).json({ message: "Aim is required before submitting" })
    if (!record.codeContent.trim()) return res.status(400).json({ message: "Code is required before submitting" })
    if (!record.output.trim()) return res.status(400).json({ message: "Output is required before submitting" })
    if (!record.conclusion.trim()) return res.status(400).json({ message: "Conclusion is required before submitting" })

    record.status = "submitted"
    record.submissionCount += 1
    record.sendBackReason = ""
    await record.save()

    res.json({ message: "Record submitted for review", record })
  } catch (error) {
    console.error("submitRecord error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add inline comment (teacher)
const addInlineComment = async (req, res) => {
  try {
    const { section, selectedText, startOffset, endOffset, lineNumber, comment } = req.body
    const record = await RecordBook.findById(req.params.id)
    if (!record) return res.status(404).json({ message: "Record not found" })

    record.inlineComments.push({
      section,
      selectedText,
      startOffset,
      endOffset,
      lineNumber,
      comment,
      commentedBy: req.user.id,
      resolved: false,
    })

    record.status = "under_review"
    await record.save()

    const populated = await RecordBook.findById(record._id)
      .populate("inlineComments.commentedBy", "name role")

    res.json({ message: "Comment added", record: populated })
  } catch (error) {
    console.error("addInlineComment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Resolve inline comment
const resolveComment = async (req, res) => {
  try {
    const { commentId } = req.params
    const record = await RecordBook.findById(req.params.id)
    if (!record) return res.status(404).json({ message: "Record not found" })

    const comment = record.inlineComments.id(commentId)
    if (!comment) return res.status(404).json({ message: "Comment not found" })

    comment.resolved = true
    await record.save()

    res.json({ message: "Comment resolved" })
  } catch (error) {
    console.error("resolveComment error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Send back for re-edit (teacher)
const sendBack = async (req, res) => {
  try {
    const { reason, teacherRemarks } = req.body
    const record = await RecordBook.findById(req.params.id)
    if (!record) return res.status(404).json({ message: "Record not found" })

    record.status = "sent_back"
    record.sendBackReason = reason || ""
    record.teacherRemarks = teacherRemarks || ""
    await record.save()

    res.json({ message: "Record sent back for re-edit", record })
  } catch (error) {
    console.error("sendBack error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Approve record (teacher)
const approveRecord = async (req, res) => {
  try {
    const { teacherRemarks } = req.body
    const record = await RecordBook.findById(req.params.id)
    if (!record) return res.status(404).json({ message: "Record not found" })

    record.status = "approved"
    record.teacherRemarks = teacherRemarks || ""
    await record.save()

    res.json({ message: "Record approved", record })
  } catch (error) {
    console.error("approveRecord error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Digitally sign record (teacher)
const signRecord = async (req, res) => {
  try {
    const record = await RecordBook.findById(req.params.id)
      .populate("studentId", "name email rollNumber")

    if (!record) return res.status(404).json({ message: "Record not found" })

    if (record.status !== "approved") {
      return res.status(400).json({ message: "Record must be approved before signing" })
    }

    const signedAt = new Date()

    const docString = JSON.stringify({
      experimentId:     record.experimentId,
      experimentName:   record.experimentName,
      studentId:        record.studentId._id.toString(),
      aim:              record.aim,
      algorithmContent: record.algorithmContent,
      codeContent:      record.codeContent,
      output:           record.output,
      conclusion:       record.conclusion,
      signedBy:         req.user.id.toString(),
      signedAt:         signedAt.toISOString(),
    })

    const documentHash = crypto
      .createHash("sha256")
      .update(docString)
      .digest("hex")

    record.status = "signed"
    record.signature = {
      signedBy:     req.user.id,
      signedAt:     signedAt,
      documentHash,
    }

    await record.save()

    res.json({ message: "Record digitally signed and locked", documentHash, record })
  } catch (error) {
    console.error("signRecord error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Verify signature
const verifySignature = async (req, res) => {
  try {
    const record = await RecordBook.findById(req.params.id)
      .populate("studentId", "name email rollNumber")
      .populate("signature.signedBy", "name role")

    if (!record) return res.status(404).json({ message: "Record not found" })

    if (!record.signature?.documentHash) {
      return res.json({ verified: false, message: "Record is not signed" })
    }

    const docString = JSON.stringify({
      experimentId:     record.experimentId,
      experimentName:   record.experimentName,
      studentId:        record.studentId._id.toString(),
      aim:              record.aim,
      algorithmContent: record.algorithmContent,
      codeContent:      record.codeContent,
      output:           record.output,
      conclusion:       record.conclusion,
      signedBy:         record.signature.signedBy._id.toString(),
      signedAt:         record.signature.signedAt.toISOString(),
    })

    const recomputedHash = crypto
      .createHash("sha256")
      .update(docString)
      .digest("hex")

    const verified = recomputedHash === record.signature.documentHash

    res.json({
      verified,
      message: verified
        ? "Signature is valid — record is authentic"
        : "Signature mismatch — record may have been tampered",
      signedBy:     record.signature.signedBy,
      signedAt:     record.signature.signedAt,
      documentHash: record.signature.documentHash,
    })
  } catch (error) {
    console.error("verifySignature error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  createOrGetRecord,
  getMyRecords,
  getAllRecords,
  getRecord,
  updateRecord,
  submitRecord,
  addInlineComment,
  resolveComment,
  sendBack,
  approveRecord,
  signRecord,
  verifySignature,
}
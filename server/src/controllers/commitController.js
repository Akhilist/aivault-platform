const Commit = require("../models/Commit")

// Get all commits for an experiment
const getCommits = async (req, res) => {
  try {
    const { experimentId } = req.params

    const commits = await Commit.find({ experimentId })
      .populate("studentId", "name email rollNumber")
      .sort({ createdAt: 1 })

    res.json({ commits })
  } catch (error) {
    console.error("getCommits error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all experiments for a student
const getExperiments = async (req, res) => {
  try {
    const studentId = req.user.id

    const experiments = await Commit.aggregate([
      { $match: { studentId: require("mongoose").Types.ObjectId.createFromHexString(studentId), isLatest: true } },
      {
        $group: {
          _id: "$experimentId",
          experimentName: { $first: "$experimentName" },
          stages: { $push: "$stage" },
          isFinal: { $max: "$isFinal" },
          lastUpdated: { $max: "$updatedAt" },
        }
      },
      { $sort: { lastUpdated: -1 } }
    ])

    res.json({ experiments })
  } catch (error) {
    console.error("getExperiments error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get all experiments (teacher/hod view)
const getAllExperiments = async (req, res) => {
  try {
    const experiments = await Commit.aggregate([
      { $match: { isLatest: true } },
      {
        $group: {
          _id: { experimentId: "$experimentId", studentId: "$studentId" },
          experimentName: { $first: "$experimentName" },
          stages: { $push: "$stage" },
          isFinal: { $max: "$isFinal" },
          lastUpdated: { $max: "$updatedAt" },
          studentId: { $first: "$studentId" },
        }
      },
      { $sort: { lastUpdated: -1 } }
    ])

    const populated = await Commit.populate(experiments, {
      path: "studentId",
      select: "name email rollNumber",
    })

    res.json({ experiments: populated })
  } catch (error) {
    console.error("getAllExperiments error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Create a new commit
const createCommit = async (req, res) => {
  try {
    const {
      experimentId,
      experimentName,
      stage,
      content,
      commitMessage,
      language,
    } = req.body

    if (!experimentId || !experimentName || !stage || !content) {
      return res.status(400).json({ message: "experimentId, experimentName, stage, and content are required" })
    }

    // count existing commits for this stage
    const existingCount = await Commit.countDocuments({
      studentId: req.user.id,
      experimentId,
      stage,
    })

    // mark previous commits for this stage as not latest
    await Commit.updateMany(
      { studentId: req.user.id, experimentId, stage },
      { isLatest: false }
    )

    const commit = await Commit.create({
      studentId:      req.user.id,
      experimentId,
      experimentName,
      stage,
      content,
      commitMessage:  commitMessage || `${stage} commit ${existingCount + 1}`,
      commitNumber:   existingCount + 1,
      language:       language || null,
      isFinal:        false,
      isLatest:       true,
    })

    res.status(201).json({ message: "Commit saved", commit })
  } catch (error) {
    console.error("createCommit error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Final submit — lock all commits
const finalSubmit = async (req, res) => {
  try {
    const { experimentId } = req.params

    const commits = await Commit.find({
      studentId: req.user.id,
      experimentId,
    })

    if (commits.length === 0) {
      return res.status(404).json({ message: "No commits found for this experiment" })
    }

    await Commit.updateMany(
      { studentId: req.user.id, experimentId },
      { isFinal: true }
    )

    res.json({ message: "Experiment finally submitted and locked" })
  } catch (error) {
    console.error("finalSubmit error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Teacher adds note to a commit
const addNote = async (req, res) => {
  try {
    const { note } = req.body
    const commit = await Commit.findByIdAndUpdate(
      req.params.commitId,
      { teacherNote: note },
      { new: true }
    )
    if (!commit) return res.status(404).json({ message: "Commit not found" })
    res.json({ message: "Note added", commit })
  } catch (error) {
    console.error("addNote error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get commit history for a stage (diff view)
const getStageHistory = async (req, res) => {
  try {
    const { experimentId, stage } = req.params

    const commits = await Commit.find({
      experimentId,
      stage,
    }).sort({ commitNumber: 1 })

    res.json({ commits })
  } catch (error) {
    console.error("getStageHistory error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  getCommits,
  getExperiments,
  getAllExperiments,
  createCommit,
  finalSubmit,
  addNote,
  getStageHistory,
}
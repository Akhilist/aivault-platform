const express = require("express")
const {
  getCommits,
  getExperiments,
  getAllExperiments,
  createCommit,
  finalSubmit,
  addNote,
  getStageHistory,
} = require("../controllers/commitController")
const { protect, authorizeRoles } = require("../middleware/authMiddleware")

const router = express.Router()

router.get(
  "/experiments",
  protect,
  authorizeRoles("student"),
  getExperiments
)

router.get(
  "/experiments/all",
  protect,
  authorizeRoles("teacher", "hod", "exam_controller"),
  getAllExperiments
)

router.get(
  "/:experimentId",
  protect,
  authorizeRoles("student", "teacher", "hod"),
  getCommits
)

router.get(
  "/:experimentId/:stage/history",
  protect,
  authorizeRoles("student", "teacher", "hod"),
  getStageHistory
)

router.post(
  "/",
  protect,
  authorizeRoles("student"),
  createCommit
)

router.put(
  "/:experimentId/finalize",
  protect,
  authorizeRoles("student"),
  finalSubmit
)

router.put(
  "/note/:commitId",
  protect,
  authorizeRoles("teacher", "hod"),
  addNote
)

module.exports = router
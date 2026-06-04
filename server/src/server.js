const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const http = require("http")
const { Server } = require("socket.io")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const testRoutes = require("./routes/testRoutes")
const questionRoutes = require("./routes/questionRoutes")
const examRoutes = require("./routes/examRoutes")
const codeRoutes = require("./routes/codeRoutes")
const commitRoutes = require("./routes/commitRoutes")
const aiRoutes = require("./routes/aiRoutes")
const submissionRoutes = require("./routes/submissionRoutes")
const recordBookRoutes = require("./routes/recordBookRoutes")
const feedbackRoutes = require("./routes/feedbackRoutes")

dotenv.config()
connectDB()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
})

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/test", testRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/exams", examRoutes)
app.use("/api/code", codeRoutes)
app.use("/api/commits", commitRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/submissions", submissionRoutes)
app.use("/api/records", recordBookRoutes)
app.use("/api/feedback", feedbackRoutes)

app.get("/", (req, res) => {
  res.json({ message: "AIVault API Running" })
})

// Socket.io — Live Polling
const activePolls = {}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("join-session", (sessionId) => {
    socket.join(sessionId)
    console.log(`${socket.id} joined session ${sessionId}`)
    if (activePolls[sessionId]) {
      socket.emit("poll-launched", activePolls[sessionId])
    }
  })

  socket.on("launch-poll", ({ sessionId, poll }) => {
    activePolls[sessionId] = { ...poll, responses: {} }
    io.to(sessionId).emit("poll-launched", activePolls[sessionId])
  })

  socket.on("submit-vote", ({ sessionId, optionIndex, studentId }) => {
    if (!activePolls[sessionId]) return
    activePolls[sessionId].responses[studentId] = optionIndex
    const counts = activePolls[sessionId].options.map((_, i) =>
      Object.values(activePolls[sessionId].responses).filter(v => v === i).length
    )
    io.to(sessionId).emit("poll-updated", {
      counts,
      total: Object.keys(activePolls[sessionId].responses).length,
    })
  })

  socket.on("end-poll", ({ sessionId }) => {
    if (activePolls[sessionId]) {
      io.to(sessionId).emit("poll-ended")
      delete activePolls[sessionId]
    }
  })

  socket.on("reveal-results", ({ sessionId }) => {
    io.to(sessionId).emit("results-revealed")
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
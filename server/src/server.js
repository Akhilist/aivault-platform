const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
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

dotenv.config()
connectDB()

const app = express()

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

app.get("/", (req, res) => {
  res.json({ message: "AIVault API Running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
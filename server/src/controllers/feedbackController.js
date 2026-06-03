const Feedback = require("../models/Feedback")
const axios = require("axios")

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const callGroq = async (prompt) => {
  const response = await axios.post(
    GROQ_API_URL,
    {
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
    }
  )
  return response.data.choices[0].message.content
}

const createForm = async (req, res) => {
  try {
    const { title, description, questions, examId, closeWindow } = req.body
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Title and questions are required" })
    }
    const feedback = await Feedback.create({
      createdBy: req.user.id,
      title,
      description,
      questions,
      examId: examId || null,
      closeWindow: closeWindow || null,
      isOpen: true,
    })
    res.status(201).json({ message: "Feedback form created", feedback })
  } catch (error) {
    console.error("createForm error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getForms = async (req, res) => {
  try {
    let filter = {}
    if (req.user.role === "teacher") filter.createdBy = req.user.id
    const forms = await Feedback.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
    res.json({ forms })
  } catch (error) {
    console.error("getForms error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getOpenForms = async (req, res) => {
  try {
    const forms = await Feedback.find({ isOpen: true })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
    res.json({ forms })
  } catch (error) {
    console.error("getOpenForms error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const getForm = async (req, res) => {
  try {
    const form = await Feedback.findById(req.params.id)
      .populate("createdBy", "name email")
    if (!form) return res.status(404).json({ message: "Form not found" })
    res.json({ form })
  } catch (error) {
    console.error("getForm error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const submitResponse = async (req, res) => {
  try {
    const { answers } = req.body
    const form = await Feedback.findById(req.params.id)
    if (!form) return res.status(404).json({ message: "Form not found" })
    if (!form.isOpen) return res.status(400).json({ message: "This form is closed" })
    form.responses.push({ answers, submittedAt: new Date() })
    await form.save()
    res.json({ message: "Response submitted anonymously" })
  } catch (error) {
    console.error("submitResponse error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const closeForm = async (req, res) => {
  try {
    const form = await Feedback.findByIdAndUpdate(
      req.params.id,
      { isOpen: false },
      { new: true }
    )
    if (!form) return res.status(404).json({ message: "Form not found" })
    res.json({ message: "Form closed", form })
  } catch (error) {
    console.error("closeForm error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

const summariseForm = async (req, res) => {
  try {
    const form = await Feedback.findById(req.params.id)
    if (!form) return res.status(404).json({ message: "Form not found" })
    if (form.responses.length === 0) {
      return res.status(400).json({ message: "No responses to summarise" })
    }

    const textResponses = []
    form.responses.forEach(r => {
      r.answers.forEach((ans, i) => {
        const q = form.questions[i]
        if (q && q.type === "text" && ans) {
          textResponses.push(`Q: ${q.text} — A: ${ans}`)
        }
      })
    })

    const ratingResponses = []
    form.questions.forEach((q, qi) => {
      if (q.type === "rating") {
        const ratings = form.responses
          .map(r => r.answers[qi])
          .filter(a => a !== undefined && a !== null)
          .map(Number)
        if (ratings.length > 0) {
          const avg = (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
          ratingResponses.push(`${q.text}: avg rating ${avg}/5`)
        }
      }
    })

    const prompt = `You are analyzing student feedback for a teacher. Summarize these responses.

Rating Averages:
${ratingResponses.join("\n") || "No rating questions"}

Text Responses:
${textResponses.join("\n") || "No text responses"}

Total responses: ${form.responses.length}

Respond ONLY in this exact JSON format:
{
  "keyThemes": ["theme 1", "theme 2"],
  "commonComplaints": ["complaint 1", "complaint 2"],
  "positiveHighlights": ["positive 1", "positive 2"],
  "suggestedActions": ["action 1", "action 2"],
  "overallSentiment": "positive|neutral|negative",
  "summary": "2-3 sentence overall summary"
}`

    const result = await callGroq(prompt)
    let parsed
    try {
      const clean = result.replace(/```json|```/g, "").trim()
      parsed = JSON.parse(clean)
    } catch {
      parsed = { summary: result, keyThemes: [], commonComplaints: [], positiveHighlights: [], suggestedActions: [], overallSentiment: "neutral" }
    }

    form.aiSummary = JSON.stringify(parsed)
    form.summaryGeneratedAt = new Date()
    await form.save()

    res.json({ message: "Summary generated", summary: parsed })
  } catch (error) {
    console.error("summariseForm error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

module.exports = {
  createForm,
  getForms,
  getOpenForms,
  getForm,
  submitResponse,
  closeForm,
  summariseForm,
}
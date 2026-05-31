import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

export default function GradingPanel() {
  const { examId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const headers = { Authorization: `Bearer ${token}` }

  const [submissions, setSubmissions] = useState([])
  const [selectedSub, setSelectedSub] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiLoading, setAiLoading] = useState({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [publishing, setPublishing] = useState(false)
  const [localGrades, setLocalGrades] = useState({})
  const [localComments, setLocalComments] = useState({})

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/submissions/exam/${examId}`, { headers })
      setSubmissions(res.data.submissions)
    } catch (err) {
      setError("Failed to load submissions")
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmission = async (id) => {
    try {
      const res = await axios.get(`${API}/submissions/${id}`, { headers })
      setSelectedSub(res.data.submission)
      const grades = {}
      const comments = {}
      res.data.submission.answers.forEach(a => {
        const qId = a.questionId?._id
        grades[qId] = a.marks ?? a.aiScore ?? ""
        comments[qId] = a.teacherComment || ""
      })
      setLocalGrades(grades)
      setLocalComments(comments)
    } catch (err) {
      setError("Failed to load submission")
    }
  }

  useEffect(() => { fetchSubmissions() }, [])

  const handleAIGrade = async (answer) => {
    const qId = answer.questionId?._id
    setAiLoading(prev => ({ ...prev, [qId]: true }))
    try {
      const res = await axios.post(`${API}/ai/grade`, {
        question:      answer.questionId?.text,
        modelAnswer:   answer.questionId?.rubric,
        studentAnswer: answer.answer,
        maxMarks:      answer.maxMarks,
      }, { headers })

      await axios.post(`${API}/submissions/ai-grade`, {
        submissionId:    selectedSub._id,
        questionId:      qId,
        aiScore:         res.data.score,
        aiJustification: res.data.justification,
        aiFeedback:      res.data.feedback,
      }, { headers })

      setLocalGrades(prev => ({ ...prev, [qId]: res.data.score }))
      await fetchSubmission(selectedSub._id)
      setSuccess("AI grading complete")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("AI grading failed")
    } finally {
      setAiLoading(prev => ({ ...prev, [qId]: false }))
    }
  }

  const handleGrade = async (answer, marks, comment) => {
    const qId = answer.questionId?._id
    try {
      await axios.post(`${API}/submissions/grade-answer`, {
        submissionId:   selectedSub._id,
        questionId:     qId,
        marks:          parseFloat(marks),
        teacherComment: comment,
      }, { headers })
      await fetchSubmission(selectedSub._id)
      await fetchSubmissions()
      setSuccess("Answer graded")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Grading failed")
    }
  }

  const handlePublish = async () => {
    if (!window.confirm("Publish results to all students?")) return
    setPublishing(true)
    try {
      await axios.put(`${API}/submissions/publish/${examId}`, {}, { headers })
      setSuccess("Results published to all students")
      await fetchSubmissions()
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      setError("Failed to publish results")
    } finally {
      setPublishing(false)
    }
  }

  const STATUS_COLORS = {
    started:   { bg: "#FAEEDA", color: "#854F0B" },
    submitted: { bg: "#E6F1FB", color: "#185FA5" },
    graded:    { bg: "#EEEDFE", color: "#534AB7" },
    published: { bg: "#EAF3DE", color: "#3B6D11" },
  }

  const btn = (bg, color, disabled) => ({
    padding: "7px 14px",
    background: disabled ? "#D3D1C7" : bg,
    color: disabled ? "#888780" : color,
    border: "none",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
  })

  const input = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #D3D1C7",
    background: "#FAFAF8",
    fontSize: "13px",
    color: "#2C2C2A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "6px",
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <button onClick={() => navigate("/exams")} style={{ background: "none", border: "none", cursor: "pointer", color: "#185FA5", fontSize: "13px", padding: 0, marginBottom: "4px", display: "block" }}>
            ← Back to Exams
          </button>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
            Grading Panel
          </h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            {submissions.length} submissions
          </p>
        </div>
        <button
          onClick={handlePublish}
          disabled={publishing || submissions.every(s => s.status !== "graded")}
          style={btn("#3B6D11", "white", publishing || submissions.every(s => s.status !== "graded"))}
        >
          {publishing ? "Publishing..." : "Publish Results"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {success && (
        <div style={{ background: "#EAF3DE", border: "1px solid #B8D9A0", color: "#3B6D11", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", height: "calc(100vh - 180px)" }}>

        {/* Left — student list */}
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            Students
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>Loading...</div>
            ) : submissions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>No submissions yet</div>
            ) : (
              submissions.map(sub => (
                <div
                  key={sub._id}
                  onClick={() => fetchSubmission(sub._id)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #F1EFE8",
                    cursor: "pointer",
                    background: selectedSub?._id === sub._id ? "#E6F1FB" : "transparent",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>
                    {sub.studentId?.name}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "6px" }}>
                    {sub.studentId?.email}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "20px",
                      background: STATUS_COLORS[sub.status]?.bg,
                      color: STATUS_COLORS[sub.status]?.color,
                    }}>
                      {sub.status}
                    </span>
                    {sub.totalScore !== null && (
                      <span style={{ fontSize: "12px", fontWeight: "600", color: "#2C2C2A" }}>
                        {sub.totalScore}/{sub.totalMarks}
                      </span>
                    )}
                  </div>
                  {sub.violations > 0 && (
                    <div style={{ fontSize: "11px", color: "#993C1D", marginTop: "4px" }}>
                      ⚠ {sub.violations} violation{sub.violations > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — grading area */}
        {!selectedSub ? (
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#888780" }}>
              <i className="ti ti-clipboard" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
              <div style={{ fontSize: "14px" }}>Select a student to start grading</div>
            </div>
          </div>
        ) : (
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>

            {/* Student header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #D3D1C7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: "#2C2C2A", fontFamily: "'Lora', serif" }}>
                  {selectedSub.studentId?.name}
                </div>
                <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>
                  Submitted: {new Date(selectedSub.submitTime).toLocaleString()}
                  {selectedSub.autoSubmitted && " · Auto submitted"}
                  {selectedSub.violations > 0 && ` · ${selectedSub.violations} violations`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                {selectedSub.totalScore !== null && (
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#185FA5" }}>
                    {selectedSub.totalScore}/{selectedSub.totalMarks}
                  </div>
                )}
                <div style={{ fontSize: "12px", color: selectedSub.passed ? "#3B6D11" : selectedSub.passed === false ? "#993C1D" : "#888780" }}>
                  {selectedSub.passed === true ? "Passed" : selectedSub.passed === false ? "Failed" : "Pending grading"}
                </div>
              </div>
            </div>

            {/* Answers */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {selectedSub.answers?.map((answer, i) => {
                const q = answer.questionId
                const qId = q?._id
                const isMCQ = q?.type === "mcq"
                const localMarks = localGrades[qId] ?? ""
                const localComment = localComments[qId] ?? ""

                return (
                  <div key={qId || i} style={{ marginBottom: "20px", padding: "16px", background: "#F5F3EE", borderRadius: "12px" }}>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <div style={{ fontSize: "11.5px", color: "#888780" }}>
                        Q{i + 1} · {q?.type} · {answer.maxMarks} marks
                      </div>
                      {answer.isGraded && (
                        <span style={{ fontSize: "11.5px", fontWeight: "500", padding: "1px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" }}>
                          Graded: {answer.marks}/{answer.maxMarks}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: "14px", fontWeight: "500", color: "#2C2C2A", marginBottom: "10px", lineHeight: "1.5" }}>
                      {q?.text}
                    </div>

                    <div style={{ padding: "10px 14px", background: "white", borderRadius: "8px", marginBottom: "10px", border: "1px solid #D3D1C7" }}>
                      <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "4px" }}>Student Answer</div>
                      <div style={{ fontSize: "13.5px", color: "#2C2C2A", lineHeight: "1.6", fontFamily: q?.type === "coding" ? "monospace" : "'DM Sans', sans-serif", whiteSpace: q?.type === "coding" ? "pre-wrap" : "normal" }}>
                        {answer.answer || <span style={{ color: "#B4B2A9", fontStyle: "italic" }}>No answer provided</span>}
                      </div>
                    </div>

                    {isMCQ && (
                      <div style={{ padding: "8px 12px", background: answer.marks > 0 ? "#EAF3DE" : "#FAECE7", borderRadius: "8px", fontSize: "13px", color: answer.marks > 0 ? "#3B6D11" : "#993C1D" }}>
                        {answer.marks > 0 ? "Correct" : "Incorrect"} · Auto graded · Correct answer: {q?.correctAnswer}
                      </div>
                    )}

                    {!isMCQ && (
                      <div>
                        {q?.rubric && (
                          <div style={{ padding: "8px 12px", background: "#E6F1FB", borderRadius: "8px", marginBottom: "10px", fontSize: "12.5px" }}>
                            <div style={{ fontWeight: "500", color: "#185FA5", marginBottom: "4px" }}>Model Answer</div>
                            <div style={{ color: "#2C2C2A" }}>{q.rubric}</div>
                          </div>
                        )}

                        {answer.aiScore !== null && answer.aiScore !== undefined && (
                          <div style={{ padding: "10px 12px", background: "#EEEDFE", borderRadius: "8px", marginBottom: "10px", fontSize: "13px" }}>
                            <div style={{ fontWeight: "500", color: "#534AB7", marginBottom: "4px" }}>
                              AI Suggestion: {answer.aiScore}/{answer.maxMarks}
                            </div>
                            <div style={{ color: "#2C2C2A", fontSize: "12.5px" }}>{answer.aiJustification}</div>
                            {answer.aiFeedback && (
                              <div style={{ color: "#5F5E5A", fontSize: "12px", marginTop: "4px" }}>Feedback: {answer.aiFeedback}</div>
                            )}
                          </div>
                        )}

                        <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <input
                              type="number"
                              min="0"
                              max={answer.maxMarks}
                              placeholder={`Marks (0-${answer.maxMarks})`}
                              value={localMarks}
                              onChange={e => setLocalGrades(prev => ({ ...prev, [qId]: e.target.value }))}
                              style={input}
                            />
                            <input
                              type="text"
                              placeholder="Teacher comment (optional)..."
                              value={localComment}
                              onChange={e => setLocalComments(prev => ({ ...prev, [qId]: e.target.value }))}
                              style={{ ...input, marginBottom: 0 }}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                            <button
                              onClick={() => handleAIGrade(answer)}
                              disabled={aiLoading[qId]}
                              style={btn("#EEEDFE", "#534AB7", aiLoading[qId])}
                            >
                              {aiLoading[qId] ? "Asking AI..." : "AI Grade"}
                            </button>
                            <button
                              onClick={() => handleGrade(answer, localMarks, localComment)}
                              disabled={localMarks === ""}
                              style={btn("#185FA5", "white", localMarks === "")}
                            >
                              Save Grade
                            </button>
                            {answer.aiScore !== null && answer.aiScore !== undefined && (
                              <button
                                onClick={() => {
                                  setLocalGrades(prev => ({ ...prev, [qId]: answer.aiScore }))
                                  handleGrade(answer, answer.aiScore, localComment)
                                }}
                                style={btn("#EAF3DE", "#3B6D11", false)}
                              >
                                Accept AI
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
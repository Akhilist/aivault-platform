import { useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

export default function AIAnalysis() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [activeTab, setActiveTab] = useState("grade")

  // Grade answer state
  const [gradeForm, setGradeForm] = useState({
    question: "",
    modelAnswer: "",
    studentAnswer: "",
    maxMarks: 10,
  })
  const [gradeResult, setGradeResult] = useState(null)
  const [grading, setGrading] = useState(false)

  // Plagiarism state
  const [plagQuestion, setPlagQuestion] = useState("")
  const [plagAnswers, setPlagAnswers] = useState([
    { studentId: "Student 1", answer: "" },
    { studentId: "Student 2", answer: "" },
  ])
  const [plagResult, setPlagResult] = useState(null)
  const [checking, setChecking] = useState(false)

  // Code review state
  const [codeForm, setCodeForm] = useState({
    question: "",
    code: "",
    language: "python",
  })
  const [codeResult, setCodeResult] = useState(null)
  const [reviewing, setReviewing] = useState(false)

  // Generate questions state
  const [genForm, setGenForm] = useState({
    topic: "",
    subject: "",
    count: 5,
    difficulty: "medium",
  })
  const [genResult, setGenResult] = useState(null)
  const [generating, setGenerating] = useState(false)

  const [error, setError] = useState("")

  const handleGrade = async () => {
    if (!gradeForm.question || !gradeForm.studentAnswer) return setError("Question and student answer are required")
    setError("")
    setGrading(true)
    setGradeResult(null)
    try {
      const res = await axios.post(`${API}/ai/grade`, gradeForm, { headers })
      setGradeResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "AI grading failed")
    } finally {
      setGrading(false)
    }
  }

  const handlePlagiarism = async () => {
    if (!plagQuestion) return setError("Question is required")
    if (plagAnswers.some(a => !a.answer.trim())) return setError("All answers must be filled")
    setError("")
    setChecking(true)
    setPlagResult(null)
    try {
      const res = await axios.post(`${API}/ai/plagiarism`, {
        question: plagQuestion,
        answers: plagAnswers,
      }, { headers })
      setPlagResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Plagiarism check failed")
    } finally {
      setChecking(false)
    }
  }

  const handleCodeReview = async () => {
    if (!codeForm.code) return setError("Code is required")
    setError("")
    setReviewing(true)
    setCodeResult(null)
    try {
      const res = await axios.post(`${API}/ai/review-code`, codeForm, { headers })
      setCodeResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Code review failed")
    } finally {
      setReviewing(false)
    }
  }

  const handleGenerate = async () => {
    if (!genForm.topic || !genForm.subject) return setError("Topic and subject are required")
    setError("")
    setGenerating(true)
    setGenResult(null)
    try {
      const res = await axios.post(`${API}/ai/generate-questions`, genForm, { headers })
      setGenResult(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Question generation failed")
    } finally {
      setGenerating(false)
    }
  }

  const TABS = [
    { id: "grade",     label: "Grade Answer",       icon: "ti-check" },
    { id: "plagiarism",label: "Plagiarism Check",   icon: "ti-copy" },
    { id: "code",      label: "Code Review",        icon: "ti-code" },
    { id: "generate",  label: "Generate Questions", icon: "ti-brain" },
  ]

  const input = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #D3D1C7",
    background: "#FAFAF8",
    fontSize: "13.5px",
    color: "#2C2C2A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "10px",
  }

  const label = {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "500",
    color: "#2C2C2A",
    marginBottom: "5px",
  }

  const btn = (bg, color, disabled) => ({
    padding: "9px 20px",
    background: disabled ? "#D3D1C7" : bg,
    color: disabled ? "#888780" : color,
    border: "none",
    borderRadius: "8px",
    fontSize: "13.5px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  })

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  }

  const resultCard = (bg, color) => ({
    background: bg,
    border: `1px solid ${color}30`,
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "10px",
  })

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          AI Answer Analysis
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Powered by Gemini AI — grade answers, detect plagiarism, review code, generate questions
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setError("") }}
            style={{
              padding: "8px 16px",
              background: activeTab === tab.id ? "#185FA5" : "white",
              color: activeTab === tab.id ? "white" : "#5F5E5A",
              border: "1px solid",
              borderColor: activeTab === tab.id ? "#185FA5" : "#D3D1C7",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: activeTab === tab.id ? "500" : "400",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ fontSize: "14px" }}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grade Answer tab */}
      {activeTab === "grade" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={card}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
              Answer Details
            </h2>
            <label style={label}>Question</label>
            <textarea
              placeholder="Enter the exam question..."
              value={gradeForm.question}
              onChange={e => setGradeForm({ ...gradeForm, question: e.target.value })}
              rows={3}
              style={{ ...input, resize: "vertical" }}
            />
            <label style={label}>Model Answer or Rubric (optional)</label>
            <textarea
              placeholder="Enter model answer or marking rubric..."
              value={gradeForm.modelAnswer}
              onChange={e => setGradeForm({ ...gradeForm, modelAnswer: e.target.value })}
              rows={3}
              style={{ ...input, resize: "vertical" }}
            />
            <label style={label}>Student Answer</label>
            <textarea
              placeholder="Enter student's answer..."
              value={gradeForm.studentAnswer}
              onChange={e => setGradeForm({ ...gradeForm, studentAnswer: e.target.value })}
              rows={4}
              style={{ ...input, resize: "vertical" }}
            />
            <label style={label}>Maximum Marks</label>
            <input
              type="number"
              min="1"
              value={gradeForm.maxMarks}
              onChange={e => setGradeForm({ ...gradeForm, maxMarks: parseInt(e.target.value) || 10 })}
              style={input}
            />
            <button onClick={handleGrade} disabled={grading} style={btn("#185FA5", "white", grading)}>
              <i className="ti ti-brain" style={{ fontSize: "14px" }}></i>
              {grading ? "Grading..." : "Grade with AI"}
            </button>
          </div>

          <div>
            {gradeResult ? (
              <div style={card}>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                  AI Grading Result
                </h2>
                <div style={{ ...resultCard("#E6F1FB", "#185FA5"), textAlign: "center" }}>
                  <div style={{ fontSize: "11px", color: "#185FA5", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Score</div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "36px", fontWeight: "600", color: "#185FA5" }}>
                    {gradeResult.score}
                    <span style={{ fontSize: "18px", color: "#888780" }}>/{gradeForm.maxMarks}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#185FA5", marginTop: "4px" }}>
                    {Math.round((gradeResult.score / gradeForm.maxMarks) * 100)}%
                  </div>
                </div>

                <div style={resultCard("#F5F3EE", "#888780")}>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "6px" }}>Justification</div>
                  <div style={{ fontSize: "13.5px", color: "#2C2C2A", lineHeight: "1.6" }}>{gradeResult.justification}</div>
                </div>

                {gradeResult.feedback && (
                  <div style={resultCard("#EAF3DE", "#3B6D11")}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#3B6D11", marginBottom: "6px" }}>Feedback for Student</div>
                    <div style={{ fontSize: "13.5px", color: "#2C2C2A", lineHeight: "1.6" }}>{gradeResult.feedback}</div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
                <i className="ti ti-brain" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                <div style={{ fontSize: "14px" }}>Fill in the form and click Grade with AI</div>
                <div style={{ fontSize: "12px", marginTop: "6px" }}>Gemini will suggest a score and justification</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plagiarism tab */}
      {activeTab === "plagiarism" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={card}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
              Student Answers
            </h2>
            <label style={label}>Question</label>
            <textarea
              placeholder="Enter the exam question..."
              value={plagQuestion}
              onChange={e => setPlagQuestion(e.target.value)}
              rows={2}
              style={{ ...input, resize: "vertical" }}
            />

            {plagAnswers.map((ans, i) => (
              <div key={i} style={{ marginBottom: "12px", padding: "12px", background: "#F5F3EE", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <input
                    type="text"
                    placeholder="Student name or ID"
                    value={ans.studentId}
                    onChange={e => {
                      const updated = [...plagAnswers]
                      updated[i].studentId = e.target.value
                      setPlagAnswers(updated)
                    }}
                    style={{ ...input, marginBottom: 0, width: "60%" }}
                  />
                  {plagAnswers.length > 2 && (
                    <button
                      onClick={() => setPlagAnswers(plagAnswers.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: "#993C1D", cursor: "pointer", fontSize: "14px" }}
                    >
                      x
                    </button>
                  )}
                </div>
                <textarea
                  placeholder={`Student ${i + 1} answer...`}
                  value={ans.answer}
                  onChange={e => {
                    const updated = [...plagAnswers]
                    updated[i].answer = e.target.value
                    setPlagAnswers(updated)
                  }}
                  rows={3}
                  style={{ ...input, marginBottom: 0, resize: "vertical" }}
                />
              </div>
            ))}

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setPlagAnswers([...plagAnswers, { studentId: `Student ${plagAnswers.length + 1}`, answer: "" }])}
                style={btn("#F1EFE8", "#185FA5", false)}
              >
                + Add Student
              </button>
              <button onClick={handlePlagiarism} disabled={checking} style={btn("#185FA5", "white", checking)}>
                <i className="ti ti-copy" style={{ fontSize: "14px" }}></i>
                {checking ? "Checking..." : "Check Plagiarism"}
              </button>
            </div>
          </div>

          <div>
            {plagResult ? (
              <div style={card}>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                  Plagiarism Report
                </h2>

                <div style={resultCard("#F5F3EE", "#888780")}>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "6px" }}>Summary</div>
                  <div style={{ fontSize: "13.5px", color: "#2C2C2A", lineHeight: "1.6" }}>{plagResult.summary}</div>
                </div>

                {plagResult.flaggedPairs?.length === 0 ? (
                  <div style={resultCard("#EAF3DE", "#3B6D11")}>
                    <div style={{ fontSize: "13.5px", color: "#3B6D11", fontWeight: "500" }}>
                      No plagiarism detected
                    </div>
                  </div>
                ) : (
                  plagResult.flaggedPairs?.map((pair, i) => (
                    <div key={i} style={resultCard("#FAECE7", "#993C1D")}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "500", color: "#993C1D" }}>
                          Flagged Pair {i + 1}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#993C1D" }}>
                          {pair.similarityScore}% similar
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", color: "#2C2C2A", marginBottom: "4px" }}>
                        {pair.student1} and {pair.student2}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#5F5E5A" }}>{pair.reason}</div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
                <i className="ti ti-copy" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                <div style={{ fontSize: "14px" }}>Add student answers and check for plagiarism</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Code review tab */}
      {activeTab === "code" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={card}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
              Code Submission
            </h2>
            <label style={label}>Question or Problem Statement</label>
            <textarea
              placeholder="Enter the coding question..."
              value={codeForm.question}
              onChange={e => setCodeForm({ ...codeForm, question: e.target.value })}
              rows={2}
              style={{ ...input, resize: "vertical" }}
            />
            <label style={label}>Language</label>
            <select
              value={codeForm.language}
              onChange={e => setCodeForm({ ...codeForm, language: e.target.value })}
              style={input}
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
            <label style={label}>Student Code</label>
            <textarea
              placeholder="Paste student code here..."
              value={codeForm.code}
              onChange={e => setCodeForm({ ...codeForm, code: e.target.value })}
              rows={10}
              style={{ ...input, fontFamily: "monospace", resize: "vertical", background: "#1E1E2E", color: "#CDD6F4", border: "1px solid #3E3E5E" }}
            />
            <button onClick={handleCodeReview} disabled={reviewing} style={btn("#185FA5", "white", reviewing)}>
              <i className="ti ti-code" style={{ fontSize: "14px" }}></i>
              {reviewing ? "Reviewing..." : "Review with AI"}
            </button>
          </div>

          <div>
            {codeResult ? (
              <div style={card}>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                  Code Review Report
                </h2>

                <div style={resultCard("#F5F3EE", "#888780")}>
                  <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "6px" }}>Overall Assessment</div>
                  <div style={{ fontSize: "13.5px", color: "#2C2C2A", lineHeight: "1.6" }}>{codeResult.overallFeedback}</div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <span style={{
                      fontSize: "11.5px", fontWeight: "500", padding: "2px 9px", borderRadius: "20px",
                      background: codeResult.codeQuality === "good" ? "#EAF3DE" : codeResult.codeQuality === "average" ? "#FAEEDA" : "#FAECE7",
                      color: codeResult.codeQuality === "good" ? "#3B6D11" : codeResult.codeQuality === "average" ? "#854F0B" : "#993C1D",
                    }}>
                      Quality: {codeResult.codeQuality}
                    </span>
                    {codeResult.timeComplexity && (
                      <span style={{ fontSize: "11.5px", padding: "2px 9px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                        Time: {codeResult.timeComplexity}
                      </span>
                    )}
                  </div>
                </div>

                {codeResult.logicalErrors?.length > 0 && (
                  <div style={resultCard("#FAECE7", "#993C1D")}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#993C1D", marginBottom: "8px" }}>Logical Errors</div>
                    {codeResult.logicalErrors.map((e, i) => (
                      <div key={i} style={{ fontSize: "13px", color: "#2C2C2A", marginBottom: "4px" }}>
                        {i + 1}. {e}
                      </div>
                    ))}
                  </div>
                )}

                {codeResult.improvements?.length > 0 && (
                  <div style={resultCard("#EAF3DE", "#3B6D11")}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#3B6D11", marginBottom: "8px" }}>Suggested Improvements</div>
                    {codeResult.improvements.map((imp, i) => (
                      <div key={i} style={{ fontSize: "13px", color: "#2C2C2A", marginBottom: "4px" }}>
                        {i + 1}. {imp}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
                <i className="ti ti-code" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                <div style={{ fontSize: "14px" }}>Paste student code and get an AI review</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate questions tab */}
      {activeTab === "generate" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={card}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
              Generate MCQ Questions
            </h2>
            <label style={label}>Subject</label>
            <input
              type="text"
              placeholder="e.g. Data Structures"
              value={genForm.subject}
              onChange={e => setGenForm({ ...genForm, subject: e.target.value })}
              style={input}
            />
            <label style={label}>Topic</label>
            <input
              type="text"
              placeholder="e.g. Binary Search Trees"
              value={genForm.topic}
              onChange={e => setGenForm({ ...genForm, topic: e.target.value })}
              style={input}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={label}>Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={genForm.count}
                  onChange={e => setGenForm({ ...genForm, count: parseInt(e.target.value) || 5 })}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Difficulty</label>
                <select
                  value={genForm.difficulty}
                  onChange={e => setGenForm({ ...genForm, difficulty: e.target.value })}
                  style={input}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <button onClick={handleGenerate} disabled={generating} style={btn("#185FA5", "white", generating)}>
              <i className="ti ti-brain" style={{ fontSize: "14px" }}></i>
              {generating ? "Generating..." : "Generate Questions"}
            </button>
          </div>

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {genResult ? (
              <div style={card}>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                  Generated Questions ({genResult.questions?.length || 0})
                </h2>
                {genResult.questions?.map((q, i) => (
                  <div key={i} style={{ marginBottom: "16px", padding: "14px", background: "#F5F3EE", borderRadius: "10px" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: "500", color: "#2C2C2A", marginBottom: "10px" }}>
                      {i + 1}. {q.text}
                    </div>
                    {q.options?.map((opt, j) => (
                      <div key={j} style={{
                        fontSize: "13px",
                        padding: "5px 10px",
                        borderRadius: "6px",
                        marginBottom: "4px",
                        background: opt === q.correctAnswer ? "#EAF3DE" : "white",
                        color: opt === q.correctAnswer ? "#3B6D11" : "#5F5E5A",
                        fontWeight: opt === q.correctAnswer ? "500" : "400",
                      }}>
                        {String.fromCharCode(65 + j)}. {opt}
                        {opt === q.correctAnswer && " ✓"}
                      </div>
                    ))}
                    {q.explanation && (
                      <div style={{ fontSize: "12px", color: "#888780", marginTop: "8px", fontStyle: "italic" }}>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
                <i className="ti ti-brain" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                <div style={{ fontSize: "14px" }}>Enter a topic and generate MCQ questions instantly</div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
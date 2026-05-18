import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

export default function TakeExam() {
  const { examId } = useParams()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const headers = { Authorization: `Bearer ${token}` }

  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [violations, setViolations] = useState(0)
  const [warningMsg, setWarningMsg] = useState("")
  const [currentQ, setCurrentQ] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const timerRef = useRef(null)
  const violationRef = useRef(0)
  const submittedRef = useRef(false)

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`${API}/exams/${examId}`, { headers })
        setExam(res.data.exam)
        setTimeLeft(res.data.exam.duration * 60)
      } catch (err) {
        alert("Failed to load exam")
        navigate("/exams")
      } finally {
        setLoading(false)
      }
    }
    fetchExam()
  }, [examId])

  const handleSubmit = useCallback(async (auto = false) => {
    if (submittedRef.current) return
    if (!auto && !window.confirm("Are you sure you want to submit?")) return
    submittedRef.current = true
    setSubmitted(true)
    clearInterval(timerRef.current)
    if (document.fullscreenElement) document.exitFullscreen()
    alert(auto ? "Time is up! Exam auto-submitted." : "Exam submitted successfully!")
    navigate("/exams")
  }, [navigate])

  useEffect(() => {
    if (!exam || submitted) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [exam, submitted, handleSubmit])

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsFullscreen(true)
    }).catch(() => {
      alert("Please allow fullscreen to start the exam")
    })
  }

  const logViolation = useCallback((type) => {
    if (submittedRef.current) return
    violationRef.current += 1
    setViolations(violationRef.current)
    if (violationRef.current >= 4) {
      setWarningMsg("")
      handleSubmit(true)
    } else {
      setWarningMsg(`Warning ${violationRef.current} of 3: ${type}. Your 4th violation will auto-submit your exam.`)
    }
  }, [handleSubmit])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !submittedRef.current) {
        logViolation("Tab switch detected")
      }
    }

    const handleWindowBlur = () => {
      if (!submittedRef.current) {
        logViolation("Switched to another application")
      }
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen && !submittedRef.current) {
        logViolation("Fullscreen exit detected")
      }
    }

    const handleKeyDown = (e) => {
      if (submittedRef.current) return
      const blocked = [
        e.ctrlKey && e.key === "c",
        e.ctrlKey && e.key === "v",
        e.ctrlKey && e.key === "u",
        e.ctrlKey && e.key === "a",
        e.ctrlKey && e.key === "s",
        e.ctrlKey && e.key === "Tab",
        e.altKey && e.key === "Tab",
        e.metaKey && e.key === "Tab",
        e.key === "F12",
        e.key === "Escape",
      ]
      if (blocked.some(Boolean)) {
        e.preventDefault()
        logViolation("Restricted key combination used")
      }
    }

    const handleContextMenu = (e) => {
      if (!submittedRef.current) e.preventDefault()
    }

    document.addEventListener("visibilitychange", handleVisibility)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("contextmenu", handleContextMenu)
    window.addEventListener("blur", handleWindowBlur)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("contextmenu", handleContextMenu)
      window.removeEventListener("blur", handleWindowBlur)
    }
  }, [isFullscreen, logViolation])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${m}:${s}`
  }

  const isRed = timeLeft < 300

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3EE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: "center", color: "#888780" }}>Loading exam...</div>
    </div>
  )

  if (!isFullscreen) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F3EE", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "16px", padding: "40px", maxWidth: "500px", width: "100%", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", background: "#E6F1FB", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <i className="ti ti-file-certificate" style={{ fontSize: "28px", color: "#185FA5" }}></i>
        </div>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "22px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 8px" }}>
          {exam?.title}
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: "0 0 24px" }}>
          {exam?.subject}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
          {[
            { label: "Duration",    value: `${exam?.duration} minutes` },
            { label: "Questions",   value: exam?.questions?.length },
            { label: "Total Marks", value: exam?.totalMarks },
            { label: "Pass Mark",   value: exam?.passMark },
          ].map(s => (
            <div key={s.label} style={{ background: "#F5F3EE", borderRadius: "10px", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "#888780", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "18px", fontWeight: "600", color: "#2C2C2A", fontFamily: "'Lora', serif" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {exam?.instructions && (
          <div style={{ background: "#FAEEDA", border: "1px solid #F0D4A8", borderRadius: "10px", padding: "14px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "12px", fontWeight: "500", color: "#854F0B", marginBottom: "6px" }}>Instructions</div>
            <div style={{ fontSize: "13px", color: "#633806", lineHeight: "1.6" }}>{exam?.instructions}</div>
          </div>
        )}

        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", borderRadius: "10px", padding: "12px", marginBottom: "24px", textAlign: "left" }}>
          <div style={{ fontSize: "12px", fontWeight: "500", color: "#993C1D", marginBottom: "4px" }}>Before you start</div>
          <div style={{ fontSize: "12.5px", color: "#7A2E16", lineHeight: "1.7" }}>
            The exam will run in fullscreen mode<br />
            Tab switching and app switching will be detected<br />
            Copy paste and right click are disabled<br />
            Alt Tab and Ctrl Tab are blocked<br />
            4 violations will auto-submit your exam
          </div>
        </div>

        <button
          onClick={enterFullscreen}
          style={{ width: "100%", padding: "13px", background: "#185FA5", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Start Exam
        </button>
      </div>
    </div>
  )

  const questions = exam?.questions || []
  const q = questions[currentQ]
  const questionData = q?.questionId

  return (
    <div style={{ minHeight: "100vh", background: "#F5F3EE", fontFamily: "'DM Sans', sans-serif", userSelect: "none" }}>

      {/* Top bar */}
      <div style={{ background: "white", borderBottom: "1px solid #D3D1C7", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>
          {exam?.title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "13px", color: "#888780" }}>
            Q {currentQ + 1} of {questions.length}
          </div>
          <div style={{
            fontFamily: "'Lora', serif",
            fontSize: "20px",
            fontWeight: "600",
            color: isRed ? "#993C1D" : "#185FA5",
            background: isRed ? "#FAECE7" : "#E6F1FB",
            padding: "4px 14px",
            borderRadius: "8px",
            minWidth: "80px",
            textAlign: "center",
          }}>
            {formatTime(timeLeft)}
          </div>
          <div style={{ fontSize: "12px", color: violations > 0 ? "#993C1D" : "#888780" }}>
            {violations > 0 ? `${violations} warning${violations > 1 ? "s" : ""}` : "No warnings"}
          </div>
        </div>

        <button
          onClick={() => handleSubmit(false)}
          style={{ padding: "8px 18px", background: "#185FA5", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Submit Exam
        </button>
      </div>

      {/* Warning banner */}
      {warningMsg && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span><i className="ti ti-alert-triangle" style={{ marginRight: "6px" }}></i>{warningMsg}</span>
          <button onClick={() => setWarningMsg("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      <div style={{ display: "flex", maxWidth: "1100px", margin: "0 auto", padding: "24px", gap: "20px" }}>

        {/* Question navigator */}
        <div style={{ width: "200px", flexShrink: 0 }}>
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Questions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {questions.map((_, i) => {
                const qId = questions[i]?.questionId?._id || questions[i]?.questionId
                const answered = answers[qId] !== undefined && answers[qId] !== ""
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    style={{
                      width: "36px", height: "36px",
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: i === currentQ ? "#185FA5" : answered ? "#3B6D11" : "#D3D1C7",
                      background: i === currentQ ? "#185FA5" : answered ? "#EAF3DE" : "white",
                      color: i === currentQ ? "white" : answered ? "#3B6D11" : "#5F5E5A",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#888780" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#185FA5" }}></div>
                Current
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#888780" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#EAF3DE", border: "1px solid #3B6D11" }}></div>
                Answered
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#888780" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "white", border: "1px solid #D3D1C7" }}></div>
                Not answered
              </div>
            </div>
          </div>
        </div>

        {/* Question area */}
        <div style={{ flex: 1 }}>
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "24px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#888780" }}>
                Question {currentQ + 1} · {questionData?.marks || q?.marks} marks · {questionData?.type}
              </div>
              <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                {questionData?.difficulty}
              </span>
            </div>

            <div style={{ fontSize: "15px", color: "#2C2C2A", lineHeight: "1.7", marginBottom: "24px", fontWeight: "500" }}>
              {questionData?.text}
            </div>

            {/* MCQ */}
            {questionData?.type === "mcq" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {questionData?.options?.map((opt, i) => {
                  const qId = questionData?._id
                  const selected = answers[qId] === opt
                  return (
                    <div
                      key={i}
                      onClick={() => setAnswers({ ...answers, [qId]: opt })}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        border: `1.5px solid ${selected ? "#185FA5" : "#D3D1C7"}`,
                        background: selected ? "#E6F1FB" : "white",
                        color: selected ? "#185FA5" : "#2C2C2A",
                        cursor: "pointer",
                        fontSize: "14px",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div style={{
                        width: "20px", height: "20px",
                        borderRadius: "50%",
                        border: `2px solid ${selected ? "#185FA5" : "#D3D1C7"}`,
                        background: selected ? "#185FA5" : "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        {selected && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "white" }}></div>}
                      </div>
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Short / Long answer */}
            {(questionData?.type === "short" || questionData?.type === "long") && (
              <textarea
                placeholder={questionData?.type === "short" ? "Write your answer here (2-3 sentences)..." : "Write your detailed answer here..."}
                value={answers[questionData?._id] || ""}
                onChange={e => setAnswers({ ...answers, [questionData?._id]: e.target.value })}
                rows={questionData?.type === "short" ? 4 : 10}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1.5px solid #D3D1C7",
                  background: "#FAFAF8",
                  fontSize: "14px",
                  color: "#2C2C2A",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: "border-box",
                  lineHeight: "1.6",
                }}
              />
            )}

            {/* Matching */}
            {(questionData?.type === "matching" || questionData?.type === "dragdrop") && (
              <div>
                <div style={{ fontSize: "13px", color: "#888780", marginBottom: "12px" }}>
                  Match each item on the left with the correct item on the right:
                </div>
                {questionData?.matchPairs?.map((pair, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <div style={{ flex: 1, padding: "10px 14px", background: "#F5F3EE", borderRadius: "8px", fontSize: "13.5px", color: "#2C2C2A" }}>
                      {pair.left}
                    </div>
                    <i className="ti ti-arrow-right" style={{ color: "#888780", flexShrink: 0 }}></i>
                    <select
                      value={answers[`${questionData?._id}_${i}`] || ""}
                      onChange={e => setAnswers({ ...answers, [`${questionData?._id}_${i}`]: e.target.value })}
                      style={{ flex: 1, padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #D3D1C7", background: "#FAFAF8", fontSize: "13.5px", color: "#2C2C2A", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    >
                      <option value="">Select match...</option>
                      {questionData?.matchPairs?.map((p, j) => (
                        <option key={j} value={p.right}>{p.right}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Coding */}
            {questionData?.type === "coding" && (
              <div>
                {questionData?.testCases?.filter(tc => !tc.isHidden).length > 0 && (
                  <div style={{ background: "#F5F3EE", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "8px" }}>Sample Test Cases</div>
                    {questionData?.testCases?.filter(tc => !tc.isHidden).map((tc, i) => (
                      <div key={i} style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "12px", color: "#5F5E5A" }}>Input: <code style={{ background: "#E8E6E0", padding: "1px 6px", borderRadius: "4px" }}>{tc.input || "none"}</code></div>
                        <div style={{ fontSize: "12px", color: "#5F5E5A", marginTop: "2px" }}>Expected: <code style={{ background: "#E8E6E0", padding: "1px 6px", borderRadius: "4px" }}>{tc.expectedOutput}</code></div>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  placeholder="Write your code here..."
                  value={answers[questionData?._id] || ""}
                  onChange={e => setAnswers({ ...answers, [questionData?._id]: e.target.value })}
                  rows={12}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: "1.5px solid #D3D1C7",
                    background: "#1E1E2E",
                    color: "#CDD6F4",
                    fontSize: "13.5px",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                    lineHeight: "1.7",
                  }}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
              disabled={currentQ === 0}
              style={{ padding: "10px 20px", background: currentQ === 0 ? "#F1EFE8" : "white", color: currentQ === 0 ? "#B4B2A9" : "#2C2C2A", border: "1px solid #D3D1C7", borderRadius: "8px", fontSize: "13.5px", cursor: currentQ === 0 ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}
            >
              Previous
            </button>

            <div style={{ fontSize: "13px", color: "#888780" }}>
              {Object.keys(answers).length} of {questions.length} answered
            </div>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
                style={{ padding: "10px 20px", background: "#185FA5", color: "white", border: "none", borderRadius: "8px", fontSize: "13.5px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                style={{ padding: "10px 20px", background: "#3B6D11", color: "white", border: "none", borderRadius: "8px", fontSize: "13.5px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
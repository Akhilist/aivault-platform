import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API } from "../config/api"


export default function FeedbackManagement() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const isStudent = user?.role === "student"
  const isTeacher = user?.role === "teacher" || user?.role === "hod"

  const [forms, setForms] = useState([])
  const [selectedForm, setSelectedForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summarising, setSummarising] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [studentAnswers, setStudentAnswers] = useState([])

  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    questions: [{ text: "", type: "rating", options: [] }],
  })

  const fetchForms = async () => {
    try {
      setLoading(true)
      const url = isStudent ? `${API}/feedback/open` : `${API}/feedback`
      const res = await axios.get(url, { headers })
      setForms(res.data.forms)
    } catch (err) {
      setError("Failed to load forms")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchForms() }, [])

  const handleSelectForm = async (form) => {
    try {
      const res = await axios.get(`${API}/feedback/${form._id}`, { headers })
      setSelectedForm(res.data.form)
      setStudentAnswers(new Array(res.data.form.questions.length).fill(""))
      setSummary(res.data.form.aiSummary ? JSON.parse(res.data.form.aiSummary) : null)
      setError("")
      setSuccess("")
    } catch (err) {
      setSelectedForm(form)
      setStudentAnswers(new Array(form.questions.length).fill(""))
      setSummary(null)
    }
  }

  const handleAddQuestion = () => {
    setNewForm({
      ...newForm,
      questions: [...newForm.questions, { text: "", type: "text", options: [] }],
    })
  }

  const handleRemoveQuestion = (i) => {
    setNewForm({
      ...newForm,
      questions: newForm.questions.filter((_, j) => j !== i),
    })
  }

  const handleQuestionChange = (i, field, value) => {
    const updated = [...newForm.questions]
    updated[i] = { ...updated[i], [field]: value }
    setNewForm({ ...newForm, questions: updated })
  }

  const handleCreateForm = async () => {
    if (!newForm.title.trim()) return setError("Title is required")
    if (newForm.questions.some(q => !q.text.trim())) return setError("All questions must have text")
    try {
      await axios.post(`${API}/feedback`, newForm, { headers })
      setSuccess("Feedback form created")
      setShowCreate(false)
      setNewForm({ title: "", description: "", questions: [{ text: "", type: "rating", options: [] }] })
      await fetchForms()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create form")
    }
  }

  const handleSubmitResponse = async () => {
    if (studentAnswers.some(a => a === "" || a === null || a === undefined)) {
      return setError("Please answer all questions")
    }
    setSubmitting(true)
    try {
      await axios.post(`${API}/feedback/${selectedForm._id}/respond`, {
        answers: studentAnswers,
      }, { headers })
      setSuccess("Response submitted anonymously. Thank you!")
      setStudentAnswers(new Array(selectedForm.questions.length).fill(""))
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit response")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = async (id) => {
    try {
      await axios.put(`${API}/feedback/${id}/close`, {}, { headers })
      setSuccess("Form closed")
      await fetchForms()
      if (selectedForm?._id === id) setSelectedForm({ ...selectedForm, isOpen: false })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to close form")
    }
  }

  const handleSummarise = async () => {
    setSummarising(true)
    setSummary(null)
    try {
      const res = await axios.post(`${API}/feedback/${selectedForm._id}/summarise`, {}, { headers })
      setSummary(res.data.summary)
      setSuccess("AI summary generated")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Summarisation failed")
    } finally {
      setSummarising(false)
    }
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
    marginBottom: "8px",
  }

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
            Feedback
          </h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            {isStudent ? "Share your feedback anonymously" : "Create and manage feedback forms"}
          </p>
        </div>
        {isTeacher && (
          <button onClick={() => setShowCreate(true)} style={btn("#185FA5", "white", false)}>
            + Create Form
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {success && (
        <div style={{ background: "#EAF3DE", border: "1px solid #B8D9A0", color: "#3B6D11", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
          <i className="ti ti-check" style={{ marginRight: "6px" }}></i>{success}
        </div>
      )}

      {/* Create form modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: 0 }}>
                Create Feedback Form
              </h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#888780" }}>x</button>
            </div>

            <input type="text" placeholder="Form title e.g. Mid Semester Feedback" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} style={input} />
            <textarea placeholder="Description (optional)..." value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} rows={2} style={{ ...input, resize: "vertical" }} />

            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "10px" }}>Questions</div>

            {newForm.questions.map((q, i) => (
              <div key={i} style={{ background: "#F5F3EE", borderRadius: "10px", padding: "12px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <div style={{ fontSize: "12px", color: "#888780" }}>Question {i + 1}</div>
                  {newForm.questions.length > 1 && (
                    <button onClick={() => handleRemoveQuestion(i)} style={{ background: "none", border: "none", color: "#993C1D", cursor: "pointer", fontSize: "13px" }}>Remove</button>
                  )}
                </div>
                <input type="text" placeholder="Question text..." value={q.text} onChange={e => handleQuestionChange(i, "text", e.target.value)} style={input} />
                <select value={q.type} onChange={e => handleQuestionChange(i, "type", e.target.value)} style={input}>
                  <option value="rating">Rating (1-5 stars)</option>
                  <option value="text">Open Text</option>
                  <option value="mcq">Multiple Choice</option>
                </select>

                {q.type === "mcq" && (
                  <div>
                    <div style={{ fontSize: "12px", color: "#888780", marginBottom: "6px" }}>Options</div>
                    {(q.options || []).map((opt, oi) => (
                      <div key={oi} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                        <input
                          type="text"
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={e => {
                            const updated = [...newForm.questions]
                            updated[i].options[oi] = e.target.value
                            setNewForm({ ...newForm, questions: updated })
                          }}
                          style={{ ...input, marginBottom: 0, flex: 1 }}
                        />
                        <button
                          onClick={() => {
                            const updated = [...newForm.questions]
                            updated[i].options = updated[i].options.filter((_, j) => j !== oi)
                            setNewForm({ ...newForm, questions: updated })
                          }}
                          style={{ background: "none", border: "none", color: "#993C1D", cursor: "pointer", fontSize: "14px" }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const updated = [...newForm.questions]
                        updated[i].options = [...(updated[i].options || []), ""]
                        setNewForm({ ...newForm, questions: updated })
                      }}
                      style={{ fontSize: "12px", color: "#185FA5", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      + Add Option
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button onClick={handleAddQuestion} style={{ ...btn("#F1EFE8", "#185FA5", false), marginBottom: "16px" }}>
              + Add Question
            </button>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreate(false)} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
              <button onClick={handleCreateForm} style={btn("#185FA5", "white", false)}>Create Form</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", height: "calc(100vh - 180px)" }}>

        {/* Left — form list */}
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            Forms ({forms.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>Loading...</div>
            ) : forms.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>
                {isStudent ? "No open feedback forms right now" : "No forms yet. Click + Create Form."}
              </div>
            ) : (
              forms.map(form => (
                <div
                  key={form._id}
                  onClick={() => handleSelectForm(form)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #F1EFE8",
                    cursor: "pointer",
                    background: selectedForm?._id === form._id ? "#E6F1FB" : "transparent",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>
                    {form.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", color: "#888780" }}>
                      {form.questions?.length} questions
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: "500", padding: "1px 7px", borderRadius: "20px",
                      background: form.isOpen ? "#EAF3DE" : "#F1EFE8",
                      color: form.isOpen ? "#3B6D11" : "#888780",
                    }}>
                      {form.isOpen ? "Open" : "Closed"}
                    </span>
                  </div>
                  {isTeacher && (
                    <div style={{ fontSize: "11px", color: "#888780", marginTop: "2px" }}>
                      {form.responses?.length || 0} responses
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — form detail */}
        {!selectedForm ? (
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#888780" }}>
              <i className="ti ti-message-circle" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
              <div style={{ fontSize: "14px" }}>
                {isStudent ? "Select a form to give feedback" : "Select a form to view responses"}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ overflowY: "auto" }}>

            {/* Form header */}
            <div style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
                  {selectedForm.title}
                </h2>
                {selectedForm.description && (
                  <div style={{ fontSize: "13px", color: "#888780" }}>{selectedForm.description}</div>
                )}
                {isTeacher && (
                  <div style={{ fontSize: "12px", color: "#888780", marginTop: "4px" }}>
                    {selectedForm.responses?.length || 0} responses · {selectedForm.questions?.length} questions
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {isTeacher && selectedForm.isOpen && (
                  <button onClick={() => handleClose(selectedForm._id)} style={btn("#FAEEDA", "#854F0B", false)}>
                    Close Form
                  </button>
                )}
                {isTeacher && (selectedForm.responses?.length || 0) > 0 && (
                  <button onClick={handleSummarise} disabled={summarising} style={btn("#EEEDFE", "#534AB7", summarising)}>
                    <i className="ti ti-brain" style={{ fontSize: "13px", marginRight: "4px" }}></i>
                    {summarising ? "Summarising..." : "AI Summarise"}
                  </button>
                )}
              </div>
            </div>

            {/* AI Summary */}
            {summary && (
              <div style={{ ...card, background: "#EEEDFE", border: "1px solid #C5C2F0" }}>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#534AB7", marginBottom: "12px" }}>
                  <i className="ti ti-brain" style={{ marginRight: "6px" }}></i>
                  AI Summary
                </div>
                <div style={{ fontSize: "13.5px", color: "#2C2C2A", lineHeight: "1.6", marginBottom: "12px" }}>
                  {summary.summary}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  {summary.keyThemes?.length > 0 && (
                    <div style={{ background: "white", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: "500", color: "#534AB7", marginBottom: "6px" }}>Key Themes</div>
                      {summary.keyThemes.map((t, i) => <div key={i} style={{ fontSize: "12.5px", color: "#2C2C2A", marginBottom: "2px" }}>• {t}</div>)}
                    </div>
                  )}
                  {summary.positiveHighlights?.length > 0 && (
                    <div style={{ background: "#EAF3DE", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: "500", color: "#3B6D11", marginBottom: "6px" }}>Positives</div>
                      {summary.positiveHighlights.map((t, i) => <div key={i} style={{ fontSize: "12.5px", color: "#2C2C2A", marginBottom: "2px" }}>• {t}</div>)}
                    </div>
                  )}
                  {summary.commonComplaints?.length > 0 && (
                    <div style={{ background: "#FAECE7", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: "500", color: "#993C1D", marginBottom: "6px" }}>Complaints</div>
                      {summary.commonComplaints.map((t, i) => <div key={i} style={{ fontSize: "12.5px", color: "#2C2C2A", marginBottom: "2px" }}>• {t}</div>)}
                    </div>
                  )}
                  {summary.suggestedActions?.length > 0 && (
                    <div style={{ background: "#FAEEDA", borderRadius: "8px", padding: "10px" }}>
                      <div style={{ fontSize: "11.5px", fontWeight: "500", color: "#854F0B", marginBottom: "6px" }}>Suggested Actions</div>
                      {summary.suggestedActions.map((t, i) => <div key={i} style={{ fontSize: "12.5px", color: "#2C2C2A", marginBottom: "2px" }}>• {t}</div>)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Student response form */}
            {isStudent && selectedForm.isOpen && (
              <div style={card}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "16px" }}>
                  Your response is completely anonymous
                </div>
                {selectedForm.questions?.map((q, i) => (
                  <div key={i} style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: "500", color: "#2C2C2A", marginBottom: "8px" }}>
                      {i + 1}. {q.text}
                    </div>
                    {q.type === "rating" && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            onClick={() => {
                              const updated = [...studentAnswers]
                              updated[i] = n
                              setStudentAnswers(updated)
                            }}
                            style={{
                              width: "40px", height: "40px",
                              borderRadius: "50%",
                              border: `2px solid ${studentAnswers[i] === n ? "#185FA5" : "#D3D1C7"}`,
                              background: studentAnswers[i] === n ? "#185FA5" : "white",
                              color: studentAnswers[i] === n ? "white" : "#5F5E5A",
                              fontSize: "14px",
                              fontWeight: "600",
                              cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                    {q.type === "text" && (
                      <textarea
                        placeholder="Write your response..."
                        value={studentAnswers[i] || ""}
                        onChange={e => {
                          const updated = [...studentAnswers]
                          updated[i] = e.target.value
                          setStudentAnswers(updated)
                        }}
                        rows={3}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #D3D1C7", background: "#FAFAF8", fontSize: "13.5px", color: "#2C2C2A", outline: "none", resize: "vertical", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" }}
                      />
                    )}
                    {q.type === "mcq" && q.options?.map((opt, j) => (
                      <div
                        key={j}
                        onClick={() => {
                          const updated = [...studentAnswers]
                          updated[i] = opt
                          setStudentAnswers(updated)
                        }}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: `1.5px solid ${studentAnswers[i] === opt ? "#185FA5" : "#D3D1C7"}`,
                          background: studentAnswers[i] === opt ? "#E6F1FB" : "white",
                          color: studentAnswers[i] === opt ? "#185FA5" : "#2C2C2A",
                          cursor: "pointer",
                          fontSize: "13.5px",
                          marginBottom: "6px",
                        }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                ))}
                <button onClick={handleSubmitResponse} disabled={submitting} style={btn("#185FA5", "white", submitting)}>
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            )}

            {isStudent && !selectedForm.isOpen && (
              <div style={{ ...card, textAlign: "center", color: "#888780" }}>
                This feedback form is now closed.
              </div>
            )}

            {/* Teacher responses view */}
            {isTeacher && (
              <div style={card}>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "12px" }}>
                  Responses ({selectedForm.responses?.length || 0})
                </div>
                {selectedForm.responses?.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#888780", padding: "24px", fontSize: "13px" }}>
                    No responses yet
                  </div>
                ) : (
                  selectedForm.questions?.map((q, qi) => (
                    <div key={qi} style={{ marginBottom: "16px", padding: "12px", background: "#F5F3EE", borderRadius: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "8px" }}>
                        {qi + 1}. {q.text}
                      </div>
                      {q.type === "rating" && (() => {
                        const ratings = selectedForm.responses
                          .map(r => r.answers[qi])
                          .filter(a => a !== undefined && a !== null)
                          .map(Number)
                        const avg = ratings.length > 0
                          ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
                          : "N/A"
                        const counts = [1,2,3,4,5].map(n => ({ n, count: ratings.filter(r => r === n).length }))
                        return (
                          <div>
                            <div style={{ fontSize: "20px", fontWeight: "600", color: "#185FA5", fontFamily: "'Lora', serif", marginBottom: "8px" }}>
                              {avg} / 5
                            </div>
                            {counts.map(c => (
                              <div key={c.n} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "12px", color: "#888780", width: "20px" }}>{c.n}★</span>
                                <div style={{ flex: 1, height: "8px", background: "#E8E6E0", borderRadius: "4px" }}>
                                  <div style={{ width: ratings.length > 0 ? `${(c.count / ratings.length) * 100}%` : "0%", height: "100%", background: "#185FA5", borderRadius: "4px" }}></div>
                                </div>
                                <span style={{ fontSize: "12px", color: "#888780", width: "20px" }}>{c.count}</span>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                      {q.type === "text" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {selectedForm.responses.map((r, ri) => r.answers[qi] && (
                            <div key={ri} style={{ padding: "8px 12px", background: "white", borderRadius: "6px", fontSize: "13px", color: "#2C2C2A" }}>
                              {r.answers[qi]}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
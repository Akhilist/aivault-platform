import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

const TYPES = ["mcq", "short", "long", "coding", "matching", "dragdrop"]
const DIFFICULTIES = ["easy", "medium", "hard"]

const TYPE_LABELS = {
  mcq:      "MCQ",
  short:    "Short Answer",
  long:     "Long Answer",
  coding:   "Coding",
  matching: "Matching",
  dragdrop: "Drag and Drop",
}

const TYPE_COLORS = {
  mcq:      { bg: "#E6F1FB", color: "#185FA5" },
  short:    { bg: "#EAF3DE", color: "#3B6D11" },
  long:     { bg: "#EEEDFE", color: "#534AB7" },
  coding:   { bg: "#FAEEDA", color: "#854F0B" },
  matching: { bg: "#FAECE7", color: "#993C1D" },
  dragdrop: { bg: "#F1EFE8", color: "#2C2C2A" },
}

const DIFF_COLORS = {
  easy:   { bg: "#EAF3DE", color: "#3B6D11" },
  medium: { bg: "#FAEEDA", color: "#854F0B" },
  hard:   { bg: "#FAECE7", color: "#993C1D" },
}

const EMPTY_FORM = {
  type: "mcq",
  text: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  rubric: "",
  testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  matchPairs: [{ left: "", right: "" }],
  marks: 1,
  difficulty: "medium",
  topic: "",
  subject: "",
}

export default function QuestionBank() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [filterType, setFilterType] = useState("")
  const [filterDiff, setFilterDiff] = useState("")
  const [filterSubject, setFilterSubject] = useState("")
  const [editId, setEditId] = useState(null)

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filterType)    params.type = filterType
      if (filterDiff)    params.difficulty = filterDiff
      if (filterSubject) params.subject = filterSubject
      const res = await axios.get(`${API}/questions`, { headers, params })
      setQuestions(res.data.questions)
    } catch (err) {
      setError("Failed to load questions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuestions() }, [filterType, filterDiff, filterSubject])

  const handleSubmit = async () => {
    if (!form.text.trim()) return setError("Question text is required")
    if (!form.subject.trim()) return setError("Subject is required")
    setError("")
    setSaving(true)
    try {
      if (editId) {
        await axios.put(`${API}/questions/${editId}`, form, { headers })
      } else {
        await axios.post(`${API}/questions`, form, { headers })
      }
      setShowForm(false)
      setForm(EMPTY_FORM)
      setEditId(null)
      fetchQuestions()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (q) => {
    setForm({
      type:          q.type,
      text:          q.text,
      options:       q.options?.length ? q.options : ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
      rubric:        q.rubric || "",
      testCases:     q.testCases?.length ? q.testCases : [{ input: "", expectedOutput: "", isHidden: false }],
      matchPairs:    q.matchPairs?.length ? q.matchPairs : [{ left: "", right: "" }],
      marks:         q.marks,
      difficulty:    q.difficulty,
      topic:         q.topic || "",
      subject:       q.subject || "",
    })
    setEditId(q._id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return
    try {
      await axios.delete(`${API}/questions/${id}`, { headers })
      fetchQuestions()
    } catch (err) {
      setError("Failed to delete question")
    }
  }

  const handleApprove = async (id) => {
    try {
      await axios.put(`${API}/questions/${id}/approve`, {}, { headers })
      fetchQuestions()
    } catch (err) {
      setError("Failed to approve question")
    }
  }

  const handleReject = async (id) => {
    try {
      await axios.put(`${API}/questions/${id}/reject`, {}, { headers })
      fetchQuestions()
    } catch (err) {
      setError("Failed to reject question")
    }
  }

  const updateOption = (i, val) => {
    const opts = [...form.options]
    opts[i] = val
    setForm({ ...form, options: opts })
  }

  const updateTestCase = (i, field, val) => {
    const tc = [...form.testCases]
    tc[i] = { ...tc[i], [field]: val }
    setForm({ ...form, testCases: tc })
  }

  const updateMatchPair = (i, field, val) => {
    const mp = [...form.matchPairs]
    mp[i] = { ...mp[i], [field]: val }
    setForm({ ...form, matchPairs: mp })
  }

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "12px",
  }

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

  const btn = (bg, color) => ({
    padding: "8px 16px",
    background: bg,
    color: color,
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
            Question Bank
          </h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            {questions.length} questions total
          </p>
        </div>
        {(user?.role === "teacher" || user?.role === "hod") && (
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM) }}
            style={btn("#185FA5", "white")}
          >
            + Add Question
          </button>
        )}
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...input, width: "160px", marginBottom: 0 }}>
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>

        <select value={filterDiff} onChange={e => setFilterDiff(e.target.value)} style={{ ...input, width: "160px", marginBottom: 0 }}>
          <option value="">All Difficulties</option>
          {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
        </select>

        <input
          type="text"
          placeholder="Filter by subject..."
          value={filterSubject}
          onChange={e => setFilterSubject(e.target.value)}
          style={{ ...input, width: "200px", marginBottom: 0 }}
        />

        {(filterType || filterDiff || filterSubject) && (
          <button onClick={() => { setFilterType(""); setFilterDiff(""); setFilterSubject("") }} style={btn("#F1EFE8", "#5F5E5A")}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888780" }}>Loading questions...</div>
      ) : questions.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
          <i className="ti ti-database" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }}></i>
          No questions yet. Click Add Question to create one.
        </div>
      ) : (
        questions.map((q) => (
          <div key={q._id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "11px", fontWeight: "500", padding: "2px 9px", borderRadius: "20px", background: TYPE_COLORS[q.type]?.bg, color: TYPE_COLORS[q.type]?.color }}>
                    {TYPE_LABELS[q.type]}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "500", padding: "2px 9px", borderRadius: "20px", background: DIFF_COLORS[q.difficulty]?.bg, color: DIFF_COLORS[q.difficulty]?.color }}>
                    {q.difficulty}
                  </span>
                  <span style={{ fontSize: "11px", padding: "2px 9px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                    {q.marks} mark{q.marks !== 1 ? "s" : ""}
                  </span>
                  {q.subject && (
                    <span style={{ fontSize: "11px", padding: "2px 9px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                      {q.subject}
                    </span>
                  )}
                  {q.topic && (
                    <span style={{ fontSize: "11px", padding: "2px 9px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                      {q.topic}
                    </span>
                  )}
                  <span style={{
                    fontSize: "11px", fontWeight: "500", padding: "2px 9px", borderRadius: "20px",
                    background: q.status === "approved" ? "#EAF3DE" : q.status === "rejected" ? "#FAECE7" : "#FAEEDA",
                    color:      q.status === "approved" ? "#3B6D11"  : q.status === "rejected" ? "#993C1D"  : "#854F0B",
                  }}>
                    {q.status}
                  </span>
                </div>

                <div style={{ fontSize: "14px", color: "#2C2C2A", lineHeight: "1.6", marginBottom: "8px" }}>
                  {q.text}
                </div>

                {q.type === "mcq" && q.options?.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{
                        fontSize: "12.5px",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        background: opt === q.correctAnswer ? "#EAF3DE" : "#F5F3EE",
                        color: opt === q.correctAnswer ? "#3B6D11" : "#5F5E5A",
                        fontWeight: opt === q.correctAnswer ? "500" : "400",
                      }}>
                        {String.fromCharCode(65 + i)}. {opt}
                        {opt === q.correctAnswer && " correct"}
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "coding" && (
                  <div style={{ fontSize: "12.5px", color: "#888780" }}>
                    {q.testCases?.length || 0} test cases
                  </div>
                )}

                <div style={{ fontSize: "11.5px", color: "#B4B2A9", marginTop: "8px" }}>
                  Added by {q.createdBy?.name} · {new Date(q.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                {(user?.role === "teacher" || user?.role === "hod") && (
                  <button onClick={() => handleEdit(q)} style={btn("#F1EFE8", "#2C2C2A")}>
                    Edit
                  </button>
                )}
                {user?.role === "hod" && q.status === "draft" && (
                  <>
                    <button onClick={() => handleApprove(q._id)} style={btn("#EAF3DE", "#3B6D11")}>
                      Approve
                    </button>
                    <button onClick={() => handleReject(q._id)} style={btn("#FAECE7", "#993C1D")}>
                      Reject
                    </button>
                  </>
                )}
                {(user?.role === "teacher" || user?.role === "hod") && (
                  <button onClick={() => handleDelete(q._id)} style={btn("#FAECE7", "#993C1D")}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {showForm && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontFamily: "'Lora', serif", fontSize: "20px", fontWeight: "600", color: "#2C2C2A", margin: 0 }}>
                {editId ? "Edit Question" : "Add Question"}
              </h2>
              <button onClick={() => { setShowForm(false); setError("") }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#888780" }}>
                x
              </button>
            </div>

            {error && (
              <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <label style={label}>Question Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={input}>
              {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>

            <label style={label}>Subject</label>
            <input type="text" placeholder="e.g. Data Structures" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={input} />

            <label style={label}>Topic</label>
            <input type="text" placeholder="e.g. Linked Lists" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} style={input} />

            <label style={label}>Question Text</label>
            <textarea
              placeholder="Enter your question here..."
              value={form.text}
              onChange={e => setForm({ ...form, text: e.target.value })}
              rows={3}
              style={{ ...input, resize: "vertical" }}
            />

            {form.type === "mcq" && (
              <>
                <label style={label}>Options</label>
                {form.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    style={input}
                  />
                ))}
                <label style={label}>Correct Answer</label>
                <select value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} style={input}>
                  <option value="">Select correct option</option>
                  {form.options.map((opt, i) => opt && (
                    <option key={i} value={opt}>{String.fromCharCode(65 + i)}. {opt}</option>
                  ))}
                </select>
              </>
            )}

            {(form.type === "short" || form.type === "long") && (
              <>
                <label style={label}>Marking Rubric or Model Answer</label>
                <textarea
                  placeholder="Enter model answer or rubric..."
                  value={form.rubric}
                  onChange={e => setForm({ ...form, rubric: e.target.value })}
                  rows={3}
                  style={{ ...input, resize: "vertical" }}
                />
              </>
            )}

            {form.type === "coding" && (
              <>
                <label style={label}>Test Cases</label>
                {form.testCases.map((tc, i) => (
                  <div key={i} style={{ background: "#F5F3EE", borderRadius: "8px", padding: "12px", marginBottom: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "6px" }}>
                      Test Case {i + 1}
                    </div>
                    <input type="text" placeholder="Input (leave blank if none)" value={tc.input} onChange={e => updateTestCase(i, "input", e.target.value)} style={input} />
                    <input type="text" placeholder="Expected Output" value={tc.expectedOutput} onChange={e => updateTestCase(i, "expectedOutput", e.target.value)} style={input} />
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#5F5E5A", cursor: "pointer" }}>
                      <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(i, "isHidden", e.target.checked)} />
                      Hidden test case
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => setForm({ ...form, testCases: [...form.testCases, { input: "", expectedOutput: "", isHidden: false }] })}
                  style={{ ...btn("#F1EFE8", "#2C2C2A"), marginBottom: "10px" }}
                >
                  + Add Test Case
                </button>
              </>
            )}

            {(form.type === "matching" || form.type === "dragdrop") && (
              <>
                <label style={label}>Match Pairs</label>
                {form.matchPairs.map((mp, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                    <input type="text" placeholder="Left item" value={mp.left} onChange={e => updateMatchPair(i, "left", e.target.value)} style={{ ...input, marginBottom: 0 }} />
                    <input type="text" placeholder="Right item" value={mp.right} onChange={e => updateMatchPair(i, "right", e.target.value)} style={{ ...input, marginBottom: 0 }} />
                  </div>
                ))}
                <button
                  onClick={() => setForm({ ...form, matchPairs: [...form.matchPairs, { left: "", right: "" }] })}
                  style={{ ...btn("#F1EFE8", "#2C2C2A"), marginBottom: "10px" }}
                >
                  + Add Pair
                </button>
              </>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={label}>Marks</label>
                <input
                  type="number"
                  min="1"
                  value={form.marks}
                  onChange={e => setForm({ ...form, marks: parseInt(e.target.value) || 1 })}
                  style={input}
                />
              </div>
              <div>
                <label style={label}>Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} style={input}>
                  {DIFFICULTIES.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => { setShowForm(false); setError("") }} style={btn("#F1EFE8", "#5F5E5A")}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving} style={btn(saving ? "#7BAED4" : "#185FA5", "white")}>
                {saving ? "Saving..." : editId ? "Update Question" : "Save Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
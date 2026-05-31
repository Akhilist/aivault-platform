import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Editor from "@monaco-editor/react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

const STATUS_COLORS = {
  draft:        { bg: "#F1EFE8", color: "#5F5E5A", label: "Draft" },
  submitted:    { bg: "#E6F1FB", color: "#185FA5", label: "Submitted" },
  under_review: { bg: "#FAEEDA", color: "#854F0B", label: "Under Review" },
  sent_back:    { bg: "#FAECE7", color: "#993C1D", label: "Sent Back" },
  approved:     { bg: "#EEEDFE", color: "#534AB7", label: "Approved" },
  signed:       { bg: "#EAF3DE", color: "#3B6D11", label: "Signed" },
}

export default function RecordBook() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const headers = { Authorization: `Bearer ${token}` }

  const isStudent = user?.role === "student"
  const isTeacher = user?.role === "teacher" || user?.role === "hod"

  const [records, setRecords] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeSection, setActiveSection] = useState("aim")
  const [experiments, setExperiments] = useState([])
  const [showNewForm, setShowNewForm] = useState(false)
  const [newRecordExp, setNewRecordExp] = useState("")

  // inline comment state
  const [selection, setSelection] = useState(null)
  const [commentText, setCommentText] = useState("")
  const [commentPopup, setCommentPopup] = useState(null)
  const [showCommentBox, setShowCommentBox] = useState(false)

  // teacher action state
  const [teacherRemarks, setTeacherRemarks] = useState("")
  const [sendBackReason, setSendBackReason] = useState("")
  const [showSendBack, setShowSendBack] = useState(false)
  const [showApprove, setShowApprove] = useState(false)

  // form state
  const [form, setForm] = useState({
    aim: "", theory: "", output: "", conclusion: "",
    subject: "", batch: "", codeContent: "", codeLanguage: "python",
  })

  const codeRef = useRef(null)
  const algoRef = useRef(null)

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const url = isStudent ? `${API}/records/my` : `${API}/records/all`
      const res = await axios.get(url, { headers })
      setRecords(res.data.records)
    } catch (err) {
      setError("Failed to load records")
    } finally {
      setLoading(false)
    }
  }

  const fetchExperiments = async () => {
    try {
      const res = await axios.get(`${API}/commits/experiments`, { headers })
      setExperiments(res.data.experiments)
    } catch (err) {
      console.error("Failed to load experiments")
    }
  }

  useEffect(() => {
    fetchRecords()
    if (isStudent) fetchExperiments()
  }, [])

  const handleSelectRecord = async (record) => {
    try {
      const res = await axios.get(`${API}/records/${record._id}`, { headers })
      setSelectedRecord(res.data.record)
      setForm({
        aim:         res.data.record.aim || "",
        theory:      res.data.record.theory || "",
        output:      res.data.record.output || "",
        conclusion:  res.data.record.conclusion || "",
        subject:     res.data.record.subject || "",
        batch:       res.data.record.batch || "",
        codeContent: res.data.record.codeContent || "",
        codeLanguage: res.data.record.codeLanguage || "python",
      })
      setTeacherRemarks(res.data.record.teacherRemarks || "")
      setActiveSection("aim")
      setSelection(null)
      setCommentPopup(null)
      setError("")
      setSuccess("")
    } catch (err) {
      setError("Failed to load record")
    }
  }

  const handleCreateRecord = async () => {
    if (!newRecordExp) return setError("Select an experiment")
    const exp = experiments.find(e => e._id === newRecordExp)
    if (!exp) return setError("Experiment not found")
    try {
      const res = await axios.post(`${API}/records`, {
        experimentId:   exp._id,
        experimentName: exp.experimentName,
      }, { headers })
      setShowNewForm(false)
      setNewRecordExp("")
      await fetchRecords()
      handleSelectRecord(res.data.record)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create record")
    }
  }

  const handleSave = async () => {
    if (!selectedRecord) return
    setSaving(true)
    try {
      await axios.put(`${API}/records/${selectedRecord._id}`, form, { headers })
      setSuccess("Record saved")
      setTimeout(() => setSuccess(""), 3000)
      await handleSelectRecord(selectedRecord)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!window.confirm("Submit this record for teacher review? You cannot edit it until teacher responds.")) return
    try {
      await axios.put(`${API}/records/${selectedRecord._id}/submit`, {}, { headers })
      setSuccess("Record submitted for review")
      await handleSelectRecord(selectedRecord)
      await fetchRecords()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit")
    }
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return setError("Comment cannot be empty")
    if (!selection) return setError("Select some text first")
    try {
      await axios.post(`${API}/records/${selectedRecord._id}/comment`, {
        section:      selection.section,
        selectedText: selection.text,
        startOffset:  selection.start,
        endOffset:    selection.end,
        lineNumber:   selection.lineNumber,
        comment:      commentText,
      }, { headers })
      setCommentText("")
      setSelection(null)
      setShowCommentBox(false)
      setCommentPopup(null)
      setSuccess("Comment added")
      await handleSelectRecord(selectedRecord)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to add comment")
    }
  }

  const handleResolveComment = async (commentId) => {
    try {
      await axios.put(`${API}/records/${selectedRecord._id}/comment/${commentId}/resolve`, {}, { headers })
      await handleSelectRecord(selectedRecord)
    } catch (err) {
      setError("Failed to resolve comment")
    }
  }

  const handleSendBack = async () => {
    if (!sendBackReason.trim()) return setError("Please provide a reason for sending back")
    try {
      await axios.put(`${API}/records/${selectedRecord._id}/sendback`, {
        reason: sendBackReason,
        teacherRemarks,
      }, { headers })
      setShowSendBack(false)
      setSendBackReason("")
      setSuccess("Record sent back to student")
      await handleSelectRecord(selectedRecord)
      await fetchRecords()
    } catch (err) {
      setError("Failed to send back")
    }
  }

  const handleApprove = async () => {
    try {
      await axios.put(`${API}/records/${selectedRecord._id}/approve`, {
        teacherRemarks,
      }, { headers })
      setShowApprove(false)
      setSuccess("Record approved")
      await handleSelectRecord(selectedRecord)
      await fetchRecords()
    } catch (err) {
      setError("Failed to approve")
    }
  }

  const handleSign = async () => {
    if (!window.confirm("Digitally sign this record? This action is permanent and cannot be undone.")) return
    try {
      const res = await axios.put(`${API}/records/${selectedRecord._id}/sign`, {}, { headers })
      setSuccess(`Record digitally signed. Hash: ${res.data.documentHash.slice(0, 20)}...`)
      await handleSelectRecord(selectedRecord)
      await fetchRecords()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to sign")
    }
  }

  const handleVerify = async () => {
    try {
      const res = await axios.get(`${API}/records/${selectedRecord._id}/verify`, { headers })
      if (res.data.verified) {
        setSuccess(`Signature VALID — Record is authentic. Signed by ${res.data.signedBy?.name} on ${new Date(res.data.signedAt).toLocaleString()}`)
      } else {
        setError("Signature INVALID — Record may have been tampered with")
      }
    } catch (err) {
      setError("Verification failed")
    }
  }

  // Handle text selection for inline comments
  const handleTextSelection = (section) => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const text = sel.toString().trim()
    if (!text) return

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setSelection({
      section,
      text,
      start: range.startOffset,
      end:   range.endOffset,
      lineNumber: null,
      rect,
    })
    setShowCommentBox(true)
    setCommentPopup({ x: rect.left, y: rect.bottom + window.scrollY + 8 })
  }

  const canEdit = isStudent && selectedRecord &&
    (selectedRecord.status === "draft" || selectedRecord.status === "sent_back")

  const canSubmit = isStudent && selectedRecord &&
    (selectedRecord.status === "draft" || selectedRecord.status === "sent_back")

  const isSigned = selectedRecord?.status === "signed"

  const SECTIONS = [
    { id: "aim",       label: "Aim" },
    { id: "theory",    label: "Theory" },
    { id: "algorithm", label: "Algorithm" },
    { id: "flowchart", label: "Flowchart" },
    { id: "code",      label: "Code" },
    { id: "output",    label: "Output" },
    { id: "conclusion",label: "Conclusion" },
    { id: "comments",  label: "Comments" },
    { id: "signature", label: "Signature" },
  ]

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

  const textarea = (editable) => ({
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #D3D1C7",
    background: editable ? "#FAFAF8" : "#F5F3EE",
    fontSize: "14px",
    color: "#2C2C2A",
    outline: "none",
    resize: "vertical",
    fontFamily: "'DM Sans', sans-serif",
    lineHeight: "1.7",
    boxSizing: "border-box",
    minHeight: "120px",
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

  const sectionComments = selectedRecord?.inlineComments?.filter(
    c => c.section === activeSection && !c.resolved
  ) || []

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
            E-Code Record Book
          </h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            {isStudent ? "Your digital lab records" : "Student record books"}
          </p>
        </div>
        {isStudent && (
          <button onClick={() => setShowNewForm(true)} style={btn("#185FA5", "white", false)}>
            + New Record
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

      {/* New record modal */}
      {showNewForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "440px" }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
              Create Record from Experiment
            </h2>
            <div style={{ fontSize: "13px", color: "#888780", marginBottom: "12px" }}>
              Select a completed experiment from Version Control:
            </div>
            <select
              value={newRecordExp}
              onChange={e => setNewRecordExp(e.target.value)}
              style={{ ...input, marginBottom: "16px" }}
            >
              <option value="">Select experiment...</option>
              {experiments.map(exp => (
                <option key={exp._id} value={exp._id}>
                  {exp.experimentName} ({(exp.stages || []).length} stages)
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowNewForm(false); setNewRecordExp("") }} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
              <button onClick={handleCreateRecord} style={btn("#185FA5", "white", false)}>Create Record</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", height: "calc(100vh - 190px)" }}>

        {/* Left — record list */}
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            Records ({records.length})
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>Loading...</div>
            ) : records.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>
                {isStudent ? "No records yet. Click + New Record." : "No records submitted yet."}
              </div>
            ) : (
              records.map(rec => (
                <div
                  key={rec._id}
                  onClick={() => handleSelectRecord(rec)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #F1EFE8",
                    cursor: "pointer",
                    background: selectedRecord?._id === rec._id ? "#E6F1FB" : "transparent",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>
                    {rec.experimentName}
                  </div>
                  {isTeacher && rec.studentId && (
                    <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "4px" }}>
                      {rec.studentId?.name}
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "20px",
                      background: STATUS_COLORS[rec.status]?.bg,
                      color: STATUS_COLORS[rec.status]?.color,
                    }}>
                      {STATUS_COLORS[rec.status]?.label}
                    </span>
                    {rec.inlineComments?.filter(c => !c.resolved).length > 0 && (
                      <span style={{ fontSize: "11px", color: "#993C1D" }}>
                        {rec.inlineComments.filter(c => !c.resolved).length} comment{rec.inlineComments.filter(c => !c.resolved).length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — record editor */}
        {!selectedRecord ? (
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#888780" }}>
              <i className="ti ti-book" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
              <div style={{ fontSize: "14px" }}>
                {isStudent ? "Select a record or create a new one" : "Select a student record to review"}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0", background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden" }}>

            {/* Record header */}
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #D3D1C7", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 2px" }}>
                  {selectedRecord.experimentName}
                </h2>
                <div style={{ fontSize: "12px", color: "#888780" }}>
                  {isTeacher && selectedRecord.studentId?.name && `${selectedRecord.studentId.name} · `}
                  Submission #{selectedRecord.submissionCount || 0}
                  {selectedRecord.sendBackReason && ` · Sent back: ${selectedRecord.sendBackReason}`}
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{
                  fontSize: "12px", fontWeight: "500", padding: "4px 12px", borderRadius: "20px",
                  background: STATUS_COLORS[selectedRecord.status]?.bg,
                  color: STATUS_COLORS[selectedRecord.status]?.color,
                }}>
                  {STATUS_COLORS[selectedRecord.status]?.label}
                </span>

                {/* Student actions */}
                {canEdit && (
                  <button onClick={handleSave} disabled={saving} style={btn("#185FA5", "white", saving)}>
                    {saving ? "Saving..." : "Save"}
                  </button>
                )}
                {canSubmit && (
                  <button onClick={handleSubmit} style={btn("#3B6D11", "white", false)}>
                    Submit for Review
                  </button>
                )}

                {/* Teacher actions */}
                {isTeacher && selectedRecord.status === "submitted" && (
                  <>
                    <button onClick={() => setShowSendBack(true)} style={btn("#FAECE7", "#993C1D", false)}>
                      Send Back
                    </button>
                    <button onClick={() => setShowApprove(true)} style={btn("#EAF3DE", "#3B6D11", false)}>
                      Approve
                    </button>
                  </>
                )}
                {isTeacher && selectedRecord.status === "under_review" && (
                  <>
                    <button onClick={() => setShowSendBack(true)} style={btn("#FAECE7", "#993C1D", false)}>
                      Send Back
                    </button>
                    <button onClick={() => setShowApprove(true)} style={btn("#EAF3DE", "#3B6D11", false)}>
                      Approve
                    </button>
                  </>
                )}
                {isTeacher && selectedRecord.status === "approved" && (
                  <button onClick={handleSign} style={btn("#185FA5", "white", false)}>
                    <i className="ti ti-certificate" style={{ fontSize: "13px", marginRight: "4px" }}></i>
                    Sign Record
                  </button>
                )}
                {isSigned && (
                  <button onClick={handleVerify} style={btn("#EAF3DE", "#3B6D11", false)}>
                    <i className="ti ti-shield-check" style={{ fontSize: "13px", marginRight: "4px" }}></i>
                    Verify
                  </button>
                )}
              </div>
            </div>

            {/* Section tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #D3D1C7", background: "#FAFAF8", overflowX: "auto", flexShrink: 0 }}>
              {SECTIONS.map(s => {
                const hasComments = selectedRecord.inlineComments?.filter(c => c.section === s.id && !c.resolved).length > 0
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    style={{
                      padding: "9px 14px",
                      background: "none",
                      border: "none",
                      borderBottom: activeSection === s.id ? "2px solid #185FA5" : "2px solid transparent",
                      color: activeSection === s.id ? "#185FA5" : "#888780",
                      fontSize: "12.5px",
                      fontWeight: activeSection === s.id ? "500" : "400",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                      position: "relative",
                    }}
                  >
                    {s.label}
                    {hasComments && (
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#993C1D", display: "inline-block", marginLeft: "4px", verticalAlign: "middle" }}></span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Section content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

              {/* Send back modal */}
              {showSendBack && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px" }}>
                    <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                      Send Back for Re-edit
                    </h2>
                    <div style={{ fontSize: "13px", color: "#888780", marginBottom: "8px" }}>Reason (required)</div>
                    <textarea
                      placeholder="Tell the student what needs to be fixed..."
                      value={sendBackReason}
                      onChange={e => setSendBackReason(e.target.value)}
                      rows={3}
                      style={{ ...textarea(true), marginBottom: "12px" }}
                    />
                    <div style={{ fontSize: "13px", color: "#888780", marginBottom: "8px" }}>Overall Remarks (optional)</div>
                    <textarea
                      placeholder="General teacher remarks..."
                      value={teacherRemarks}
                      onChange={e => setTeacherRemarks(e.target.value)}
                      rows={2}
                      style={{ ...textarea(true), marginBottom: "16px" }}
                    />
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => setShowSendBack(false)} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
                      <button onClick={handleSendBack} style={btn("#993C1D", "white", false)}>Send Back</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Approve modal */}
              {showApprove && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                  <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "480px" }}>
                    <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                      Approve Record
                    </h2>
                    <div style={{ fontSize: "13px", color: "#888780", marginBottom: "8px" }}>Overall Remarks (optional)</div>
                    <textarea
                      placeholder="Well done! Your record is approved..."
                      value={teacherRemarks}
                      onChange={e => setTeacherRemarks(e.target.value)}
                      rows={3}
                      style={{ ...textarea(true), marginBottom: "16px" }}
                    />
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button onClick={() => setShowApprove(false)} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
                      <button onClick={handleApprove} style={btn("#3B6D11", "white", false)}>Approve</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline comment popup */}
              {showCommentBox && commentPopup && isTeacher && (
                <div style={{
                  position: "fixed",
                  top: Math.min(commentPopup.y, window.innerHeight - 200),
                  left: Math.min(commentPopup.x, window.innerWidth - 320),
                  background: "white",
                  border: "1px solid #D3D1C7",
                  borderRadius: "10px",
                  padding: "14px",
                  width: "300px",
                  zIndex: 500,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}>
                  <div style={{ fontSize: "12px", color: "#888780", marginBottom: "6px" }}>
                    Comment on: <em>"{selection?.text?.slice(0, 40)}{selection?.text?.length > 40 ? "..." : ""}"</em>
                  </div>
                  <textarea
                    placeholder="Write your comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={3}
                    autoFocus
                    style={{ ...textarea(true), minHeight: "70px", marginBottom: "8px" }}
                  />
                  <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button onClick={() => { setShowCommentBox(false); setSelection(null) }} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
                    <button onClick={handleAddComment} style={btn("#185FA5", "white", false)}>Add Comment</button>
                  </div>
                </div>
              )}

              {/* AIM */}
              {activeSection === "aim" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "8px" }}>Aim of the Experiment</div>
                  <textarea
                    placeholder="State the aim or objective of this experiment..."
                    value={form.aim}
                    onChange={e => setForm({ ...form, aim: e.target.value })}
                    disabled={!canEdit}
                    rows={5}
                    style={textarea(canEdit)}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                    <div>
                      <div style={{ fontSize: "12.5px", color: "#888780", marginBottom: "4px" }}>Subject</div>
                      <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} disabled={!canEdit} style={input} placeholder="e.g. Data Structures" />
                    </div>
                    <div>
                      <div style={{ fontSize: "12.5px", color: "#888780", marginBottom: "4px" }}>Batch</div>
                      <input type="text" value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} disabled={!canEdit} style={input} placeholder="e.g. MCA S3" />
                    </div>
                  </div>
                </div>
              )}

              {/* THEORY */}
              {activeSection === "theory" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "8px" }}>Theory and Background</div>
                  <textarea
                    placeholder="Write the theory, concepts, and background related to this experiment..."
                    value={form.theory}
                    onChange={e => setForm({ ...form, theory: e.target.value })}
                    disabled={!canEdit}
                    rows={10}
                    style={textarea(canEdit)}
                  />
                </div>
              )}

              {/* ALGORITHM */}
              {activeSection === "algorithm" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>Algorithm</div>
                  <div style={{ fontSize: "12px", color: "#888780", marginBottom: "12px" }}>
                    Auto-pulled from Version Control commits.
                    {isTeacher && " Select text to add an inline comment."}
                  </div>
                  <div
                    onMouseUp={() => isTeacher && handleTextSelection("algorithm")}
                    style={{
                      padding: "16px",
                      background: "#F5F3EE",
                      borderRadius: "10px",
                      fontSize: "14px",
                      lineHeight: "2",
                      color: "#2C2C2A",
                      fontFamily: "'DM Sans', sans-serif",
                      userSelect: "text",
                      cursor: isTeacher ? "text" : "default",
                      minHeight: "200px",
                      position: "relative",
                    }}
                  >
                    {selectedRecord.algorithmContent ? (
                      selectedRecord.algorithmContent.split("\n").map((line, i) => {
                        const lineComments = selectedRecord.inlineComments?.filter(
                          c => c.section === "algorithm" && !c.resolved &&
                          selectedRecord.algorithmContent.indexOf(c.selectedText) >= 0
                        )
                        return (
                          <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                            <span style={{ color: "#B4B2A9", fontSize: "12px", minWidth: "20px", paddingTop: "2px" }}>{i + 1}</span>
                            <span>{line}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div style={{ color: "#B4B2A9", fontStyle: "italic" }}>No algorithm committed yet in Version Control</div>
                    )}
                  </div>

                  {/* Algorithm comments */}
                  {selectedRecord.inlineComments?.filter(c => c.section === "algorithm" && !c.resolved).map(c => (
                    <div key={c._id} style={{ marginTop: "8px", padding: "10px 14px", background: "#FAEEDA", borderRadius: "8px", borderLeft: "3px solid #854F0B" }}>
                      <div style={{ fontSize: "12px", color: "#854F0B", fontWeight: "500", marginBottom: "4px" }}>
                        Comment on: <em>"{c.selectedText?.slice(0, 50)}"</em>
                      </div>
                      <div style={{ fontSize: "13px", color: "#2C2C2A" }}>{c.comment}</div>
                      <div style={{ fontSize: "11px", color: "#888780", marginTop: "4px" }}>by {c.commentedBy?.name}</div>
                      {(isTeacher || isStudent) && (
                        <button onClick={() => handleResolveComment(c._id)} style={{ ...btn("#F1EFE8", "#5F5E5A", false), marginTop: "6px", fontSize: "11.5px", padding: "4px 10px" }}>
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* FLOWCHART */}
              {activeSection === "flowchart" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>Flowchart</div>
                  <div style={{ fontSize: "12px", color: "#888780", marginBottom: "12px" }}>Auto-pulled from Version Control commits.</div>
                  {selectedRecord.flowchartContent ? (
                    <div style={{ padding: "16px", background: "#F5F3EE", borderRadius: "10px", fontSize: "13px", color: "#888780" }}>
                      <i className="ti ti-sitemap" style={{ fontSize: "20px", marginRight: "8px" }}></i>
                      Flowchart data saved from Version Control.
                      <div style={{ marginTop: "8px", fontSize: "12px" }}>
                        (Visual rendering available in Version Control module)
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "16px", background: "#F5F3EE", borderRadius: "10px", color: "#B4B2A9", fontStyle: "italic", fontSize: "13px" }}>
                      No flowchart committed yet in Version Control
                    </div>
                  )}
                </div>
              )}

              {/* CODE */}
              {activeSection === "code" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>Code</div>
                  <div style={{ fontSize: "12px", color: "#888780", marginBottom: "8px" }}>
                    {isTeacher ? "Select code text to add inline comments." : canEdit ? "You can update your code here." : "Read-only view."}
                  </div>

                  {isTeacher ? (
                    <div>
                      <div
                        onMouseUp={() => handleTextSelection("code")}
                        style={{
                          background: "#1E1E2E",
                          borderRadius: "10px",
                          padding: "16px",
                          minHeight: "300px",
                          userSelect: "text",
                          cursor: "text",
                        }}
                      >
                        {selectedRecord.codeContent ? (
                          selectedRecord.codeContent.split("\n").map((line, i) => (
                            <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", lineHeight: "1.7" }}>
                              <span style={{ color: "#555570", fontSize: "12px", minWidth: "24px", userSelect: "none" }}>{i + 1}</span>
                              <span style={{ color: "#CDD6F4", fontSize: "13.5px", fontFamily: "monospace" }}>{line}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: "#555570", fontStyle: "italic" }}>No code submitted</div>
                        )}
                      </div>

                      {/* Code comments */}
                      {selectedRecord.inlineComments?.filter(c => c.section === "code" && !c.resolved).map(c => (
                        <div key={c._id} style={{ marginTop: "8px", padding: "10px 14px", background: "#FAEEDA", borderRadius: "8px", borderLeft: "3px solid #854F0B" }}>
                          <div style={{ fontSize: "12px", color: "#854F0B", fontWeight: "500", marginBottom: "4px" }}>
                            Comment on: <code style={{ background: "#F0D4A8", padding: "1px 5px", borderRadius: "3px", fontSize: "11px" }}>"{c.selectedText?.slice(0, 60)}"</code>
                          </div>
                          <div style={{ fontSize: "13px", color: "#2C2C2A" }}>{c.comment}</div>
                          <div style={{ fontSize: "11px", color: "#888780", marginTop: "4px" }}>by {c.commentedBy?.name}</div>
                          <button onClick={() => handleResolveComment(c._id)} style={{ ...btn("#F1EFE8", "#5F5E5A", false), marginTop: "6px", fontSize: "11.5px", padding: "4px 10px" }}>
                            Mark Resolved
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ height: "400px" }}>
                      <Editor
                        height="100%"
                        language={form.codeLanguage || "python"}
                        value={form.codeContent}
                        onChange={val => canEdit && setForm({ ...form, codeContent: val || "" })}
                        theme="vs-dark"
                        options={{
                          fontSize: 14,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          lineNumbers: "on",
                          readOnly: !canEdit,
                          bracketPairColorization: { enabled: true },
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* OUTPUT */}
              {activeSection === "output" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "8px" }}>Output and Results</div>
                  <textarea
                    placeholder="Paste your program output here or describe the results..."
                    value={form.output}
                    onChange={e => setForm({ ...form, output: e.target.value })}
                    disabled={!canEdit}
                    rows={8}
                    style={{ ...textarea(canEdit), fontFamily: "monospace" }}
                  />
                </div>
              )}

              {/* CONCLUSION */}
              {activeSection === "conclusion" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "8px" }}>Conclusion</div>
                  <textarea
                    placeholder="Write your conclusion — what did you learn? Did the output match expectations? Any limitations?"
                    value={form.conclusion}
                    onChange={e => setForm({ ...form, conclusion: e.target.value })}
                    disabled={!canEdit}
                    rows={8}
                    style={textarea(canEdit)}
                  />
                </div>
              )}

              {/* COMMENTS */}
              {activeSection === "comments" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "12px" }}>
                    All Inline Comments ({selectedRecord.inlineComments?.length || 0})
                  </div>

                  {selectedRecord.inlineComments?.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px", color: "#888780", fontSize: "13px" }}>
                      No comments yet
                    </div>
                  ) : (
                    selectedRecord.inlineComments?.map(c => (
                      <div key={c._id} style={{ marginBottom: "10px", padding: "12px 16px", background: c.resolved ? "#F5F3EE" : "#FAEEDA", borderRadius: "10px", borderLeft: `3px solid ${c.resolved ? "#D3D1C7" : "#854F0B"}`, opacity: c.resolved ? 0.6 : 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <div style={{ fontSize: "12px", color: "#888780" }}>
                            <span style={{ fontWeight: "500", color: "#2C2C2A" }}>{c.section}</span> section ·
                            <em> "{c.selectedText?.slice(0, 40)}{c.selectedText?.length > 40 ? "..." : ""}"</em>
                          </div>
                          <span style={{ fontSize: "11px", padding: "1px 7px", borderRadius: "20px", background: c.resolved ? "#EAF3DE" : "#FAEEDA", color: c.resolved ? "#3B6D11" : "#854F0B" }}>
                            {c.resolved ? "Resolved" : "Open"}
                          </span>
                        </div>
                        <div style={{ fontSize: "13.5px", color: "#2C2C2A", marginBottom: "4px" }}>{c.comment}</div>
                        <div style={{ fontSize: "11px", color: "#888780" }}>by {c.commentedBy?.name}</div>
                        {!c.resolved && (
                          <button onClick={() => handleResolveComment(c._id)} style={{ ...btn("#F1EFE8", "#5F5E5A", false), marginTop: "8px", fontSize: "11.5px", padding: "4px 10px" }}>
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {selectedRecord.teacherRemarks && (
                    <div style={{ marginTop: "16px", padding: "14px 16px", background: "#E6F1FB", borderRadius: "10px", borderLeft: "3px solid #185FA5" }}>
                      <div style={{ fontSize: "12px", fontWeight: "500", color: "#185FA5", marginBottom: "6px" }}>Overall Teacher Remarks</div>
                      <div style={{ fontSize: "13.5px", color: "#2C2C2A" }}>{selectedRecord.teacherRemarks}</div>
                    </div>
                  )}
                </div>
              )}

              {/* SIGNATURE */}
              {activeSection === "signature" && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "12px" }}>Digital Signature</div>

                  {isSigned ? (
                    <div>
                      <div style={{ padding: "20px", background: "#EAF3DE", borderRadius: "12px", border: "1px solid #B8D9A0", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                          <i className="ti ti-certificate" style={{ fontSize: "28px", color: "#3B6D11" }}></i>
                          <div>
                            <div style={{ fontSize: "15px", fontWeight: "600", color: "#3B6D11" }}>Digitally Signed</div>
                            <div style={{ fontSize: "12px", color: "#5F7A5A" }}>This record is certified and tamper-proof</div>
                          </div>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "#2C2C2A", lineHeight: "1.8" }}>
                          <div>Signed by: <strong>{selectedRecord.signature?.signedBy?.name}</strong></div>
                          <div>Date: <strong>{new Date(selectedRecord.signature?.signedAt).toLocaleString()}</strong></div>
                          <div style={{ marginTop: "8px", wordBreak: "break-all" }}>
                            Hash: <code style={{ fontSize: "11px", background: "#D4EDDA", padding: "2px 6px", borderRadius: "4px" }}>{selectedRecord.signature?.documentHash}</code>
                          </div>
                        </div>
                      </div>
                      <button onClick={handleVerify} style={btn("#185FA5", "white", false)}>
                        <i className="ti ti-shield-check" style={{ fontSize: "13px", marginRight: "6px" }}></i>
                        Verify Signature Integrity
                      </button>
                    </div>
                  ) : selectedRecord.status === "approved" && isTeacher ? (
                    <div>
                      <div style={{ padding: "16px", background: "#EEEDFE", borderRadius: "10px", marginBottom: "12px", fontSize: "13px", color: "#534AB7" }}>
                        This record is approved and ready to be digitally signed. Once signed it will be permanently locked.
                      </div>
                      <button onClick={handleSign} style={btn("#185FA5", "white", false)}>
                        <i className="ti ti-certificate" style={{ fontSize: "13px", marginRight: "6px" }}></i>
                        Sign Record with Digital Signature
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: "16px", background: "#F5F3EE", borderRadius: "10px", fontSize: "13px", color: "#888780" }}>
                      {selectedRecord.status === "approved"
                        ? "Record is approved. Waiting for teacher signature."
                        : "Record must be approved by teacher before it can be signed."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
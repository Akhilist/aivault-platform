import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API } from "../config/api"

export default function Schedule() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [scheduleForm, setScheduleForm] = useState({})
  const [showScheduleFor, setShowScheduleFor] = useState(null)

  const fetchExams = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/exams`, { headers })
      setExams(res.data.exams)
    } catch (err) {
      setError("Failed to load exams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExams() }, [])

  const handleSchedule = async (examId) => {
    const form = scheduleForm[examId]
    if (!form?.scheduledStart || !form?.scheduledEnd) {
      return setError("Set both start and end time")
    }
    try {
      await axios.put(`${API}/exams/${examId}/schedule`, {
        scheduledStart: form.scheduledStart,
        scheduledEnd: form.scheduledEnd,
      }, { headers })
      setSuccess("Exam scheduled successfully")
      setShowScheduleFor(null)
      await fetchExams()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule")
    }
  }

  const handleGoLive = async (examId) => {
    try {
      await axios.put(`${API}/exams/${examId}/live`, {}, { headers })
      setSuccess("Exam is now live")
      await fetchExams()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to go live")
    }
  }

  const handleClose = async (examId) => {
    if (!window.confirm("Close this exam? Students will no longer be able to take it.")) return
    try {
      await axios.put(`${API}/exams/${examId}/close`, {}, { headers })
      setSuccess("Exam closed")
      await fetchExams()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close")
    }
  }

  const approved = exams.filter(e => e.status === "approved")
  const scheduled = exams.filter(e => e.status === "scheduled")
  const live = exams.filter(e => e.status === "live")
  const closed = exams.filter(e => e.status === "closed")

  const STATUS_COLORS = {
    approved:  { bg: "#E6F1FB", color: "#185FA5", label: "Approved — Ready to Schedule" },
    scheduled: { bg: "#FAEEDA", color: "#854F0B", label: "Scheduled" },
    live:      { bg: "#EAF3DE", color: "#3B6D11", label: "Live" },
    closed:    { bg: "#F1EFE8", color: "#5F5E5A", label: "Closed" },
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
    padding: "7px 10px",
    borderRadius: "6px",
    border: "1px solid #D3D1C7",
    background: "#FAFAF8",
    fontSize: "12.5px",
    color: "#2C2C2A",
    outline: "none",
    fontFamily: "'DM Sans', sans-serif",
  }

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "12px",
  }

  const ExamRow = ({ exam }) => (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>
            {exam.title}
          </div>
          <div style={{ fontSize: "12px", color: "#888780" }}>
            {exam.subject} · {exam.duration} mins · {exam.totalMarks} marks
          </div>
          {exam.scheduledStart && (
            <div style={{ fontSize: "11.5px", color: "#888780", marginTop: "4px" }}>
              {new Date(exam.scheduledStart).toLocaleString()} → {new Date(exam.scheduledEnd).toLocaleString()}
            </div>
          )}
        </div>
        <span style={{
          fontSize: "11.5px", fontWeight: "500", padding: "3px 10px", borderRadius: "20px",
          background: STATUS_COLORS[exam.status]?.bg, color: STATUS_COLORS[exam.status]?.color,
        }}>
          {STATUS_COLORS[exam.status]?.label}
        </span>
      </div>

      <div style={{ marginTop: "12px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        {exam.status === "approved" && (
          showScheduleFor === exam._id ? (
            <>
              <input
                type="datetime-local"
                style={input}
                onChange={e => setScheduleForm(prev => ({ ...prev, [exam._id]: { ...prev[exam._id], scheduledStart: e.target.value } }))}
              />
              <input
                type="datetime-local"
                style={input}
                onChange={e => setScheduleForm(prev => ({ ...prev, [exam._id]: { ...prev[exam._id], scheduledEnd: e.target.value } }))}
              />
              <button onClick={() => handleSchedule(exam._id)} style={btn("#185FA5", "white", false)}>Confirm</button>
              <button onClick={() => setShowScheduleFor(null)} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setShowScheduleFor(exam._id)} style={btn("#185FA5", "white", false)}>
              Schedule
            </button>
          )
        )}

        {exam.status === "scheduled" && (
          <button onClick={() => handleGoLive(exam._id)} style={btn("#3B6D11", "white", false)}>
            Go Live
          </button>
        )}

        {exam.status === "live" && (
          <button onClick={() => handleClose(exam._id)} style={btn("#FAECE7", "#993C1D", false)}>
            Close Exam
          </button>
        )}

        {exam.status === "closed" && (
          <span style={{ fontSize: "12px", color: "#888780" }}>No actions available — exam closed</span>
        )}
      </div>
    </div>
  )

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Schedule
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Schedule, launch, and close examinations
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {success && (
        <div style={{ background: "#EAF3DE", border: "1px solid #B8D9A0", color: "#3B6D11", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#888780" }}>Loading...</div>
      ) : (
        <div>
          {approved.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Ready to Schedule ({approved.length})
              </div>
              {approved.map(exam => <ExamRow key={exam._id} exam={exam} />)}
            </div>
          )}

          {scheduled.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Scheduled ({scheduled.length})
              </div>
              {scheduled.map(exam => <ExamRow key={exam._id} exam={exam} />)}
            </div>
          )}

          {live.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Live Now ({live.length})
              </div>
              {live.map(exam => <ExamRow key={exam._id} exam={exam} />)}
            </div>
          )}

          {closed.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Closed ({closed.length})
              </div>
              {closed.map(exam => <ExamRow key={exam._id} exam={exam} />)}
            </div>
          )}

          {approved.length === 0 && scheduled.length === 0 && live.length === 0 && closed.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
              No exams available for scheduling yet
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
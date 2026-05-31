import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

export default function SecurityAudit() {
  const { token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${API}/exams`, { headers })
        setExams(res.data.exams.filter(e => e.status === "closed" || e.status === "live"))
      } catch (err) {
        setError("Failed to load exams")
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  const handleSelectExam = async (exam) => {
    setSelectedExam(exam)
    try {
      const res = await axios.get(`${API}/submissions/exam/${exam._id}`, { headers })
      setSubmissions(res.data.submissions)
    } catch (err) {
      setError("Failed to load submissions")
    }
  }

  const getRiskLevel = (sub) => {
    if (sub.violations >= 4) return { label: "Critical", bg: "#FAECE7", color: "#993C1D" }
    if (sub.violations >= 2) return { label: "High", bg: "#FAEEDA", color: "#854F0B" }
    if (sub.violations >= 1) return { label: "Medium", bg: "#FAEEDA", color: "#854F0B" }
    return { label: "Low", bg: "#EAF3DE", color: "#3B6D11" }
  }

  const flagged = submissions.filter(s => s.violations > 0)
  const autoSubmitted = submissions.filter(s => s.autoSubmitted)
  const clean = submissions.filter(s => s.violations === 0)

  const btn = (bg, color) => ({
    padding: "7px 14px",
    background: bg,
    color: color,
    border: "none",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: "500",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Security Audit
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Device fingerprints, IP addresses, violations and suspicious activity per exam
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", height: "calc(100vh - 180px)" }}>

        {/* Left — exam list */}
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
            Exams
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>Loading...</div>
            ) : exams.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>No closed exams yet</div>
            ) : (
              exams.map(exam => (
                <div
                  key={exam._id}
                  onClick={() => handleSelectExam(exam)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #F1EFE8",
                    cursor: "pointer",
                    background: selectedExam?._id === exam._id ? "#E6F1FB" : "transparent",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "2px" }}>{exam.title}</div>
                  <div style={{ fontSize: "11.5px", color: "#888780" }}>{exam.subject}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — audit report */}
        {!selectedExam ? (
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#888780" }}>
              <i className="ti ti-shield" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
              <div style={{ fontSize: "14px" }}>Select an exam to view security report</div>
            </div>
          </div>
        ) : (
          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {[
                { label: "Total Students", value: submissions.length, bg: "#E6F1FB", color: "#185FA5", icon: "ti-users" },
                { label: "Flagged", value: flagged.length, bg: "#FAEEDA", color: "#854F0B", icon: "ti-alert-triangle" },
                { label: "Auto Submitted", value: autoSubmitted.length, bg: "#FAECE7", color: "#993C1D", icon: "ti-send" },
                { label: "Clean Sessions", value: clean.length, bg: "#EAF3DE", color: "#3B6D11", icon: "ti-shield-check" },
              ].map(s => (
                <div key={s.label} style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "16px" }}>
                  <div style={{ width: "32px", height: "32px", background: s.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    <i className={`ti ${s.icon}`} style={{ fontSize: "16px", color: s.color }}></i>
                  </div>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A" }}>{s.value}</div>
                  <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Submissions table */}
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
                Session Details
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FAFAF8" }}>
                      {["Student", "Status", "Violations", "Auto Submit", "Device Fingerprint", "IP Address", "Risk"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", color: "#888780", fontWeight: "500", borderBottom: "1px solid #D3D1C7", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: "32px", textAlign: "center", color: "#888780", fontSize: "13px" }}>
                          No submissions for this exam
                        </td>
                      </tr>
                    ) : (
                      submissions.map(sub => {
                        const risk = getRiskLevel(sub)
                        return (
                          <tr key={sub._id} style={{ borderBottom: "1px solid #F1EFE8" }}>
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{sub.studentId?.name}</div>
                              <div style={{ fontSize: "11.5px", color: "#888780" }}>{sub.studentId?.email}</div>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ fontSize: "11.5px", fontWeight: "500", padding: "2px 8px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                                {sub.status}
                              </span>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: sub.violations > 0 ? "#993C1D" : "#3B6D11", fontWeight: "500" }}>
                              {sub.violations}
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: "13px", color: sub.autoSubmitted ? "#993C1D" : "#3B6D11" }}>
                              {sub.autoSubmitted ? "Yes" : "No"}
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <code style={{ fontSize: "11px", background: "#F5F3EE", padding: "2px 6px", borderRadius: "4px", color: "#5F5E5A" }}>
                                {sub.deviceFingerprint ? sub.deviceFingerprint.slice(0, 16) + "..." : "Not captured"}
                              </code>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <code style={{ fontSize: "11px", background: "#F5F3EE", padding: "2px 6px", borderRadius: "4px", color: "#5F5E5A" }}>
                                {sub.ipAddress || "Not captured"}
                              </code>
                            </td>
                            <td style={{ padding: "12px 16px" }}>
                              <span style={{ fontSize: "11.5px", fontWeight: "500", padding: "2px 8px", borderRadius: "20px", background: risk.bg, color: risk.color }}>
                                {risk.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
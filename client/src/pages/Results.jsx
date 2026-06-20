import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API } from "../config/api"


export default function Results() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const isStudent = user?.role === "student"
  const isEC = user?.role === "exam_controller"

  const [results, setResults] = useState([])
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (isStudent) {
          const res = await axios.get(`${API}/submissions/my-results`, { headers })
          setResults(res.data.submissions)
        } else {
          const res = await axios.get(`${API}/exams`, { headers })
          setExams(res.data.exams.filter(e => e.status === "closed"))
        }
      } catch (err) {
        setError("Failed to load results")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "12px",
  }

  const gradeBadge = (passed) => ({
    fontSize: "11.5px",
    fontWeight: "500",
    padding: "2px 10px",
    borderRadius: "20px",
    background: passed === true ? "#EAF3DE" : passed === false ? "#FAECE7" : "#F1EFE8",
    color: passed === true ? "#3B6D11" : passed === false ? "#993C1D" : "#888780",
  })

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          {isStudent ? "My Results" : "Exam Results"}
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          {isStudent ? "Your published exam results" : "View results for all closed exams"}
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#888780" }}>Loading results...</div>
      ) : isStudent ? (
        <div>
          {results.length === 0 ? (
            <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
              <i className="ti ti-file-text" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }}></i>
              No published results yet. Check back after your teacher grades your exam.
            </div>
          ) : (
            results.map(sub => (
              <div key={sub._id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", marginBottom: "4px" }}>
                      {sub.examId?.title || "Exam"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#888780", marginBottom: "8px" }}>
                      {sub.examId?.subject} · Submitted {new Date(sub.submitTime).toLocaleDateString()}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <span style={gradeBadge(sub.passed)}>
                        {sub.passed === true ? "Passed" : sub.passed === false ? "Failed" : "Pending"}
                      </span>
                      {sub.violations > 0 && (
                        <span style={{ fontSize: "11.5px", color: "#993C1D" }}>
                          {sub.violations} violation{sub.violations > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: "32px", fontWeight: "700", color: "#185FA5" }}>
                      {sub.totalScore !== null ? sub.totalScore : "-"}
                      <span style={{ fontSize: "16px", color: "#888780" }}>/{sub.totalMarks}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#888780" }}>
                      {sub.percentage !== null ? `${sub.percentage}%` : ""}
                    </div>
                  </div>
                </div>

                {/* Per question breakdown */}
                {sub.answers && sub.answers.length > 0 && (
                  <div style={{ marginTop: "16px", borderTop: "1px solid #F1EFE8", paddingTop: "14px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#888780", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Question Breakdown
                    </div>
                    {sub.answers.map((ans, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F5F3EE" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "13px", color: "#2C2C2A" }}>
                            Q{i + 1} — {ans.answer ? ans.answer.slice(0, 60) + (ans.answer.length > 60 ? "..." : "") : "No answer"}
                          </div>
                          {ans.teacherComment && (
                            <div style={{ fontSize: "12px", color: "#185FA5", marginTop: "3px" }}>
                              Teacher: {ans.teacherComment}
                            </div>
                          )}
                          {ans.aiFeedback && (
                            <div style={{ fontSize: "12px", color: "#534AB7", marginTop: "3px" }}>
                              AI Feedback: {ans.aiFeedback}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#2C2C2A", marginLeft: "16px" }}>
                          {ans.marks !== null ? `${ans.marks}/${ans.maxMarks}` : "Pending"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        // Exam Controller view
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", height: "calc(100vh - 180px)" }}>
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
              Closed Exams
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {exams.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>No closed exams</div>
              ) : (
                exams.map(exam => (
                  <div
                    key={exam._id}
                    onClick={() => handleSelectExam(exam)}
                    style={{ padding: "12px 16px", borderBottom: "1px solid #F1EFE8", cursor: "pointer", background: selectedExam?._id === exam._id ? "#E6F1FB" : "transparent" }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "2px" }}>{exam.title}</div>
                    <div style={{ fontSize: "11.5px", color: "#888780" }}>{exam.subject}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {!selectedExam ? (
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#888780" }}>
                <i className="ti ti-certificate" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                <div>Select an exam to view results</div>
              </div>
            </div>
          ) : (
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #D3D1C7" }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A" }}>{selectedExam.title}</div>
                <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>{submissions.length} submissions</div>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FAFAF8" }}>
                      {["Student", "Score", "Percentage", "Status", "Violations", "Published"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11.5px", color: "#888780", fontWeight: "500", borderBottom: "1px solid #D3D1C7" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#888780" }}>No submissions</td></tr>
                    ) : (
                      submissions.map(sub => (
                        <tr key={sub._id} style={{ borderBottom: "1px solid #F1EFE8" }}>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{sub.studentId?.name}</div>
                            <div style={{ fontSize: "11.5px", color: "#888780" }}>{sub.studentId?.email}</div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#2C2C2A" }}>
                            {sub.totalScore !== null ? `${sub.totalScore}/${sub.totalMarks}` : "Pending"}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: "#2C2C2A" }}>
                            {sub.percentage !== null ? `${sub.percentage}%` : "-"}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={gradeBadge(sub.passed)}>
                              {sub.passed === true ? "Passed" : sub.passed === false ? "Failed" : "Pending"}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: "13px", color: sub.violations > 0 ? "#993C1D" : "#3B6D11" }}>
                            {sub.violations}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: "11.5px", padding: "2px 8px", borderRadius: "20px", background: sub.resultPublished ? "#EAF3DE" : "#F1EFE8", color: sub.resultPublished ? "#3B6D11" : "#888780" }}>
                              {sub.resultPublished ? "Yes" : "No"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API } from "../config/api"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, Legend
} from "recharts"


const COLORS = ["#185FA5", "#3B6D11", "#854F0B", "#534AB7", "#993C1D", "#085041"]

export default function Analytics() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const isStudent = user?.role === "student"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const examRes = await axios.get(`${API}/exams`, { headers })
        const closedExams = examRes.data.exams.filter(e =>
          e.status === "closed" || e.status === "live"
        )
        setExams(closedExams)

        if (isStudent) {
          const subRes = await axios.get(`${API}/submissions/my-results`, { headers })
          setSubmissions(subRes.data.submissions)
        }
      } catch (err) {
        setError("Failed to load analytics")
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

  // compute analytics from submissions
  const submitted = submissions.filter(s => s.status !== "started")
  const graded = submissions.filter(s => s.totalScore !== null)
  const passed = graded.filter(s => s.passed === true)
  const failed = graded.filter(s => s.passed === false)
  const avgScore = graded.length > 0
    ? Math.round(graded.reduce((sum, s) => sum + s.totalScore, 0) / graded.length)
    : 0
  const passRate = graded.length > 0
    ? Math.round((passed.length / graded.length) * 100)
    : 0
  const topScore = graded.length > 0
    ? Math.max(...graded.map(s => s.totalScore))
    : 0

  // score distribution
  const scoreDistribution = () => {
    if (!selectedExam || graded.length === 0) return []
    const totalMarks = selectedExam.totalMarks
    const buckets = [
      { range: "0-20%",   min: 0,   max: 0.2  },
      { range: "21-40%",  min: 0.2, max: 0.4  },
      { range: "41-60%",  min: 0.4, max: 0.6  },
      { range: "61-80%",  min: 0.6, max: 0.8  },
      { range: "81-100%", min: 0.8, max: 1.01 },
    ]
    return buckets.map(b => ({
      range: b.range,
      count: graded.filter(s => {
        const pct = s.totalScore / totalMarks
        return pct >= b.min && pct < b.max
      }).length
    }))
  }

  // violation distribution
  const violationData = [
    { name: "No violations", value: submissions.filter(s => s.violations === 0).length },
    { name: "1 violation",   value: submissions.filter(s => s.violations === 1).length },
    { name: "2 violations",  value: submissions.filter(s => s.violations === 2).length },
    { name: "3+ violations", value: submissions.filter(s => s.violations >= 3).length },
  ].filter(d => d.value > 0)

  // student results for personal view
  const studentResultsData = submissions.map(s => ({
    name: s.examId?.title?.slice(0, 15) || "Exam",
    score: s.totalScore || 0,
    total: s.examId?.totalMarks || 100,
    percent: s.percentage || 0,
  }))

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "20px",
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: "center", padding: "60px", color: "#888780" }}>Loading analytics...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Analytics
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          {isStudent ? "Your personal performance" : "Exam performance and statistics"}
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Student personal analytics */}
      {isStudent && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            {[
              { label: "Exams Taken",   value: submissions.length, icon: "ti-file-text",  color: "#185FA5", bg: "#E6F1FB" },
              { label: "Avg Score",     value: `${avgScore}%`,     icon: "ti-chart-bar",  color: "#3B6D11", bg: "#EAF3DE" },
              { label: "Passed",        value: passed.length,      icon: "ti-check",      color: "#534AB7", bg: "#EEEDFE" },
              { label: "Failed",        value: failed.length,      icon: "ti-x",          color: "#993C1D", bg: "#FAECE7" },
            ].map(s => (
              <div key={s.label} style={card}>
                <div style={{ width: "34px", height: "34px", background: s.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: "17px", color: s.color }}></i>
                </div>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "26px", fontWeight: "600", color: "#2C2C2A" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {studentResultsData.length > 0 && (
            <div style={{ ...card, marginBottom: "16px" }}>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "16px" }}>
                Score History
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={studentResultsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888780" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#888780" }} domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percent" stroke="#185FA5" strokeWidth={2} dot={{ fill: "#185FA5" }} name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {submissions.length === 0 && (
            <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
              <i className="ti ti-chart-bar" style={{ fontSize: "40px", marginBottom: "12px", display: "block" }}></i>
              No results published yet. Take an exam to see your analytics.
            </div>
          )}
        </div>
      )}

      {/* Teacher/Admin analytics */}
      {!isStudent && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "16px" }}>

          {/* Exam list */}
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
              Select Exam
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {exams.length === 0 ? (
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

          {/* Analytics content */}
          {!selectedExam ? (
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center", color: "#888780" }}>
                <i className="ti ti-chart-bar" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                <div style={{ fontSize: "14px" }}>Select an exam to view analytics</div>
              </div>
            </div>
          ) : (
            <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* Summary stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                {[
                  { label: "Submissions", value: submitted.length, icon: "ti-users",      color: "#185FA5", bg: "#E6F1FB" },
                  { label: "Pass Rate",   value: `${passRate}%`,   icon: "ti-check",      color: "#3B6D11", bg: "#EAF3DE" },
                  { label: "Avg Score",   value: avgScore,          icon: "ti-chart-bar",  color: "#534AB7", bg: "#EEEDFE" },
                  { label: "Top Score",   value: topScore,          icon: "ti-trophy",     color: "#854F0B", bg: "#FAEEDA" },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ width: "34px", height: "34px", background: s.bg, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
                      <i className={`ti ${s.icon}`} style={{ fontSize: "17px", color: s.color }}></i>
                    </div>
                    <div style={{ fontFamily: "'Lora', serif", fontSize: "26px", fontWeight: "600", color: "#2C2C2A" }}>{s.value}</div>
                    <div style={{ fontSize: "12px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "12px" }}>

                {/* Score distribution */}
                <div style={card}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "16px" }}>
                    Score Distribution
                  </div>
                  {graded.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888780", padding: "32px", fontSize: "13px" }}>No graded submissions yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={scoreDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1EFE8" />
                        <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#888780" }} />
                        <YAxis tick={{ fontSize: 11, fill: "#888780" }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#185FA5" radius={[4, 4, 0, 0]} name="Students" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Pass vs Fail */}
                <div style={card}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "16px" }}>
                    Pass vs Fail
                  </div>
                  {graded.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#888780", padding: "32px", fontSize: "13px" }}>No graded submissions yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Passed", value: passed.length },
                            { name: "Failed", value: failed.length },
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#3B6D11" />
                          <Cell fill="#993C1D" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Violation chart */}
              {violationData.length > 0 && (
                <div style={card}>
                  <div style={{ fontFamily: "'Lora', serif", fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "16px" }}>
                    Violation Distribution
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={violationData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {violationData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Student scores table */}
              <div style={{ ...card, marginBottom: "16px" }}>
                <div style={{ fontFamily: "'Lora', serif", fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "16px" }}>
                  Student Results
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#FAFAF8" }}>
                      {["Student", "Score", "Percentage", "Status", "Violations"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "11.5px", color: "#888780", fontWeight: "500", borderBottom: "1px solid #D3D1C7" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submitted.map(sub => (
                      <tr key={sub._id} style={{ borderBottom: "1px solid #F1EFE8" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{sub.studentId?.name}</div>
                          <div style={{ fontSize: "11.5px", color: "#888780" }}>{sub.studentId?.email}</div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#2C2C2A" }}>
                          {sub.totalScore !== null ? `${sub.totalScore}/${sub.totalMarks}` : "Pending"}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: "13px", color: "#2C2C2A" }}>
                          {sub.percentage !== null ? `${sub.percentage}%` : "-"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{
                            fontSize: "11.5px", fontWeight: "500", padding: "2px 8px", borderRadius: "20px",
                            background: sub.passed === true ? "#EAF3DE" : sub.passed === false ? "#FAECE7" : "#F1EFE8",
                            color: sub.passed === true ? "#3B6D11" : sub.passed === false ? "#993C1D" : "#888780",
                          }}>
                            {sub.passed === true ? "Passed" : sub.passed === false ? "Failed" : "Pending"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: "13px", color: sub.violations > 0 ? "#993C1D" : "#3B6D11", fontWeight: "500" }}>
                          {sub.violations}
                        </td>
                      </tr>
                    ))}
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
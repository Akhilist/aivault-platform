import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"

export default function TeacherDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Active Exams",     value: "4",   icon: "ti-file-certificate", color: "#185FA5", bg: "#E6F1FB" },
    { label: "Students",         value: "248", icon: "ti-users",            color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Pending Grading",  value: "31",  icon: "ti-clock",            color: "#854F0B", bg: "#FAEEDA" },
    { label: "AI Analyses Done", value: "189", icon: "ti-brain",            color: "#534AB7", bg: "#EEEDFE" },
  ]

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontFamily: "'Lora', serif",
          fontSize: "24px",
          fontWeight: "600",
          color: "#2C2C2A",
          margin: "0 0 4px"
        }}>Good day, {user?.name} 👋</h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Here's what's happening in your department today
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginBottom: "24px"
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "white",
            border: "1px solid #D3D1C7",
            borderRadius: "12px",
            padding: "16px"
          }}>
            <div style={{
              width: "36px", height: "36px",
              background: s.bg,
              borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "10px"
            }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: "18px", color: s.color }}></i>
            </div>
            <div style={{
              fontFamily: "'Lora', serif",
              fontSize: "28px",
              fontWeight: "600",
              color: "#2C2C2A",
              lineHeight: 1
            }}>{s.value}</div>
            <div style={{
              fontSize: "12px",
              color: "#888780",
              marginTop: "4px"
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Exams table */}
      <div style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px"
      }}>
        <h2 style={{
          fontFamily: "'Lora', serif",
          fontSize: "16px",
          fontWeight: "600",
          color: "#2C2C2A",
          margin: "0 0 16px"
        }}>Active & Upcoming Exams</h2>

        {[
          { name: "Data Structures — Lab",      batch: "S3 MCA · 62 students", status: "Live",     sc: "#3B6D11", sb: "#EAF3DE" },
          { name: "Operating Systems — Theory", batch: "S5 MCA · 58 students", status: "Upcoming", sc: "#185FA5", sb: "#E6F1FB" },
          { name: "Python Programming",         batch: "S1 MCA · 74 students", status: "Grading",  sc: "#854F0B", sb: "#FAEEDA" },
        ].map((exam) => (
          <div key={exam.name} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: "1px solid #F1EFE8"
          }}>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: "500", color: "#2C2C2A" }}>
                {exam.name}
              </div>
              <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>
                {exam.batch}
              </div>
            </div>
            <span style={{
              fontSize: "11.5px",
              fontWeight: "500",
              padding: "3px 10px",
              borderRadius: "20px",
              background: exam.sb,
              color: exam.sc
            }}>{exam.status}</span>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div style={{
        background: "white",
        border: "1px solid #D3D1C7",
        borderRadius: "12px",
        padding: "20px"
      }}>
        <h2 style={{
          fontFamily: "'Lora', serif",
          fontSize: "16px",
          fontWeight: "600",
          color: "#2C2C2A",
          margin: "0 0 16px"
        }}>Recent Activity</h2>

        {[
          { icon: "ti-check",          bg: "#EAF3DE", color: "#3B6D11", text: "Arjun K. submitted code lab record",  time: "12 minutes ago" },
          { icon: "ti-brain",          bg: "#E6F1FB", color: "#185FA5", text: "AI graded 18 descriptive answers",    time: "34 minutes ago" },
          { icon: "ti-alert-triangle", bg: "#FAEEDA", color: "#854F0B", text: "Plagiarism flag on 2 submissions",    time: "1 hour ago" },
        ].map((a) => (
          <div key={a.text} style={{
            display: "flex",
            gap: "12px",
            padding: "10px 0",
            borderBottom: "1px solid #F1EFE8",
            alignItems: "flex-start"
          }}>
            <div style={{
              width: "32px", height: "32px",
              borderRadius: "8px",
              background: a.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <i className={`ti ${a.icon}`} style={{ fontSize: "15px", color: a.color }}></i>
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "#2C2C2A" }}>{a.text}</div>
              <div style={{ fontSize: "11.5px", color: "#B4B2A9", marginTop: "2px" }}>{a.time}</div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
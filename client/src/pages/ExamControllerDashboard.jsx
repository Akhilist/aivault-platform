import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"

export default function ExamControllerDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Scheduled Exams", value: "8",  icon: "ti-calendar",       color: "#185FA5", bg: "#E6F1FB" },
    { label: "Live Now",        value: "2",  icon: "ti-live-view",      color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Pending Certify", value: "5",  icon: "ti-certificate",    color: "#854F0B", bg: "#FAEEDA" },
    { label: "Total Students",  value: "620",icon: "ti-users",          color: "#534AB7", bg: "#EEEDFE" },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Exam Control Centre
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Good day, {user?.name} — manage and monitor all exams
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "16px" }}>
            <div style={{ width: "36px", height: "36px", background: s.bg, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px" }}>
              <i className={`ti ${s.icon}`} style={{ fontSize: "18px", color: s.color }}></i>
            </div>
            <div style={{ fontFamily: "'Lora', serif", fontSize: "28px", fontWeight: "600", color: "#2C2C2A", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "20px" }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
          Today's Exam Schedule
        </h2>
        {[
          { name: "Data Structures — Lab",      dept: "MCA S3 · 62 students", time: "2:00 PM – 4:00 PM", sc: "#3B6D11", sb: "#EAF3DE", status: "Live" },
          { name: "Operating Systems — Theory", dept: "MCA S5 · 58 students", time: "10:00 AM – 12:00 PM",sc: "#185FA5", sb: "#E6F1FB", status: "Upcoming" },
          { name: "Python Programming",         dept: "MCA S1 · 74 students", time: "Completed",          sc: "#854F0B", sb: "#FAEEDA", status: "Grading" },
        ].map((e) => (
          <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1EFE8" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{e.name}</div>
              <div style={{ fontSize: "11.5px", color: "#888780", marginTop: "2px" }}>{e.dept} · {e.time}</div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "500", padding: "3px 9px", borderRadius: "20px", background: e.sb, color: e.sc }}>{e.status}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
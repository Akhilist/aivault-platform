import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"

export default function StudentDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Upcoming Exams",  value: "3",  icon: "ti-file-text",  color: "#185FA5", bg: "#E6F1FB" },
    { label: "Completed Exams", value: "12", icon: "ti-check",      color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Avg Score",       value: "78%",icon: "ti-chart-bar",  color: "#534AB7", bg: "#EEEDFE" },
    { label: "Record Book",     value: "9",  icon: "ti-book",       color: "#854F0B", bg: "#FAEEDA" },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Welcome back, {user?.name} 👋
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Here's your academic summary
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

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "16px" }}>
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
            Upcoming Exams
          </h2>
          {[
            { name: "Data Structures — Lab",      date: "Today 2:00 PM",   sc: "#3B6D11", sb: "#EAF3DE", status: "Today" },
            { name: "Operating Systems — Theory", date: "Tomorrow 10:00 AM",sc: "#185FA5", sb: "#E6F1FB", status: "Tomorrow" },
            { name: "Computer Networks",          date: "May 20, 9:00 AM", sc: "#854F0B", sb: "#FAEEDA", status: "May 20" },
          ].map((e) => (
            <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1EFE8" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{e.name}</div>
                <div style={{ fontSize: "11.5px", color: "#888780", marginTop: "2px" }}>{e.date}</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: "500", padding: "3px 9px", borderRadius: "20px", background: e.sb, color: e.sc }}>{e.status}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "20px" }}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
            Recent Results
          </h2>
          {[
            { name: "Python Programming", score: "88/100", grade: "A" },
            { name: "DBMS — Theory",      score: "74/100", grade: "B" },
            { name: "Web Technology",     score: "91/100", grade: "A+" },
          ].map((r) => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1EFE8" }}>
              <div style={{ fontSize: "13px", color: "#2C2C2A" }}>{r.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#888780" }}>{r.score}</span>
                <span style={{ fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" }}>{r.grade}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
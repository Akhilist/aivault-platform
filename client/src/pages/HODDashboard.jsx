import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"

export default function HODDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Total Teachers",  value: "18", icon: "ti-users",            color: "#185FA5", bg: "#E6F1FB" },
    { label: "Total Students",  value: "420",icon: "ti-school",           color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Active Exams",    value: "6",  icon: "ti-file-certificate", color: "#854F0B", bg: "#FAEEDA" },
    { label: "Dept Pass Rate",  value: "87%",icon: "ti-chart-bar",        color: "#534AB7", bg: "#EEEDFE" },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Department Overview 👋
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Good day, {user?.name} — here's your department summary
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
          Pending Approvals
        </h2>
        {[
          { name: "Data Structures Question Paper", teacher: "Dr. Ramesh K.", type: "Exam Approval",    sc: "#854F0B", sb: "#FAEEDA" },
          { name: "S3 MCA Record Books (12)",       teacher: "Prof. Anita S.", type: "Record Review",   sc: "#185FA5", sb: "#E6F1FB" },
          { name: "Python Lab Exam Results",        teacher: "Dr. Meena P.",  type: "Result Sign-off",  sc: "#534AB7", sb: "#EEEDFE" },
        ].map((a) => (
          <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1EFE8" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{a.name}</div>
              <div style={{ fontSize: "11.5px", color: "#888780", marginTop: "2px" }}>{a.teacher}</div>
            </div>
            <span style={{ fontSize: "11px", fontWeight: "500", padding: "3px 9px", borderRadius: "20px", background: a.sb, color: a.sc }}>{a.type}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
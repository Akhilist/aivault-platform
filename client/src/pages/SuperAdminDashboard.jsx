import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"

export default function SuperAdminDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Institutions",   value: "12",  icon: "ti-building",   color: "#185FA5", bg: "#E6F1FB" },
    { label: "Total Users",    value: "4820",icon: "ti-users",      color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Active Exams",   value: "38",  icon: "ti-file-text",  color: "#854F0B", bg: "#FAEEDA" },
    { label: "System Health",  value: "99%", icon: "ti-heart-rate", color: "#534AB7", bg: "#EEEDFE" },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          System Overview
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Good day, {user?.name} — platform-wide summary
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
          Registered Institutions
        </h2>
        {[
          { name: "Kerala University",   students: "1240", status: "Active" },
          { name: "Calicut University",  students: "980",  status: "Active" },
          { name: "Kannur University",   students: "760",  status: "Active" },
          { name: "MG University",       students: "1100", status: "Active" },
        ].map((inst) => (
          <div key={inst.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1EFE8" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{inst.name}</div>
            <div style={{ fontSize: "12px", color: "#888780" }}>{inst.students} students</div>
            <span style={{ fontSize: "11px", fontWeight: "500", padding: "3px 9px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" }}>{inst.status}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}

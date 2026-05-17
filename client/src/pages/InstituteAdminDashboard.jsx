import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"

export default function InstituteAdminDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Departments",    value: "6",   icon: "ti-building",       color: "#185FA5", bg: "#E6F1FB" },
    { label: "Total Staff",    value: "84",  icon: "ti-users",          color: "#3B6D11", bg: "#EAF3DE" },
    { label: "Total Students", value: "1240",icon: "ti-school",         color: "#854F0B", bg: "#FAEEDA" },
    { label: "Active Exams",   value: "14",  icon: "ti-file-text",      color: "#534AB7", bg: "#EEEDFE" },
  ]

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Institution Overview
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Good day, {user?.name} — institution-wide summary
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
          Department Summary
        </h2>
        {[
          { name: "MCA",  students: "420", teachers: "18", passRate: "87%" },
          { name: "BCA",  students: "380", teachers: "14", passRate: "82%" },
          { name: "MSc",  students: "210", teachers: "22", passRate: "91%" },
          { name: "BSc",  students: "230", teachers: "30", passRate: "79%" },
        ].map((d) => (
          <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F1EFE8" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", width: "80px" }}>{d.name}</div>
            <div style={{ fontSize: "12px", color: "#888780" }}>{d.students} students</div>
            <div style={{ fontSize: "12px", color: "#888780" }}>{d.teachers} teachers</div>
            <span style={{ fontSize: "11px", fontWeight: "500", padding: "3px 9px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" }}>
              {d.passRate} pass
            </span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}

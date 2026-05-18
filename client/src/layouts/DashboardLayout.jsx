import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ROLE_COLORS = {
  super_admin:      { accent: "#2C2C2A", light: "#F1EFE8" },
  institute_admin:  { accent: "#0C447C", light: "#E6F1FB" },
  hod:              { accent: "#085041", light: "#E1F5EE" },
  exam_controller:  { accent: "#854F0B", light: "#FAEEDA" },
  teacher:          { accent: "#534AB7", light: "#EEEDFE" },
  student:          { accent: "#993C1D", light: "#FAECE7" },
}

const NAV_ITEMS = {
  super_admin: [
    { icon: "ti-layout-dashboard", label: "Dashboard",    path: "/dashboard/superadmin" },
    { icon: "ti-building",         label: "Institutions", path: "/institutions" },
    { icon: "ti-users",            label: "All Users",    path: "/users" },
    { icon: "ti-settings",         label: "Settings",     path: "/settings" },
  ],
  institute_admin: [
    { icon: "ti-layout-dashboard", label: "Dashboard",   path: "/dashboard/instituteadmin" },
    { icon: "ti-building",         label: "Departments", path: "/departments" },
    { icon: "ti-users",            label: "Staff",       path: "/staff" },
    { icon: "ti-report-analytics", label: "Analytics",   path: "/analytics" },
    { icon: "ti-settings",         label: "Settings",    path: "/settings" },
  ],
  hod: [
    { icon: "ti-layout-dashboard", label: "Dashboard",     path: "/dashboard/hod" },
    { icon: "ti-users",            label: "Teachers",      path: "/teachers" },
    { icon: "ti-school",           label: "Students",      path: "/students" },
    { icon: "ti-file-text",        label: "Exams",         path: "/exams" },
    { icon: "ti-database",         label: "Question Bank", path: "/questions" },
    { icon: "ti-report-analytics", label: "Analytics",     path: "/analytics" },
    { icon: "ti-settings",         label: "Settings",      path: "/settings" },
  ],
  exam_controller: [
    { icon: "ti-layout-dashboard", label: "Dashboard",  path: "/dashboard/examcontroller" },
    { icon: "ti-calendar",         label: "Schedule",   path: "/schedule" },
    { icon: "ti-file-text",        label: "Exams",      path: "/exams" },
    { icon: "ti-certificate",      label: "Results",    path: "/results" },
    { icon: "ti-settings",         label: "Settings",   path: "/settings" },
  ],
  teacher: [
    { icon: "ti-layout-dashboard", label: "Dashboard",     path: "/dashboard/teacher" },
    { icon: "ti-file-text",        label: "Exams",         path: "/exams" },
    { icon: "ti-database",         label: "Question Bank", path: "/questions" },
    { icon: "ti-code",             label: "Code Lab",      path: "/codelab" },
    { icon: "ti-report-analytics", label: "Analytics",     path: "/analytics" },
    { icon: "ti-message-circle",   label: "Feedback",      path: "/feedback" },
    { icon: "ti-device-tv",        label: "Live Poll",     path: "/poll" },
  ],
  student: [
    { icon: "ti-layout-dashboard", label: "Dashboard",    path: "/dashboard/student" },
    { icon: "ti-file-text",        label: "My Exams",     path: "/exams" },
    { icon: "ti-code",             label: "Code Lab",     path: "/codelab" },
    { icon: "ti-book",             label: "Record Book",  path: "/records" },
    { icon: "ti-chart-bar",        label: "My Results",   path: "/results" },
    { icon: "ti-message-circle",   label: "Feedback",     path: "/feedback" },
  ],
}

const ROLE_LABELS = {
  super_admin:     "Super Admin",
  institute_admin: "Institute Admin",
  hod:             "HOD",
  exam_controller: "Exam Controller",
  teacher:         "Teacher",
  student:         "Student",
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const role = user?.role || "student"
  const color = ROLE_COLORS[role] || ROLE_COLORS.student
  const navItems = NAV_ITEMS[role] || []

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const initials = user?.name
    ?.split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??"

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#F5F3EE",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Sidebar */}
      <div style={{
        width: "220px",
        backgroundColor: "white",
        borderRight: "1px solid #D3D1C7",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "fixed",
        height: "100vh",
        overflowY: "auto"
      }}>
        {/* Logo */}
        <div style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #D3D1C7"
        }}>
          <div style={{
            fontFamily: "'Lora', serif",
            fontSize: "18px",
            fontWeight: "600",
            color: "#185FA5"
          }}>AIVault</div>
          <div style={{
            fontSize: "11px",
            color: "#888780",
            marginTop: "2px"
          }}>Academic Platform</div>
        </div>

        {/* Role badge */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #D3D1C7" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: color.light,
            color: color.accent,
            fontSize: "11.5px",
            fontWeight: "500",
            padding: "4px 10px",
            borderRadius: "20px"
          }}>
            <i className="ti ti-shield-check" style={{ fontSize: "12px" }}></i>
            {ROLE_LABELS[role]}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  color: isActive ? color.accent : "#5F5E5A",
                  background: isActive ? color.light : "transparent",
                  fontWeight: isActive ? "500" : "400",
                  cursor: "pointer",
                  marginBottom: "2px",
                  transition: "background 0.15s"
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: "17px" }}></i>
                {item.label}
              </div>
            )
          })}
        </nav>

        {/* User + logout */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid #D3D1C7"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px"
          }}>
            <div style={{
              width: "32px", height: "32px",
              borderRadius: "50%",
              background: color.light,
              color: color.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "600",
              flexShrink: 0
            }}>{initials}</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#2C2C2A",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>{user?.name}</div>
              <div style={{
                fontSize: "11px",
                color: "#888780",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>{user?.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "7px",
              border: "1px solid #D3D1C7",
              borderRadius: "7px",
              background: "transparent",
              fontSize: "12.5px",
              color: "#5F5E5A",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            <i className="ti ti-logout" style={{ fontSize: "14px" }}></i>
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft: "220px", flex: 1, padding: "28px" }}>
        {children}
      </div>
    </div>
  )
}
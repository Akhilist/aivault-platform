import { useState, useEffect } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API } from "../config/api"


const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Administration", "Examination Cell"]
const BATCHES = ["MCA-S1", "MCA-S2", "MCA-S3", "MSCS-S1", "MSCS-S2", "BCA-S4", "BCA-S5", "BCA-S6"]

export default function UserManagement() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const isInstituteAdmin = user?.role === "institute_admin"
  const isHOD = user?.role === "hod"

  const ROLE_OPTIONS = isInstituteAdmin
    ? [
        { value: "hod", label: "HOD" },
        { value: "exam_controller", label: "Exam Controller" },
        { value: "institute_admin", label: "Institute Admin" },
      ]
    : [
        { value: "teacher", label: "Teacher" },
        { value: "student", label: "Student" },
      ]

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterRole, setFilterRole] = useState("all")

  const [form, setForm] = useState({
    name: "", email: "", password: "test1234", role: ROLE_OPTIONS[0].value,
    department: "", batch: "", rollNumber: "",
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API}/auth/users`, { headers })
      setUsers(res.data.users)
    } catch (err) {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      return setError("Name, email and password are required")
    }
    try {
      await axios.post(`${API}/auth/users`, form, { headers })
      setSuccess(`${ROLE_OPTIONS.find(r => r.value === form.role)?.label} account created successfully`)
      setShowCreate(false)
      setForm({ name: "", email: "", password: "test1234", role: ROLE_OPTIONS[0].value, department: "", batch: "", rollNumber: "" })
      await fetchUsers()
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user")
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}'s account? This cannot be undone.`)) return
    try {
      await axios.delete(`${API}/auth/users/${id}`, { headers })
      setSuccess("User deleted")
      await fetchUsers()
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to delete user")
    }
  }

  const filteredUsers = filterRole === "all" ? users : users.filter(u => u.role === filterRole)

  const ROLE_BADGE = {
    hod: { bg: "#EEEDFE", color: "#534AB7" },
    exam_controller: { bg: "#FAEEDA", color: "#854F0B" },
    institute_admin: { bg: "#E6F1FB", color: "#185FA5" },
    teacher: { bg: "#EAF3DE", color: "#3B6D11" },
    student: { bg: "#F1EFE8", color: "#5F5E5A" },
  }

  const btn = (bg, color, disabled) => ({
    padding: "8px 16px",
    background: disabled ? "#D3D1C7" : bg,
    color: disabled ? "#888780" : color,
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
  })

  const input = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "1px solid #D3D1C7",
    background: "#FAFAF8",
    fontSize: "13px",
    color: "#2C2C2A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "10px",
  }

  const label = {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "500",
    color: "#2C2C2A",
    marginBottom: "5px",
  }

  return (
    <DashboardLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
            User Management
          </h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            {isInstituteAdmin ? "Manage HODs, Exam Controllers and Institute Admins" : "Manage teachers and students in your department"}
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} style={btn("#185FA5", "white", false)}>
          + Add {isInstituteAdmin ? "Staff" : "Person"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {success && (
        <div style={{ background: "#EAF3DE", border: "1px solid #B8D9A0", color: "#3B6D11", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
          <i className="ti ti-check" style={{ marginRight: "6px" }}></i>{success}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "440px" }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
              Add New Account
            </h2>

            <label style={label}>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={input}>
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            <label style={label}>Full Name</label>
            <input type="text" placeholder="e.g. Dr. Anjali Kumar" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={input} />

            <label style={label}>Email</label>
            <input type="email" placeholder="email@aivault.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={input} />

            <label style={label}>Temporary Password</label>
            <input type="text" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={input} />

            {(form.role === "hod" || form.role === "teacher" || form.role === "institute_admin" || form.role === "exam_controller") && (
              <>
                <label style={label}>Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={input}>
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </>
            )}

            {form.role === "student" && (
              <>
                <label style={label}>Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={input}>
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <label style={label}>Batch</label>
                <select value={form.batch} onChange={e => setForm({ ...form, batch: e.target.value })} style={input}>
                  <option value="">Select batch...</option>
                  {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <label style={label}>Roll Number</label>
                <input type="text" placeholder="e.g. MCA021" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} style={input} />
              </>
            )}

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "8px" }}>
              <button onClick={() => setShowCreate(false)} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
              <button onClick={handleCreate} style={btn("#185FA5", "white", false)}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {["all", ...ROLE_OPTIONS.map(r => r.value)].map(r => (
          <button
            key={r}
            onClick={() => setFilterRole(r)}
            style={{
              padding: "7px 16px",
              background: filterRole === r ? "#185FA5" : "white",
              color: filterRole === r ? "white" : "#5F5E5A",
              border: "1px solid",
              borderColor: filterRole === r ? "#185FA5" : "#D3D1C7",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: filterRole === r ? "500" : "400",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              textTransform: "capitalize",
            }}
          >
            {r === "all" ? "All" : ROLE_OPTIONS.find(opt => opt.value === r)?.label}
            {r !== "all" && ` (${users.filter(u => u.role === r).length})`}
          </button>
        ))}
      </div>

      {/* Users table */}
      <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFAF8" }}>
              {["Name", "Email", "Role", "Department", "Batch/Roll", "Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11.5px", color: "#888780", fontWeight: "500", borderBottom: "1px solid #D3D1C7" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#888780" }}>Loading...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#888780" }}>No accounts yet. Click + Add to create one.</td></tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u._id} style={{ borderBottom: "1px solid #F1EFE8" }}>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>{u.name}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#5F5E5A" }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: "500", padding: "2px 9px", borderRadius: "20px", background: ROLE_BADGE[u.role]?.bg, color: ROLE_BADGE[u.role]?.color }}>
                      {ROLE_OPTIONS.find(r => r.value === u.role)?.label || u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#5F5E5A" }}>{u.department || "-"}</td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", color: "#5F5E5A" }}>
                    {u.batch ? `${u.batch}${u.rollNumber ? ` · ${u.rollNumber}` : ""}` : "-"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => handleDelete(u._id, u.name)} style={{ background: "none", border: "none", color: "#993C1D", cursor: "pointer", fontSize: "12.5px" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
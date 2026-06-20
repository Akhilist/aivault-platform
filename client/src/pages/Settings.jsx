import { useState } from "react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import { API } from "../config/api"


const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Administration", "Examination Cell"]
const BATCHES = ["MCA-S1", "MCA-S2", "MCA-S3", "MSCS-S1", "MSCS-S2", "BCA-S4", "BCA-S5", "BCA-S6"]

const ROLE_LABELS = {
  super_admin: "Super Admin",
  institute_admin: "Institute Admin",
  hod: "Head of Department",
  exam_controller: "Exam Controller",
  teacher: "Teacher",
  student: "Student",
}

export default function Settings() {
  const { user, token, login } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [profile, setProfile] = useState({
    name: user?.name || "",
    department: user?.department || "",
    batch: user?.batch || "",
    rollNumber: user?.rollNumber || "",
  })

  const [passwords, setPasswords] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async () => {
    if (!profile.name.trim()) return setError("Name cannot be empty")
    setSavingProfile(true)
    setError("")
    try {
      const res = await axios.put(`${API}/auth/profile`, profile, { headers })
      const updatedUser = { ...user, ...res.data.user }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setSuccess("Profile updated successfully")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      return setError("All password fields are required")
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError("New passwords do not match")
    }
    if (passwords.newPassword.length < 6) {
      return setError("New password must be at least 6 characters")
    }

    setSavingPassword(true)
    setError("")
    try {
      await axios.put(`${API}/auth/change-password`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }, { headers })
      setSuccess("Password changed successfully")
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password")
    } finally {
      setSavingPassword(false)
    }
  }

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "16px",
  }

  const input = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #D3D1C7",
    background: "#FAFAF8",
    fontSize: "13.5px",
    color: "#2C2C2A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "12px",
  }

  const label = {
    display: "block",
    fontSize: "12.5px",
    fontWeight: "500",
    color: "#2C2C2A",
    marginBottom: "5px",
  }

  const btn = (bg, color, disabled) => ({
    padding: "9px 20px",
    background: disabled ? "#D3D1C7" : bg,
    color: disabled ? "#888780" : color,
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
  })

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Settings
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Manage your account profile and security
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {success && (
        <div style={{ background: "#EAF3DE", border: "1px solid #B8D9A0", color: "#3B6D11", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px" }}>
          <i className="ti ti-check" style={{ marginRight: "6px" }}></i>{success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", maxWidth: "900px" }}>

        {/* Profile */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
            Profile Information
          </h2>

          <label style={label}>Full Name</label>
          <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} style={input} />

          <label style={label}>Email</label>
          <input type="email" value={user?.email || ""} disabled style={{ ...input, background: "#F1EFE8", color: "#888780" }} />

          <label style={label}>Role</label>
          <input type="text" value={ROLE_LABELS[user?.role] || user?.role} disabled style={{ ...input, background: "#F1EFE8", color: "#888780" }} />

          {(user?.role === "teacher" || user?.role === "hod" || user?.role === "institute_admin" || user?.role === "exam_controller") && (
            <>
              <label style={label}>Department</label>
              <select value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} style={input}>
                <option value="">Select department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </>
          )}

          {user?.role === "student" && (
            <>
              <label style={label}>Department</label>
              <select value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} style={input}>
                <option value="">Select department...</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <label style={label}>Batch</label>
              <select value={profile.batch} onChange={e => setProfile({ ...profile, batch: e.target.value })} style={input}>
                <option value="">Select batch...</option>
                {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <label style={label}>Roll Number</label>
              <input type="text" value={profile.rollNumber} onChange={e => setProfile({ ...profile, rollNumber: e.target.value })} style={input} />
            </>
          )}

          <button onClick={handleSaveProfile} disabled={savingProfile} style={btn("#185FA5", "white", savingProfile)}>
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Change password */}
        <div style={card}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
            Change Password
          </h2>

          <label style={label}>Current Password</label>
          <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} style={input} />

          <label style={label}>New Password</label>
          <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} style={input} />

          <label style={label}>Confirm New Password</label>
          <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} style={input} />

          <button onClick={handleChangePassword} disabled={savingPassword} style={btn("#185FA5", "white", savingPassword)}>
            {savingPassword ? "Changing..." : "Change Password"}
          </button>

          <div style={{ marginTop: "20px", padding: "12px 14px", background: "#F5F3EE", borderRadius: "8px", fontSize: "12.5px", color: "#888780" }}>
            <i className="ti ti-info-circle" style={{ marginRight: "6px" }}></i>
            Password must be at least 6 characters long.
          </div>
        </div>
      </div>

      {/* Account info card */}
      <div style={{ ...card, maxWidth: "900px" }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
          Account Information
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>User ID</div>
            <div style={{ fontSize: "12px", color: "#5F5E5A", fontFamily: "monospace" }}>{user?._id}</div>
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Account Type</div>
            <div style={{ fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>{ROLE_LABELS[user?.role]}</div>
          </div>
          <div>
            <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Platform</div>
            <div style={{ fontSize: "13px", color: "#2C2C2A", fontWeight: "500" }}>AIVault v1.0</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
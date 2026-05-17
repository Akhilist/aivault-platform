import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "./authService"
import { useAuth } from "./context/AuthContext"

const ROLE_ROUTES = {
  super_admin: "/dashboard/superadmin",
  institute_admin: "/dashboard/instituteadmin",
  hod: "/dashboard/hod",
  exam_controller: "/dashboard/examcontroller",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await loginUser({ email, password })
      login(data)
      navigate(ROLE_ROUTES[data.user.role] || "/")
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F5F3EE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: "420px", padding: "0 16px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "48px", height: "48px",
            background: "#185FA5",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px"
          }}>
            <i className="ti ti-school" style={{ fontSize: "24px", color: "white" }}></i>
          </div>
          <h1 style={{
            fontFamily: "'Lora', serif",
            fontSize: "28px",
            fontWeight: "600",
            color: "#185FA5",
            margin: "0 0 4px"
          }}>AIVault</h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            Academic Examination Management Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "white",
          border: "1px solid #D3D1C7",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
        }}>
          <h2 style={{
            fontFamily: "'Lora', serif",
            fontSize: "20px",
            fontWeight: "600",
            color: "#2C2C2A",
            margin: "0 0 4px"
          }}>Sign in</h2>
          <p style={{ fontSize: "13px", color: "#888780", margin: "0 0 24px" }}>
            Enter your institution credentials
          </p>

          {error && (
            <div style={{
              background: "#FAECE7",
              border: "1px solid #F0C4B4",
              color: "#993C1D",
              fontSize: "13px",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#2C2C2A",
                marginBottom: "6px"
              }}>Email address</label>
              <input
                type="email"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D3D1C7",
                  background: "#FAFAF8",
                  fontSize: "14px",
                  color: "#2C2C2A",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "#2C2C2A",
                marginBottom: "6px"
              }}>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #D3D1C7",
                  background: "#FAFAF8",
                  fontSize: "14px",
                  color: "#2C2C2A",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "11px",
                background: loading ? "#7BAED4" : "#185FA5",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: "center",
          fontSize: "12px",
          color: "#B4B2A9",
          marginTop: "24px"
        }}>
          AIVault · Secure Academic Platform
        </p>
      </div>
    </div>
  )
}

export default Login
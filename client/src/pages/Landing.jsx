import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const FEATURES = [
    {
      icon: "ti-lock",
      title: "Secure Exam Environment",
      desc: "Fullscreen lockdown, tab-switch detection, violation tracking and auto-submission — all enforced in the browser with zero extra software.",
      color: "#185FA5", bg: "#E6F1FB",
    },
    {
      icon: "ti-brain",
      title: "AI-Powered Grading",
      desc: "Descriptive answers graded instantly. Plagiarism detected semantically. Code reviewed for logical errors. Teachers review and override.",
      color: "#534AB7", bg: "#EEEDFE",
    },
    {
      icon: "ti-git-commit",
      title: "Version Control for Students",
      desc: "Students commit algorithm, flowchart and code in structured stages — building real engineering habits inside the classroom.",
      color: "#3B6D11", bg: "#EAF3DE",
    },
    {
      icon: "ti-book",
      title: "E-Code Record Book",
      desc: "Digital lab records with Google Docs-style inline annotations, teacher sign-off workflow, and cryptographic digital signatures.",
      color: "#854F0B", bg: "#FAEEDA",
    },
    {
      icon: "ti-code",
      title: "Live Coding Lab",
      desc: "VS Code-quality Monaco editor with Judge0 execution engine. Python, Java, C, C++ and JavaScript — all in the browser.",
      color: "#085041", bg: "#E1F5EE",
    },
    {
      icon: "ti-device-tv",
      title: "Live Polling",
      desc: "Launch real-time polls mid-lecture. Students respond instantly. Results update live on screen via Socket.io.",
      color: "#993C1D", bg: "#FAECE7",
    },
  ]

  const ROLES = [
    { role: "Super Admin", desc: "Institution-wide control", icon: "ti-building" },
    { role: "Institute Admin", desc: "Department and staff setup", icon: "ti-users" },
    { role: "HOD", desc: "Teachers, students, approvals", icon: "ti-school" },
    { role: "Exam Controller", desc: "Schedule, publish, certify", icon: "ti-calendar" },
    { role: "Teacher", desc: "Create, grade, analyse", icon: "ti-notebook" },
    { role: "Student", desc: "Exam, code, record book", icon: "ti-user" },
  ]

  const nav = {
    position: "fixed",
    top: 0, left: 0, right: 0,
    zIndex: 100,
    background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
    backdropFilter: scrolled ? "blur(12px)" : "none",
    borderBottom: scrolled ? "1px solid #D3D1C7" : "none",
    padding: "16px 60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.3s ease",
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F5F3EE", overflowX: "hidden" }}>

      {/* Navbar */}
      <nav style={nav}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "22px", fontWeight: "700", color: "#185FA5", letterSpacing: "-0.5px" }}>
          AIVault
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
            style={{ background: "none", border: "none", fontSize: "14px", color: "#5F5E5A", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Features
          </button>
          <button
            onClick={() => document.getElementById("roles").scrollIntoView({ behavior: "smooth" })}
            style={{ background: "none", border: "none", fontSize: "14px", color: "#5F5E5A", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Roles
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "9px 22px", background: "#185FA5", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        background: "linear-gradient(160deg, #F5F3EE 0%, #EBF3FD 50%, #F5F3EE 100%)",
        position: "relative",
      }}>

        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "15%", left: "8%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, #E6F1FB 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "6%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, #EEEDFE 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "780px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "white", color: "#185FA5", fontSize: "12.5px", fontWeight: "500", padding: "6px 16px", borderRadius: "20px", marginBottom: "28px", border: "1px solid #D3D1C7", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#3B6D11", display: "inline-block" }}></span>
            MSc Computer Science Project · 2026
          </div>

          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "56px", fontWeight: "700", color: "#2C2C2A", lineHeight: "1.15", margin: "0 0 20px", letterSpacing: "-1px" }}>
            The Academic Platform<br />
            <span style={{ color: "#185FA5" }}>Built for the AI Era</span>
          </h1>

          <p style={{ fontSize: "18px", color: "#5F5E5A", lineHeight: "1.7", margin: "0 auto 40px", maxWidth: "560px" }}>
            AIVault unifies secure exams, AI grading, digital lab records, live coding, and real-time analytics — in one platform designed for modern universities.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => navigate("/login")}
              style={{
                padding: "14px 36px",
                background: "#185FA5",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(24,95,165,0.3)",
              }}
            >
              Get Started →
            </button>
            <button
              onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "14px 36px",
                background: "white",
                color: "#2C2C2A",
                border: "1px solid #D3D1C7",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: "500",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Hero stats bar */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "40px", marginTop: "72px", padding: "24px 48px", background: "white", borderRadius: "16px", border: "1px solid #D3D1C7", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          {[
            { value: "14", label: "Modules" },
            { value: "6", label: "User Roles" },
            { value: "AI", label: "Powered" },
            { value: "100%", label: "Web Based" },
            { value: "SHA-256", label: "Signatures" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "26px", fontWeight: "700", color: "#185FA5" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#888780", marginTop: "2px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "1.5px", color: "#185FA5", fontWeight: "600", textTransform: "uppercase", marginBottom: "12px" }}>
            PLATFORM CAPABILITIES
          </div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "36px", fontWeight: "700", color: "#2C2C2A", margin: "0 0 14px" }}>
            Everything in one platform
          </h2>
          <p style={{ fontSize: "16px", color: "#888780", maxWidth: "480px", margin: "0 auto" }}>
            From question creation to result certification — AIVault handles the entire examination lifecycle.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: "white",
                border: "1px solid #D3D1C7",
                borderRadius: "16px",
                padding: "24px",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
            >
              <div style={{ width: "44px", height: "44px", background: f.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: "22px", color: f.color }}></i>
              </div>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "8px", fontFamily: "'Lora', serif" }}>{f.title}</div>
              <div style={{ fontSize: "13.5px", color: "#888780", lineHeight: "1.65" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: "white", borderTop: "1px solid #D3D1C7", borderBottom: "1px solid #D3D1C7", padding: "100px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ fontSize: "12px", letterSpacing: "1.5px", color: "#185FA5", fontWeight: "600", textTransform: "uppercase", marginBottom: "12px" }}>
              WORKFLOW
            </div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: "36px", fontWeight: "700", color: "#2C2C2A", margin: 0 }}>
              How AIVault works
            </h2>
          </div>

          <div style={{ display: "flex", gap: "0", position: "relative" }}>
            <div style={{ position: "absolute", top: "24px", left: "10%", right: "10%", height: "2px", background: "linear-gradient(to right, #185FA5, #534AB7, #3B6D11)", zIndex: 0 }} />
            {[
              { step: "1", title: "Create", desc: "Teacher builds question bank and exam", icon: "ti-pencil", color: "#185FA5" },
              { step: "2", title: "Approve", desc: "HOD reviews and approves the paper", icon: "ti-check", color: "#534AB7" },
              { step: "3", title: "Examine", desc: "Students take exam in secure environment", icon: "ti-file-text", color: "#3B6D11" },
              { step: "4", title: "Grade", desc: "AI assists teacher in grading answers", icon: "ti-brain", color: "#854F0B" },
              { step: "5", title: "Publish", desc: "Results certified and released to students", icon: "ti-certificate", color: "#993C1D" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", position: "relative", zIndex: 1 }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", border: "3px solid white", boxShadow: "0 0 0 2px " + s.color }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: "20px", color: "white" }}></i>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#2C2C2A" }}>{s.title}</div>
                  <div style={{ fontSize: "12px", color: "#888780", marginTop: "4px", maxWidth: "100px" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roles */}
      <div id="roles" style={{ maxWidth: "1000px", margin: "0 auto", padding: "100px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "1.5px", color: "#185FA5", fontWeight: "600", textTransform: "uppercase", marginBottom: "12px" }}>
            USER ROLES
          </div>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "36px", fontWeight: "700", color: "#2C2C2A", margin: 0 }}>
            Built for every stakeholder
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {ROLES.map((r, i) => (
            <div key={i} style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "20px", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <i className={`ti ${r.icon}`} style={{ fontSize: "18px", color: "#185FA5" }}></i>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#2C2C2A" }}>{r.role}</div>
                <div style={{ fontSize: "12.5px", color: "#888780", marginTop: "3px" }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack strip */}
      <div style={{ background: "#2C2C2A", padding: "40px 24px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#888780", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "20px" }}>
            Built with
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {["React.js", "Node.js", "MongoDB", "Express.js", "Socket.io", "Monaco Editor", "Groq AI", "Judge0", "Docker", "JWT", "SHA-256"].map(t => (
              <span key={t} style={{ padding: "6px 14px", background: "#3E3E3E", color: "#CDD6F4", borderRadius: "6px", fontSize: "13px", fontFamily: "monospace" }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: "#1A1A1A", padding: "24px 60px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "700", color: "#185FA5" }}>AIVault</div>
        <div style={{ fontSize: "12px", color: "#888780" }}>MSc Computer Science Project · Akhil Nasim Eleyadath · 2026 ·</div>
      </div>
    </div>
  )
}
import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#F5F3EE", minHeight: "100vh" }}>

      {/* Navbar */}
      <nav style={{ background: "white", borderBottom: "1px solid #D3D1C7", padding: "16px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "22px", fontWeight: "600", color: "#185FA5" }}>AIVault</div>
        <button
          onClick={() => navigate("/login")}
          style={{ padding: "9px 24px", background: "#185FA5", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#E6F1FB", color: "#185FA5", fontSize: "12.5px", fontWeight: "500", padding: "6px 14px", borderRadius: "20px", marginBottom: "24px" }}>
          <i className="ti ti-brain" style={{ fontSize: "13px" }}></i>
          AI-Powered Academic Examination Platform
        </div>

        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "48px", fontWeight: "700", color: "#2C2C2A", lineHeight: "1.2", marginBottom: "20px" }}>
          The Future of<br />
          <span style={{ color: "#185FA5" }}>Academic Examinations</span>
        </h1>

        <p style={{ fontSize: "17px", color: "#5F5E5A", lineHeight: "1.7", marginBottom: "36px", maxWidth: "600px", margin: "0 auto 36px" }}>
          AIVault brings together secure exam management, AI-powered grading, digital record books, live coding labs, and real-time analytics — all in one platform built for modern universities.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/login")}
            style={{ padding: "13px 32px", background: "#185FA5", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif' " }}
          >
            Get Started →
          </button>
          <button
            onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
            style={{ padding: "13px 32px", background: "white", color: "#185FA5", border: "1px solid #185FA5", borderRadius: "10px", fontSize: "15px", fontWeight: "500", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "white", borderTop: "1px solid #D3D1C7", borderBottom: "1px solid #D3D1C7", padding: "40px 48px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", textAlign: "center" }}>
          {[
            { value: "14", label: "Core Modules" },
            { value: "6", label: "User Roles" },
            { value: "AI", label: "Powered Grading" },
            { value: "100%", label: "Web Based" },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Lora', serif", fontSize: "36px", fontWeight: "700", color: "#185FA5" }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "#888780", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" style={{ maxWidth: "960px", margin: "0 auto", padding: "80px 24px" }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "32px", fontWeight: "600", color: "#2C2C2A", textAlign: "center", marginBottom: "48px" }}>
          Everything your institution needs
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
            { icon: "ti-file-certificate", title: "Secure Exam Environment", desc: "Fullscreen lockdown, tab detection, violation tracking and auto-submission protect exam integrity.", color: "#185FA5", bg: "#E6F1FB" },
            { icon: "ti-brain", title: "AI-Powered Grading", desc: "Groq AI automatically grades descriptive answers, detects plagiarism, and reviews code submissions.", color: "#534AB7", bg: "#EEEDFE" },
            { icon: "ti-git-commit", title: "Version Control for Code", desc: "Students commit algorithm, flowchart, and code in stages — like Git but built for academics.", color: "#3B6D11", bg: "#EAF3DE" },
            { icon: "ti-book", title: "E-Code Record Book", desc: "Digital lab records with inline teacher comments, Google Docs-style annotations, and digital signatures.", color: "#854F0B", bg: "#FAEEDA" },
            { icon: "ti-code", title: "Live Coding Lab", desc: "Monaco editor with Judge0 execution engine supporting Python, Java, C, C++ and JavaScript.", color: "#085041", bg: "#E1F5EE" },
            { icon: "ti-device-tv", title: "Live Polling", desc: "Teachers launch real-time polls during class. Students respond instantly via Socket.io.", color: "#993C1D", bg: "#FAECE7" },
            { icon: "ti-certificate", title: "Digital Signatures", desc: "Cryptographic SHA-256 signatures make approved records tamper-proof and verifiable.", color: "#185FA5", bg: "#E6F1FB" },
            { icon: "ti-chart-bar", title: "Analytics & Reporting", desc: "Score distributions, pass rates, violation reports and performance trends for every exam.", color: "#534AB7", bg: "#EEEDFE" },
            { icon: "ti-shield", title: "Security & Audit", desc: "Device fingerprinting, IP logging, and a full security audit dashboard for administrators.", color: "#3B6D11", bg: "#EAF3DE" },
          ].map(f => (
            <div key={f.title} style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "20px" }}>
              <div style={{ width: "40px", height: "40px", background: f.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
                <i className={`ti ${f.icon}`} style={{ fontSize: "20px", color: f.color }}></i>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#2C2C2A", marginBottom: "6px" }}>{f.title}</div>
              <div style={{ fontSize: "13px", color: "#888780", lineHeight: "1.6" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#185FA5", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Lora', serif", fontSize: "30px", fontWeight: "600", color: "white", marginBottom: "16px" }}>
          Ready to transform your institution?
        </h2>
        <p style={{ fontSize: "15px", color: "#B5D4F4", marginBottom: "28px" }}>
          Join AIVault and bring your examination system into the future.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{ padding: "13px 36px", background: "white", color: "#185FA5", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "600", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
        >
          Get Started Today →
        </button>
      </div>

      {/* Footer */}
      <div style={{ background: "white", borderTop: "1px solid #D3D1C7", padding: "24px 48px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#185FA5" }}>AIVault</div>
        <div style={{ fontSize: "12px", color: "#888780" }}>Built for MSc Computer Science — 2025</div>
      </div>
    </div>
  )
}
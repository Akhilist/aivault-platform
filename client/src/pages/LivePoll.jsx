import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import { SOCKET_URL } from "../config/api"


export default function LivePoll() {
  const { user } = useAuth()
  const isTeacher = user?.role === "teacher" || user?.role === "hod"
  const isStudent = user?.role === "student"

  const [sessionId, setSessionId] = useState("")
  const [sessionInput, setSessionInput] = useState("")
  const [joined, setJoined] = useState(false)
  const [connected, setConnected] = useState(false)

  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [timerSeconds, setTimerSeconds] = useState(60)
  const [pollActive, setPollActive] = useState(false)
  const [currentPoll, setCurrentPoll] = useState(null)
  const [counts, setCounts] = useState([])
  const [total, setTotal] = useState(0)
  const [voted, setVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [pollEnded, setPollEnded] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [pollHistory, setPollHistory] = useState([])

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const socketRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    socketRef.current = io(SOCKET_URL)
    socketRef.current.on("connect", () => setConnected(true))
    socketRef.current.on("disconnect", () => setConnected(false))

    socketRef.current.on("poll-launched", (poll) => {
      setCurrentPoll(poll)
      setPollActive(true)
      setPollEnded(false)
      setRevealed(false)
      setVoted(false)
      setSelectedOption(null)
      setCounts(new Array(poll.options.length).fill(0))
      setTotal(0)
      if (poll.timerSeconds > 0) {
        setTimeLeft(poll.timerSeconds)
      }
    })

    socketRef.current.on("poll-updated", ({ counts, total }) => {
      setCounts(counts)
      setTotal(total)
    })

    socketRef.current.on("poll-ended", () => {
      setPollActive(false)
      setPollEnded(true)
      clearInterval(timerRef.current)
    })

    socketRef.current.on("results-revealed", () => {
      setRevealed(true)
    })

    return () => {
      socketRef.current.disconnect()
      clearInterval(timerRef.current)
    }
  }, [])

  // timer countdown
  useEffect(() => {
    if (pollActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            if (isTeacher) handleEndPoll()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [pollActive, timeLeft])

  const handleJoin = () => {
    if (!sessionInput.trim()) return setError("Enter a session ID")
    setSessionId(sessionInput.trim())
    socketRef.current.emit("join-session", sessionInput.trim())
    setJoined(true)
    setError("")
    setSuccess(`Joined session: ${sessionInput.trim()}`)
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleLaunchPoll = () => {
    if (!question.trim()) return setError("Question is required")
    if (options.some(o => !o.trim())) return setError("All options must be filled")
    if (options.length < 2) return setError("At least 2 options required")

    const poll = {
      question,
      options,
      timerSeconds,
      launchedAt: new Date().toISOString(),
    }

    socketRef.current.emit("launch-poll", { sessionId, poll })
    setCurrentPoll(poll)
    setPollActive(true)
    setPollEnded(false)
    setRevealed(false)
    setCounts(new Array(options.length).fill(0))
    setTotal(0)
    if (timerSeconds > 0) setTimeLeft(timerSeconds)
    setError("")
  }

  const handleEndPoll = () => {
    socketRef.current.emit("end-poll", { sessionId })
    if (currentPoll) {
      setPollHistory(prev => [...prev, {
        question: currentPoll.question,
        options: currentPoll.options,
        counts,
        total,
        endedAt: new Date().toLocaleTimeString(),
      }])
    }
    setPollActive(false)
    setPollEnded(true)
    clearInterval(timerRef.current)
  }

  const handleReveal = () => {
    socketRef.current.emit("reveal-results", { sessionId })
    setRevealed(true)
  }

  const handleVote = (optionIndex) => {
    if (voted || !pollActive) return
    socketRef.current.emit("submit-vote", {
      sessionId,
      optionIndex,
      studentId: user?._id || Math.random().toString(),
    })
    setVoted(true)
    setSelectedOption(optionIndex)
  }

  const addOption = () => setOptions([...options, ""])
  const removeOption = (i) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, j) => j !== i))
  }
  const updateOption = (i, val) => {
    const updated = [...options]
    updated[i] = val
    setOptions(updated)
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`

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

  const card = {
    background: "white",
    border: "1px solid #D3D1C7",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
            Live Polling
          </h1>
          <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
            {isTeacher ? "Launch real-time polls for your students" : "Respond to live polls from your teacher"}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: connected ? "#3B6D11" : "#993C1D" }}></div>
          <span style={{ fontSize: "12px", color: "#888780" }}>{connected ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      {success && (
        <div style={{ background: "#EAF3DE", border: "1px solid #B8D9A0", color: "#3B6D11", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px" }}>
          {success}
        </div>
      )}

      {/* Session join */}
      {!joined && (
        <div style={card}>
          <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 12px" }}>
            {isTeacher ? "Start a Session" : "Join a Session"}
          </h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder={isTeacher ? "Enter session ID e.g. MCA-S3-CS101" : "Enter session ID given by teacher"}
              value={sessionInput}
              onChange={e => setSessionInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              style={{ ...input, marginBottom: 0, flex: 1 }}
            />
            <button onClick={handleJoin} style={btn("#185FA5", "white", false)}>
              {isTeacher ? "Start Session" : "Join"}
            </button>
          </div>
        </div>
      )}

      {joined && (
        <div>
          <div style={{ ...card, background: "#E6F1FB", border: "1px solid #B5D4F4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#185FA5" }}>
                Session: <strong>{sessionId}</strong>
              </div>
              <div style={{ fontSize: "12px", color: "#185FA5", marginTop: "2px" }}>
                {isTeacher ? "Share this session ID with your students" : "Connected to teacher session"}
              </div>
            </div>
            <button
              onClick={() => { setJoined(false); setSessionInput(""); setCurrentPoll(null); setPollActive(false) }}
              style={btn("#F1EFE8", "#5F5E5A", false)}
            >
              Leave Session
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isTeacher ? "1fr 1fr" : "1fr", gap: "16px" }}>

            {/* Teacher — create poll */}
            {isTeacher && (
              <div>
                <div style={card}>
                  <h2 style={{ fontFamily: "'Lora', serif", fontSize: "16px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 16px" }}>
                    Create Poll
                  </h2>
                  <label style={{ fontSize: "12.5px", fontWeight: "500", color: "#2C2C2A", display: "block", marginBottom: "5px" }}>Question</label>
                  <input
                    type="text"
                    placeholder="e.g. Which sorting algorithm is most efficient?"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    disabled={pollActive}
                    style={input}
                  />

                  <label style={{ fontSize: "12.5px", fontWeight: "500", color: "#2C2C2A", display: "block", marginBottom: "5px" }}>Options</label>
                  {options.map((opt, i) => (
                    <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                      <input
                        type="text"
                        placeholder={`Option ${i + 1}`}
                        value={opt}
                        onChange={e => updateOption(i, e.target.value)}
                        disabled={pollActive}
                        style={{ ...input, marginBottom: 0, flex: 1 }}
                      />
                      {options.length > 2 && !pollActive && (
                        <button onClick={() => removeOption(i)} style={{ background: "none", border: "none", color: "#993C1D", cursor: "pointer", fontSize: "16px" }}>x</button>
                      )}
                    </div>
                  ))}
                  {!pollActive && (
                    <button onClick={addOption} style={{ fontSize: "12px", color: "#185FA5", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "10px" }}>
                      + Add Option
                    </button>
                  )}

                  <label style={{ fontSize: "12.5px", fontWeight: "500", color: "#2C2C2A", display: "block", marginBottom: "5px" }}>Timer</label>
                  <select value={timerSeconds} onChange={e => setTimerSeconds(parseInt(e.target.value))} disabled={pollActive} style={input}>
                    <option value={0}>No timer</option>
                    <option value={30}>30 seconds</option>
                    <option value={60}>60 seconds</option>
                    <option value={120}>2 minutes</option>
                  </select>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {!pollActive ? (
                      <button onClick={handleLaunchPoll} style={btn("#185FA5", "white", false)}>
                        <i className="ti ti-player-play" style={{ fontSize: "13px", marginRight: "4px" }}></i>
                        Launch Poll
                      </button>
                    ) : (
                      <>
                        <button onClick={handleEndPoll} style={btn("#FAECE7", "#993C1D", false)}>
                          End Poll
                        </button>
                        {!revealed && (
                          <button onClick={handleReveal} style={btn("#EAF3DE", "#3B6D11", false)}>
                            Reveal Results
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Poll history */}
                {pollHistory.length > 0 && (
                  <div style={card}>
                    <h2 style={{ fontFamily: "'Lora', serif", fontSize: "15px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 12px" }}>
                      Poll History
                    </h2>
                    {pollHistory.map((p, i) => (
                      <div key={i} style={{ padding: "10px", background: "#F5F3EE", borderRadius: "8px", marginBottom: "8px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "4px" }}>{p.question}</div>
                        <div style={{ fontSize: "11.5px", color: "#888780" }}>{p.total} responses · Ended {p.endedAt}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Live poll display */}
            <div>
              {!currentPoll && !pollEnded && (
                <div style={{ ...card, textAlign: "center", padding: "48px", color: "#888780" }}>
                  <i className="ti ti-device-tv" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
                  <div style={{ fontSize: "14px" }}>
                    {isTeacher ? "Launch a poll to get started" : "Waiting for teacher to launch a poll..."}
                  </div>
                </div>
              )}

              {currentPoll && (
                <div style={card}>
                  {/* Timer */}
                  {timerSeconds > 0 && pollActive && (
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <div style={{
                        display: "inline-block",
                        fontFamily: "'Lora', serif",
                        fontSize: "28px",
                        fontWeight: "600",
                        color: timeLeft < 10 ? "#993C1D" : "#185FA5",
                        background: timeLeft < 10 ? "#FAECE7" : "#E6F1FB",
                        padding: "6px 20px",
                        borderRadius: "10px",
                      }}>
                        {formatTime(timeLeft)}
                      </div>
                    </div>
                  )}

                  <h2 style={{ fontFamily: "'Lora', serif", fontSize: "17px", fontWeight: "600", color: "#2C2C2A", marginBottom: "16px", lineHeight: "1.5" }}>
                    {currentPoll.question}
                  </h2>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                    {currentPoll.options?.map((opt, i) => {
                      const count = counts[i] || 0
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0
                      const isSelected = selectedOption === i

                      return (
                        <div
                          key={i}
                          onClick={() => isStudent && !voted && pollActive && handleVote(i)}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            border: `1.5px solid ${isSelected ? "#185FA5" : "#D3D1C7"}`,
                            background: isSelected ? "#E6F1FB" : "white",
                            cursor: isStudent && !voted && pollActive ? "pointer" : "default",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {/* Progress bar background */}
                          {(revealed || isTeacher) && (
                            <div style={{
                              position: "absolute",
                              left: 0, top: 0, bottom: 0,
                              width: `${pct}%`,
                              background: isSelected ? "#B5D4F4" : "#F1EFE8",
                              transition: "width 0.5s ease",
                              zIndex: 0,
                            }} />
                          )}
                          <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", color: "#2C2C2A", fontWeight: isSelected ? "500" : "400" }}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </span>
                            {(revealed || isTeacher) && (
                              <span style={{ fontSize: "13px", fontWeight: "600", color: "#185FA5" }}>
                                {pct}% ({count})
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ fontSize: "12.5px", color: "#888780", textAlign: "center" }}>
                    {total} response{total !== 1 ? "s" : ""}
                    {isStudent && voted && " · Your vote has been recorded"}
                    {isStudent && !voted && pollActive && " · Tap an option to vote"}
                    {pollEnded && " · Poll ended"}
                  </div>
                </div>
              )}

              {pollEnded && !currentPoll && (
                <div style={{ ...card, textAlign: "center", padding: "32px", color: "#888780" }}>
                  <i className="ti ti-check" style={{ fontSize: "36px", color: "#3B6D11", marginBottom: "8px", display: "block" }}></i>
                  <div style={{ fontSize: "14px" }}>Poll ended</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
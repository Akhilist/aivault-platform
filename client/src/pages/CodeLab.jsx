import { useState, useEffect } from "react"
import Editor from "@monaco-editor/react"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

const LANGUAGES = [
  { value: "python",     label: "Python 3",    monaco: "python" },
  { value: "javascript", label: "JavaScript",  monaco: "javascript" },
  { value: "java",       label: "Java",        monaco: "java" },
  { value: "c",          label: "C",           monaco: "c" },
  { value: "cpp",        label: "C++",         monaco: "cpp" },
]

const STARTERS = {
  python:     "# Write your Python code here\n\ndef solution():\n    pass\n\nsolution()",
  javascript: "// Write your JavaScript code here\n\nfunction solution() {\n    \n}\n\nsolution()",
  java:       "public class Main {\n    public static void main(String[] args) {\n        // Write your Java code here\n    }\n}",
  c:          "#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}",
  cpp:        "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}",
}

export default function CodeLab() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [language, setLanguage] = useState("python")
  const [code, setCode] = useState(STARTERS["python"])
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [running, setRunning] = useState(false)
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("input")
  const [testResults, setTestResults] = useState(null)

  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`${API}/questions?type=coding&status=approved`, { headers })
        setQuestions(res.data.questions)
      } catch (err) {
        console.error("Failed to load coding questions")
      } finally {
        setLoadingQuestions(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(STARTERS[lang])
    setOutput("")
    setTestResults(null)
  }

  const handleRun = async () => {
    if (!code.trim()) return setError("Write some code first")
    setError("")
    setRunning(true)
    setOutput("")
    setActiveTab("output")
    try {
      const res = await axios.post(`${API}/code/run`, { code, language, input }, { headers })
      setOutput(res.data.output || "No output")
    } catch (err) {
      setError(err.response?.data?.message || "Code execution failed")
    } finally {
      setRunning(false)
    }
  }

  const handleRunTests = async () => {
    if (!selectedQuestion) return setError("Select a question first to run test cases")
    if (!code.trim()) return setError("Write some code first")
    setError("")
    setTesting(true)
    setTestResults(null)
    setActiveTab("tests")
    try {
      const res = await axios.post(`${API}/code/test`, {
        code,
        language,
        testCases: selectedQuestion.testCases,
      }, { headers })
      setTestResults(res.data)
    } catch (err) {
      setError(err.response?.data?.message || "Test execution failed")
    } finally {
      setTesting(false)
    }
  }

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q)
    setOutput("")
    setTestResults(null)
    setActiveTab("input")
  }

  const currentLang = LANGUAGES.find(l => l.value === language)

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
    display: "flex",
    alignItems: "center",
    gap: "6px",
  })

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Code Lab
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          Write, run, and test your code with full syntax highlighting
        </p>
      </div>

      {error && (
        <div style={{ background: "#FAECE7", border: "1px solid #F0C4B4", color: "#993C1D", fontSize: "13px", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
          {error}
          <button onClick={() => setError("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D" }}>x</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px", height: "calc(100vh - 180px)" }}>

        {/* Left panel — questions */}
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7" }}>
            <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>Coding Questions</div>
            <div style={{ fontSize: "11.5px", color: "#888780", marginTop: "2px" }}>{questions.length} available</div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loadingQuestions ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>Loading...</div>
            ) : questions.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>
                No coding questions yet
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q._id}
                  onClick={() => handleSelectQuestion(q)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    marginBottom: "4px",
                    cursor: "pointer",
                    background: selectedQuestion?._id === q._id ? "#E6F1FB" : "transparent",
                    border: `1px solid ${selectedQuestion?._id === q._id ? "#185FA5" : "transparent"}`,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: "13px", fontWeight: "500", color: selectedQuestion?._id === q._id ? "#185FA5" : "#2C2C2A", marginBottom: "4px" }}>
                    {q.text?.slice(0, 50)}{q.text?.length > 50 ? "..." : ""}
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "10.5px", padding: "1px 7px", borderRadius: "20px", background: "#F1EFE8", color: "#5F5E5A" }}>
                      {q.subject}
                    </span>
                    <span style={{
                      fontSize: "10.5px", padding: "1px 7px", borderRadius: "20px",
                      background: q.difficulty === "easy" ? "#EAF3DE" : q.difficulty === "medium" ? "#FAEEDA" : "#FAECE7",
                      color: q.difficulty === "easy" ? "#3B6D11" : q.difficulty === "medium" ? "#854F0B" : "#993C1D",
                    }}>
                      {q.difficulty}
                    </span>
                    <span style={{ fontSize: "10.5px", padding: "1px 7px", borderRadius: "20px", background: "#EEEDFE", color: "#534AB7" }}>
                      {q.marks} marks
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>

          {/* Question display */}
          {selectedQuestion && (
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "16px", flexShrink: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: "600", color: "#2C2C2A", marginBottom: "8px", fontFamily: "'Lora', serif" }}>
                {selectedQuestion.text}
              </div>
              {selectedQuestion.testCases?.filter(tc => !tc.isHidden).length > 0 && (
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {selectedQuestion.testCases.filter(tc => !tc.isHidden).map((tc, i) => (
                    <div key={i} style={{ background: "#F5F3EE", borderRadius: "8px", padding: "8px 12px", fontSize: "12px" }}>
                      <div style={{ color: "#888780", marginBottom: "2px" }}>Sample {i + 1}</div>
                      <div style={{ color: "#2C2C2A" }}>Input: <code style={{ background: "#E8E6E0", padding: "1px 5px", borderRadius: "3px" }}>{tc.input || "none"}</code></div>
                      <div style={{ color: "#2C2C2A", marginTop: "2px" }}>Output: <code style={{ background: "#E8E6E0", padding: "1px 5px", borderRadius: "3px" }}>{tc.expectedOutput}</code></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Editor */}
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

            {/* Editor toolbar */}
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #D3D1C7", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1E1E2E", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value)}
                  style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #3E3E5E", background: "#2D2D44", fontSize: "13px", color: "#CDD6F4", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {LANGUAGES.map(l => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: "11.5px", color: "#888780" }}>Powered by Judge0</span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handleRun} disabled={running} style={btn("#185FA5", "white", running)}>
                  <i className="ti ti-player-play" style={{ fontSize: "13px" }}></i>
                  {running ? "Running..." : "Run Code"}
                </button>
                {selectedQuestion && (
                  <button onClick={handleRunTests} disabled={testing} style={btn("#3B6D11", "white", testing)}>
                    <i className="ti ti-check" style={{ fontSize: "13px" }}></i>
                    {testing ? "Testing..." : "Run Tests"}
                  </button>
                )}
              </div>
            </div>

            {/* Monaco Editor */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                language={currentLang?.monaco || "python"}
                value={code}
                onChange={(val) => setCode(val || "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderLineHighlight: "all",
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  contextmenu: true,
                  folding: true,
                  bracketPairColorization: { enabled: true },
                }}
              />
            </div>

            {/* Bottom panel */}
            <div style={{ borderTop: "1px solid #D3D1C7", flexShrink: 0 }}>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #D3D1C7", background: "#FAFAF8" }}>
                {["input", "output", "tests"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "8px 16px",
                      background: "none",
                      border: "none",
                      borderBottom: activeTab === tab ? "2px solid #185FA5" : "2px solid transparent",
                      color: activeTab === tab ? "#185FA5" : "#888780",
                      fontSize: "13px",
                      fontWeight: activeTab === tab ? "500" : "400",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {tab === "tests" ? "Test Results" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Input tab */}
              {activeTab === "input" && (
                <div style={{ padding: "12px 16px" }}>
                  <div style={{ fontSize: "12px", color: "#888780", marginBottom: "6px" }}>Standard Input (stdin)</div>
                  <textarea
                    placeholder="Enter input for your program..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #D3D1C7",
                      background: "#FAFAF8",
                      fontSize: "13px",
                      fontFamily: "monospace",
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                      color: "#2C2C2A",
                    }}
                  />
                </div>
              )}

              {/* Output tab */}
              {activeTab === "output" && (
                <div style={{ padding: "12px 16px", minHeight: "80px", maxHeight: "160px", overflowY: "auto" }}>
                  {running ? (
                    <div style={{ color: "#888780", fontSize: "13px" }}>Running your code...</div>
                  ) : output ? (
                    <pre style={{ margin: 0, fontSize: "13px", color: "#2C2C2A", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{output}</pre>
                  ) : (
                    <div style={{ color: "#B4B2A9", fontSize: "13px" }}>Click Run Code to see output here</div>
                  )}
                </div>
              )}

              {/* Test results tab */}
              {activeTab === "tests" && (
                <div style={{ padding: "12px 16px", maxHeight: "200px", overflowY: "auto" }}>
                  {testing ? (
                    <div style={{ color: "#888780", fontSize: "13px" }}>Running test cases...</div>
                  ) : testResults ? (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>
                          {testResults.totalPassed} of {testResults.totalCases} passed
                        </div>
                        <div style={{
                          fontSize: "12px", fontWeight: "500", padding: "2px 10px", borderRadius: "20px",
                          background: testResults.score === 100 ? "#EAF3DE" : testResults.score >= 50 ? "#FAEEDA" : "#FAECE7",
                          color: testResults.score === 100 ? "#3B6D11" : testResults.score >= 50 ? "#854F0B" : "#993C1D",
                        }}>
                          Score: {testResults.score}%
                        </div>
                      </div>

                      {testResults.results.map((r, i) => (
                        !r.isHidden && (
                          <div key={i} style={{ padding: "8px 12px", borderRadius: "8px", background: r.passed ? "#EAF3DE" : "#FAECE7", marginBottom: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "500", color: r.passed ? "#3B6D11" : "#993C1D" }}>
                                {r.passed ? "PASSED" : "FAILED"} — Test {i + 1}
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#5F5E5A" }}>
                              Input: <code style={{ background: "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: "3px" }}>{r.input || "none"}</code>
                            </div>
                            <div style={{ fontSize: "12px", color: "#5F5E5A", marginTop: "2px" }}>
                              Expected: <code style={{ background: "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: "3px" }}>{r.expectedOutput}</code>
                            </div>
                            {!r.passed && (
                              <div style={{ fontSize: "12px", color: "#993C1D", marginTop: "2px" }}>
                                Got: <code style={{ background: "rgba(0,0,0,0.08)", padding: "1px 5px", borderRadius: "3px" }}>{r.actualOutput || "no output"}</code>
                              </div>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#B4B2A9", fontSize: "13px" }}>Select a question and click Run Tests to see results</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
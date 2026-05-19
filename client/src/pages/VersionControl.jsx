import { useState, useEffect, useCallback } from "react"
import Editor from "@monaco-editor/react"
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Handle,
  Position,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import DashboardLayout from "../layouts/DashboardLayout"
import { useAuth } from "../context/AuthContext"
import axios from "axios"

const API = "http://localhost:5000/api"

const STAGES = ["algorithm", "flowchart", "code"]

const STAGE_COLORS = {
  algorithm: { bg: "#E6F1FB", color: "#185FA5", icon: "ti-list" },
  flowchart:  { bg: "#EAF3DE", color: "#3B6D11", icon: "ti-sitemap" },
  code:       { bg: "#EEEDFE", color: "#534AB7", icon: "ti-code" },
}

const LANGUAGES = [
  { value: "python",     label: "Python 3" },
  { value: "javascript", label: "JavaScript" },
  { value: "java",       label: "Java" },
  { value: "c",          label: "C" },
  { value: "cpp",        label: "C++" },
]

const SHAPE_TYPES = [
  { value: "oval",          label: "Oval (Start/End)" },
  { value: "rectangle",     label: "Rectangle (Process)" },
  { value: "diamond",       label: "Diamond (Decision)" },
  { value: "parallelogram", label: "Parallelogram (I/O)" },
]

const nodeStyle = (shape, selected) => {
  const base = {
    padding: "10px 16px",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    color: "#2C2C2A",
    border: `2px solid ${selected ? "#185FA5" : "#D3D1C7"}`,
    background: "white",
    minWidth: "140px",
    textAlign: "center",
    cursor: "pointer",
    position: "relative",
  }
  if (shape === "oval")          return { ...base, borderRadius: "50px" }
  if (shape === "rectangle")     return { ...base, borderRadius: "8px" }
  if (shape === "diamond")       return { ...base, borderRadius: "4px", transform: "rotate(45deg)", minWidth: "100px", padding: "14px" }
  if (shape === "parallelogram") return { ...base, borderRadius: "4px", transform: "skewX(-15deg)" }
  return base
}

function FlowNode({ data, selected }) {
  return (
    <div style={nodeStyle(data.shape, selected)}>
      <Handle type="target" position={Position.Top} style={{ background: "#185FA5", width: "10px", height: "10px", border: "2px solid white" }} />
      <div style={{
        transform: data.shape === "diamond"
          ? "rotate(-45deg)"
          : data.shape === "parallelogram"
            ? "skewX(15deg)"
            : "none"
      }}>
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: "#185FA5", width: "10px", height: "10px", border: "2px solid white" }} />
      <Handle type="source" position={Position.Right} style={{ background: "#3B6D11", width: "10px", height: "10px", border: "2px solid white" }} />
      <Handle type="target" position={Position.Left} style={{ background: "#3B6D11", width: "10px", height: "10px", border: "2px solid white" }} />
    </div>
  )
}

const nodeTypes = { flowNode: FlowNode }

const defaultNodes = [
  { id: "1", type: "flowNode", position: { x: 200, y: 50 },  data: { label: "START", shape: "oval" } },
  { id: "2", type: "flowNode", position: { x: 200, y: 180 }, data: { label: "Process", shape: "rectangle" } },
  { id: "3", type: "flowNode", position: { x: 200, y: 310 }, data: { label: "END", shape: "oval" } },
]

const defaultEdges = [
  { id: "e1-2", source: "1", target: "2", animated: false },
  { id: "e2-3", source: "2", target: "3", animated: false },
]

export default function VersionControl() {
  const { user, token } = useAuth()
  const headers = { Authorization: `Bearer ${token}` }

  const [experiments, setExperiments]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [showNewForm, setShowNewForm]     = useState(false)
  const [selectedExp, setSelectedExp]     = useState(null)
  const [commits, setCommits]             = useState([])
  const [activeStage, setActiveStage]     = useState("algorithm")
  const [commitMessage, setCommitMessage] = useState("")
  const [language, setLanguage]           = useState("python")
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState("")
  const [success, setSuccess]             = useState("")
  const [newExpName, setNewExpName]       = useState("")
  const [history, setHistory]             = useState([])
  const [showHistory, setShowHistory]     = useState(false)
  const [teacherNote, setTeacherNote]     = useState("")
  const [noteCommitId, setNoteCommitId]   = useState(null)

  // Algorithm
  const [steps, setSteps] = useState([{ id: 1, text: "" }])

  // Flowchart
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges)
  const [selectedNode, setSelectedNode]  = useState(null)
  const [newNodeLabel, setNewNodeLabel]  = useState("")
  const [newNodeShape, setNewNodeShape]  = useState("rectangle")

  // Code
  const [code, setCode]             = useState("")
  const [codeInput, setCodeInput]   = useState("")
  const [codeOutput, setCodeOutput] = useState("")
  const [runningCode, setRunningCode] = useState(false)
  const [terminalTab, setTerminalTab] = useState("input")

  const isStudent = user?.role === "student"
  const isTeacher = user?.role === "teacher" || user?.role === "hod"

  const fetchExperiments = async () => {
    try {
      setLoading(true)
      const url = isStudent
        ? `${API}/commits/experiments`
        : `${API}/commits/experiments/all`
      const res = await axios.get(url, { headers })
      setExperiments(res.data.experiments)
    } catch (err) {
      setError("Failed to load experiments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchExperiments() }, [])

  const fetchCommits = async (expId) => {
    try {
      const res = await axios.get(`${API}/commits/${expId}`, { headers })
      setCommits(res.data.commits)
      return res.data.commits
    } catch (err) {
      setError("Failed to load commits")
      return []
    }
  }

  const fetchHistory = async (expId, stage) => {
    try {
      const res = await axios.get(`${API}/commits/${expId}/${stage}/history`, { headers })
      setHistory(res.data.commits)
      setShowHistory(true)
    } catch (err) {
      setError("Failed to load history")
    }
  }

  const loadStageContent = (commitsList, stage) => {
    const latest = commitsList
      .filter(c => c.stage === stage && c.isLatest)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]

    if (!latest) {
      if (stage === "algorithm") setSteps([{ id: 1, text: "" }])
      if (stage === "flowchart") { setNodes(defaultNodes); setEdges(defaultEdges) }
      if (stage === "code") setCode("")
      return
    }

    if (stage === "algorithm") {
      try {
        const parsed = JSON.parse(latest.content)
        setSteps(Array.isArray(parsed) ? parsed : [{ id: 1, text: latest.content }])
      } catch {
        setSteps([{ id: 1, text: latest.content }])
      }
    }

    if (stage === "flowchart") {
      try {
        const parsed = JSON.parse(latest.content)
        setNodes(parsed.nodes || defaultNodes)
        setEdges(parsed.edges || defaultEdges)
      } catch {
        setNodes(defaultNodes)
        setEdges(defaultEdges)
      }
    }

    if (stage === "code") {
      setCode(latest.content || "")
    }
  }

  const handleSelectExperiment = async (exp) => {
    setSelectedExp(exp)
    setActiveStage("algorithm")
    setCommitMessage("")
    setError("")
    setSuccess("")
    setShowHistory(false)
    setSelectedNode(null)
    setCodeOutput("")
    const commitsList = await fetchCommits(exp._id)
    loadStageContent(commitsList, "algorithm")
  }

  const handleCreateExperiment = () => {
    if (!newExpName.trim()) return setError("Experiment name is required")
    const id = `exp_${Date.now()}`
    const newExp = {
      _id: id,
      experimentName: newExpName,
      stages: [],
      isFinal: false,
      lastUpdated: new Date(),
    }
    setExperiments(prev => [newExp, ...prev])
    setSelectedExp(newExp)
    setCommits([])
    setActiveStage("algorithm")
    setSteps([{ id: 1, text: "" }])
    setCommitMessage("")
    setShowNewForm(false)
    setNewExpName("")
    setError("")
    setSuccess("")
  }

  const isStageUnlocked = (stage) => {
    if (stage === "algorithm") return true
    if (stage === "flowchart") return commits.some(c => c.stage === "algorithm" && c.isLatest)
    if (stage === "code")      return commits.some(c => c.stage === "flowchart" && c.isLatest)
    return false
  }

  const handleStageChange = (stage) => {
    if (!isStageUnlocked(stage) && isStudent) {
      setError(`Complete and commit the ${stage === "flowchart" ? "algorithm" : "flowchart"} stage first`)
      return
    }
    setActiveStage(stage)
    setShowHistory(false)
    setSelectedNode(null)
    setCommitMessage("")
    setCodeOutput("")
    loadStageContent(commits, stage)
  }

  // Algorithm steps
  const addStep = () => {
    const newId = steps.length > 0 ? Math.max(...steps.map(s => s.id)) + 1 : 1
    setSteps([...steps, { id: newId, text: "" }])
  }

  const updateStep = (id, text) => {
    setSteps(steps.map(s => s.id === id ? { ...s, text } : s))
  }

  const removeStep = (id) => {
    if (steps.length === 1) return
    setSteps(steps.filter(s => s.id !== id))
  }

  const handleStepKeyDown = (e, index) => {
    if (e.key === "Tab") {
      e.preventDefault()
      if (index === steps.length - 1) {
        addStep()
        setTimeout(() => {
          const inputs = document.querySelectorAll(".step-input")
          if (inputs[index + 1]) inputs[index + 1].focus()
        }, 50)
      } else {
        const inputs = document.querySelectorAll(".step-input")
        if (inputs[index + 1]) inputs[index + 1].focus()
      }
    }
  }

  // Flowchart
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: false }, eds)),
    [setEdges]
  )

  const addNode = () => {
    if (!newNodeLabel.trim()) return
    const id = `node_${Date.now()}`
    const newNode = {
      id,
      type: "flowNode",
      position: { x: 150 + Math.random() * 100, y: 100 + nodes.length * 120 },
      data: { label: newNodeLabel, shape: newNodeShape },
    }
    setNodes(nds => [...nds, newNode])
    setNewNodeLabel("")
  }

  const deleteSelectedNode = () => {
    if (!selectedNode) return
    setNodes(nds => nds.filter(n => n.id !== selectedNode))
    setEdges(eds => eds.filter(e => e.source !== selectedNode && e.target !== selectedNode))
    setSelectedNode(null)
  }

  const onNodeClick = (_, node) => setSelectedNode(node.id)

  // Run code
  const handleRunCode = async () => {
    if (!code.trim()) return setError("Write some code first")
    setRunningCode(true)
    setCodeOutput("")
    setTerminalTab("output")
    try {
      const res = await axios.post(`${API}/code/run`, {
        code,
        language,
        input: codeInput,
      }, { headers })
      setCodeOutput(res.data.output || "No output")
    } catch (err) {
      setCodeOutput("Error: " + (err.response?.data?.message || "Code execution failed"))
    } finally {
      setRunningCode(false)
    }
  }

  // Commit
  const getContent = () => {
    if (activeStage === "algorithm") return JSON.stringify(steps)
    if (activeStage === "flowchart") return JSON.stringify({ nodes, edges })
    if (activeStage === "code")      return code
    return ""
  }

  const handleCommit = async () => {
    if (!commitMessage.trim()) return setError("Commit message is required — describe what you did")
    if (activeStage === "algorithm" && steps.every(s => !s.text.trim())) return setError("Write at least one step")
    if (activeStage === "code" && !code.trim()) return setError("Write some code first")
    if (!selectedExp) return setError("Select or create an experiment first")

    setError("")
    setSaving(true)
    try {
      await axios.post(`${API}/commits`, {
        experimentId:   selectedExp._id,
        experimentName: selectedExp.experimentName,
        stage:          activeStage,
        content:        getContent(),
        commitMessage,
        language: activeStage === "code" ? language : null,
      }, { headers })

      setSuccess(
        activeStage === "algorithm" ? "Algorithm committed! Flowchart stage is now unlocked." :
        activeStage === "flowchart" ? "Flowchart committed! Code stage is now unlocked." :
        "Code committed successfully!"
      )
      setCommitMessage("")
      const commitsList = await fetchCommits(selectedExp._id)
      await fetchExperiments()
      loadStageContent(commitsList, activeStage)
      setTimeout(() => setSuccess(""), 4000)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to commit")
    } finally {
      setSaving(false)
    }
  }

  const handleFinalSubmit = async () => {
    if (!window.confirm("Final submit will lock all commits. This cannot be undone. Are you sure?")) return
    try {
      await axios.put(`${API}/commits/${selectedExp._id}/finalize`, {}, { headers })
      setSuccess("Experiment finally submitted and locked")
      await fetchExperiments()
      await fetchCommits(selectedExp._id)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize")
    }
  }

  const handleAddNote = async (commitId) => {
    try {
      await axios.put(`${API}/commits/note/${commitId}`, { note: teacherNote }, { headers })
      setSuccess("Note added")
      setNoteCommitId(null)
      setTeacherNote("")
      await fetchCommits(selectedExp._id)
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to add note")
    }
  }

  const isFinal = commits.some(c => c.isFinal)
  const stagesCompleted = STAGES.filter(s => commits.some(c => c.stage === s && c.isLatest))

  const btn = (bg, color, disabled) => ({
    padding: "7px 14px",
    background: disabled ? "#D3D1C7" : bg,
    color: disabled ? "#888780" : color,
    border: "none",
    borderRadius: "8px",
    fontSize: "12.5px",
    fontWeight: "500",
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  })

  const input = {
    width: "100%",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #D3D1C7",
    background: "#FAFAF8",
    fontSize: "13px",
    color: "#2C2C2A",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontFamily: "'Lora', serif", fontSize: "24px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 4px" }}>
          Version Control
        </h1>
        <p style={{ fontSize: "13px", color: "#888780", margin: 0 }}>
          {isStudent
            ? "Algorithm → Flowchart → Code — complete each stage in order"
            : "Review student experiment commit timelines"}
        </p>
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

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px", height: "calc(100vh - 200px)" }}>

        {/* Left panel */}
        <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #D3D1C7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A" }}>Experiments</div>
              <div style={{ fontSize: "11.5px", color: "#888780", marginTop: "2px" }}>{experiments.length} total</div>
            </div>
            {isStudent && (
              <button onClick={() => setShowNewForm(true)} style={btn("#185FA5", "white", false)}>+ New</button>
            )}
          </div>

          {showNewForm && (
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #D3D1C7", background: "#F5F3EE" }}>
              <input
                type="text"
                placeholder="Experiment name..."
                value={newExpName}
                onChange={e => setNewExpName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleCreateExperiment()}
                style={{ ...input, marginBottom: "8px" }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={handleCreateExperiment} style={btn("#185FA5", "white", false)}>Create</button>
                <button onClick={() => { setShowNewForm(false); setNewExpName("") }} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
            {loading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>Loading...</div>
            ) : experiments.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888780", fontSize: "13px" }}>
                {isStudent ? "No experiments yet. Click + New to start." : "No submissions yet."}
              </div>
            ) : (
              experiments.map((exp) => {
                const isSelected = selectedExp?._id === exp._id
                return (
                  <div
                    key={exp._id}
                    onClick={() => handleSelectExperiment(exp)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      marginBottom: "4px",
                      cursor: "pointer",
                      background: isSelected ? "#E6F1FB" : "transparent",
                      border: `1px solid ${isSelected ? "#185FA5" : "transparent"}`,
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: "500", color: isSelected ? "#185FA5" : "#2C2C2A", marginBottom: "6px" }}>
                      {exp.experimentName}
                    </div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {STAGES.map(s => {
                        const done = (exp.stages || []).includes(s)
                        return (
                          <span key={s} style={{
                            fontSize: "10px", padding: "1px 6px", borderRadius: "20px",
                            background: done ? STAGE_COLORS[s].bg : "#F1EFE8",
                            color: done ? STAGE_COLORS[s].color : "#B4B2A9",
                          }}>
                            {s}
                          </span>
                        )
                      })}
                      {exp.isFinal && (
                        <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11" }}>
                          submitted
                        </span>
                      )}
                    </div>
                    {isTeacher && exp.studentId && (
                      <div style={{ fontSize: "11px", color: "#888780", marginTop: "4px" }}>
                        {exp.studentId?.name || "Unknown"}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right panel */}
        {!selectedExp ? (
          <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", color: "#888780" }}>
              <i className="ti ti-git-commit" style={{ fontSize: "48px", marginBottom: "12px", display: "block" }}></i>
              <div style={{ fontSize: "14px" }}>
                {isStudent ? "Select an experiment or create a new one" : "Select a student experiment to review"}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", minHeight: 0 }}>

            {/* Experiment header */}
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", padding: "14px 18px", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ fontFamily: "'Lora', serif", fontSize: "18px", fontWeight: "600", color: "#2C2C2A", margin: "0 0 2px" }}>
                    {selectedExp.experimentName}
                  </h2>
                  <div style={{ fontSize: "12px", color: "#888780" }}>
                    {stagesCompleted.length} of 3 stages committed
                    {isFinal && " · Final submitted and locked"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {STAGES.map((s, i) => {
                    const done = commits.some(c => c.stage === s && c.isLatest)
                    const unlocked = isStageUnlocked(s)
                    return (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: done ? STAGE_COLORS[s].bg : unlocked ? "#F5F3EE" : "#F1EFE8",
                          border: `2px solid ${done ? STAGE_COLORS[s].color : unlocked ? "#D3D1C7" : "#E8E6E0"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {done
                            ? <i className="ti ti-check" style={{ fontSize: "14px", color: STAGE_COLORS[s].color }}></i>
                            : unlocked
                              ? <i className={`ti ${STAGE_COLORS[s].icon}`} style={{ fontSize: "13px", color: "#888780" }}></i>
                              : <i className="ti ti-lock" style={{ fontSize: "12px", color: "#B4B2A9" }}></i>
                          }
                        </div>
                        {i < 2 && <div style={{ width: "16px", height: "2px", background: done ? STAGE_COLORS[s].color : "#E8E6E0" }}></div>}
                      </div>
                    )
                  })}

                  {isStudent && !isFinal && stagesCompleted.length === 3 && (
                    <button onClick={handleFinalSubmit} style={{ ...btn("#3B6D11", "white", false), marginLeft: "8px" }}>
                      <i className="ti ti-lock" style={{ fontSize: "12px" }}></i>
                      Final Submit
                    </button>
                  )}

                  {isFinal && (
                    <span style={{ fontSize: "12px", fontWeight: "500", padding: "4px 10px", borderRadius: "20px", background: "#EAF3DE", color: "#3B6D11", marginLeft: "8px" }}>
                      <i className="ti ti-lock" style={{ fontSize: "11px", marginRight: "4px" }}></i>Locked
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stage workspace */}
            <div style={{ background: "white", border: "1px solid #D3D1C7", borderRadius: "12px", overflow: "hidden", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

              {/* Stage tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #D3D1C7", background: "#FAFAF8", flexShrink: 0 }}>
                {STAGES.map(s => {
                  const done    = commits.some(c => c.stage === s && c.isLatest)
                  const unlocked = isStageUnlocked(s)
                  const isActive = activeStage === s
                  const locked  = !unlocked && isStudent
                  return (
                    <button
                      key={s}
                      onClick={() => handleStageChange(s)}
                      style={{
                        flex: 1,
                        padding: "10px 8px",
                        background: "none",
                        border: "none",
                        borderBottom: isActive ? `2px solid ${STAGE_COLORS[s].color}` : "2px solid transparent",
                        color: locked ? "#B4B2A9" : isActive ? STAGE_COLORS[s].color : "#888780",
                        fontSize: "13px",
                        fontWeight: isActive ? "500" : "400",
                        cursor: locked ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      {locked
                        ? <i className="ti ti-lock" style={{ fontSize: "13px" }}></i>
                        : <i className={`ti ${STAGE_COLORS[s].icon}`} style={{ fontSize: "13px" }}></i>
                      }
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      {done && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: STAGE_COLORS[s].color }}></span>}
                    </button>
                  )
                })}
                <button
                  onClick={() => fetchHistory(selectedExp._id, activeStage)}
                  style={{
                    padding: "10px 14px",
                    background: "none",
                    border: "none",
                    borderBottom: showHistory ? "2px solid #888780" : "2px solid transparent",
                    color: "#888780",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <i className="ti ti-history" style={{ fontSize: "13px" }}></i>
                  History
                </button>
              </div>

              {/* History view */}
              {showHistory ? (
                <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "500", color: "#2C2C2A", marginBottom: "12px" }}>
                    {activeStage.charAt(0).toUpperCase() + activeStage.slice(1)} commit history ({history.length} commits)
                  </div>
                  {history.length === 0 ? (
                    <div style={{ color: "#888780", fontSize: "13px" }}>No commits yet for this stage</div>
                  ) : (
                    history.map((h) => (
                      <div key={h._id} style={{ marginBottom: "12px", padding: "12px", background: "#F5F3EE", borderRadius: "10px", borderLeft: `3px solid ${STAGE_COLORS[activeStage].color}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: "500", color: "#2C2C2A" }}>
                            Commit #{h.commitNumber} — {h.commitMessage}
                          </span>
                          <span style={{ fontSize: "11.5px", color: "#888780" }}>
                            {new Date(h.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {h.teacherNote && (
                          <div style={{ marginTop: "6px", padding: "6px 10px", background: "#FAEEDA", borderRadius: "6px", fontSize: "12px", color: "#854F0B" }}>
                            <i className="ti ti-message-circle" style={{ marginRight: "4px" }}></i>
                            Teacher: {h.teacherNote}
                          </div>
                        )}
                        {isTeacher && (
                          <div style={{ marginTop: "8px" }}>
                            {noteCommitId === h._id ? (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <input
                                  type="text"
                                  placeholder="Add a note..."
                                  value={teacherNote}
                                  onChange={e => setTeacherNote(e.target.value)}
                                  style={{ ...input, flex: 1 }}
                                />
                                <button onClick={() => handleAddNote(h._id)} style={btn("#185FA5", "white", false)}>Save</button>
                                <button onClick={() => setNoteCommitId(null)} style={btn("#F1EFE8", "#5F5E5A", false)}>Cancel</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setNoteCommitId(h._id); setTeacherNote(h.teacherNote || "") }}
                                style={btn("#F1EFE8", "#5F5E5A", false)}
                              >
                                <i className="ti ti-edit" style={{ fontSize: "12px" }}></i>
                                {h.teacherNote ? "Edit note" : "Add note"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>

                  {/* Algorithm stage */}
                  {activeStage === "algorithm" && (
                    <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                      <div style={{ fontSize: "13px", color: "#888780", marginBottom: "12px" }}>
                        Write your algorithm step by step. Press <kbd style={{ background: "#F1EFE8", padding: "1px 6px", borderRadius: "4px", fontSize: "11px", border: "1px solid #D3D1C7" }}>Tab</kbd> to move to the next step.
                      </div>
                      {steps.map((step, index) => (
                        <div key={step.id} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: "#E6F1FB", color: "#185FA5",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "12px", fontWeight: "600", flexShrink: 0,
                          }}>
                            {index + 1}
                          </div>
                          <input
                            className="step-input"
                            type="text"
                            placeholder={`Step ${index + 1}: Describe what happens here...`}
                            value={step.text}
                            onChange={e => updateStep(step.id, e.target.value)}
                            onKeyDown={e => handleStepKeyDown(e, index)}
                            disabled={isFinal && isStudent}
                            style={{
                              ...input,
                              flex: 1,
                              background: isFinal ? "#F5F3EE" : "#FAFAF8",
                            }}
                          />
                          {steps.length > 1 && !isFinal && isStudent && (
                            <button
                              onClick={() => removeStep(step.id)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#993C1D", fontSize: "16px", padding: "4px" }}
                            >
                              x
                            </button>
                          )}
                        </div>
                      ))}
                      {isStudent && !isFinal && (
                        <button onClick={addStep} style={{ ...btn("#F1EFE8", "#185FA5", false), marginTop: "8px" }}>
                          <i className="ti ti-plus" style={{ fontSize: "13px" }}></i>
                          Add Step
                        </button>
                      )}
                    </div>
                  )}

                  {/* Flowchart stage */}
                  {activeStage === "flowchart" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                      {isStudent && !isFinal && (
                        <div style={{ padding: "10px 14px", borderBottom: "1px solid #D3D1C7", background: "#FAFAF8", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0, flexWrap: "wrap" }}>
                          <select
                            value={newNodeShape}
                            onChange={e => setNewNodeShape(e.target.value)}
                            style={{ padding: "5px 10px", borderRadius: "6px", border: "1px solid #D3D1C7", background: "white", fontSize: "12.5px", color: "#2C2C2A", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                          >
                            {SHAPE_TYPES.map(s => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Label for shape..."
                            value={newNodeLabel}
                            onChange={e => setNewNodeLabel(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addNode()}
                            style={{ ...input, width: "180px" }}
                          />
                          <button onClick={addNode} style={btn("#185FA5", "white", false)}>
                            <i className="ti ti-plus" style={{ fontSize: "12px" }}></i>
                            Add Shape
                          </button>
                          {selectedNode && (
                            <button onClick={deleteSelectedNode} style={btn("#FAECE7", "#993C1D", false)}>
                              <i className="ti ti-trash" style={{ fontSize: "12px" }}></i>
                              Delete
                            </button>
                          )}
                          <span style={{ fontSize: "11px", color: "#888780" }}>
                            Hover shape to see handles · Drag handles to connect
                          </span>
                        </div>
                      )}
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={!isFinal ? onNodesChange : undefined}
                          onEdgesChange={!isFinal ? onEdgesChange : undefined}
                          onConnect={!isFinal ? onConnect : undefined}
                          onNodeClick={onNodeClick}
                          nodeTypes={nodeTypes}
                          fitView
                        >
                          <Background />
                          <Controls />
                        </ReactFlow>
                      </div>
                    </div>
                  )}

                  {/* Code stage */}
                  {activeStage === "code" && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                      <div style={{ padding: "8px 14px", background: "#1E1E2E", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                        <select
                          value={language}
                          onChange={e => setLanguage(e.target.value)}
                          disabled={isFinal && isStudent}
                          style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #3E3E5E", background: "#2D2D44", fontSize: "12.5px", color: "#CDD6F4", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleRunCode}
                          disabled={runningCode}
                          style={{
                            padding: "5px 14px",
                            background: runningCode ? "#3E3E5E" : "#3B6D11",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12.5px",
                            fontWeight: "500",
                            cursor: runningCode ? "not-allowed" : "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <i className="ti ti-player-play" style={{ fontSize: "12px" }}></i>
                          {runningCode ? "Running..." : "Run Code"}
                        </button>
                      </div>

                      <div style={{ flex: 1, minHeight: 0 }}>
                        <Editor
                          height="100%"
                          language={language === "cpp" ? "cpp" : language}
                          value={code}
                          onChange={(val) => !isFinal && setCode(val || "")}
                          theme="vs-dark"
                          options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 4,
                            wordWrap: "on",
                            lineNumbers: "on",
                            readOnly: isFinal && isStudent,
                            bracketPairColorization: { enabled: true },
                          }}
                        />
                      </div>

                      {/* Terminal */}
                      <div style={{ borderTop: "1px solid #3E3E5E", background: "#1E1E2E", flexShrink: 0 }}>
                        <div style={{ display: "flex", borderBottom: "1px solid #3E3E5E" }}>
                          {["input", "output"].map(tab => (
                            <button
                              key={tab}
                              onClick={() => setTerminalTab(tab)}
                              style={{
                                padding: "6px 14px",
                                background: "none",
                                border: "none",
                                borderBottom: terminalTab === tab ? "2px solid #185FA5" : "2px solid transparent",
                                color: terminalTab === tab ? "#CDD6F4" : "#888780",
                                fontSize: "12.5px",
                                cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif",
                                textTransform: "capitalize",
                              }}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {terminalTab === "input" && (
                          <div style={{ padding: "10px 14px" }}>
                            <div style={{ fontSize: "11.5px", color: "#888780", marginBottom: "6px" }}>stdin — enter input for your program</div>
                            <textarea
                              placeholder="Enter input here..."
                              value={codeInput}
                              onChange={e => setCodeInput(e.target.value)}
                              rows={3}
                              style={{
                                width: "100%",
                                padding: "8px 10px",
                                background: "#2D2D44",
                                color: "#CDD6F4",
                                border: "1px solid #3E3E5E",
                                borderRadius: "6px",
                                fontSize: "13px",
                                fontFamily: "monospace",
                                outline: "none",
                                resize: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        )}

                        {terminalTab === "output" && (
                          <div style={{ padding: "10px 14px", minHeight: "80px", maxHeight: "140px", overflowY: "auto" }}>
                            {runningCode ? (
                              <div style={{ color: "#888780", fontSize: "12.5px" }}>Running...</div>
                            ) : codeOutput ? (
                              <pre style={{ margin: 0, fontSize: "13px", color: "#CDD6F4", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{codeOutput}</pre>
                            ) : (
                              <div style={{ color: "#555570", fontSize: "12.5px" }}>Click Run Code to see output here</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Commit bar */}
                  {isStudent && !isFinal && !showHistory && (
                    <div style={{ padding: "12px 16px", borderTop: "1px solid #D3D1C7", background: "#FAFAF8", display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                      <input
                        type="text"
                        placeholder="Commit message (required) — e.g. Added bubble sort steps..."
                        value={commitMessage}
                        onChange={e => setCommitMessage(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCommit()}
                        style={{
                          ...input,
                          flex: 1,
                          borderColor: !commitMessage.trim() ? "#F0C4B4" : "#D3D1C7",
                        }}
                      />
                      <button
                        onClick={handleCommit}
                        disabled={saving || !commitMessage.trim()}
                        style={btn(STAGE_COLORS[activeStage].color, "white", saving || !commitMessage.trim())}
                      >
                        <i className="ti ti-git-commit" style={{ fontSize: "13px" }}></i>
                        {saving ? "Committing..." : `Commit ${activeStage}`}
                      </button>
                    </div>
                  )}

                  {isFinal && isStudent && (
                    <div style={{ padding: "12px 16px", borderTop: "1px solid #D3D1C7", background: "#EAF3DE", textAlign: "center", fontSize: "13px", color: "#3B6D11", flexShrink: 0 }}>
                      <i className="ti ti-lock" style={{ marginRight: "6px" }}></i>
                      This experiment has been finally submitted and locked
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
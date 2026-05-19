const axios = require("axios")

const JUDGE0_API = "https://ce.judge0.com"

const LANGUAGE_IDS = {
  python:     71,
  javascript: 63,
  java:       62,
  c:          50,
  cpp:        54,
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const submitCode = async (code, languageId, input) => {
  const submitRes = await axios.post(
    `${JUDGE0_API}/submissions?base64_encoded=false&wait=false`,
    {
      source_code: code,
      language_id: languageId,
      stdin:       input || "",
    },
    {
      headers: { "Content-Type": "application/json" }
    }
  )

  const token = submitRes.data.token

  // poll for result
  for (let i = 0; i < 10; i++) {
    await sleep(1000)
    const resultRes = await axios.get(
      `${JUDGE0_API}/submissions/${token}?base64_encoded=false`,
      { headers: { "Content-Type": "application/json" } }
    )
    const result = resultRes.data
    if (result.status?.id > 2) {
      return result
    }
  }

  throw new Error("Execution timed out")
}

const runCode = async (req, res) => {
  try {
    const { code, language, input } = req.body

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" })
    }

    const languageId = LANGUAGE_IDS[language]
    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language" })
    }

    const result = await submitCode(code, languageId, input)

    const output = result.stdout || result.stderr || result.compile_output || "No output"

    res.json({
      output,
      stdout:   result.stdout || "",
      stderr:   result.stderr || "",
      status:   result.status?.description || "Unknown",
      exitCode: result.exit_code,
    })
  } catch (error) {
    console.error("runCode error:", error.message)
    res.status(500).json({ message: "Code execution failed", error: error.message })
  }
}

const runTestCases = async (req, res) => {
  try {
    const { code, language, testCases } = req.body

    if (!code || !language || !testCases) {
      return res.status(400).json({ message: "Code, language, and test cases are required" })
    }

    const languageId = LANGUAGE_IDS[language]
    if (!languageId) {
      return res.status(400).json({ message: "Unsupported language" })
    }

    const results = []

    for (const tc of testCases) {
      const result = await submitCode(code, languageId, tc.input || "")

      const actualOutput   = (result.stdout || "").trim()
      const expectedOutput = (tc.expectedOutput || "").trim()
      const passed         = actualOutput === expectedOutput

      results.push({
        input:          tc.input || "",
        expectedOutput: expectedOutput,
        actualOutput:   actualOutput,
        passed:         passed,
        stderr:         result.stderr || "",
        status:         result.status?.description || "",
        isHidden:       tc.isHidden || false,
      })
    }

    const totalPassed = results.filter(r => r.passed).length
    const totalCases  = results.length
    const score       = Math.round((totalPassed / totalCases) * 100)

    res.json({ results, totalPassed, totalCases, score })
  } catch (error) {
    console.error("runTestCases error:", error.message)
    res.status(500).json({ message: "Test execution failed", error: error.message })
  }
}

module.exports = { runCode, runTestCases }
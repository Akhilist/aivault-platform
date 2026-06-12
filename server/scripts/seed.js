const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const dotenv = require("dotenv")
const path = require("path")

dotenv.config({ path: path.join(__dirname, "../.env") })

const User = require("../src/models/User")
const Exam = require("../src/models/Exam")
const Question = require("../src/models/Question")
const Submission = require("../src/models/Submission")
const RecordBook = require("../src/models/RecordBook")
const Commit = require("../src/models/Commit")

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/aivault_db"

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]

const DEPARTMENTS = ["Computer Science", "Information Technology", "Electronics", "Mechanical"]
const BATCHES = ["MCA-S1", "MCA-S2", "MCA-S3", "MSCS-S1", "MSCS-S2", "BCA-S4", "BCA-S5", "BCA-S6"]
const SUBJECTS = ["Data Structures", "Operating Systems", "Computer Networks", "Database Management", "Algorithms", "Software Engineering", "Computer Architecture", "Web Technologies"]

async function seed() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log("Connected to MongoDB")

    // Check if already seeded
    const existingUsers = await User.countDocuments()
    const isFresh = process.argv.includes("--fresh")
    if (existingUsers > 10 && !isFresh) {
      console.log("Database already has data. Skipping seed.")
      console.log("To reseed run: npm run seed:fresh")
      process.exit(0)
    }

    if (isFresh) {
      console.log("🗑️  Clearing existing data...")
      await Promise.all([
        User.deleteMany({}),
        Exam.deleteMany({}),
        Question.deleteMany({}),
        Submission.deleteMany({}),
        RecordBook.deleteMany({}),
        Commit.deleteMany({}),
      ])
      console.log("✅ Database cleared\n")
    }

    console.log("\n🌱 Seeding database...\n")

    const hashedPassword = await bcrypt.hash("test1234", 10)

    // ─── USERS ───────────────────────────────────────────────

    // Core staff accounts (keep existing test accounts)
    const coreUsers = await User.insertMany([
      { name: "Super Admin",    email: "superadmin@aivault.com",  password: hashedPassword, role: "super_admin",      department: "Administration" },
      { name: "Institute Admin",email: "ia@aivault.com",          password: hashedPassword, role: "institute_admin",  department: "Administration" },
      { name: "Dr. Priya HOD",  email: "hod@aivault.com",         password: hashedPassword, role: "hod",              department: "Computer Science" },
      { name: "Exam Controller",email: "ec@aivault.com",          password: hashedPassword, role: "exam_controller",  department: "Examination Cell" },
      { name: "Test Teacher",   email: "teacher@aivault.com",     password: hashedPassword, role: "teacher",          department: "Computer Science" },
      { name: "Test Student",   email: "student@aivault.com",     password: hashedPassword, role: "student",          department: "Computer Science", batch: "MCA-S3", rollNumber: "MCA001" },
    ])

    // Extra teachers
    const teacherData = [
      { name: "Prof. Arjun Nair",    email: "arjun.nair@aivault.com",    department: "Computer Science" },
      { name: "Dr. Meena Pillai",    email: "meena.pillai@aivault.com",  department: "Information Technology" },
      { name: "Prof. Rahul Sharma",  email: "rahul.sharma@aivault.com",  department: "Electronics" },
    ]

    const teachers = await User.insertMany(
      teacherData.map(t => ({ ...t, password: hashedPassword, role: "teacher" }))
    )

    // 20 students
    const studentNames = [
      "Aditya Kumar", "Sneha Menon", "Rohan Verma", "Pooja Nair", "Kiran Patel",
      "Anjali Singh", "Vishnu Das", "Divya Krishnan", "Sanjay Gupta", "Priya Raj",
      "Rahul Thomas", "Lakshmi Iyer", "Deepak Pillai", "Nisha Bose", "Arun Mohan",
      "Kavya Reddy", "Suresh Babu", "Ritu Sharma", "Mohammed Ali", "Ananya Nair",
    ]

    const students = await User.insertMany(
      studentNames.map((name, i) => ({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@student.aivault.com`,
        password: hashedPassword,
        role: "student",
        department: pickRandom(DEPARTMENTS),
        batch: pickRandom(BATCHES),
        rollNumber: `MCA${String(i + 2).padStart(3, "0")}`,
      }))
    )

    const allStudents = [coreUsers[5], ...students]
    const mainTeacher = coreUsers[4]
    const hod = coreUsers[2]

    console.log(`✅ Created ${allStudents.length} students`)
    console.log(`✅ Created ${teachers.length + 1} teachers`)

    // ─── QUESTIONS ────────────────────────────────────────────

    const questionSets = []

    // DS Questions
    const dsQuestions = await Question.insertMany([
      {
        text: "What is the time complexity of binary search?",
        type: "mcq",
        subject: "Data Structures",
        difficulty: "easy",
        marks: 2,
        options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
        correctAnswer: "O(log n)",
        createdBy: mainTeacher._id,
        isApproved: true,
      },
      {
        text: "Which data structure uses LIFO principle?",
        type: "mcq",
        subject: "Data Structures",
        difficulty: "easy",
        marks: 2,
        options: ["Queue", "Stack", "Tree", "Graph"],
        correctAnswer: "Stack",
        createdBy: mainTeacher._id,
        isApproved: true,
      },
      {
        text: "What is the worst case time complexity of QuickSort?",
        type: "mcq",
        subject: "Data Structures",
        difficulty: "medium",
        marks: 2,
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correctAnswer: "O(n²)",
        createdBy: mainTeacher._id,
        isApproved: true,
      },
      {
        text: "Explain the difference between a stack and a queue with examples.",
        type: "short",
        subject: "Data Structures",
        difficulty: "medium",
        marks: 5,
        rubric: "Stack uses LIFO, queue uses FIFO. Stack example: function calls, undo. Queue example: print spooler, CPU scheduling.",
        createdBy: mainTeacher._id,
        isApproved: true,
      },
      {
        text: "Write a program to check if a given string is a palindrome using a stack.",
        type: "coding",
        subject: "Data Structures",
        difficulty: "medium",
        marks: 10,
        testCases: [
          { input: "racecar", expectedOutput: "true", isHidden: false },
          { input: "hello", expectedOutput: "false", isHidden: false },
          { input: "madam", expectedOutput: "true", isHidden: true },
        ],
        createdBy: mainTeacher._id,
        isApproved: true,
      },
    ])
    questionSets.push({ subject: "Data Structures", questions: dsQuestions })

    // Networks Questions
    const netQuestions = await Question.insertMany([
      {
        text: "Which layer of the OSI model is responsible for routing?",
        type: "mcq",
        subject: "Computer Networks",
        difficulty: "easy",
        marks: 2,
        options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
        correctAnswer: "Network Layer",
        createdBy: teachers[0]._id,
        isApproved: true,
      },
      {
        text: "What does TCP stand for?",
        type: "mcq",
        subject: "Computer Networks",
        difficulty: "easy",
        marks: 2,
        options: ["Transfer Control Protocol", "Transmission Control Protocol", "Transport Communication Protocol", "Terminal Control Protocol"],
        correctAnswer: "Transmission Control Protocol",
        createdBy: teachers[0]._id,
        isApproved: true,
      },
      {
        text: "Explain the difference between TCP and UDP.",
        type: "short",
        subject: "Computer Networks",
        difficulty: "medium",
        marks: 5,
        rubric: "TCP is connection-oriented, reliable, uses handshaking. UDP is connectionless, faster, no guarantee of delivery. TCP used for web, email. UDP for video streaming, DNS.",
        createdBy: teachers[0]._id,
        isApproved: true,
      },
      {
        text: "Describe the OSI model layers and their functions.",
        type: "long",
        subject: "Computer Networks",
        difficulty: "hard",
        marks: 10,
        rubric: "7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer should be described with function and example protocol.",
        createdBy: teachers[0]._id,
        isApproved: true,
      },
    ])
    questionSets.push({ subject: "Computer Networks", questions: netQuestions })

    // OS Questions
    const osQuestions = await Question.insertMany([
      {
        text: "What is a deadlock in an operating system?",
        type: "mcq",
        subject: "Operating Systems",
        difficulty: "medium",
        marks: 2,
        options: [
          "A process waiting for I/O",
          "Two or more processes waiting for each other indefinitely",
          "CPU being idle",
          "Memory overflow",
        ],
        correctAnswer: "Two or more processes waiting for each other indefinitely",
        createdBy: teachers[1]._id,
        isApproved: true,
      },
      {
        text: "Which scheduling algorithm gives minimum average waiting time?",
        type: "mcq",
        subject: "Operating Systems",
        difficulty: "medium",
        marks: 2,
        options: ["FCFS", "Round Robin", "SJF", "Priority Scheduling"],
        correctAnswer: "SJF",
        createdBy: teachers[1]._id,
        isApproved: true,
      },
      {
        text: "Explain virtual memory and its advantages.",
        type: "long",
        subject: "Operating Systems",
        difficulty: "hard",
        marks: 10,
        rubric: "Virtual memory allows execution of processes not completely in memory. Uses paging/segmentation. Advantages: run programs larger than RAM, better multiprogramming, isolation.",
        createdBy: teachers[1]._id,
        isApproved: true,
      },
    ])
    questionSets.push({ subject: "Operating Systems", questions: osQuestions })

    console.log(`✅ Created ${dsQuestions.length + netQuestions.length + osQuestions.length} questions`)

    // ─── EXAMS ────────────────────────────────────────────────

    const examConfigs = [
      {
        title: "Data Structures Mid Semester",
        subject: "Data Structures",
        description: "Mid semester examination covering arrays, stacks, queues and trees",
        duration: 90,
        passMark: 14,
        totalMarks: 21,
        status: "closed",
        questions: dsQuestions,
        createdBy: mainTeacher._id,
        approvedBy: hod._id,
        batch: "MCA-S3",
      },
      {
        title: "Computer Networks Final",
        subject: "Computer Networks",
        description: "End semester examination on OSI model, TCP/IP and network protocols",
        duration: 120,
        passMark: 12,
        totalMarks: 19,
        status: "closed",
        questions: netQuestions,
        createdBy: teachers[0]._id,
        approvedBy: hod._id,
        batch: "MCA-S2",
      },
      {
        title: "Operating Systems Quiz",
        subject: "Operating Systems",
        description: "Quick assessment on process management and scheduling",
        duration: 45,
        passMark: 8,
        totalMarks: 14,
        status: "closed",
        questions: osQuestions,
        createdBy: teachers[1]._id,
        approvedBy: hod._id,
        batch: "MCA-S3",
      },
      {
        title: "Data Structures Lab Test",
        subject: "Data Structures",
        description: "Practical coding assessment on sorting and searching algorithms",
        duration: 60,
        passMark: 10,
        totalMarks: 14,
        status: "live",
        questions: dsQuestions.slice(0, 3),
        createdBy: mainTeacher._id,
        approvedBy: hod._id,
        batch: "MCA-S3",
      },
      {
        title: "Computer Networks Internal",
        subject: "Computer Networks",
        description: "Internal assessment on network layer and routing",
        duration: 60,
        passMark: 10,
        totalMarks: 19,
        status: "scheduled",
        questions: netQuestions,
        createdBy: teachers[0]._id,
        approvedBy: hod._id,
        batch: "MSCS-S1",
      },
      {
        title: "OS Internal Assessment",
        subject: "Operating Systems",
        description: "Internal assessment on memory management",
        duration: 90,
        passMark: 10,
        totalMarks: 14,
        status: "scheduled",
        questions: osQuestions,
        createdBy: teachers[1]._id,
        approvedBy: hod._id,
        batch: "MCA-S2",
      },
      {
        title: "Algorithms Midterm",
        subject: "Algorithms",
        description: "Examination on divide and conquer, dynamic programming",
        duration: 120,
        passMark: 20,
        totalMarks: 40,
        status: "pending_approval",
        questions: dsQuestions.slice(0, 2),
        createdBy: mainTeacher._id,
        batch: "MSCS-S2",
      },
      {
        title: "Web Technologies Assessment",
        subject: "Web Technologies",
        description: "Assessment on HTML, CSS, JavaScript and REST APIs",
        duration: 60,
        passMark: 15,
        totalMarks: 30,
        status: "draft",
        questions: [],
        createdBy: teachers[2]._id,
        batch: "BCA-S6",
      },
    ]

    const exams = await Exam.insertMany(
      examConfigs.map(e => ({
        title: e.title,
        subject: e.subject,
        description: e.description,
        duration: e.duration,
        passMark: e.passMark,
        totalMarks: e.totalMarks,
        status: e.status,
        questions: e.questions.map(q => ({ questionId: q._id, marks: q.marks })),
        createdBy: e.createdBy,
        approvedBy: e.approvedBy || null,
        assignedBatches: [e.batch],
        scheduledStart: e.status === "scheduled" ? new Date(Date.now() + 86400000) : null,
        scheduledEnd: e.status === "scheduled" ? new Date(Date.now() + 172800000) : null,
      }))
    )

    console.log(`✅ Created ${exams.length} exams`)

    // ─── SUBMISSIONS ──────────────────────────────────────────

    const closedExams = exams.filter(e => e.status === "closed")
    const submissions = []

    for (const exam of closedExams) {
      const examConfig = examConfigs.find(e => e.title === exam.title)
      const examQuestions = examConfig.questions

      // pick 10 random students
      const selectedStudents = allStudents.slice(0, 10)

      for (const student of selectedStudents) {
        const answers = examQuestions.map(q => {
          let answer = ""
          let marks = null

          if (q.type === "mcq") {
            const correct = Math.random() > 0.35
            answer = correct ? q.correctAnswer : pickRandom(q.options.filter(o => o !== q.correctAnswer))
            marks = correct ? q.marks : 0
          } else if (q.type === "short") {
            const responses = [
              "Stack uses LIFO while queue uses FIFO. Stack example is function call stack.",
              "A stack is last in first out. Queue is first in first out like a printer queue.",
              "Stack and queue are linear data structures. Stack has push and pop operations.",
            ]
            answer = pickRandom(responses)
            marks = randomBetween(2, q.marks)
          } else if (q.type === "long") {
            answer = "The OSI model has 7 layers. Physical layer deals with raw bits. Data link handles framing. Network layer handles routing. Transport ensures reliable delivery. Session manages connections. Presentation handles encoding. Application provides user interface."
            marks = randomBetween(5, q.marks)
          } else if (q.type === "coding") {
            answer = `def is_palindrome(s):\n    stack = []\n    for char in s:\n        stack.append(char)\n    result = ''\n    while stack:\n        result += stack.pop()\n    return result == s`
            marks = randomBetween(6, q.marks)
          }

          return {
            questionId: q._id,
            answer,
            marks,
            maxMarks: q.marks,
            isGraded: true,
          }
        })

        const totalScore = Math.max(0, answers.reduce((s, a) => s + (a.marks || 0), 0))
        const percentage = Math.round((totalScore / exam.totalMarks) * 100)
        const passed = totalScore >= exam.passMark
        const violations = Math.random() > 0.85 ? randomBetween(1, 3) : 0

        submissions.push({
          examId: exam._id,
          studentId: student._id,
          answers,
          totalScore,
          totalMarks: exam.totalMarks,
          percentage,
          passed,
          violations,
          autoSubmitted: violations >= 4,
          startTime: new Date(Date.now() - randomBetween(3600000, 7200000)),
          submitTime: new Date(Date.now() - randomBetween(1800000, 3600000)),
          status: "published",
          resultPublished: true,
          deviceFingerprint: Math.random().toString(36).substring(2, 18),
          ipAddress: `192.168.${randomBetween(1, 10)}.${randomBetween(1, 254)}`,
        })
      }
    }

    await Submission.insertMany(submissions)
    console.log(`✅ Created ${submissions.length} submissions`)

    // ─── VERSION CONTROL COMMITS ──────────────────────────────

    const experiments = [
      { id: "exp_bubble_sort",   name: "Bubble Sort Implementation" },
      { id: "exp_binary_search", name: "Binary Search Algorithm" },
      { id: "exp_linked_list",   name: "Singly Linked List" },
    ]

    const commitDocs = []

    for (const student of allStudents.slice(0, 8)) {
      const exp = pickRandom(experiments)

      commitDocs.push({
        studentId: student._id,
        experimentId: `${exp.id}_${student._id}`,
        experimentName: exp.name,
        stage: "algorithm",
        content: JSON.stringify([
          { id: 1, text: "Start" },
          { id: 2, text: "Input the array elements" },
          { id: 3, text: "Compare adjacent elements" },
          { id: 4, text: "Swap if out of order" },
          { id: 5, text: "Repeat until sorted" },
          { id: 6, text: "End" },
        ]),
        commitMessage: "Initial algorithm draft",
        commitNumber: 1,
        isFinal: true,
        isLatest: true,
      })

      commitDocs.push({
        studentId: student._id,
        experimentId: `${exp.id}_${student._id}`,
        experimentName: exp.name,
        stage: "flowchart",
        content: JSON.stringify({
          nodes: [
            { id: "1", type: "flowNode", position: { x: 200, y: 50 },  data: { label: "START", shape: "oval" } },
            { id: "2", type: "flowNode", position: { x: 200, y: 160 }, data: { label: "Input Array", shape: "parallelogram" } },
            { id: "3", type: "flowNode", position: { x: 200, y: 270 }, data: { label: "i < n-1?", shape: "diamond" } },
            { id: "4", type: "flowNode", position: { x: 200, y: 380 }, data: { label: "Swap Elements", shape: "rectangle" } },
            { id: "5", type: "flowNode", position: { x: 200, y: 490 }, data: { label: "END", shape: "oval" } },
          ],
          edges: [
            { id: "e1-2", source: "1", target: "2" },
            { id: "e2-3", source: "2", target: "3" },
            { id: "e3-4", source: "3", target: "4" },
            { id: "e4-5", source: "4", target: "5" },
          ],
        }),
        commitMessage: "Flowchart with decision node",
        commitNumber: 1,
        isFinal: true,
        isLatest: true,
      })

      commitDocs.push({
        studentId: student._id,
        experimentId: `${exp.id}_${student._id}`,
        experimentName: exp.name,
        stage: "code",
        content: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n-1):\n        for j in range(n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n\narr = list(map(int, input().split()))\nprint(bubble_sort(arr))`,
        commitMessage: "Working bubble sort implementation",
        commitNumber: 1,
        language: "python",
        isFinal: true,
        isLatest: true,
      })
    }

    await Commit.insertMany(commitDocs)
    console.log(`✅ Created ${commitDocs.length} version control commits`)

    // ─── RECORD BOOKS ─────────────────────────────────────────

    const recordBooks = []

    for (const student of allStudents.slice(0, 6)) {
      const exp = pickRandom(experiments)
      const status = pickRandom(["draft", "submitted", "approved", "signed"])

      const record = {
        studentId: student._id,
        experimentId: `${exp.id}_${student._id}`,
        experimentName: exp.name,
        subject: "Data Structures",
        batch: student.batch || "MCA-S3",
        date: new Date(),
        aim: `To implement and demonstrate the ${exp.name} algorithm and analyze its time complexity.`,
        theory: `${exp.name} is a fundamental algorithm in computer science. It works by repeatedly comparing adjacent elements and swapping them if they are in the wrong order. The algorithm has a time complexity of O(n²) in the worst case.`,
        algorithmContent: "Step 1: Start\nStep 2: Input the array elements\nStep 3: Compare adjacent elements\nStep 4: Swap if out of order\nStep 5: Repeat until sorted\nStep 6: End",
        codeContent: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n-1):\n        for j in range(n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`,
        codeLanguage: "python",
        output: "Input: [64, 34, 25, 12, 22, 11, 90]\nOutput: [11, 12, 22, 25, 34, 64, 90]\nTime taken: 0.002ms",
        conclusion: `The ${exp.name} was successfully implemented. The output matched the expected results. The algorithm efficiently sorts the array but has O(n²) complexity which makes it unsuitable for large datasets.`,
        status,
        submissionCount: status === "draft" ? 0 : 1,
        teacherRemarks: status === "approved" || status === "signed" ? "Good work! Algorithm is correct and well documented." : "",
        inlineComments: [],
      }

      if (status === "signed") {
        const crypto = require("crypto")
        const signedAt = new Date()
        const docString = JSON.stringify({
          experimentId:     record.experimentId,
          experimentName:   record.experimentName,
          studentId:        student._id.toString(),
          aim:              record.aim,
          algorithmContent: record.algorithmContent,
          codeContent:      record.codeContent,
          output:           record.output,
          conclusion:       record.conclusion,
          signedBy:         mainTeacher._id.toString(),
          signedAt:         signedAt.toISOString(),
        })
        const documentHash = crypto.createHash("sha256").update(docString).digest("hex")
        record.signature = {
          signedBy:     mainTeacher._id,
          signedAt,
          documentHash,
        }
      }

      recordBooks.push(record)
    }

    await RecordBook.insertMany(recordBooks)
    console.log(`✅ Created ${recordBooks.length} record book entries`)

    // ─── SUMMARY ──────────────────────────────────────────────

    console.log("\n" + "═".repeat(50))
    console.log("✅ DATABASE SEEDED SUCCESSFULLY")
    console.log("═".repeat(50))
    console.log("\n📋 LOGIN CREDENTIALS (all passwords: test1234)\n")
    console.log("STAFF ACCOUNTS:")
    console.log("  Super Admin      → superadmin@aivault.com")
    console.log("  Institute Admin  → ia@aivault.com")
    console.log("  HOD              → hod@aivault.com")
    console.log("  Exam Controller  → ec@aivault.com")
    console.log("  Teacher          → teacher@aivault.com")
    console.log("  Extra Teacher 1  → arjun.nair@aivault.com")
    console.log("  Extra Teacher 2  → meena.pillai@aivault.com")
    console.log("\nSTUDENT ACCOUNTS (20 students):")
    allStudents.slice(0, 5).forEach(s => {
      console.log(`  ${s.name.padEnd(20)} → ${s.email}`)
    })
    console.log(`  ... and ${allStudents.length - 5} more students`)
    console.log("\n📊 SEEDED DATA:")
    console.log(`  Users        : ${allStudents.length + 5} (${allStudents.length} students, 4 staff, 3 teachers)`)
    console.log(`  Questions    : ${dsQuestions.length + netQuestions.length + osQuestions.length}`)
    console.log(`  Exams        : ${exams.length} (3 closed, 1 live, 2 scheduled, 1 pending, 1 draft)`)
    console.log(`  Submissions  : ${submissions.length}`)
    console.log(`  Commits      : ${commitDocs.length}`)
    console.log(`  Record Books : ${recordBooks.length}`)
    console.log("\n" + "═".repeat(50) + "\n")

    process.exit(0)
  } catch (error) {
    console.error("❌ Seed error:", error.message)
    process.exit(1)
  }
}

seed()
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { loginUser } from "./authService"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const data = await loginUser({
        email,
        password,
      })

      console.log(data)

      localStorage.setItem("token", data.token)

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      alert("Login Successful")

      if (data.user.role === "teacher") {
        navigate("/teacher")
      }

      else if (data.user.role === "student") {
        navigate("/student")
      }

      else if (data.user.role === "super_admin") {
        navigate("/admin")
      }

    } catch (error) {
      console.log(error)

      alert("Login Failed")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleLogin}
        className="bg-slate-800 p-8 rounded-xl w-96"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          AIVault Login
        </h1>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full p-3 mb-4 rounded bg-slate-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-3 mb-4 rounded bg-slate-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 p-3 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  )
}

export default Login
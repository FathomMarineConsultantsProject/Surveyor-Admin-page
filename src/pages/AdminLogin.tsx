import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AdminLogin() {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(true)

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setErr("")

      const base = import.meta.env.VITE_API_URL || "https://surveyor-form-backend-git-main-fmc-projects-projects.vercel.app"

      const res = await fetch(`${base}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || "Login failed")
      }

      const token = data?.data?.token
      if (!token) throw new Error("Token missing in response")

      // Store token
      if (remember) localStorage.setItem("admin_token", token)
      else sessionStorage.setItem("admin_token", token)

      navigate("/admin")
    } catch (e: unknown) {
      console.error("Login Error:", e)
      
      if (e instanceof Error) {
        setErr(e.message)
      } else {
        setErr("Login failed. Please check your connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
        <p className="text-slate-600 mt-1">Sign in to manage form records.</p>

        {err ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">
            {err}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-slate-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full h-11 rounded-xl border border-slate-200 px-4 outline-none focus:ring-4 focus:ring-slate-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>

          <button
            disabled={loading}
            className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  )
}

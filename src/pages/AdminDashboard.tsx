import React, { useEffect, useState } from "react"
import AdminLayout from "../layout/AdminLayout"
import { getFormStats } from "../services/records.api"

type Stats = {
  total: number
  pending: number
  approved: number
  new_today: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, new_today: 0 })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState("")

  async function fetchStats() {
    try {
      setErr("")
      const res = await getFormStats()
      setStats(res?.data || { total: 0, pending: 0, approved:0, new_today: 0 })
    } catch (e: any) {
      setErr(e?.message || "Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // ✅ updates after review button is clicked in FormRecords
    const onRefresh = () => fetchStats()
    window.addEventListener("stats:refresh", onRefresh)
    return () => window.removeEventListener("stats:refresh", onRefresh)
  }, [])

  return (
    <AdminLayout>
      <div className="text-slate-900">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
          <p className="text-slate-600 mt-2 text-base leading-relaxed max-w-2xl">
            Use the sidebar to navigate through surveyor form submissions and review records
            efficiently.
          </p>
        </div>

        {/* Error */}
        {err ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {err}
          </div>
        ) : null}

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <p className="text-slate-500 text-sm font-medium">Total Submissions</p>
            {loading ? (
              <div className="mt-3 h-10 w-28 rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <p className="text-4xl font-semibold mt-2 tracking-tight">{stats.total}</p>
            )}
            <p className="text-slate-500 text-sm mt-2">All-time received forms</p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <p className="text-slate-500 text-sm font-medium">Pending Review</p>
            {loading ? (
              <div className="mt-3 h-10 w-20 rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <p className="text-4xl font-semibold mt-2 tracking-tight">{stats.pending}</p>
            )}
            <p className="text-slate-500 text-sm mt-2">Awaiting admin action</p>
          </div>
          {/* Approved */}
<div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
  <p className="text-slate-500 text-sm font-medium">Approved</p>

  {loading ? (
    <div className="mt-3 h-10 w-20 rounded-xl bg-slate-100 animate-pulse" />
  ) : (
    <p className="text-4xl font-semibold mt-2 tracking-tight">{stats.approved}</p>
  )}

  <p className="text-slate-500 text-sm mt-2">Total approved forms</p>
</div>


          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            <p className="text-slate-500 text-sm font-medium">New Today</p>
            {loading ? (
              <div className="mt-3 h-10 w-16 rounded-xl bg-slate-100 animate-pulse" />
            ) : (
              <p className="text-4xl font-semibold mt-2 tracking-tight">{stats.new_today}</p>
            )}
            <p className="text-slate-500 text-sm mt-2">Submitted in last 24 hours</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

import { useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

/*
  Admin Shell (Sidebar + Topbar + Content Container)

  Don’t Make Me Think:
  - Always show where you are (breadcrumb/title)
  Jakob’s Law:
  - Standard sidebar navigation behavior + consistent layout
  Fitts’s Law:
  - Large clickable nav targets
  Gestalt:
  - Consistent spacing, grouping, and hierarchy
*/

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "📊", path: "/admin" },
  { key: "records", label: "Form Records", icon: "🗂️", path: "/admin/records" },
]

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/admin/records")) return "Form Records"
  return "Dashboard"
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const activeKey = useMemo(() => {
  const matches = NAV_ITEMS.filter((x) => location.pathname.startsWith(x.path))
  if (!matches.length) return "dashboard"

  // ✅ Longest path wins: "/admin/records" beats "/admin"
  matches.sort((a, b) => b.path.length - a.path.length)
  return matches[0].key
}, [location.pathname])


  const pageTitle = useMemo(() => getPageTitle(location.pathname), [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="min-h-screen flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            className="fixed inset-0 bg-black/30 lg:hidden z-20"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static z-30 h-full
            w-72 shrink-0
            transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
            transition-transform duration-200
            p-4
          `}
        >
          <div className="h-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-slate-900 text-white grid place-items-center shadow-sm">
                  ⚓
                </div>
                <div className="min-w-0">
                  <p className="font-semibold leading-tight truncate">Admin Console</p>
                  <p className="text-xs text-slate-500 truncate">Surveyor Dashboard</p>
                </div>
              </div>
            </div>

            <nav className="p-3">
              <p className="px-3 py-2 text-xs font-semibold text-slate-500 tracking-wide">MAIN</p>
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeKey === item.key

                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => {
                          navigate(item.path)
                          setSidebarOpen(false)
                        }}
                        className={`
                          w-full flex items-center gap-3
                          px-3 py-2.5 rounded-xl
                          transition
                          ${
                            isActive
                              ? "bg-slate-900 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-100"
                          }
                        `}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-sm font-semibold">{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="p-4 mt-auto border-t border-slate-200">
              <button
                className="w-full rounded-xl py-2.5 bg-slate-900 text-white hover:bg-slate-800 transition text-sm font-semibold"
                onClick={() => navigate("/login")}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Content column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur border-b border-slate-200">
           <div className="w-full px-6 py-4 flex items-center justify-between">

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>

                <div>
                  <p className="text-xs text-slate-500">Admin</p>
                  <h1 className="text-lg md:text-xl font-semibold tracking-tight">{pageTitle}</h1>
                </div>
              </div>

              {/* Right side (optional quick actions) */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  {/* <span className="text-slate-500 text-sm">⚙️</span>
                  <span className="text-sm font-semibold text-slate-700">Settings</span> */}
                </div>
              </div>
            </div>
          </header>

          {/* Page content container */}
          <main className="w-full px-6 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

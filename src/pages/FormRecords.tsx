import { useEffect, useMemo, useState } from "react"
import AdminLayout from "../layout/AdminLayout"
import { getFormRecords, markReviewed, approveForm } from "../services/records.api"

/*
  FORM RECORDS (API + UI)
  - Pending / All / Reviewed tabs
  - Review button marks reviewed=true and disappears from Pending
  - Hide (Other) columns unless any record uses it
*/

const COLUMNS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "phoneNumber", label: "Phone Number" },
  { key: "mobileNumber", label: "Mobile Number" },
  { key: "nationality", label: "Nationality" },
  { key: "employmentStatus", label: "Employment Status" },
  { key: "companyName", label: "Company Name" },

  { key: "email", label: "Email" },
  { key: "dob", label: "DOB (DD/MM/YYYY)" },
  { key: "yearStarted", label: "Year Started" },
  { key: "heardAbout", label: "Heard About" },

  { key: "street1", label: "Street 1" },
  { key: "street2", label: "Street 2" },
  { key: "city", label: "City" },
  { key: "postalCode", label: "Postal Code" },
  { key: "country", label: "Country" },
  { key: "stateRegion", label: "State/Region" },

  { key: "discipline", label: "Discipline" },
  { key: "disciplineOther", label: "Discipline (Other)" },
  { key: "rank", label: "Rank" },
  { key: "rankOther", label: "Rank (Other)" },

  { key: "qualifications", label: "Qualifications" },
  { key: "qualificationsOther", label: "Qualifications (Other)" },

  { key: "experienceByQualification", label: "Experience By Qualification" },

  { key: "vesselTypes", label: "Vessel Types" },
  { key: "vesselTypesOther", label: "Vessel Types (Other)" },

  { key: "shoresideExperience", label: "Shoreside Experience" },
  { key: "shoresideExperienceOther", label: "Shoreside (Other)" },

  { key: "surveyingExperience", label: "Surveying Experience" },
  { key: "surveyingExperienceOther", label: "Surveying (Other)" },

  { key: "vesselTypeSurveyingExperience", label: "Vessel Type Surveying Exp" },
  {
    key: "vesselTypeSurveyingExperienceOther",
    label: "Vessel Type Surveying (Other)",
  },

  { key: "accreditations", label: "Accreditations" },
  { key: "accreditationsOther", label: "Accreditations (Other)" },
  { key: "coursesCompleted", label: "Courses Completed" },
  { key: "coursesCompletedOther", label: "Courses Completed (Other)" },

  { key: "references", label: "References" },

  { key: "cvFile", label: "CV" },
  { key: "photoFile", label: "Photo" },
  { key: "inspectionCost", label: "Inspection Cost" },
  { key: "marketingConsent", label: "Marketing Consent" },

  { key: "actions", label: "Actions" },
  { key: "approve", label: "Approve" },
]

const OTHER_KEYS = new Set([
  "disciplineOther",
  "rankOther",
  "qualificationsOther",
  "vesselTypesOther",
  "shoresideExperienceOther",
  "surveyingExperienceOther",
  "vesselTypeSurveyingExperienceOther",
  "accreditationsOther",
  "coursesCompletedOther",
])

function hasAnyValue(allRows: any[], key: string) {
  return allRows.some((r) => {
    const v = r?.[key]
    if (v === null || v === undefined) return false
    if (typeof v === "string") return v.trim().length > 0
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === "object") return Object.keys(v).length > 0
    return Boolean(v)
  })
}

function normalizeRecord(r: any) {
  return {
    id: r.id,
    reviewed: !!r.reviewed,
    reviewedAt: r.reviewed_at ?? null,

    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    phoneNumber: r.phone_number ?? "",
    mobileNumber: r.mobile_number ?? "",
    nationality: r.nationality ?? "",
    employmentStatus: r.employment_status ?? "",
    companyName: r.company_name ?? "",

    email: r.email ?? "",
    yearStarted: r.year_started ?? "",
    heardAbout: r.heard_about ?? "",

    // address (your API returns these as street1/street2 based on your model)
    street1: r.street1 ?? "",
    street2: r.street2 ?? "",
    city: r.city ?? "",
    postalCode: r.postal_code ?? "",
    country: r.country ?? "",
    stateRegion: r.state_region ?? "",

    discipline: r.discipline ?? "",
    rank: r.rank ?? "",

    qualifications: r.qualifications ?? [],
    experienceByQualification: r.experience_by_qualification ?? {},

    vesselTypes: r.vessel_types ?? [],
    shoresideExperience: r.shoreside_experience ?? [],
    surveyingExperience: r.surveying_experience ?? [],
    vesselTypeSurveyingExperience: r.vessel_type_surveying_experience ?? [],

    accreditations: r.accreditations ?? [],
    coursesCompleted: r.courses_completed ?? [],

    references: r.refs ?? [],

    photoFile: r.photo_path ?? null,
    cvFile: r.cv_path ?? null,

    inspectionCost: r.inspection_cost ?? "",
    marketingConsent: !!r.marketing_consent,

    // ✅ Other fields (snake_case from DB)
    disciplineOther: r.discipline_other ?? "",
    rankOther: r.rank_other ?? "",
    qualificationsOther: r.qualifications_other ?? "",
    vesselTypesOther: r.vessel_types_other ?? "",
    shoresideExperienceOther: r.shoreside_experience_other ?? "",
    surveyingExperienceOther: r.surveying_experience_other ?? "",
    vesselTypeSurveyingExperienceOther:
      r.vessel_type_surveying_experience_other ?? "",
    accreditationsOther: r.accreditations_other ?? "",
    coursesCompletedOther: r.courses_completed_other ?? "",

    dobDD: r.dob_dd ?? "",
    dobMM: r.dob_mm ?? "",
    dobYYYY: r.dob_yyyy ?? "",

    approved: !!(r.approved ?? r.is_approved),
    approvedAt: r.approvedAt ?? r.approved_at ?? null,
  }
}

// ✅ IMPORTANT: show "Other (text)" when array includes Other
const withOther = (arr: any, otherText?: string) => {
  const list = Array.isArray(arr) ? arr : []
  const hasOther = list.includes("Other") || list.includes("other")
  const cleaned = list.filter((x) => x !== "Other" && x !== "other")

  if (!hasOther) return cleaned.length ? cleaned.join(", ") : "—"

  const extra = (otherText ?? "").trim()
  if (!extra) return [...cleaned, "Other"].filter(Boolean).join(", ")

  return [...cleaned, `Other (${extra})`].filter(Boolean).join(", ")
}

const formatDOB = (r: any) => {
  if (!r?.dobDD && !r?.dobMM && !r?.dobYYYY) return "—"
  return `${r.dobDD || "—"}/${r.dobMM || "—"}/${r.dobYYYY || "—"}`
}

const formatExperienceByQualification = (obj: any) => {
  if (!obj || typeof obj !== "object") return "—"
  const entries = Object.entries(obj)
  if (!entries.length) return "—"
  return entries
    .map(([k, t]: any) => `${k}: ${t.years}y ${t.months}m ${t.days}d`)
    .join(" | ")
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"

const toFileUrl = (p: string) => {
  if (!p) return ""
  if (p.startsWith("http://") || p.startsWith("https://")) return p
  return `${API_BASE}/${p.replace(/^\/+/, "")}`
}

const fileNameFromPath = (p: string) => (p ? p.split("/").pop() || p : "")

const clipMiddle = (s = "", head = 18, tail = 10) => {
  if (!s) return ""
  if (s.length <= head + tail + 3) return s
  return `${s.slice(0, head)}...${s.slice(-tail)}`
}

export default function FormRecords() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState("")
  const [busyId, setBusyId] = useState<number | null>(null)

  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed">("pending")

  const pageSize = 8

  async function handleReview(id: number) {
    try {
      setBusyId(id)
      await markReviewed(id)
      setRows((prev) =>
        prev.map((x) => (x.id === id ? { ...x, reviewed: true } : x))
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleApprove(id: number) {
    try {
      setBusyId(id)
      await approveForm(id)
      setRows((prev) =>
        prev.map((x) => (x.id === id ? { ...x, approved: true } : x))
      )
    } finally {
      setBusyId(null)
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setApiError("")
        const res = await getFormRecords()
        const list = res?.data || []
        const normalized = list.map(normalizeRecord)
        if (mounted) setRows(normalized)
      } catch (e: any) {
        if (mounted) setApiError(e?.message || "Failed to load records")
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const visibleColumns = useMemo(() => {
    return COLUMNS.filter((col) => {
      if (OTHER_KEYS.has(col.key)) return hasAnyValue(rows, col.key)
      return true
    })
  }, [rows])

  const filtered = useMemo(() => {
    let base = rows
    if (statusFilter === "pending") base = base.filter((r) => !r.reviewed)
    if (statusFilter === "reviewed") base = base.filter((r) => r.reviewed)

    const query = q.trim().toLowerCase()
    if (!query) return base

    return base.filter((r) => {
      const hay = `${r.firstName} ${r.lastName} ${r.email} ${r.mobileNumber} ${r.companyName} ${r.rank} ${r.discipline}`.toLowerCase()
      return hay.includes(query)
    })
  }, [rows, q, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage])

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-slate-900">
          <h2 className="text-2xl font-semibold tracking-tight">Form Records</h2>
          <p className="text-slate-600 mt-2 text-base">Loading records...</p>
        </div>
      </AdminLayout>
    )
  }

  if (apiError) {
    return (
      <AdminLayout>
        <div className="text-slate-900">
          <h2 className="text-2xl font-semibold tracking-tight">Form Records</h2>
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {apiError}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="text-slate-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Form Records</h2>
            <p className="text-slate-600 mt-2 text-base max-w-2xl">
              Review submissions and manage pending items.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 w-fit">
            {[
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "reviewed", label: "Reviewed" },
            ].map((t: any) => (
              <button
                key={t.key}
                onClick={() => {
                  setStatusFilter(t.key)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  statusFilter === t.key
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setPage(1)
              }}
              className="w-full h-12 rounded-xl bg-white border border-slate-200 px-11 pr-4 outline-none focus:ring-4 focus:ring-slate-200 transition text-base"
              placeholder="Search name, email, company, rank, discipline..."
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              🔎
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">{paged.length}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">{filtered.length}</span>
            </p>
            <p className="text-sm text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-900">{safePage}</span> /{" "}
              {totalPages}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[2600px] w-full">
              <thead className="bg-slate-900">
                <tr>
                  {visibleColumns.map((c) => (
                    <th
                      key={c.key}
                      className="px-4 py-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-white whitespace-nowrap border-b border-slate-800"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="px-4 py-10 text-center text-slate-600"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paged.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition align-top">
                      {visibleColumns.map((c) => {
                        let val: any = r?.[c.key]

                        // ✅ DOB column
                        if (c.key === "dob") val = formatDOB(r)

                        // ✅ show "Other(text)" on Discipline/Rank main columns
                        if (c.key === "discipline") {
                          if (String(r.discipline).toLowerCase() === "other") {
                            const extra = (r.disciplineOther ?? "").trim()
                            val = extra ? `Other (${extra})` : "Other"
                          }
                        }

                        if (c.key === "rank") {
                          if (String(r.rank).toLowerCase() === "other") {
                            const extra = (r.rankOther ?? "").trim()
                            val = extra ? `Other (${extra})` : "Other"
                          }
                        }

                        // ✅ Arrays with Other info (main columns)
                        if (c.key === "qualifications") {
                          val = withOther(r.qualifications, r.qualificationsOther)
                        }

                        if (c.key === "vesselTypes") {
                          val = withOther(r.vesselTypes, r.vesselTypesOther)
                        }

                        if (c.key === "shoresideExperience") {
                          val = withOther(
                            r.shoresideExperience,
                            r.shoresideExperienceOther
                          )
                        }

                        if (c.key === "surveyingExperience") {
                          val = withOther(
                            r.surveyingExperience,
                            r.surveyingExperienceOther
                          )
                        }

                        if (c.key === "vesselTypeSurveyingExperience") {
                          val = withOther(
                            r.vesselTypeSurveyingExperience,
                            r.vesselTypeSurveyingExperienceOther
                          )
                        }

                        if (c.key === "accreditations") {
                          val = withOther(r.accreditations, r.accreditationsOther)
                        }

                        if (c.key === "coursesCompleted") {
                          val = withOther(
                            r.coursesCompleted,
                            r.coursesCompletedOther
                          )
                        }

                        // ✅ Experience mapping
                        if (c.key === "experienceByQualification") {
                          val = formatExperienceByQualification(
                            r?.experienceByQualification
                          )
                        }

                        // ✅ References
                        if (c.key === "references") {
                          val = r?.references?.length
                            ? r.references
                                .map((x: any) => `${x.name} (${x.contact})`)
                                .join(" | ")
                            : "—"
                        }

                        // ✅ Photo cell
                        if (c.key === "photoFile") {
                          const url = toFileUrl(r.photoFile)
                          const fname = fileNameFromPath(r.photoFile)

                          return (
                            <td
                              key={c.key}
                              className="px-4 py-4 text-sm text-slate-800 border-b border-slate-200"
                            >
                              {!url ? (
                                "—"
                              ) : (
                                <div className="flex items-center gap-3 min-w-[220px]">
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group"
                                    title="Open photo"
                                  >
                                    <img
                                      src={url}
                                      alt="Uploaded"
                                      className="h-12 w-12 rounded-xl object-cover border border-slate-200 shadow-sm group-hover:shadow transition"
                                      loading="lazy"
                                    />
                                  </a>

                                  <div className="min-w-0">
                                    <p className="text-xs text-slate-500 truncate max-w-[140px]">
                                      {clipMiddle(fname, 14, 10)}
                                    </p>

                                    <div className="mt-1 flex items-center gap-2">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                      >
                                        Preview
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          )
                        }

                        // ✅ CV cell
                        if (c.key === "cvFile") {
                          const url = toFileUrl(r.cvFile)
                          const fname = fileNameFromPath(r.cvFile)

                          return (
                            <td
                              key={c.key}
                              className="px-4 py-4 text-sm text-slate-800 border-b border-slate-200"
                            >
                              {!url ? (
                                "—"
                              ) : (
                                <div className="flex items-center gap-3 min-w-[320px]">
                                  <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-700 text-xs font-bold">
                                    PDF
                                  </div>
                                  <div className="min-w-0">
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="block text-sm font-semibold text-slate-800 hover:underline truncate max-w-[220px]"
                                      title={fname}
                                    >
                                      {clipMiddle(fname, 18, 10)}
                                    </a>

                                    <div className="mt-1 flex items-center gap-2">
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                      >
                                        Open
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </td>
                          )
                        }

                        // ✅ Actions
                        if (c.key === "actions") {
                          const isBusy = busyId === r.id

                          return (
                            <td
                              key={c.key}
                              className="px-4 py-4 align-top text-left border-b border-slate-200"
                            >
                              {r.reviewed ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                  Reviewed
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleReview(r.id)}
                                  className={`
                                    px-3 py-1.5 rounded-lg text-xs font-semibold transition
                                    ${
                                      isBusy
                                        ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                                        : "bg-slate-900 text-white hover:bg-slate-800"
                                    }
                                  `}
                                >
                                  {isBusy ? "Reviewing..." : "Review"}
                                </button>
                              )}
                            </td>
                          )
                        }

                        // ✅ marketingConsent boolean
                        if (c.key === "marketingConsent") {
                          val = r?.marketingConsent ? "Yes" : "No"
                        }

                        // ✅ Approve
                        if (c.key === "approve") {
                          const isBusy = busyId === r.id
                          const canApprove = r.reviewed && !r.approved && !isBusy

                          return (
                            <td
                              key={c.key}
                              className="px-4 py-4 align-top text-left border-b border-slate-200"
                            >
                              {r.approved ? (
                                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                  Approved
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  disabled={!canApprove}
                                  onClick={() => handleApprove(r.id)}
                                  className={`
                                    px-3 py-1.5 rounded-lg text-xs font-semibold transition
                                    ${
                                      canApprove
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                    }
                                  `}
                                  title={!r.reviewed ? "Please review first" : "Approve"}
                                >
                                  {isBusy ? "Approving..." : "Approve"}
                                </button>
                              )}
                            </td>
                          )
                        }

                        // default cell
                        return (
                          <td
                            key={c.key}
                            className="px-4 py-4 text-sm text-slate-800 border-b border-slate-200"
                          >
                            {val ? String(val) : "—"}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-4 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
            >
              Prev
            </button>

            <div className="text-sm text-slate-600">
              Page <span className="font-semibold text-slate-900">{safePage}</span> of{" "}
              <span className="font-semibold text-slate-900">{totalPages}</span>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

function authHeaders(): Record<string, string> {
  const token =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token")

  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

/* ---------------------------
   GET
---------------------------- */
export async function apiGet(url: string) {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
  })

  const data = await safeJson(res)

  if (!res.ok) {
    throw new Error(data?.message || `GET ${url} failed (${res.status})`)
  }

  return data
}

/* ---------------------------
   PATCH
---------------------------- */
export async function apiPatch(url: string, body?: any) {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(body ?? {}),
  })

  const data = await safeJson(res)

  if (!res.ok) throw new Error(data?.message || "Request failed")

  return data
}

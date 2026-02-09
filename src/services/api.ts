const BASE_URL = import.meta.env.VITE_API_URL || "https://surveyor-form-backend-git-main-fmc-projects-projects.vercel.app";

function authHeaders(): HeadersInit {
  const token =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token")

  if (!token) return {}

  return {
    Authorization: `Bearer ${token}`,
  }
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
  const endpoint = url.startsWith('/') ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: new Headers({
      Accept: "application/json",
      ...(authHeaders() as Record<string, string>),
    }),
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
export async function apiPatch(url: string, body?: unknown) {
  const endpoint = url.startsWith('/') ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: new Headers({
      "Content-Type": "application/json",
      ...(authHeaders() as Record<string, string>),
    }),
    body: JSON.stringify(body ?? {}),
  })

  const data = await safeJson(res)

  if (!res.ok) throw new Error(data?.message || "Request failed")

  return data
}

export async function deleteForm(id: number, token?: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/forms/${id}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Delete failed");
  return data;
}



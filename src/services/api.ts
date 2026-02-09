const BASE_URL =
  (import.meta.env.VITE_API_URL ||
    "https://surveyor-form-backend-git-main-fmc-projects-projects.vercel.app").replace(/\/+$/, "");

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGet(url: string) {
  const endpoint = url.startsWith("/") ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    credentials: "include", // ✅ cookie sent
    headers: { Accept: "application/json" },
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `GET ${url} failed (${res.status})`);
  return data;
}

export async function apiPatch(url: string, body?: unknown) {
  const endpoint = url.startsWith("/") ? url : `/${url}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body ?? {}),
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export async function deleteForm(id: number) {
  const res = await fetch(`${BASE_URL}/api/form/${id}`, {
    method: "DELETE",
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Delete failed");
  return data;
}

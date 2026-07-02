const BASE_URL = "http://localhost:4000/api"

// Wrapper attorno a fetch che aggiunge automaticamente il token (se presente)
// e gestisce gli errori in modo uniforme, così ogni pagina non deve ripetere la stessa logica.
const request = async (path, { method = "GET", body, token } = {}) => {
  const headers = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Le risposte 204 (No Content, es. delete) non hanno corpo JSON da leggere
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.error || "Errore di comunicazione con il server")
  }

  return data
}

export const api = {
  register: (email, password) => request("/auth/register", { method: "POST", body: { email, password } }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),

  getPercorsi: (token) => request("/percorsi", { token }),
  createPercorso: (nome, token) => request("/percorsi", { method: "POST", body: { nome }, token }),
  deletePercorso: (id, token) => request(`/percorsi/${id}`, { method: "DELETE", token }),

  getNote: (percorsoId, token, { from, to } = {}) => {
    const params = new URLSearchParams()
    if (from) params.set("from", from)
    if (to) params.set("to", to)
    const query = params.toString() ? `?${params.toString()}` : ""
    return request(`/percorsi/${percorsoId}/note${query}`, { token })
  },
  addNota: (percorsoId, contenuto, data, token) =>
    request(`/percorsi/${percorsoId}/note`, { method: "POST", body: { contenuto, data }, token }),
  deleteNota: (percorsoId, notaId, token) =>
    request(`/percorsi/${percorsoId}/note/${notaId}`, { method: "DELETE", token }),

  getPeriodi: (percorsoId, token) => request(`/percorsi/${percorsoId}/periodi`, { token }),

  generaRiassunto: (percorsoId, token, { from, to } = {}) =>
    request(`/percorsi/${percorsoId}/riassunto`, { method: "POST", body: { from, to }, token }),
}

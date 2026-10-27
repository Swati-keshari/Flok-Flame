// Small helpers for talking to the backend API (used by almost every page).
// - getJSON / postJSON / putJSON / patchJSON / deleteJSON send a request and return the JSON reply.
// - If the server replies with an error, they throw an Error with the server's message
//   (and error.status = HTTP status code, e.g. 401 = not logged in).
// - getToken / setToken save the admin login token in localStorage. When a token exists,
//   it is sent as "Authorization: Bearer <token>" so admin-only APIs work.

// In dev, Vite proxies /api to the backend (see vite.config.js).
// For production, set VITE_API_URL to the deployed backend URL.
const API_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'adminToken'

export const getToken = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* storage unavailable */ }
}

const request = async (method, path, { body, params } = {}) => {
  const query = params
    ? new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
      ).toString()
    : ''
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_URL}${path}${query ? `?${query}` : ''}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const error = new Error(data.message || 'Request failed')
    error.status = res.status
    throw error
  }
  return data
}

export const getJSON = (path, params) => request('GET', path, { params })
export const postJSON = (path, body) => request('POST', path, { body })
export const putJSON = (path, body) => request('PUT', path, { body })
export const patchJSON = (path, body) => request('PATCH', path, { body })
export const deleteJSON = (path) => request('DELETE', path)

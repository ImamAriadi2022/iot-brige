const BASE_URL = 'https://iotbridge.click'

/**
 * Generic fetch wrapper — throws an Error with .message from API
 * if the response is not 2xx.
 */
async function request(path, options = {}) {
  const token = localStorage.getItem('iot_bridge_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  let data = null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await res.json()
  }

  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      `Terjadi kesalahan (${res.status})`
    throw new Error(message)
  }

  return data
}

// ─────────────────────────────────────────────────────────────
// Auth — Public Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * @param {{ username: string, email: string, phone_number: string, password: string }} body
 */
export function register(body) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * POST /auth/login
 * @param {{ identity: string, password: string }} body
 * @returns {{ token: string, user: { id, role } }}
 */
export function login(body) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

/**
 * POST /auth/forgot-password
 * @param {{ email: string }} body
 */
export function forgotPassword(body) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// ─────────────────────────────────────────────────────────────
// Auth — Protected Endpoints
// ─────────────────────────────────────────────────────────────

/**
 * GET /auth/profile
 */
export function getProfile() {
  return request('/auth/profile')
}

/**
 * PATCH /auth/profile  (multipart/form-data)
 * @param {FormData} formData
 */
export function updateProfile(formData) {
  const token = localStorage.getItem('iot_bridge_token')
  return fetch(`${BASE_URL}/auth/profile`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  }).then(async (res) => {
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new Error(data?.message || `Gagal memperbarui profil (${res.status})`)
    return data
  })
}

/**
 * PATCH /auth/email
 * @param {{ new_email: string }} body
 */
export function updateEmail(body) {
  return request('/auth/email', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/**
 * PATCH /auth/password
 * @param {{ old_password: string, new_password: string }} body
 */
export function updatePassword(body) {
  return request('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

// ─────────────────────────────────────────────────────────────
// Session helpers
// ─────────────────────────────────────────────────────────────

export function saveSession({ token, user }) {
  localStorage.setItem('iot_bridge_token', token)
  localStorage.setItem('iot_bridge_user', JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem('iot_bridge_token')
  localStorage.removeItem('iot_bridge_user')
}

export function getToken() {
  return localStorage.getItem('iot_bridge_token')
}

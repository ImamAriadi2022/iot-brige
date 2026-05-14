const BASE_URL = 'https://iotbridge.click'

const ORG_KEY = 'iot_bridge_org_id'

/**
 * Generic fetch wrapper — throws an Error with .message from API
 * if the response is not 2xx.
 */
async function request(path, options = {}) {
  let token = localStorage.getItem('iot_bridge_token') || ''
  if (token === 'undefined' || token === 'null') token = ''

  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    const err = new Error(message)
    err.status = res.status
    err.raw = data
    // Helpful debug output for 403 forbidden (organization not verified)
    if (res.status === 403) {
      try {
        const masked = token ? `${token.slice(0, 8)}...${token.slice(-8)}` : '<no-token>'
        // eslint-disable-next-line no-console
        console.warn('[API] 403 response for', path, { status: res.status, token: masked, body: data })
      } catch (e) {
        // ignore logging errors
      }
    }
    throw err
  }

  return data
}

function toQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (!entries.length) return ''
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return `?${qs}`
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.results)) return data.results
  return []
}

function pickId(item, keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) return item[key]
  }
  return null
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
  }).then((data) => {
    // Normalize common token/user shapes from various backends
    const token = data?.token || data?.access_token || data?.data?.token || data?.data?.access_token || null
    const user = data?.user || data?.data?.user || null
    return { token, user, raw: data }
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
  return request('/auth/profile', { useApi: false })
}

/**
 * PATCH /auth/profile  (multipart/form-data)
 * @param {FormData} formData
 */
export function updateProfile(formData) {
  return request('/auth/profile', {
    method: 'PATCH',
    body: formData,
    useApi: false,
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
// Organizations
// ─────────────────────────────────────────────────────────────

export function getOrganizationsList() {
  return request('/organizations/list')
}

export function proposeOrganization(body) {
  return request('/organizations/propose', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function verifyOrganization(body) {
  return request('/organizations/verify', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function unverifyOrganization(body) {
  return request('/organizations/unverify', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function getOrganizationProfile(organizationId) {
  return request(`/organizations/${organizationId}/profile`)
}

export function updateOrganizationProfile(organizationId, body) {
  return request(`/organizations/${organizationId}/profile`, {
    method: 'PATCH',
    body: body instanceof FormData ? body : JSON.stringify(body),
  })
}

export function searchOrganizationMembers(organizationId, params = {}) {
  return request(`/organizations/${organizationId}/search-members${toQuery(params)}`)
}

export function memberInvitation(organizationId, body) {
  return request(`/organizations/${organizationId}/member-invitation`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function memberInvitationResponse(organizationId, body) {
  return request(`/organizations/${organizationId}/member-invitation-response`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function getOrganizationMembers(organizationId) {
  return request(`/organizations/${organizationId}/member-list`)
}

export function createLocalMember(organizationId, body) {
  return request(`/organizations/${organizationId}/local-member`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function deleteMember(organizationId, userId) {
  return request(`/organizations/${organizationId}/member/${userId}`, {
    method: 'DELETE',
  })
}

export function changeMemberRoles(organizationId, body) {
  return request(`/organizations/${organizationId}/member-roles`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function leaveOrganization(organizationId) {
  return request(`/organizations/${organizationId}/leave`, {
    method: 'DELETE',
  })
}

export function searchOrganizations(params = {}) {
  return request(`/organizations/search${toQuery(params)}`)
}

export function getOrganizationById(organizationId) {
  return request(`/organizations/${organizationId}`)
}


// ─────────────────────────────────────────────────────────────
// Devices & Widget Boxes
// ─────────────────────────────────────────────────────────────

export function searchDevices(organizationId, params = {}) {
  return request(`/organizations/${organizationId}/devices/search${toQuery(params)}`)
}

export function getDevices(organizationId) {
  return request(`/organizations/${organizationId}/devices`)
}

export function getDeviceById(organizationId, deviceId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}`)
}

export function createDevice(organizationId, body) {
  return request(`/organizations/${organizationId}/devices`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function updateDevice(organizationId, deviceId, body) {
  return request(`/organizations/${organizationId}/devices/${deviceId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteDevice(organizationId, deviceId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}`, {
    method: 'DELETE',
  })
}

export function getPinList(organizationId, deviceId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/pin-list`)
}

export function getWidgetBoxList(organizationId, deviceId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/widget-boxes/list`)
}

export function getWidgetBoxById(organizationId, deviceId, widgetBoxId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/widget-boxes/${widgetBoxId}`)
}

export function upsertWidgetBoxes(organizationId, deviceId, body) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/widget-boxes`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export function createWidgetBox(organizationId, deviceId, body) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/widget-boxes`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}


export function deleteWidgetBox(organizationId, deviceId, widgetBoxId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/widget-boxes/${widgetBoxId}`, {
    method: 'DELETE',
  })
}

export function getDeviceReport(organizationId, deviceId, params = {}) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/report${toQuery(params)}`)
}

export function createNotificationEvent(organizationId, deviceId, body) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/notification-events`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getNotificationEvents(organizationId, deviceId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/notification-events/list`)
}

export function getNotificationEventById(organizationId, deviceId, notificationEventId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/notification-events/${notificationEventId}`)
}

export function updateNotificationEvent(organizationId, deviceId, notificationEventId, body) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/notification-events/${notificationEventId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export function deleteNotificationEvent(organizationId, deviceId, notificationEventId) {
  return request(`/organizations/${organizationId}/devices/${deviceId}/notification-events/${notificationEventId}`, {
    method: 'DELETE',
  })
}


// ─────────────────────────────────────────────────────────────
// Notifications (global)
// ─────────────────────────────────────────────────────────────

export function getNotifications() {
  return request('/notifications')
}

export function deleteAllNotifications() {
  return request('/notifications', { method: 'DELETE' })
}

export function deleteNotificationById(notificationId) {
  return request(`/notifications/${notificationId}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────
// Session helpers
// ─────────────────────────────────────────────────────────────

export function saveSession({ token, user }) {
  if (token !== undefined && token !== null && token !== '') {
    localStorage.setItem('iot_bridge_token', token)
  }
  if (user !== undefined && user !== null) {
    localStorage.setItem('iot_bridge_user', JSON.stringify(user))
  }
}

export function clearSession() {
  localStorage.removeItem('iot_bridge_token')
  localStorage.removeItem('iot_bridge_user')
  localStorage.removeItem(ORG_KEY)
}

export function getToken() {
  return localStorage.getItem('iot_bridge_token')
}

export function getActiveOrganizationId() {
  return localStorage.getItem(ORG_KEY)
}

export function setActiveOrganizationId(organizationId) {
  if (!organizationId) return
  localStorage.setItem(ORG_KEY, organizationId)
}

export async function ensureOrganizationId() {
  const existing = getActiveOrganizationId()
  if (existing) return existing
  const data = await getOrganizationsList()
  const list = unwrapList(data)
  const first = list[0]
  const id = pickId(first, ['id', 'organization_id', 'organizationId', '_id'])
  if (id) setActiveOrganizationId(String(id))
  return id ? String(id) : null
}

export function unwrapApiList(data) {
  return unwrapList(data)
}

// ─────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────

export function searchUsers(params = {}) {
  const query = new URLSearchParams(params).toString()
  return request(`/users/search?${query}`)
}

export function getUserById(userId) {
  return request(`/users/${userId}`)
}





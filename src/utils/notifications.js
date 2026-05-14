const NOTIF_MODE_KEY = 'iot_bridge_notification_mode'

export function getNotificationMode() {
  return localStorage.getItem(NOTIF_MODE_KEY) || 'Nonaktif'
}

export function setNotificationMode(mode) {
  localStorage.setItem(NOTIF_MODE_KEY, mode)
}

export function isLocalNotificationEnabled() {
  return getNotificationMode() === 'Aktif'
}

export async function ensureLocalNotificationPermission() {
  if (!('Notification' in window)) return false
  if (!isLocalNotificationEnabled()) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function showBrowserNotification(title, body) {
  if (!('Notification' in window)) return false
  if (Notification.permission !== 'granted') return false
  new Notification(title || 'Notifikasi', {
    body: body || '',
  })
  return true
}

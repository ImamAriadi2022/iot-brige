<script setup>
import {
  createNotificationEvent,
  deleteNotificationEvent,
  getOrganizationsList,
  getDevices,
  getNotificationEvents,
  getNotifications,
  deleteNotificationById,
  searchDevices,
  unwrapApiList,
  memberInvitationResponse,
} from '@/services/api.js'

import { getNotificationMode, isLocalNotificationEnabled, showBrowserNotification } from '@/utils/notifications.js'
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const user = computed(() => {
  const u = localStorage.getItem('iot_bridge_user')
  return u ? JSON.parse(u) : { id: 'guest', name: 'Pengguna', email: '' }
})
const notifSeenKey = computed(() => `iot_bridge_notif_seen_${user.value.id || 'guest'}`)
const notifReadKey = computed(() => `iot_bridge_notif_read_${user.value.id || 'guest'}`)

const notifSeenIds = ref(new Set(JSON.parse(localStorage.getItem(notifSeenKey.value) || '[]')))
const notifReadIds = ref(new Set(JSON.parse(localStorage.getItem(notifReadKey.value) || '[]')))

const selectedDevice = ref('')
const devices = ref([{ id: '', label: 'Pilih perangkat...' }])
const notifications = ref([])
const globalNotifications = ref([])
const loading = ref(false)
const error = ref('')
const orgId = ref(null)
const seenEventIds = new Set()

const activeTab = ref('events') // 'events' or 'messages'
const showAddModal = ref(false)
const newEvent = ref({
  title: '',
  pin: '',
  condition: '>',
  value: 0,
})



function mapDevice(d) {
  const id = d?.id || d?.device_id || d?.deviceId || d?._id
  const name = d?.name || d?.nama || d?.device_name || 'Perangkat'
  return { id: String(id), label: name }
}

function mapEvent(e) {
  return {
    id: e?.id || e?.notification_event_id || e?.notificationEventId || e?._id,
    title: e?.title || e?.subject || e?.type || 'Notifikasi',
    message: e?.message || e?.detail || e?.description || '-',
    time: e?.time || e?.created_at || e?.createdAt || '',
  }
}

async function loadDevices() {
  error.value = ''
  loading.value = true
  try {
    const orgsData = await getOrganizationsList()
    const orgs = unwrapApiList(orgsData)
    
    let allDevices = []
    
    for (const org of orgs) {
      const oid = org?.id || org?.organization_id || org?._id
      if (!oid) continue
      
      try {
        let devData
        try {
          devData = await getDevices(oid)
        } catch (e) {
          devData = await searchDevices(oid, { name: '' })
        }
        const list = unwrapApiList(devData)
        allDevices.push(...list.map(d => ({ ...mapDevice(d), orgId: oid })))
      } catch (e) {
        // Abaikan error untuk organisasi tertentu
      }
    }
    
    devices.value = [{ id: '', label: 'Pilih perangkat...' }, ...allDevices.filter(d => d.id)]
  } catch (err) {
    error.value = err?.message || 'Gagal memuat perangkat.'
  } finally {
    loading.value = false
  }
}


async function loadEvents() {
  if (!selectedDevice.value) {
    notifications.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    const selectedDev = devices.value.find(d => d.id === selectedDevice.value)
    const targetOrgId = selectedDev?.orgId
    
    if (!targetOrgId) {
      error.value = 'Organisasi perangkat tidak ditemukan.'
      loading.value = false
      return
    }
    
    const data = await getNotificationEvents(targetOrgId, selectedDevice.value)

    const list = unwrapApiList(data)
    const mapped = list.map(mapEvent)
    if (getNotificationMode() === 'Aktif' && isLocalNotificationEnabled()) {
      mapped.forEach((item) => {
        if (!item.id || seenEventIds.has(item.id)) return
        seenEventIds.add(item.id)
        showBrowserNotification(item.title, item.message)
      })
    }
    notifications.value = mapped
  } catch (err) {
    error.value = err?.message || 'Gagal memuat notifikasi.'
  } finally {
    loading.value = false
  }
}

async function addEvent() {
  if (!newEvent.value.title || !newEvent.value.pin) return
  if (!selectedDevice.value) {
    error.value = 'Perangkat belum dipilih.'
    return
  }
  
  const selectedDev = devices.value.find(d => d.id === selectedDevice.value)
  const targetOrgId = selectedDev?.orgId
  
  if (!targetOrgId) {
    error.value = 'Organisasi perangkat tidak ditemukan.'
    return
  }
  
  try {
    await createNotificationEvent(targetOrgId, selectedDevice.value, {

      title: newEvent.value.title,
      pin: newEvent.value.pin,
      condition: newEvent.value.condition,
      value: parseFloat(newEvent.value.value),
    })
    newEvent.value = { title: '', pin: '', condition: '>', value: 0 }
    showAddModal.value = false
    await loadEvents()
  } catch (err) {
    error.value = err?.message || 'Gagal menambahkan event.'
  }
}

async function handleDeleteEvent(eventId) {
  if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return
  try {
    await deleteNotificationEvent(orgId.value, selectedDevice.value, eventId)
    await loadEvents()
  } catch (err) {
    error.value = err?.message || 'Gagal menghapus event.'
  }
}

function mapGlobalNotification(item) {
  const mappedTitle = item?.title || item?.subject || item?.type || 'Notifikasi'
  const mappedMessage = item?.message || item?.detail || item?.description || '-'
  return {
    raw: item,
    id: item?.id || item?.notification_id || item?.notificationId || item?._id,
    title: mappedTitle,
    message: mappedMessage,
    time: item?.time || item?.created_at || item?.createdAt || '',
    organization_id: item?.organization_id || item?.organizationId || item?.data?.organization_id || item?.meta?.organization_id || null,
    is_invitation: !!(
      (item?.type === 'invitation' ||
       mappedMessage.toLowerCase().includes('undangan') ||
       mappedTitle.toLowerCase().includes('undangan') ||
       mappedTitle.toLowerCase().includes('invitation')) &&
      !mappedTitle.toLowerCase().includes('diterima') &&
      !mappedTitle.toLowerCase().includes('ditolak') &&
      !mappedMessage.toLowerCase().includes('diterima') &&
      !mappedMessage.toLowerCase().includes('ditolak')
    ),
  }
}

async function loadGlobalNotifications() {
  loading.value = true
  error.value = ''
  try {
    const data = await getNotifications()
    const list = Array.isArray(data) ? data : data?.data || []
    globalNotifications.value = list.map(mapGlobalNotification)
  } catch (err) {
    error.value = err?.message || 'Gagal memuat notifikasi.'
  } finally {
    loading.value = false
  }
}

async function handleDeleteGlobalNotif(id) {
  if (!confirm('Hapus notifikasi ini?')) return
  try {
    await deleteNotificationById(id)
    await loadGlobalNotifications()
  } catch (err) {
    error.value = err?.message || 'Gagal menghapus notifikasi.'
  }
}

import { deleteAllNotifications } from '@/services/api.js'

async function handleClearAll() {
  if (!confirm('Hapus semua notifikasi?')) return
  try {
    await deleteAllNotifications()
    await loadGlobalNotifications()
  } catch (err) {
    error.value = err?.message || 'Gagal menghapus semua notifikasi.'
  }
}

function handleMarkAllRead() {
  const updatedSet = new Set(notifReadIds.value)
  globalNotifications.value.forEach(n => updatedSet.add(n.id))
  notifReadIds.value = updatedSet
  localStorage.setItem(notifReadKey.value, JSON.stringify(Array.from(notifReadIds.value)))
  alert('Semua notifikasi telah ditandai dibaca.')
}

watch(activeTab, (newTab) => {
  if (newTab === 'messages' && globalNotifications.value.length === 0) {
    loadGlobalNotifications()
  }
})

watch(selectedDevice, loadEvents)
onMounted(loadDevices)

function findOrgIdRecursively(obj) {
  if (!obj || typeof obj !== 'object') return null
  
  // Direct matches
  const keys = ['organization_id', 'organizationId', 'org_id', 'orgId']
  for (const k of keys) {
    if (obj[k]) return String(obj[k])
  }
  
  // Search recursively
  for (const k in obj) {
    let child = obj[k]
    if (typeof child === 'string') {
      try { child = JSON.parse(child) } catch(e) {}
    }
    if (typeof child === 'object' && child) {
      const found = findOrgIdRecursively(child)
      if (found) return found
    }
  }
  return null
}

function extractOrgId(notif) {
  if (notif?.organization_id) return String(notif.organization_id)
  
  const raw = notif?.raw || {}
  const found = findOrgIdRecursively(raw)
  if (found) return found
  
  // Try extracting from 'type' string (e.g. "organization_member_invitation, id: 123-abc")
  const typeStr = notif?.type || raw?.type || ''
  const typeMatch = typeStr.match(/id:\s*([\w-]+)/i)
  if (typeMatch) return typeMatch[1]
  
  // Fallback regex on message
  const msgMatch = (notif?.message || '').match(/organization[_\s]?id[:\s]+([\w-]+)/i)
  if (msgMatch) return msgMatch[1]
  
  return null
}

async function resolveOrgId(notif) {
  // 1. Fast offline extraction
  const offlineId = extractOrgId(notif)
  if (offlineId) return offlineId

  // 2. Fallback: extract name from message and query API
  const msgMatch = (notif?.message || '').match(/organisasi:\s*(.*)/i)
  if (msgMatch) {
    const orgName = msgMatch[1].trim()
    try {
      const data = await getOrganizationsList()
      const list = unwrapApiList(data)
      const foundOrg = list.find(o => 
        (o.name && o.name.toLowerCase() === orgName.toLowerCase()) || 
        (o.nama && o.nama.toLowerCase() === orgName.toLowerCase())
      )
      if (foundOrg && (foundOrg.id || foundOrg.organization_id || foundOrg._id)) {
        return String(foundOrg.id || foundOrg.organization_id || foundOrg._id)
      }
    } catch (e) {
      console.warn('Failed to resolve organization from list:', e)
    }
  }
  return null
}

async function handleAcceptInvite(notif) {
  const invOrgId = await resolveOrgId(notif)
  if (!invOrgId) {
    alert('Tidak dapat menentukan organisasi dari notifikasi ini. Coba hubungi pengundang secara manual.')
    return
  }
  try {
    await memberInvitationResponse(invOrgId, { is_accepted: true })
    // Hapus dari backend
    try { await deleteNotificationById(notif.id) } catch (e) {}
    
    // Hapus notifikasi dari list
    globalNotifications.value = globalNotifications.value.filter(n => n.id !== notif.id)
    alert('Berhasil menerima undangan! Anda sekarang bergabung ke organisasi.')
  } catch (err) {
    alert('Gagal menerima undangan: ' + (err?.message || 'Terjadi kesalahan.'))
  }
}

async function handleRejectInvite(notif) {
  if (!confirm('Apakah Anda yakin ingin menolak undangan ini?')) return
  const invOrgId = await resolveOrgId(notif)
  if (!invOrgId) {
    alert('Tidak dapat menentukan organisasi dari notifikasi ini.')
    return
  }
  try {
    await memberInvitationResponse(invOrgId, { is_accepted: false })
    // Hapus dari backend
    try { await deleteNotificationById(notif.id) } catch (e) {}
    
    // Hapus notifikasi dari list
    globalNotifications.value = globalNotifications.value.filter(n => n.id !== notif.id)
    alert('Undangan telah ditolak.')
  } catch (err) {
    alert('Gagal menolak undangan: ' + (err?.message || 'Terjadi kesalahan.'))
  }
}
</script>


<template>
  <AppLayout page-title="Notifikasi">
    <div class="notif-page">
      <div class="tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'events' }" @click="activeTab = 'events'">Event Rules</button>
        <button class="tab-btn" :class="{ active: activeTab === 'messages' }" @click="activeTab = 'messages'">Pesan Masuk</button>
      </div>

      <!-- Tab 1: Event Rules -->
      <div v-if="activeTab === 'events'" class="tab-content">
        <div class="notif-filter">
          <div class="filter-group">
            <label class="filter-label" for="notif-device">Pilih Perangkat</label>
            <div class="select-wrap">
              <select id="notif-device" v-model="selectedDevice" class="select-input">
                <option v-for="d in devices" :key="d.id" :value="d.id">{{ d.label }}</option>
              </select>
              <svg class="select-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
          <button v-if="selectedDevice" class="btn-accent" @click="showAddModal = true">
            Tambah Event
          </button>
        </div>

        <div v-if="error" class="notif-empty error">{{ error }}</div>
        <div v-else-if="loading" class="notif-empty">Memuat notifikasi...</div>
        <div v-else-if="!selectedDevice" class="notif-empty">Pilih perangkat untuk melihat event.</div>
        <div v-else-if="notifications.length === 0" class="notif-empty">Belum ada event</div>
        <div v-else class="notif-list">
          <div v-for="n in notifications" :key="n.id" class="notif-item">
            <div class="notif-content">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-message">{{ n.message }}</div>
              <div class="notif-time">{{ n.time }}</div>
            </div>
            <button class="delete-btn" @click="handleDeleteEvent(n.id)" title="Hapus Event">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Add Event Modal -->
        <Transition name="modal">
          <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
            <div class="modal-box">
              <div class="modal-head">
                <h3>Tambah Notification Event</h3>
                <button class="modal-close-x" @click="showAddModal = false">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <form @submit.prevent="addEvent" class="modal-form">
                <div class="form-group">
                  <label class="form-label">Judul Notifikasi</label>
                  <input v-model="newEvent.title" type="text" class="form-input" placeholder="Suhu Tinggi" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Pin Sensor</label>
                  <input v-model="newEvent.pin" type="text" class="form-input" placeholder="V1" required/>
                </div>
                <div class="form-group">
                  <label class="form-label">Kondisi</label>
                  <select v-model="newEvent.condition" class="form-input">
                    <option value=">"> Lebih dari (&gt;) </option>
                    <option value="<"> Kurang dari (&lt;) </option>
                    <option value="="> Sama dengan (=) </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Nilai Trigger</label>
                  <input v-model="newEvent.value" type="number" step="any" class="form-input" required/>
                </div>
                <div class="modal-actions">
                  <button type="button" class="btn-outline" @click="showAddModal = false">Batal</button>
                  <button type="submit" class="btn-primary">Tambah</button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Tab 2: Pesan Masuk -->
      <div v-if="activeTab === 'messages'" class="tab-content">
        <div class="notif-actions-row" v-if="globalNotifications.length > 0">
          <button class="btn-secondary btn-sm" @click="handleMarkAllRead">Tandai Semua Dibaca</button>
          <button class="btn-danger-outline btn-sm" @click="handleClearAll">Hapus Semua</button>
        </div>

        <div v-if="error" class="notif-empty error">{{ error }}</div>
        <div v-else-if="loading" class="notif-empty">Memuat notifikasi...</div>
        <div v-else-if="globalNotifications.length === 0" class="notif-empty">Belum ada notifikasi masuk.</div>
        <div v-else class="notif-list">
          <div v-for="n in globalNotifications" :key="n.id" class="notif-item">
            <div class="notif-content" :class="{ 'is-read': notifReadIds.has(n.id) }">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-message">{{ n.message }}</div>
              <div class="notif-time">{{ n.time }}</div>
              
              <!-- Tombol Aksi Undangan -->
              <div v-if="n.is_invitation" class="invite-actions">
                <button class="notif-invite-btn accept-icon" @click="handleAcceptInvite(n)" title="Terima Undangan">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
                <button class="notif-invite-btn reject-icon" @click="handleRejectInvite(n)" title="Tolak Undangan">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <button class="delete-btn" @click="handleDeleteGlobalNotif(n.id)" title="Hapus Notifikasi">

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>


<style scoped>
.notif-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 640px;
}
.invite-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  justify-content: flex-end;
}

.notif-invite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.notif-invite-btn.accept-icon {
  color: var(--color-success);
}
.notif-invite-btn.accept-icon:hover {
  background: #def7ec;
}

.notif-invite-btn.reject-icon {
  color: var(--color-danger);
}
.notif-invite-btn.reject-icon:hover {
  background: #fde8e8;
}
.btn-sm {
  padding: 4px 12px;
  font-size: 12px;
}
.notif-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 8px;
}
.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
}
.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}
.btn-danger-outline {
  background: white;
  color: var(--color-danger);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: var(--transition);
}
.btn-danger-outline:hover {
  background: var(--color-danger);
  color: white;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}
.tab-btn {
  padding: 8px 16px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}
.tab-btn:hover {
  background: var(--color-bg);
  color: var(--color-text);
}
.tab-btn.active {
  background: var(--color-primary);
  color: white;
}
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.notif-filter {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.filter-group {
  flex: 1;
}
.filter-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
  display: block;
}
.select-wrap {
  position: relative;
}
.select-input {
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  color: var(--color-text);
  appearance: none;
  outline: none;
  transition: var(--transition);
}
.select-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.select-caret {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}
.notif-empty {
  text-align: center;
  color: var(--color-text-light);
  padding: 24px 0;
  font-size: 14px;
}
.notif-empty.error { color: var(--color-danger); }
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.notif-item {
  background: white;
  border-radius: var(--radius-md);
  padding: 14px 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.notif-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.notif-title { font-weight: 700; color: var(--color-text); font-size: 14px; }
.notif-message { font-size: 13px; color: var(--color-text-muted); }
.notif-time { font-size: 12px; color: var(--color-text-light); }
.notif-content.is-read .notif-title { font-weight: 500; color: var(--color-text-muted); }

.btn-accent {
  padding: 12px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}
.btn-accent:hover { background: var(--color-primary-dark); }

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}
.delete-btn:hover {
  background: #fef2f2;
  color: var(--color-danger);
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 300; padding: 16px;
}
.modal-box {
  background: white; border-radius: var(--radius-lg);
  padding: 28px; max-width: 440px; width: 100%; position: relative;
  box-shadow: var(--shadow-lg);
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.modal-head h3 { font-size: 17px; font-weight: 700; color: var(--color-text); }
.modal-close-x {
  width: 30px; height: 30px; border: none; background: #f1f5f9;
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--color-text); transition: var(--transition);
}
.modal-close-x:hover { background: var(--color-border); }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--color-text); }
.form-input {
  padding: 10px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  transition: var(--transition); background: #f8fafc; color: var(--color-text);
}
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.modal-actions { display: flex; gap: 12px; margin-top: 4px; }
.btn-primary { flex: 1; padding: 10px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: var(--transition); }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-outline { flex: 1; padding: 10px; background: white; color: var(--color-text); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; transition: var(--transition); }
.btn-outline:hover { background: var(--color-bg); }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92); }
</style>


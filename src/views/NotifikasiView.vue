<script setup>
import {
  ensureOrganizationId,
  getNotificationEvents,
  searchDevices,
  unwrapApiList,
} from '@/services/api.js'
import { getNotificationMode, isLocalNotificationEnabled, showBrowserNotification } from '@/utils/notifications.js'
import { onMounted, ref, watch } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const selectedDevice = ref('')
const devices = ref([{ id: '', label: 'Pilih perangkat...' }])
const notifications = ref([])
const loading = ref(false)
const error = ref('')
const orgId = ref(null)
const seenEventIds = new Set()

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
    orgId.value = await ensureOrganizationId()
    if (!orgId.value) {
      error.value = 'Organisasi belum tersedia untuk akun ini.'
      return
    }
    const data = await searchDevices(orgId.value)
    const list = unwrapApiList(data)
    const mapped = list.map(mapDevice).filter(d => d.id)
    devices.value = [{ id: '', label: 'Pilih perangkat...' }, ...mapped]
  } catch (err) {
    error.value = err?.message || 'Gagal memuat perangkat.'
  } finally {
    loading.value = false
  }
}

async function loadEvents() {
  if (!selectedDevice.value || !orgId.value) {
    notifications.value = []
    return
  }
  loading.value = true
  error.value = ''
  try {
    const data = await getNotificationEvents(orgId.value, selectedDevice.value)
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

watch(selectedDevice, loadEvents)
onMounted(loadDevices)
</script>

<template>
  <AppLayout page-title="Notification Events">
    <div class="notif-page">
      <div class="notif-filter">
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

      <div v-if="error" class="notif-empty error">{{ error }}</div>
      <div v-else-if="loading" class="notif-empty">Memuat notifikasi...</div>
      <div v-else-if="!selectedDevice" class="notif-empty">Pilih perangkat untuk melihat event.</div>
      <div v-else-if="notifications.length === 0" class="notif-empty">Belum ada event</div>
      <div v-else class="notif-list">
        <div v-for="n in notifications" :key="n.id" class="notif-item">
          <div class="notif-title">{{ n.title }}</div>
          <div class="notif-message">{{ n.message }}</div>
          <div class="notif-time">{{ n.time }}</div>
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
  flex-direction: column;
  gap: 4px;
}
.notif-title { font-weight: 700; color: var(--color-text); font-size: 14px; }
.notif-message { font-size: 13px; color: var(--color-text-muted); }
.notif-time { font-size: 12px; color: var(--color-text-light); }
</style>

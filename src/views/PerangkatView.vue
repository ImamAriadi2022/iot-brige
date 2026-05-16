<script setup>
import {
    createDevice,
    deleteDevice,
    getOrganizationsList,
    getDevices,
    searchDevices,
    unwrapApiList,
    setActiveOrganizationId
} from '@/services/api.js'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const selectedDevice = ref(null)

const perangkat = ref([])
const loading = ref(false)
const error = ref('')

const organizations = ref([])
const selectedOrgId = ref(null)

const selectedDeviceId = ref('all')
const newDevice = ref({ nama: '', token: '', pemilik: '', status: 'Offline' })
const statusOptions = ['Online', 'Offline', 'Inactive']

const deviceOptions = computed(() => [
  { value: 'all', label: '-- Pilih Perangkat --' },
  ...perangkat.value.map(d => ({ value: String(d.id), label: d.nama })),
])

const filtered = computed(() => {
  if (selectedDeviceId.value === 'all') return perangkat.value
  return perangkat.value.filter(d => String(d.id) === selectedDeviceId.value)
})

function mapDevice(d) {
  return {
    id: d?.id || d?.device_id || d?.deviceId || d?._id,
    nama: d?.name || d?.nama || d?.device_name || 'Perangkat',
    token: d?.auth_code || d?.auth_token || d?.token || d?.authToken || d?.authentication_token || d?.auth || '(Belum ada)',
    pemilik: d?.owner_email || d?.pemilik || d?.email || '- ',
    status: d?.status || 'Offline',
    laporan: d?.last_report_at || d?.last_report || d?.laporan || '- ',
    mine: d?.mine ?? true,
  }
}

async function loadOrganizations() {
  try {
    const data = await getOrganizationsList()
    organizations.value = unwrapApiList(data)
    if (organizations.value.length > 0) {
      // Find the currently active one or fallback to the first
      const activeId = localStorage.getItem('iot_bridge_org_id')
      const found = organizations.value.find(o => String(o.id || o._id) === activeId)
      
      if (found) {
        selectedOrgId.value = activeId
      } else {
        selectedOrgId.value = organizations.value[0].id || organizations.value[0]._id
      }
      
      setActiveOrganizationId(String(selectedOrgId.value))
      loadDevices(selectedOrgId.value)
    }
  } catch (err) {
    error.value = 'Gagal memuat organisasi.'
  }
}

async function onOrgChange() {
  if (selectedOrgId.value) {
    setActiveOrganizationId(String(selectedOrgId.value))
    selectedDeviceId.value = 'all' // Reset device filter
    loadDevices(selectedOrgId.value)
  }
}

async function loadDevices(orgId) {
  loading.value = true
  error.value = ''
  try {
    let data
    try {
      data = await getDevices(orgId)
    } catch (e) {
      data = await searchDevices(orgId, { name: '' })
    }
    const list = unwrapApiList(data)
    perangkat.value = list.map(mapDevice).filter(d => d.id)
  } catch (err) {
    error.value = err?.message || 'Gagal memuat perangkat.'
  } finally {
    loading.value = false
  }
}

function openDelete(device) {
  selectedDevice.value = device
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!selectedOrgId.value) return
  try {
    await deleteDevice(selectedOrgId.value, selectedDevice.value.id)
    perangkat.value = perangkat.value.filter(d => d.id !== selectedDevice.value.id)
  } catch (err) {
    error.value = err?.message || 'Gagal menghapus perangkat.'
  } finally {
    showDeleteModal.value = false
  }
}

async function addDevice() {
  if (!newDevice.value.nama) return
  if (!selectedOrgId.value) {
    error.value = 'Organisasi belum dipilih.'
    return
  }
  try {
    await createDevice(selectedOrgId.value, {
      name: newDevice.value.nama,
    })
    newDevice.value = { nama: '', token: '', pemilik: '', status: 'Offline' }
    showAddModal.value = false
    await loadDevices(selectedOrgId.value)
  } catch (err) {
    error.value = err?.message || 'Gagal menambahkan perangkat.'
  }
}

function copyToken(token) {
  navigator.clipboard?.writeText(token)
}

function openWidgetBox(device) {
  router.push(`/dashboard/kolam/${device.id}`)
}

function openDeviceStats(device) {
  router.push(`/statistika?device=${device.id}`)
}

onMounted(loadOrganizations)
</script>


<template>
  <AppLayout page-title="Perangkat">
    <div class="device-page">
      <div class="device-filter" style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <label class="filter-label" for="org-select">Pilih Organisasi</label>
          <div class="select-wrap">
            <select id="org-select" v-model="selectedOrgId" class="select-input" @change="onOrgChange">
              <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
            </select>
            <svg class="select-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>

        <div style="flex: 1; min-width: 200px;">
          <label class="filter-label" for="device-select">Pilih Perangkat</label>
          <div class="select-wrap">
            <select id="device-select" v-model="selectedDeviceId" class="select-input">
              <option v-for="opt in deviceOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <svg class="select-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>


      <div v-if="error" class="device-empty error">{{ error }}</div>
      <div v-else-if="loading" class="device-empty">Memuat perangkat...</div>
      <div v-else class="device-list">
        <div v-for="d in filtered" :key="d.id" class="device-card">
          <div class="device-main">
            <h3 class="device-name">{{ d.nama }}</h3>
            <div class="device-auth">
              <span class="auth-label">Auth Code:</span>
              <span class="auth-value">{{ d.token }}</span>
              <button v-if="d.token !== '(Belum ada)'" class="auth-copy-btn" @click="copyToken(d.token)" title="Salin token">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="device-actions">
            <button class="icon-btn info" @click="openWidgetBox(d)" title="Widget Box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button class="icon-btn success" @click="openDeviceStats(d)" title="Statistika">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"/>
                <path d="M7 16l4-5 4 3 4-6"/>
              </svg>
            </button>
            <button class="icon-btn danger" @click="openDelete(d)" title="Hapus Perangkat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>
        <div v-if="filtered.length === 0" class="device-empty">
          Belum ada perangkat.
        </div>
      </div>

      <div class="fab-group">
        <button id="add-device-btn" class="fab fab-primary" @click="showAddModal = true" title="Tambah Perangkat">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      <Transition name="modal">
        <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
          <div class="modal-box">
            <div class="modal-head">
              <h3>Tambahkan Perangkat</h3>
              <button class="modal-close-x" @click="showAddModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form @submit.prevent="addDevice" class="modal-form">
              <div class="form-group">
                <label class="form-label">Nama Perangkat <span class="required">*</span></label>
                <input v-model="newDevice.nama" type="text" class="form-input" placeholder="Contoh: Kolam A - RAS" required />
              </div>
              <p class="form-hint" style="color: var(--color-text-muted); font-size: 13px; margin-bottom: 12px;">
                <strong>Catatan:</strong> Auth token, pemilik, dan status akan digenerate otomatis oleh sistem setelah perangkat dibuat.
              </p>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="showAddModal = false">Batal</button>
                <button type="submit" class="btn-primary">Tambahkan</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>

      <Transition name="modal">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-box confirm-box">
            <button class="modal-close-accent" @click="showDeleteModal = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div class="confirm-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <p class="confirm-text">Hapus perangkat <strong>{{ selectedDevice?.nama }}</strong>?</p>
            <p class="confirm-sub">Tindakan ini tidak dapat dibatalkan.</p>
            <div class="modal-actions center">
              <button class="btn-cancel-orange" @click="showDeleteModal = false">Batal</button>
              <button class="btn-confirm-dark" @click="confirmDelete">Hapus</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<style scoped>
.device-page {
  position: relative;
  min-height: calc(100vh - var(--header-height) - 48px);
}

.device-filter {
  max-width: 520px;
  margin-bottom: 18px;
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

.device-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.device-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.device-main { min-width: 0; }
.device-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 6px;
}
.device-auth {
  font-size: 13px;
  color: var(--color-text-muted);
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.auth-label { font-weight: 600; color: var(--color-text); }
.auth-value {
  font-family: monospace;
  color: var(--color-text-muted);
  word-break: break-all;
}
.auth-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: var(--transition);
}
.auth-copy-btn:hover {
  color: var(--color-primary);
}

.device-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}
.icon-btn.info { background: #e8f1ff; color: #3b82f6; }
.icon-btn.success { background: #e8f7ef; color: #16a34a; }
.icon-btn.danger { background: #fdecec; color: var(--color-danger); }
.icon-btn:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }

.device-empty {
  background: white;
  border-radius: var(--radius-lg);
  padding: 28px;
  color: var(--color-text-muted);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.device-empty.error { color: var(--color-danger); }

.fab-group {
  position: fixed;
  right: 28px;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  z-index: 50;
}
.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: white;
  box-shadow: 0 8px 18px rgba(0,0,0,0.2);
  transition: var(--transition);
}
.fab-accent { background: #f59e0b; }
.fab-primary { background: var(--color-primary); }
.fab:hover { transform: translateY(-2px); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 16px;
}
.modal-box {
  background: white; border-radius: var(--radius-lg);
  padding: 28px; max-width: 460px; width: 100%; position: relative;
  box-shadow: var(--shadow-lg);
}
.confirm-box { text-align: center; padding: 48px 32px 36px; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;
}
.modal-head h3 { font-size: 17px; font-weight: 700; color: var(--color-text); }
.modal-close-x {
  width: 30px; height: 30px; border: none; background: #f1f5f9;
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--color-text); transition: var(--transition);
}
.modal-close-x:hover { background: var(--color-border); }
.modal-close-accent {
  position: absolute; top: 12px; right: 12px;
  width: 30px; height: 30px; border: none;
  background: var(--color-accent); color: white;
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.modal-close-accent:hover { background: var(--color-accent-hover); }
.confirm-icon { color: var(--color-danger); margin-bottom: 12px; }
.confirm-text { font-size: 17px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.confirm-sub { font-size: 13px; color: var(--color-text-muted); margin-bottom: 24px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--color-text); }
.required { color: var(--color-danger); }
.hint { font-weight: 400; color: var(--color-text-muted); font-size: 11.5px; }
.form-input {
  padding: 10px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  transition: var(--transition); background: #f8fafc; color: var(--color-text);
}
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.modal-actions { display: flex; gap: 12px; margin-top: 4px; }
.modal-actions.center { justify-content: center; }
.btn-primary { flex: 1; padding: 10px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: var(--transition); }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-outline { flex: 1; padding: 10px; background: white; color: var(--color-text); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; transition: var(--transition); }
.btn-outline:hover { background: var(--color-bg); }
.btn-cancel-orange { padding: 11px 32px; background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 15px; cursor: pointer; transition: var(--transition); }
.btn-cancel-orange:hover { background: var(--color-accent-hover); }
.btn-confirm-dark { padding: 11px 32px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 15px; cursor: pointer; transition: var(--transition); }
.btn-confirm-dark:hover { background: var(--color-primary-dark); }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92); }

@media (max-width: 768px) {
  .device-card { flex-direction: column; align-items: flex-start; }
  .device-actions { width: 100%; justify-content: flex-end; }
  .fab-group { right: 20px; bottom: 20px; }
}
</style>

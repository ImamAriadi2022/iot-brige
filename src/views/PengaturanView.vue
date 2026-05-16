<script setup>
import { ensureLocalNotificationPermission, getNotificationMode, setNotificationMode } from '@/utils/notifications.js'
import { onMounted, ref, watch } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const notifikasi = ref(getNotificationMode())
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const notifOptions = ['Aktif', 'Nonaktif']

const permissionStatus = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default')

// Auto-save when dropdown changes
watch(notifikasi, (newVal) => {
  setNotificationMode(newVal)
  saved.value = true
  setTimeout(() => { saved.value = false }, 1500)
})

async function handleSave() {
  error.value = ''
  saving.value = true
  try {
    setNotificationMode(notifikasi.value)
    if (notifikasi.value === 'Aktif') {
      const granted = await ensureLocalNotificationPermission()
      if (!granted) {
        error.value = 'Izin notifikasi lokal belum diberikan di browser.'
      }
      permissionStatus.value = typeof Notification !== 'undefined' ? Notification.permission : 'default'
    }
    await new Promise(r => setTimeout(r, 500))
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } finally {
    saving.value = false
  }
}


async function requestPermission() {
  if (typeof Notification === 'undefined') return
  const res = await Notification.requestPermission()
  permissionStatus.value = res
  if (res === 'granted') {
    notifikasi.value = 'Aktif'
    setNotificationMode('Aktif')
  }
}

function revokePermission() {
  alert('Untuk membatalkan izin, klik ikon gembok pada bilah alamat URL (address bar) browser, lalu matikan atau reset izin Notifikasi.')
}

onMounted(() => {
  if (typeof Notification !== 'undefined') {
    permissionStatus.value = Notification.permission
  }
})
</script>

<template>
  <AppLayout page-title="Pengaturan">
    <div class="settings-page">
      <div class="settings-card">
        
        <!-- Notifikasi Section -->
        <div class="form-group">
          <label class="form-label">Notifikasi</label>
          <div class="select-wrap">
            <select v-model="notifikasi" class="form-input">
              <option v-for="opt in notifOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg class="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <p class="hint-text">Aktif = notifikasi website + notifikasi lokal browser. Nonaktif = hanya notifikasi di website.</p>
        </div>

        <!-- Permission Status -->
        <div class="form-group permission-box">
          <label class="form-label">Status Izin Browser</label>
          <div class="status-row">
            <span :class="['status-badge', permissionStatus]">
              {{ permissionStatus === 'granted' ? 'Diizinkan' : permissionStatus === 'denied' ? 'Diblokir' : 'Belum Ditanya' }}
            </span>
            <button v-if="permissionStatus !== 'granted'" class="btn-secondary" @click="requestPermission">
              Minta Izin
            </button>
            <button v-else class="btn-danger-outline" @click="revokePermission">
              Batal Izin
            </button>
          </div>
          <p class="hint-text">Aplikasi membutuhkan izin browser untuk memunculkan notifikasi langsung di layar komputer/HP Anda.</p>
        </div>

        <div class="save-row">
          <span v-if="error" class="saved-msg error-msg">{{ error }}</span>
          <Transition name="fade">
            <span v-if="saved" class="saved-msg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Pengaturan disimpan!
            </span>
          </Transition>
          <button id="settings-save-btn" class="btn-primary" @click="handleSave" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.settings-page { max-width: 520px; }
.settings-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 15px; font-weight: 700; color: var(--color-text); }
.hint-text { font-size: 12px; color: var(--color-text-muted); line-height: 1.45; }
.select-wrap { position: relative; }
.form-input {
  width: 100%; padding: 12px 44px 12px 18px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-xl);
  font-size: 15px; font-weight: 700;
  color: var(--color-text); background: white;
  appearance: none; cursor: pointer;
  transition: var(--transition); outline: none;
}
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.select-chevron {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  color: var(--color-text-muted); pointer-events: none;
}
.save-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.saved-msg { display: flex; align-items: center; gap: 6px; color: var(--color-success); font-size: 13px; font-weight: 600; }
.saved-msg.error-msg { color: var(--color-danger); }
.btn-primary {
  padding: 10px 28px; background: var(--color-primary); color: white;
  border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Permission Specific Styles */
.permission-box {
  background: #f8fafc;
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.status-badge {
  font-size: 13px; font-weight: 700; padding: 4px 10px; border-radius: 12px;
}
.status-badge.granted { background: #def7ec; color: #03543f; }
.status-badge.denied { background: #fde8e8; color: #9b1c1c; }
.status-badge.default { background: #fef08a; color: #713f12; }

.btn-secondary {
  padding: 8px 16px; background: white; color: var(--color-primary);
  border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition);
}
.btn-secondary:hover { background: var(--color-primary); color: white; }

.btn-danger-outline {
  padding: 8px 16px; background: white; color: var(--color-danger);
  border: 1.5px solid var(--color-danger); border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition);
}
.btn-danger-outline:hover { background: var(--color-danger); color: white; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .settings-page { max-width: 100%; }
  .settings-card { padding: 24px 20px; }
  .save-row { justify-content: stretch; }
  .btn-primary { width: 100%; justify-content: center; }
  .status-row { flex-direction: column; gap: 10px; align-items: flex-start; }
  .btn-secondary { width: 100%; text-align: center; }
}
</style>

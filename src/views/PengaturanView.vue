<script setup>
import { ensureLocalNotificationPermission, getNotificationMode, setNotificationMode } from '@/utils/notifications.js'
import { ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const notifikasi = ref(getNotificationMode())
const bahasa = ref('Bahasa Indonesia')
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const notifOptions = ['Aktif', 'Nonaktif']
const bahasaOptions = ['Bahasa Indonesia', 'English']

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
    }
    await new Promise(r => setTimeout(r, 500))
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout page-title="Pengaturan">
    <div class="settings-page">
      <div class="settings-card">
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

        <div class="form-group">
          <label class="form-label">Bahasa</label>
          <div class="select-wrap">
            <select v-model="bahasa" class="form-input">
              <option v-for="opt in bahasaOptions" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <svg class="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .settings-page { max-width: 100%; }
  .settings-card { padding: 24px 20px; }
  .save-row { justify-content: stretch; }
  .btn-primary { width: 100%; justify-content: center; }
}
</style>

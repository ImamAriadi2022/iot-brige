<script setup>
import { updatePassword } from '@/services/api.js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const form = ref({ current: '', newPass: '', confirm: '' })
const show = ref({ current: false, newPass: false, confirm: false })
const saving = ref(false)
const error = ref('')
const success = ref(false)

async function handleSave() {
  error.value = ''
  if (!form.value.current || !form.value.newPass || !form.value.confirm) {
    error.value = 'Semua field harus diisi.'
    return
  }
  if (form.value.newPass !== form.value.confirm) {
    error.value = 'Konfirmasi kata sandi tidak cocok.'
    return
  }
  if (form.value.newPass.length < 6) {
    error.value = 'Kata sandi baru minimal 6 karakter.'
    return
  }
  saving.value = true
  try {
    await updatePassword({
      old_password: form.value.current,
      new_password: form.value.newPass,
    })
    success.value = true
    form.value = { current: '', newPass: '', confirm: '' }
    setTimeout(() => { success.value = false }, 3000)
  } catch (err) {
    error.value = err?.message || 'Gagal mengubah kata sandi.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout page-title="Ubah Kata Sandi">
    <div class="change-pw-page">
      <div class="change-pw-card">
        <h2 class="card-title">Ubah Kata Sandi</h2>

        <form class="pw-form" @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">Kata Sandi Saat Ini<span class="required">*</span></label>
            <div class="input-wrap">
              <input
                id="pw-current"
                v-model="form.current"
                :type="show.current ? 'text' : 'password'"
                class="form-input"
                placeholder="Masukan kata sandi saat ini"
              />
              <button type="button" class="toggle-pw" @click="show.current = !show.current">
                <svg v-if="!show.current" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kata Sandi Baru<span class="required">*</span></label>
            <div class="input-wrap">
              <input
                id="pw-new"
                v-model="form.newPass"
                :type="show.newPass ? 'text' : 'password'"
                class="form-input"
                placeholder="Masukan kata sandi baru"
              />
              <button type="button" class="toggle-pw" @click="show.newPass = !show.newPass">
                <svg v-if="!show.newPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Konfirmasi Kata Sandi<span class="required">*</span></label>
            <div class="input-wrap">
              <input
                id="pw-confirm"
                v-model="form.confirm"
                :type="show.confirm ? 'text' : 'password'"
                class="form-input"
                placeholder="Konfirmasi kata sandi baru"
              />
              <button type="button" class="toggle-pw" @click="show.confirm = !show.confirm">
                <svg v-if="!show.confirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <Transition name="fade">
            <div v-if="error" class="form-error">{{ error }}</div>
          </Transition>

          <Transition name="fade">
            <div v-if="success" class="form-success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Kata sandi berhasil diubah!
            </div>
          </Transition>

          <button id="pw-save-btn" type="submit" class="btn-primary" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.change-pw-page { display: flex; }
.change-pw-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 36px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 480px;
}
.card-title { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 28px; }
.pw-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 14px; font-weight: 600; color: var(--color-text); }
.required { color: var(--color-danger); margin-left: 2px; }
.input-wrap { position: relative; }
.form-input {
  width: 100%; padding: 11px 44px 11px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px; color: var(--color-text);
  background: #f8fafc; transition: var(--transition); outline: none;
}
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.form-input::placeholder { color: var(--color-text-light); }
.toggle-pw {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--color-text-muted);
  display: flex; align-items: center; justify-content: center;
  padding: 4px; transition: var(--transition);
}
.toggle-pw:hover { color: var(--color-primary); }
.form-error {
  padding: 10px 14px; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: var(--radius-sm);
  font-size: 13px; color: var(--color-danger);
}
.form-success {
  padding: 10px 14px; background: #f0fdf4;
  border: 1px solid #bbf7d0; border-radius: var(--radius-sm);
  font-size: 13px; color: var(--color-success);
  display: flex; align-items: center; gap: 8px; font-weight: 600;
}
.btn-primary {
  padding: 12px; background: var(--color-primary); color: white;
  border: none; border-radius: var(--radius-sm); font-size: 15px; font-weight: 700;
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .change-pw-card { padding: 24px 18px; }
}
</style>

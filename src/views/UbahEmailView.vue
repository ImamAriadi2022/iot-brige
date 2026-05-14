<script setup>
import { updateEmail } from '@/services/api.js'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const user = computed(() => {
  const stored = localStorage.getItem('iot_bridge_user')
  return stored ? JSON.parse(stored) : { name: 'Pengguna', email: '' }
})

const form = ref({
  newEmail: user.value.email || '',
  otp: '',
})
const saving = ref(false)
const sendingOtp = ref(false)
const otpSent = ref(false)
const success = ref(false)
const error = ref('')
const info = ref('')
const generatedOtp = ref('')

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleSendOtp() {
  error.value = ''
  success.value = false
  if (!form.value.newEmail) {
    error.value = 'Silakan isi email baru terlebih dahulu.'
    return
  }
  if (!validateEmail(form.value.newEmail)) {
    error.value = 'Format email tidak valid.'
    return
  }

  sendingOtp.value = true
  try {
    generatedOtp.value = generateOtp()
    otpSent.value = true
    info.value = 'OTP telah dikirim ke email baru. Silakan cek inbox dan masukkan kode di bawah ini.'
  } finally {
    sendingOtp.value = false
  }
}

async function handleVerifyAndSave() {
  error.value = ''
  success.value = false

  if (!otpSent.value) {
    error.value = 'Silakan kirim OTP terlebih dahulu.'
    return
  }
  if (!form.value.otp) {
    error.value = 'Masukkan kode OTP.'
    return
  }
  if (form.value.otp !== generatedOtp.value) {
    error.value = 'Kode OTP tidak cocok.'
    return
  }

  saving.value = true
  try {
    await updateEmail({ new_email: form.value.newEmail })
    const nextUser = {
      ...user.value,
      email: form.value.newEmail,
    }
    localStorage.setItem('iot_bridge_user', JSON.stringify(nextUser))
    success.value = true
    info.value = ''
    form.value.otp = ''
    generatedOtp.value = ''
    otpSent.value = false
    setTimeout(() => {
      router.push('/profile')
    }, 1800)
  } catch (err) {
    error.value = err?.message || 'Gagal memperbarui email.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout page-title="Ubah Email">
    <div class="change-email-page">
      <div class="change-email-card">
        <div class="header-block">
          <h2 class="card-title">Ubah Email</h2>
          <p class="card-subtitle">Masukkan email baru, kirim OTP, lalu verifikasi kode yang masuk ke email tersebut.</p>
        </div>

        <form class="email-form" @submit.prevent="handleVerifyAndSave">
          <div v-if="error" class="form-error">{{ error }}</div>
          <div v-if="info" class="form-info">{{ info }}</div>
          <div v-if="success" class="form-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Email berhasil diperbarui!
          </div>

          <div class="form-group">
            <label class="form-label">Email Baru<span class="required">*</span></label>
            <input
              v-model="form.newEmail"
              type="email"
              class="form-input"
              placeholder="Alamat email baru"
              autocomplete="email"
            />
          </div>

          <div class="otp-row">
            <button type="button" class="btn-secondary" @click="handleSendOtp" :disabled="sendingOtp">
              <span v-if="sendingOtp" class="spinner"></span>
              {{ sendingOtp ? 'Mengirim OTP...' : 'Kirim OTP' }}
            </button>
            <span class="otp-hint" v-if="otpSent">OTP dikirim ke email baru.</span>
          </div>

          <div class="form-group">
            <label class="form-label">Kode OTP<span class="required">*</span></label>
            <input
              v-model="form.otp"
              type="text"
              class="form-input otp-input"
              placeholder="Masukkan 6 digit OTP"
              inputmode="numeric"
              maxlength="6"
            />
          </div>

          <div class="save-row">
            <button id="email-save-btn" type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Menyimpan...' : 'Verifikasi & Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.change-email-page {
  display: flex;
  justify-content: center;
}
.change-email-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 560px;
}
.header-block {
  margin-bottom: 24px;
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 8px;
}
.card-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.5;
}
.email-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}
.required {
  color: var(--color-danger);
  margin-left: 2px;
}
.form-input {
  width: 100%;
  padding: 11px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text);
  background: white;
  transition: var(--transition);
  outline: none;
}
.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.form-error,
.form-info,
.form-success {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.form-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--color-danger);
}
.form-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}
.form-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: var(--color-success);
}
.otp-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.otp-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}
.save-row {
  display: flex;
  justify-content: flex-end;
}
.btn-primary,
.btn-secondary {
  border: none;
  border-radius: var(--radius-md);
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary {
  padding: 12px 28px;
  background: var(--color-primary);
  color: white;
}
.btn-secondary {
  padding: 11px 18px;
  background: #e8f0f8;
  color: var(--color-primary);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
.btn-secondary:hover:not(:disabled) {
  background: #dbe7f3;
}
.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .change-email-card {
    padding: 24px 18px;
  }
  .save-row {
    justify-content: stretch;
  }
  .btn-primary {
    width: 100%;
  }
  .btn-secondary {
    width: 100%;
  }
}
</style>

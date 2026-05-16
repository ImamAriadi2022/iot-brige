<script setup>
import { register } from '@/services/api.js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ username: '', email: '', phone_number: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleRegister() {
  if (!form.value.username || !form.value.email || !form.value.password) {
    error.value = 'Harap lengkapi semua field yang wajib diisi.'
    return
  }
  const pwRegex = /^[a-zA-Z0-9]{6,20}$/
  if (!pwRegex.test(form.value.password)) {
    error.value = 'Kata sandi harus 6–20 karakter alfanumerik tanpa spasi.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await register({
      username: form.value.username,
      email: form.value.email,
      phone_number: form.value.phone_number,
      password: form.value.password,
    })
    success.value = true
  } catch (err) {
    error.value = err.message || 'Pendaftaran gagal. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}

function closePopup() {
  success.value = false
  router.push('/masuk')
}
</script>

<template>
  <!-- Success Modal Popup -->
  <Transition name="popup">
    <div v-if="success" class="popup-overlay" @click.self="closePopup">
      <div class="popup-card">
        <button class="popup-close" @click="closePopup" aria-label="Tutup">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <div class="popup-icon-wrap">
          <img src="@/assets/ceklis.png" alt="Berhasil" class="popup-icon-img" />
        </div>
        <p class="popup-message">Pendaftaran berhasil! Silakan cek email Anda untuk melakukan verifikasi akun sebelum login.</p>
      </div>
    </div>
  </Transition>

  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-illustration">
        <img src="@/assets/ikon daftar.png" alt="Ilustrasi Daftar" class="illust-img" />
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-form-wrap">
        <div class="auth-logo">
          <img src="@/assets/logo-bridge.png" alt="IoT Bridge Logo" class="brand-logo-img" />
        </div>

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label">Username <span style="color:var(--color-danger)">*</span></label>
            <div class="input-wrap">
              <input id="reg-username" v-model="form.username" type="text" class="form-input" placeholder="Masukan username unik"/>
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Alamat Email <span style="color:var(--color-danger)">*</span></label>
            <div class="input-wrap">
              <input id="reg-email" v-model="form.email" type="email" class="form-input" placeholder="Masukan email pengguna"/>
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nomor Handphone</label>
            <div class="input-wrap">
              <input id="reg-phone" v-model="form.phone_number" type="tel" class="form-input" placeholder="Contoh: 08123456789"/>
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.85a16 16 0 0 0 6.29 6.29l1.45-1.45a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kata sandi <span style="color:var(--color-danger)">*</span></label>
            <div class="input-wrap">
              <input id="reg-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-input" placeholder="6–20 karakter alfanumerik"/>
              <button type="button" class="input-icon clickable" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="error" class="form-error">{{ error }}</div>

          <button id="register-submit" type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Memproses...' : 'Daftar' }}
          </button>

          <p class="auth-switch">Sudah punya akun? <RouterLink to="/masuk">Masuk</RouterLink></p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  background: #ffffff;
}

.auth-left {
  width: 40%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.auth-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-primary);
  clip-path: ellipse(85% 91% at 15% 50%);
  pointer-events: none;
}
.auth-left::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-primary-light);
  clip-path: ellipse(84% 92% at 15% 50%);
  pointer-events: none;
}
.auth-illustration {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 34px;
}
.illust-img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
.auth-right {
  width: 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 18px;
  background: transparent;
}
.auth-form-wrap {
  width: 100%;
  max-width: 316px;
}
.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 22px;
}
.brand-logo-img {
  height: 180px;
  width: auto;
  object-fit: contain;
}
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
.form-label { font-weight: 500; font-size: 11px; color: var(--color-text); }
.input-wrap { position: relative; }
.form-input {
  width: 100%;
  height: 33px;
  padding: 7px 40px 7px 10px;
  border: 1px solid #d7dce2;
  border-radius: 5px;
  font-size: 12px;
  color: var(--color-text);
  background: #eef1f5;
  transition: var(--transition);
  outline: none;
}
.form-input:focus {
  border-color: #6c86a7;
  background: white;
  box-shadow: 0 0 0 2px rgba(30,58,95,0.12);
}
.form-input::placeholder { color: var(--color-text-muted); }
.input-icon {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f5d88;
  background: #2f5d88;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  pointer-events: none;
}
.input-icon svg {
  color: #fff;
}
.input-icon.clickable { pointer-events: all; cursor: pointer; border: none; }
.form-error {
  font-size: 11px;
  color: var(--color-danger);
  padding: 8px 10px;
  background: #fef2f2;
  border-radius: 5px;
  border: 1px solid #fecaca;
}
.btn-primary {
  height: 34px;
  padding: 0 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(28, 63, 97, 0.35);
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.auth-switch {
  text-align: center;
  font-size: 10px;
  color: var(--color-text-muted);
}
.auth-switch a {
  color: #1f3552;
  font-weight: 600;
  text-decoration: underline;
}
@media (max-width: 768px) {
  .auth-page {
    flex-direction: column;
    background: #ffffff;
  }
  .auth-left {
    width: 100%;
    min-height: 220px;
  }
  .auth-left::before {
    clip-path: ellipse(100% 120% at 50% 0%);
  }
  .auth-left::after {
    clip-path: ellipse(72% 92% at 50% 0%);
  }
  .auth-illustration { max-width: 280px; padding: 10px 16px 20px; }
  .auth-right {
    width: 100%;
    padding: 24px 20px 30px;
  }
  .auth-form-wrap {
    max-width: 360px;
  }
  .form-label {
    font-size: 12px;
  }
  .form-input {
    height: 40px;
    font-size: 13px;
    padding: 10px 42px 10px 12px;
  }
  .input-icon {
    width: 26px;
    height: 26px;
  }
  .btn-primary {
    height: 40px;
    font-size: 13px;
  }
  .forgot-link,
  .auth-switch {
    font-size: 11px;
  }
}

/* ── Popup Modal ── */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 33, 56, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.popup-card {
  position: relative;
  background: white;
  border-radius: 18px;
  padding: 40px 36px 36px;
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.popup-close {
  position: absolute;
  top: -14px;
  right: -14px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--color-accent);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(232,107,26,0.4);
  transition: var(--transition);
}
.popup-close:hover { background: var(--color-accent-hover); transform: scale(1.1); }
.popup-icon-wrap {
  border: 2px solid #c4b5fd;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-icon-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
}
.popup-message {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  line-height: 1.55;
}
.popup-enter-active,
.popup-leave-active { transition: opacity 0.25s ease; }
.popup-enter-from,
.popup-leave-to { opacity: 0; }
</style>

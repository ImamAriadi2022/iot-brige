<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Harap isi email dan kata sandi.'
    return
  }
  loading.value = true
  error.value = ''
  // Simulate login
  await new Promise(r => setTimeout(r, 800))
  const user = { name: 'Mufita', email: email.value }
  localStorage.setItem('iot_bridge_user', JSON.stringify(user))
  loading.value = false
  success.value = true
}

function closePopup() {
  success.value = false
  router.push('/dashboard')
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
        <p class="popup-message">Selamat datang kembali! Anda berhasil masuk ke sistem IoT Bridge.</p>
      </div>
    </div>
  </Transition>

  <div class="auth-page">
    <!-- Left panel -->
    <div class="auth-left">
      <div class="auth-blob"></div>
      <div class="auth-illustration">
        <img src="@/assets/animasi-page-first.png" alt="Ilustrasi Login" class="illust-img" />
      </div>
    </div>

    <!-- Right panel -->
    <div class="auth-right">
      <div class="auth-form-wrap">
        <!-- Logo -->
        <div class="auth-logo">
          <img src="@/assets/logo-bridge.png" alt="IoT Bridge Logo" class="brand-logo-img" />
        </div>

        <form class="auth-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label">Alamat Email</label>
            <div class="input-wrap">
              <input
                id="login-email"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="Masukan email pengguna"
                autocomplete="email"
              />
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M22 7l-10 7L2 7"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Kata sandi</label>
            <div class="input-wrap">
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Masukan kata sandi"
                autocomplete="current-password"
              />
              <button type="button" class="input-icon clickable" @click="showPassword = !showPassword" aria-label="Toggle password">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="5" y="11" width="14" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <div v-if="error" class="form-error">{{ error }}</div>

          <div class="forgot-link">
            <RouterLink to="/lupa-kata-sandi">Lupa kata sandi?</RouterLink>
          </div>

          <button id="login-submit" type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Memproses...' : 'Masuk' }}
          </button>

          <p class="auth-switch">Belum punya akun? <RouterLink to="/daftar">Daftar</RouterLink></p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
}

/* LEFT */
.auth-left {
  width: 50%;
  background: var(--color-primary);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.auth-blob {
  position: absolute;
  right: -80px;
  top: -60px;
  width: 500px;
  height: 500px;
  background: rgba(255,255,255,0.06);
  border-radius: 50%;
  pointer-events: none;
}
.auth-illustration {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.illust-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.22));
  border-radius: 16px;
}

/* RIGHT */
.auth-right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: var(--color-white);
}
.auth-form-wrap {
  width: 100%;
  max-width: 400px;
}
.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}
.brand-logo-img {
  height: 80px;
  width: auto;
  object-fit: contain;
}

/* FORM */
.auth-form {
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
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text);
}
.input-wrap {
  position: relative;
}
.form-input {
  width: 100%;
  padding: 12px 48px 12px 14px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text);
  background: #f8fafc;
  transition: var(--transition);
  outline: none;
}
.form-input:focus {
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.form-input::placeholder { color: var(--color-text-muted); }
.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: #e8f0f8;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  pointer-events: none;
}
.input-icon.clickable {
  pointer-events: all;
  cursor: pointer;
  border: none;
}
.form-error {
  font-size: 13px;
  color: var(--color-danger);
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: var(--radius-sm);
  border: 1px solid #fecaca;
}
.forgot-link {
  text-align: right;
  font-size: 13px;
}
.forgot-link a {
  color: var(--color-text);
  text-decoration: underline;
  font-weight: 500;
}
.forgot-link a:hover { color: var(--color-accent); }
.btn-primary {
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.auth-switch {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-muted);
}
.auth-switch a {
  color: var(--color-primary);
  font-weight: 700;
  text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-left {
    width: 100%;
    min-height: 240px;
  }
  .auth-illustration { max-width: 280px; padding: 16px; }
  .auth-right {
    width: 100%;
    padding: 32px 20px;
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

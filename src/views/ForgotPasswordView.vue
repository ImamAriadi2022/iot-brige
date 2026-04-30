<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const contact = ref('')
const loading = ref(false)
const success = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!contact.value.trim()) {
    error.value = 'Harap isi email atau nomor handphone.'
    return
  }
  error.value = ''
  loading.value = true
  await new Promise(r => setTimeout(r, 900))
  loading.value = false
  success.value = true
}

function closePopup() {
  success.value = false
  router.push('/masuk')
}
</script>

<template>
  <!-- ── Success Modal Popup ── -->
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
        <p class="popup-message">Silahkan cek email kamu dan lakukan pengaturan ulang kata sandi!</p>
      </div>
    </div>
  </Transition>

  <div class="auth-page">
    <!-- ── Left panel ── -->
    <div class="auth-left">
      <div class="auth-blob"></div>
      <div class="auth-blob auth-blob-2"></div>
      <div class="auth-illustration">
        <img src="@/assets/animasi-page-first.png" alt="Ilustrasi Lupa Kata Sandi" class="illust-img" />
      </div>
    </div>

    <!-- ── Right panel ── -->
    <div class="auth-right">
      <div class="auth-form-wrap">

        <!-- Logo -->
        <div class="auth-logo">
          <img src="@/assets/logo-bridge.png" alt="IoT Bridge Logo" class="brand-logo-img" />
        </div>

        <!-- Form -->
        <form class="auth-form" @submit.prevent="handleSubmit">
          <div class="form-header">
            <h3 class="form-title">Lupa Kata Sandi?</h3>
            <p class="form-subtitle">Masukkan email atau nomor HP Anda dan kami akan mengirimkan instruksi reset kata sandi.</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="forgot-contact">Email/No.Handphone pengguna</label>
            <div class="input-wrap">
              <input
                id="forgot-contact"
                v-model="contact"
                type="text"
                class="form-input"
                placeholder="Masukan email/no.handphone pengguna"
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

          <div v-if="error" class="form-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
            </svg>
            {{ error }}
          </div>

          <button id="forgot-submit" type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            {{ loading ? 'Mengirim...' : 'Kirim' }}
          </button>

          <p class="auth-switch">
            <RouterLink to="/masuk" class="back-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Kembali ke Halaman Masuk
            </RouterLink>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout ── */
.auth-page {
  min-height: 100vh;
  display: flex;
}

/* ── Left panel ── */
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
  right: -100px;
  top: -80px;
  width: 520px;
  height: 520px;
  background: rgba(255,255,255,0.055);
  border-radius: 50%;
  pointer-events: none;
}
.auth-blob-2 {
  right: auto;
  left: -120px;
  top: auto;
  bottom: -100px;
  width: 380px;
  height: 380px;
  background: rgba(232,107,26,0.1);
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

/* ── Right panel ── */
.auth-right {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 28px;
  background: var(--color-white);
}
.auth-form-wrap {
  width: 100%;
  max-width: 400px;
}

/* ── Logo ── */
.auth-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
}
.brand-logo-img {
  width: auto;
  height: 80px;
  object-fit: contain;
}

/* ── Form header ── */
.form-header {
  margin-bottom: 8px;
}
.form-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 6px;
}
.form-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.55;
}

/* ── Form ── */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
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
  padding: 13px 52px 13px 15px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text);
  background: #f8fafc;
  transition: var(--transition);
  outline: none;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--color-primary);
  background: white;
  box-shadow: 0 0 0 3px rgba(30,58,95,0.09);
}
.form-input::placeholder { color: var(--color-text-muted); }
.input-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  background: #dde8f5;
  width: 34px;
  height: 34px;
  border-radius: 7px;
  pointer-events: none;
}

/* ── Error ── */
.form-error {
  font-size: 13px;
  color: var(--color-danger);
  padding: 10px 14px;
  background: #fef2f2;
  border-radius: var(--radius-sm);
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  gap: 7px;
}

/* ── Button ── */
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
  width: 100%;
  text-decoration: none;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(30,58,95,0.25);
}
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Back link ── */
.auth-switch { text-align: center; font-size: 13.5px; }
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-muted);
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition);
}
.back-link:hover { color: var(--color-primary); }

/* ── Success ── */
.success-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  padding: 28px 0;
  animation: fadeUp 0.45s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.success-icon-wrap {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(34,197,94,0.35);
}
.success-box h3 {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-primary);
}
.success-box p {
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.6;
  max-width: 300px;
}
.btn-back {
  margin-top: 8px;
  padding: 12px 24px;
  width: auto;
  font-size: 14px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-left { width: 100%; min-height: 260px; }
  .auth-illustration { max-width: 280px; padding: 16px; }
  .auth-right { width: 100%; padding: 36px 20px; }
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

/* Popup transition */
.popup-enter-active,
.popup-leave-active { transition: opacity 0.25s ease; }
.popup-enter-from,
.popup-leave-to { opacity: 0; }
</style>

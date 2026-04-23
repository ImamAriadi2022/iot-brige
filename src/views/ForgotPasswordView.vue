<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const phone = ref('')
const loading = ref(false)
const success = ref(false)

async function handleSubmit() {
  loading.value = true
  await new Promise(r => setTimeout(r, 800))
  loading.value = false
  success.value = true
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-blob"></div>
      <div class="auth-illustration">
        <svg viewBox="0 0 340 420" fill="none" class="illust-svg">
          <rect x="100" y="60" width="140" height="240" rx="18" fill="white" stroke="#e2e8f0" stroke-width="2"/>
          <rect x="110" y="80" width="120" height="200" rx="8" fill="#f5f7fa"/>
          <rect x="120" y="100" width="80" height="8" rx="4" fill="#cbd5e1"/>
          <rect x="120" y="116" width="60" height="6" rx="3" fill="#e2e8f0"/>
          <circle cx="148" cy="145" r="12" fill="#1e3a5f" opacity="0.15"/>
          <rect x="120" y="165" width="100" height="6" rx="3" fill="#e2e8f0"/>
          <rect x="120" y="179" width="80" height="6" rx="3" fill="#e2e8f0"/>
          <rect x="130" y="240" width="80" height="22" rx="6" fill="#1e3a5f"/>
          <text x="170" y="255" text-anchor="middle" fill="white" font-size="9" font-family="Inter" font-weight="600">MASUK</text>
          <circle cx="260" cy="100" r="28" fill="#e86b1a"/>
          <rect x="250" y="97" width="20" height="14" rx="3" fill="white"/>
          <path d="M254 97v-5a6 6 0 0 1 12 0v5" stroke="white" stroke-width="2.5" fill="none"/>
          <circle cx="82" cy="320" r="28" fill="#e86b1a"/>
          <circle cx="82" cy="308" r="10" fill="#fcd9b0"/>
          <path d="M60 340 Q82 320 104 340" fill="#1e3a5f"/>
          <rect x="20" y="290" width="30" height="60" rx="4" fill="#1e3a5f"/>
          <rect x="134" y="290" width="30" height="60" rx="4" fill="#1e3a5f"/>
          <ellipse cx="290" cy="280" rx="20" ry="30" fill="#e86b1a" opacity="0.7" transform="rotate(-20, 290, 280)"/>
        </svg>
      </div>
    </div>

    <div class="auth-right">
      <div class="auth-form-wrap">
        <div class="auth-logo">
          <svg width="72" height="64" viewBox="0 0 44 40" fill="none">
            <path d="M6 36 L6 20 L2 20 L22 4 L42 20 L38 20 L38 36" stroke="#e86b1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M14 36 L14 22 L30 22 L30 36" stroke="#e86b1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <line x1="10" y1="20" x2="10" y2="36" stroke="#e86b1a" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="34" y1="20" x2="34" y2="36" stroke="#e86b1a" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="6" cy="8" r="2" fill="#e86b1a"/>
            <circle cx="38" cy="8" r="2" fill="#e86b1a"/>
            <path d="M6 8 Q22 1 38 8" stroke="#e86b1a" stroke-width="2" fill="none"/>
          </svg>
          <h2 class="brand-name">I<span>⚙</span>T Bridge</h2>
        </div>

        <div v-if="success" class="success-box">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
          </svg>
          <h3>Berhasil Dikirim!</h3>
          <p>Instruksi reset kata sandi telah dikirim ke email dan nomor HP Anda.</p>
          <RouterLink to="/masuk" class="btn-primary" style="display:flex;justify-content:center;text-decoration:none;">Kembali ke Masuk</RouterLink>
        </div>

        <form v-else class="auth-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">Alamat Email</label>
            <div class="input-wrap">
              <input id="forgot-email" v-model="email" type="email" class="form-input" placeholder="Masukan email pengguna"/>
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
              <input id="forgot-phone" v-model="phone" type="tel" class="form-input" placeholder="Masukan nomor handphone"/>
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="forgot-link">
            <RouterLink to="/masuk">Lupa kata sandi?</RouterLink>
          </div>

          <button id="forgot-submit" type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Mengirim...' : 'Kirim' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100vh; display: flex; }
.auth-left { width: 50%; background: var(--color-primary); position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.auth-blob { position: absolute; right: -80px; top: -60px; width: 500px; height: 500px; background: rgba(255,255,255,0.06); border-radius: 50%; }
.auth-illustration { position: relative; z-index: 1; width: 340px; height: 420px; }
.illust-svg { width: 100%; height: 100%; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25)); }
.auth-right { width: 50%; display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: white; }
.auth-form-wrap { width: 100%; max-width: 400px; }
.auth-logo { display: flex; flex-direction: column; align-items: center; margin-bottom: 36px; }
.brand-name { font-size: 26px; font-weight: 800; color: var(--color-primary); margin-top: 8px; }
.brand-name span { color: var(--color-accent); }
.auth-form { display: flex; flex-direction: column; gap: 18px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-weight: 600; font-size: 13px; color: var(--color-text); }
.input-wrap { position: relative; }
.form-input { width: 100%; padding: 12px 48px 12px 14px; border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-size: 14px; color: var(--color-text); background: #f8fafc; transition: var(--transition); outline: none; }
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.form-input::placeholder { color: var(--color-text-muted); }
.input-icon { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: flex; align-items: center; justify-content: center; color: var(--color-primary); background: #e8f0f8; width: 32px; height: 32px; border-radius: 6px; pointer-events: none; }
.forgot-link { text-align: right; font-size: 13px; }
.forgot-link a { color: var(--color-text); text-decoration: underline; }
.btn-primary { padding: 14px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-size: 15px; font-weight: 700; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; }
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.success-box { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; padding: 32px 0; }
.success-box h3 { font-size: 20px; font-weight: 700; color: var(--color-text); }
.success-box p { color: var(--color-text-muted); font-size: 14px; }
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-left { width: 100%; min-height: 200px; }
  .auth-illustration { width: 200px; height: 250px; }
  .auth-right { width: 100%; padding: 28px 20px; }
}
</style>

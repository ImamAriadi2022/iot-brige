<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({ name: '', email: '', org: '', personal: false, password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Harap lengkapi semua field yang wajib diisi.'
    return
  }
  loading.value = true
  error.value = ''
  await new Promise(r => setTimeout(r, 800))
  const user = { name: form.value.name, email: form.value.email }
  localStorage.setItem('iot_bridge_user', JSON.stringify(user))
  loading.value = false
  router.push('/dashboard')
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-left">
      <div class="auth-blob"></div>
      <div class="auth-illustration">
        <svg viewBox="0 0 340 420" fill="none" xmlns="http://www.w3.org/2000/svg" class="illust-svg">
          <rect x="100" y="60" width="140" height="240" rx="18" fill="white" stroke="#e2e8f0" stroke-width="2"/>
          <rect x="110" y="80" width="120" height="200" rx="8" fill="#f5f7fa"/>
          <rect x="120" y="100" width="80" height="8" rx="4" fill="#cbd5e1"/>
          <rect x="120" y="116" width="60" height="6" rx="3" fill="#e2e8f0"/>
          <circle cx="148" cy="145" r="12" fill="#1e3a5f" opacity="0.15"/>
          <rect x="120" y="165" width="100" height="6" rx="3" fill="#e2e8f0"/>
          <rect x="120" y="179" width="80" height="6" rx="3" fill="#e2e8f0"/>
          <rect x="120" y="193" width="90" height="6" rx="3" fill="#cbd5e1"/>
          <circle cx="155" cy="220" r="4" fill="#e86b1a"/>
          <circle cx="170" cy="220" r="4" fill="#e86b1a" opacity="0.5"/>
          <circle cx="185" cy="220" r="4" fill="#e86b1a" opacity="0.3"/>
          <rect x="130" y="240" width="80" height="22" rx="6" fill="#1e3a5f"/>
          <text x="170" y="255" text-anchor="middle" fill="white" font-size="9" font-family="Inter" font-weight="600">MASUK</text>
          <circle cx="260" cy="100" r="28" fill="#e86b1a"/>
          <rect x="250" y="97" width="20" height="14" rx="3" fill="white"/>
          <path d="M254 97v-5a6 6 0 0 1 12 0v5" stroke="white" stroke-width="2.5" fill="none"/>
          <rect x="30" y="100" width="90" height="60" rx="8" fill="white" stroke="#e2e8f0" stroke-width="1.5"/>
          <rect x="40" y="112" width="50" height="6" rx="3" fill="#e2e8f0"/>
          <rect x="40" y="124" width="35" height="6" rx="3" fill="#cbd5e1"/>
          <circle cx="45" cy="150" r="10" fill="#1e3a5f" opacity="0.1"/>
          <rect x="65" y="145" width="40" height="5" rx="2.5" fill="#e2e8f0"/>
          <circle cx="82" cy="320" r="28" fill="#e86b1a"/>
          <circle cx="82" cy="308" r="10" fill="#fcd9b0"/>
          <path d="M60 340 Q82 320 104 340" fill="#1e3a5f"/>
          <rect x="20" y="290" width="30" height="60" rx="4" fill="#1e3a5f"/>
          <rect x="134" y="290" width="30" height="60" rx="4" fill="#1e3a5f"/>
          <ellipse cx="290" cy="280" rx="20" ry="30" fill="#e86b1a" opacity="0.7" transform="rotate(-20, 290, 280)"/>
          <ellipse cx="305" cy="265" rx="15" ry="22" fill="#e86b1a" opacity="0.5" transform="rotate(15, 305, 265)"/>
          <line x1="290" y1="280" x2="285" y2="350" stroke="#7c4a1a" stroke-width="3"/>
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

        <form class="auth-form" @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label">Nama Pengguna</label>
            <div class="input-wrap">
              <input id="reg-name" v-model="form.name" type="text" class="form-input" placeholder="Masukan nama pengguna"/>
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Alamat Email</label>
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
            <label class="form-label">Nama Organisasi</label>
            <div class="input-wrap">
              <input id="reg-org" v-model="form.org" type="text" class="form-input" placeholder="Masukan nama organisasi"/>
              <span class="input-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <rect x="9" y="2" width="6" height="4" rx="1"/>
                  <rect x="2" y="18" width="6" height="4" rx="1"/>
                  <rect x="9" y="18" width="6" height="4" rx="1"/>
                  <rect x="16" y="18" width="6" height="4" rx="1"/>
                  <path d="M12 6v6M5 18v-4h14v4"/>
                </svg>
              </span>
            </div>
          </div>

          <div class="form-check">
            <input id="reg-personal" v-model="form.personal" type="checkbox"/>
            <label for="reg-personal">Silahkan ceklis jika akun untuk penggunaan pribadi</label>
          </div>

          <div class="form-group">
            <label class="form-label">Kata sandi</label>
            <div class="input-wrap">
              <input id="reg-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-input" placeholder="Masukan kata sandi"/>
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
.auth-page { min-height: 100vh; display: flex; }
.auth-left {
  width: 50%; background: var(--color-primary);
  position: relative; display: flex; align-items: center;
  justify-content: center; overflow: hidden;
}
.auth-blob {
  position: absolute; right: -80px; top: -60px;
  width: 500px; height: 500px; background: rgba(255,255,255,0.06);
  border-radius: 50%; pointer-events: none;
}
.auth-illustration { position: relative; z-index: 1; width: 340px; height: 420px; }
.illust-svg { width: 100%; height: 100%; filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25)); }
.auth-right {
  width: 50%; display: flex; align-items: center;
  justify-content: center; padding: 40px 24px; background: var(--color-white); overflow-y: auto;
}
.auth-form-wrap { width: 100%; max-width: 400px; }
.auth-logo { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
.brand-name { font-size: 26px; font-weight: 800; color: var(--color-primary); margin-top: 8px; }
.brand-name span { color: var(--color-accent); }
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-weight: 600; font-size: 13px; color: var(--color-text); }
.input-wrap { position: relative; }
.form-input {
  width: 100%; padding: 12px 48px 12px 14px;
  border: 1.5px solid var(--color-border); border-radius: var(--radius-sm);
  font-size: 14px; color: var(--color-text); background: #f8fafc; transition: var(--transition); outline: none;
}
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.form-input::placeholder { color: var(--color-text-muted); }
.input-icon {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-primary); background: #e8f0f8;
  width: 32px; height: 32px; border-radius: 6px; pointer-events: none;
}
.input-icon.clickable { pointer-events: all; cursor: pointer; border: none; }
.form-check { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
.form-check input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; }
.form-error { font-size: 13px; color: var(--color-danger); padding: 10px 14px; background: #fef2f2; border-radius: var(--radius-sm); }
.btn-primary {
  padding: 14px; background: var(--color-primary); color: white;
  border: none; border-radius: var(--radius-sm); font-size: 15px; font-weight: 700;
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px;
}
.btn-primary:hover:not(:disabled) { background: var(--color-primary-dark); }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner { width: 16px; height: 16px; border: 2.5px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.auth-switch { text-align: center; font-size: 14px; color: var(--color-text-muted); }
.auth-switch a { color: var(--color-primary); font-weight: 700; text-decoration: underline; }
@media (max-width: 768px) {
  .auth-page { flex-direction: column; }
  .auth-left { width: 100%; min-height: 200px; }
  .auth-illustration { width: 200px; height: 250px; }
  .auth-right { width: 100%; padding: 28px 20px; }
}
</style>

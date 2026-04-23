<script setup>
import { ref, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const user = computed(() => {
  const u = localStorage.getItem('iot_bridge_user')
  return u ? JSON.parse(u) : { name: 'Mufita', email: 'halimah.mufita@gmail.com' }
})

const form = ref({
  username: user.value.name || 'Mufita',
  namaLengkap: user.value.name || 'Mufita',
  email: user.value.email || 'halimah.mufita@gmail.com',
  phone: '0895353304313',
})

const avatarPreview = ref(null)
const saving = ref(false)
const saved = ref(false)

function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function handleSave() {
  saving.value = true
  await new Promise(r => setTimeout(r, 900))
  const updated = { name: form.value.namaLengkap, email: form.value.email }
  localStorage.setItem('iot_bridge_user', JSON.stringify(updated))
  saving.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 2500)
}
</script>

<template>
  <AppLayout page-title="Profile">
    <div class="profile-page">
      <div class="profile-card">
        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-wrap">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-img"/>
            <div v-else class="avatar-placeholder">
              {{ form.namaLengkap?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <label class="avatar-camera" for="avatar-input" title="Ubah foto">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </label>
            <input id="avatar-input" type="file" accept="image/*" style="display:none" @change="handleAvatarChange"/>
          </div>
        </div>

        <!-- Form -->
        <div class="profile-form">
          <div class="form-group">
            <label class="form-label">Nama Pengguna<span class="required">*</span></label>
            <input v-model="form.username" type="text" class="form-input"/>
          </div>

          <div class="form-group">
            <label class="form-label">Nama Lengkap<span class="required">*</span></label>
            <input v-model="form.namaLengkap" type="text" class="form-input"/>
          </div>

          <div class="form-group">
            <label class="form-label">Alamat Email<span class="required">*</span></label>
            <input v-model="form.email" type="email" class="form-input"/>
          </div>

          <div class="form-group">
            <label class="form-label">Nomor Handphone</label>
            <input v-model="form.phone" type="tel" class="form-input"/>
          </div>

          <div class="save-row">
            <Transition name="fade">
              <span v-if="saved" class="saved-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Profile diperbarui!
              </span>
            </Transition>
            <button id="profile-save-btn" class="btn-primary" @click="handleSave" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Menyimpan...' : 'Perbarui' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.profile-page { display: flex; justify-content: flex-start; }
.profile-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 48px;
  align-items: flex-start;
  width: 100%;
  max-width: 800px;
}

/* Avatar */
.avatar-section { flex-shrink: 0; }
.avatar-wrap {
  position: relative;
  width: 180px;
  height: 180px;
}
.avatar-img, .avatar-placeholder {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  font-weight: 800;
  color: white;
}
.avatar-camera {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1e3a5f;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: var(--transition);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.avatar-camera:hover { background: var(--color-accent); }

/* Form */
.profile-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 15px; font-weight: 700; color: var(--color-text); }
.required { color: var(--color-danger); margin-left: 2px; }
.form-input {
  padding: 11px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--color-text);
  background: white;
  transition: var(--transition);
  outline: none;
  width: 100%;
}
.form-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }

.save-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 8px; }
.saved-msg { display: flex; align-items: center; gap: 6px; color: var(--color-success); font-size: 13px; font-weight: 600; }
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

@media (max-width: 768px) {
  .profile-card {
    flex-direction: column;
    align-items: center;
    padding: 28px 20px;
    gap: 32px;
  }
  .save-row { justify-content: stretch; }
  .btn-primary { width: 100%; justify-content: center; }
}
</style>

<script setup>
import { getProfile, updateProfile } from '@/services/api.js'
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const user = computed(() => {
  const u = localStorage.getItem('iot_bridge_user')
  return u ? JSON.parse(u) : { name: 'BillValentinov', email: '' }
})

const form = ref({
  nama: user.value.name || 'BillValentinov',
  phone: user.value.phone || '085691496242',
})

const avatarPreview = ref(null)
const avatarFile = ref(null)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  avatarFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { avatarPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function handleSave() {
  saving.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('username', form.value.nama)
    formData.append('phone_number', form.value.phone)
    if (avatarFile.value) formData.append('profile_picture', avatarFile.value) // Field name is profile_picture according to spec line 430
    
    const res = await updateProfile(formData)
    const data = res?.data?.user
    
    if (data) {
      const nextUser = {
        ...user.value,
        name: data.username || form.value.nama,
        phone: data.phone_number || form.value.phone,
        email: data.email || user.value.email,
        avatar: data.profile_picture || user.value.avatar,
      }
      localStorage.setItem('iot_bridge_user', JSON.stringify(nextUser))
      
      // Save new token if returned
      if (res?.data?.token) {
        localStorage.setItem('iot_bridge_token', res.data.token)
      }
      
      avatarPreview.value = data.profile_picture || avatarPreview.value
    }
    
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (err) {
    error.value = err?.message || 'Gagal memperbarui profil.'
  } finally {
    saving.value = false
  }
}


async function loadProfile() {
  error.value = ''
  try {
    const res = await getProfile()
    const data = res?.data?.user
    if (data) {
      form.value.nama = data.username || form.value.nama
      form.value.phone = data.phone_number || form.value.phone
      
      let avatar = data.profile_picture
      if (avatar && avatar.startsWith('/')) {
        avatar = `https://iotbridge.click${avatar}`
      }
      avatarPreview.value = avatar || avatarPreview.value

      
      // Update local storage too if needed
      const u = localStorage.getItem('iot_bridge_user')
      const currentUser = u ? JSON.parse(u) : {}
      localStorage.setItem('iot_bridge_user', JSON.stringify({
        ...currentUser,
        name: data.username,
        email: data.email,
        phone: data.phone_number,
        avatar: data.profile_picture,
        role: data.role
      }))
    }
  } catch (err) {
    error.value = err?.message || 'Gagal memuat profil.'
  }
}


onMounted(loadProfile)
</script>

<template>
  <AppLayout page-title="Profil">
    <div class="profile-page">
      <div class="profile-card">
        <div class="avatar-section">
          <label class="avatar-picker" for="avatar-input">
            <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar" class="avatar-img"/>
            <span v-else class="avatar-text">Pilih Foto</span>
          </label>
          <input id="avatar-input" class="sr-only" type="file" accept="image/*" @change="handleAvatarChange"/>
        </div>

        <div class="profile-form">
          <div v-if="error" class="form-error">{{ error }}</div>
          <div class="form-group">
            <label class="form-label">Nama Pengguna<span class="required">*</span></label>
            <input v-model="form.nama" type="text" class="form-input"/>
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
.profile-page { display: flex; justify-content: center; }
.profile-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 36px 32px;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 36px;
  align-items: center;
  width: 100%;
  max-width: 720px;
}

/* Avatar */
.avatar-section { flex-shrink: 0; }
.avatar-picker {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  overflow: hidden;
}
.avatar-picker:hover { background: #d1d5db; }
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-muted);
}

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

.form-error {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-danger);
}

.save-row { display: flex; align-items: center; justify-content: flex-end; gap: 12px; margin-top: 6px; }
.saved-msg { display: flex; align-items: center; gap: 6px; color: var(--color-success); font-size: 13px; font-weight: 600; }
.btn-primary {
  padding: 12px 28px; background: var(--color-primary); color: white;
  border: none; border-radius: var(--radius-md); font-size: 15px; font-weight: 700;
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

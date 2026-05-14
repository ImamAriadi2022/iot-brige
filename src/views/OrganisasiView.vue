<script setup>
import { ensureOrganizationId, getOrganizationProfile, updateOrganizationProfile } from '@/services/api.js'
import { onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const form = ref({
  nama: 'Pokdakan Bintang Rosela Jaya',
  deskripsi: '',
  email: '',
  telepon: '',
  lokasi: '',
  timezone: '',
})
const charCount = ref(0)
const logoPreview = ref(null)
const logoFile = ref(null)
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const organizationId = ref(null)

function handleDeskripsi(e) {
  charCount.value = e.target.value.length
}

function handleLogoDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer?.files[0] || e.target.files[0]
  if (file) previewLogo(file)
}

function previewLogo(file) {
  logoFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => { logoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function handleSave() {
  if (!organizationId.value) return
  saving.value = true
  error.value = ''
  try {
    const formData = new FormData()
    formData.append('name', form.value.nama)
    formData.append('description', form.value.deskripsi)
    formData.append('location', form.value.lokasi)
    if (logoFile.value) {
      formData.append('organization_picture', logoFile.value)
    }

    await updateOrganizationProfile(organizationId.value, formData)
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (err) {
    error.value = err?.message || 'Gagal memperbarui profil organisasi.'
  } finally {
    saving.value = false
  }
}


const timezones = ['WIB (UTC+7)', 'WITA (UTC+8)', 'WIT (UTC+9)', 'UTC+0']

async function loadOrganization() {
  error.value = ''
  try {
    organizationId.value = await ensureOrganizationId()
    if (!organizationId.value) {
      error.value = 'Organisasi belum tersedia untuk akun ini.'
      return
    }
    const data = await getOrganizationProfile(organizationId.value)
    form.value.nama = data?.name || data?.nama || form.value.nama
    form.value.deskripsi = data?.description || data?.deskripsi || ''
    form.value.email = data?.email || ''
    form.value.telepon = data?.phone_number || data?.telepon || ''
    form.value.lokasi = data?.location || data?.lokasi || ''
    form.value.timezone = data?.timezone || ''
    charCount.value = form.value.deskripsi.length
    logoPreview.value = data?.logo_url || data?.logo || logoPreview.value
  } catch (err) {
      // Friendly handling for organization-not-verified (backend may return 403)
      if (err?.status === 403 || /verif/i.test(String(err?.message || ''))) {
        error.value = 'Organisasi belum diverifikasi. Silakan hubungi administrator atau verifikasi organisasi melalui dashboard admin.'
      } else {
        error.value = err?.message || 'Gagal memuat profil organisasi.'
      }
  }
}

onMounted(loadOrganization)
</script>

<template>
  <AppLayout page-title="Pokdakan Bintang Rosela Jaya">
    <div class="org-page">
      <h2 class="section-title">Profile Organisasi</h2>

      <div v-if="error" class="form-error">{{ error }}</div>

      <div class="org-grid">
        <!-- Left column -->
        <div class="org-left">
          <div class="form-group">
            <label class="form-label">Nama Organisasi<span class="required">*</span></label>
            <input v-model="form.nama" type="text" class="form-input" readonly/>
            <p class="form-hint">*Nama Organisasi yang sudah terdaftar tidak bisa diubah. Jika terdapat Kesalahan dalam nama organisasi silahkan hubungi admin sistem</p>
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi <span class="optional">(Opsional)</span></label>
            <textarea
              v-model="form.deskripsi"
              class="form-input textarea"
              rows="6"
              maxlength="500"
              placeholder="Tulis deskripsi organisasi..."
              @input="handleDeskripsi"
            ></textarea>
            <p class="char-count">{{ charCount }} / 500</p>
          </div>

          <div class="form-group">
            <label class="form-label">Alamat Email<span class="required">*</span></label>
            <input v-model="form.email" type="email" class="form-input" placeholder="email@organisasi.com"/>
          </div>

          <div class="form-group">
            <label class="form-label">Nomor Telepon<span class="required">*</span></label>
            <input v-model="form.telepon" type="tel" class="form-input" placeholder="08xxxxxxxxxx"/>
          </div>

          <div class="form-group">
            <label class="form-label">Lokasi<span class="required">*</span></label>
            <input v-model="form.lokasi" type="text" class="form-input" placeholder="Alamat lokasi"/>
          </div>

          <div class="form-group">
            <label class="form-label">Timezone<span class="required">*</span></label>
            <div class="select-wrap">
              <select v-model="form.timezone" class="form-input">
                <option value="" disabled>Pilih timezone</option>
                <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
              </select>
              <svg class="select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Right column -->
        <div class="org-right">
          <div class="form-group">
            <label class="form-label">Logo <span class="optional">(Opsional)</span></label>
            <div
              class="logo-upload"
              @drop="handleLogoDrop"
              @dragover.prevent
              @click="$refs.logoInput.click()"
            >
              <img v-if="logoPreview" :src="logoPreview" alt="Logo preview" class="logo-preview"/>
              <template v-else>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.5">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p class="upload-title">Unggah Logo</p>
                <p class="upload-hint">Unggah dari komputer atau tarik dan lepaskan file logonya dengan format .png, .jpg, .jpeg. Minimal dengan ukuran 2 MB.</p>
              </template>
              <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="e => previewLogo(e.target.files[0])"/>
            </div>
          </div>

          <div class="save-row">
            <Transition name="fade">
              <span v-if="saved" class="saved-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Tersimpan!
              </span>
            </Transition>
            <button id="org-save-btn" class="btn-primary" @click="handleSave" :disabled="saving">
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
.org-page { display: flex; flex-direction: column; gap: 24px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--color-text); }

.org-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
}

.org-left, .org-right { display: flex; flex-direction: column; gap: 20px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 14px; font-weight: 600; color: var(--color-text); }
.required { color: var(--color-danger); margin-left: 2px; }
.optional { color: var(--color-text-muted); font-weight: 400; font-size: 13px; }
.form-hint { font-size: 11px; color: var(--color-text-muted); margin-top: 4px; font-style: italic; }
.char-count { font-size: 12px; color: var(--color-text-muted); text-align: right; }
.form-error {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-danger);
}

.form-input {
  padding: 11px 14px;
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
.form-input[readonly] { background: #f1f5f9; cursor: not-allowed; color: var(--color-text-muted); }
.form-input::placeholder { color: var(--color-text-light); }
.textarea { resize: vertical; min-height: 120px; }

.select-wrap { position: relative; }
.select-wrap .form-input { appearance: none; padding-right: 36px; cursor: pointer; }
.select-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-muted); pointer-events: none; }

.logo-upload {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: var(--transition);
  text-align: center;
  background: #f8fafc;
  min-height: 200px;
  justify-content: center;
}
.logo-upload:hover { border-color: var(--color-primary); background: #eef4ff; }
.upload-title { font-size: 15px; font-weight: 700; color: var(--color-text); }
.upload-hint { font-size: 12px; color: var(--color-text-muted); line-height: 1.6; }
.logo-preview { width: 100%; max-height: 180px; object-fit: contain; border-radius: var(--radius-sm); }

.save-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}
.saved-msg {
  display: flex; align-items: center; gap: 6px;
  color: var(--color-success); font-size: 13px; font-weight: 600;
}
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

@media (max-width: 900px) {
  .org-grid { grid-template-columns: 1fr; }
  .org-right { order: -1; }
}
@media (max-width: 600px) {
  .save-row { justify-content: stretch; }
  .btn-primary { width: 100%; justify-content: center; }
}
</style>

<script setup>
import { 
  getOrganizationProfile, 
  updateOrganizationProfile,
  getOrganizationMembers,
  createLocalMember,
  searchOrganizationMembers
} from '@/services/api.js'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const organizationId = ref(route.params.id)

const form = ref({
  nama: '',
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

const members = ref([])
const searchMemberQuery = ref('')
const showAddMemberModal = ref(false)
const newMember = ref({
  name: '',
  email: '',
  password: '',
})

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
    const data = await getOrganizationProfile(organizationId.value)
    form.value.nama = data?.name || data?.nama || ''
    form.value.deskripsi = data?.description || data?.deskripsi || ''
    form.value.email = data?.email || ''
    form.value.telepon = data?.phone_number || data?.telepon || ''
    form.value.lokasi = data?.location || data?.lokasi || ''
    form.value.timezone = data?.timezone || ''
    charCount.value = form.value.deskripsi.length
    logoPreview.value = data?.logo_url || data?.logo || logoPreview.value
    
    await loadMembers()
  } catch (err) {
    error.value = err?.message || 'Gagal memuat profil organisasi.'
  }
}

async function loadMembers() {
  try {
    const data = await getOrganizationMembers(organizationId.value)
    members.value = data?.data || data || []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Gagal memuat anggota:', err)
  }
}

async function handleSearchMembers() {
  try {
    const data = await searchOrganizationMembers(organizationId.value, { query: searchMemberQuery.value })
    members.value = data?.data || data || []
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Gagal mencari anggota:', err)
  }
}

async function handleAddLocalMember() {
  error.value = ''
  try {
    await createLocalMember(organizationId.value, newMember.value)
    showAddMemberModal.value = false
    newMember.value = { name: '', email: '', password: '' }
    await loadMembers()
  } catch (err) {
    error.value = err?.message || 'Gagal menambahkan anggota lokal.'
  }
}

onMounted(loadOrganization)
</script>

<template>
  <AppLayout :page-title="form.nama || 'Detail Organisasi'">
    <div class="org-page">
      <button class="back-btn" @click="router.push('/organisasi')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali ke Daftar
      </button>

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

      <!-- Members Section -->
      <div class="members-section">
        <div class="members-head">
          <h3 class="section-title">Anggota Organisasi</h3>
          <button class="btn-primary" @click="showAddMemberModal = true">Tambah Anggota Lokal</button>
        </div>

        <div class="search-bar">
          <input v-model="searchMemberQuery" type="text" class="form-input" placeholder="Cari anggota..." @input="handleSearchMembers" />
        </div>

        <div class="members-list">
          <div v-if="members.length === 0" class="empty-members">Belum ada anggota.</div>
          <div v-for="m in members" :key="m.id" class="member-card">
            <div class="member-info">
              <div class="member-name">{{ m.name || m.username }}</div>
              <div class="member-email">{{ m.email }}</div>
            </div>
            <div class="member-role">{{ m.role }}</div>
          </div>
        </div>
      </div>

      <!-- Add Member Modal -->
      <Transition name="modal">
        <div v-if="showAddMemberModal" class="modal-overlay" @click.self="showAddMemberModal = false">
          <div class="modal-box">
            <div class="modal-head">
              <h3>Tambah Anggota Lokal</h3>
            </div>
            <form class="modal-form" @submit.prevent="handleAddLocalMember">
              <input v-model="newMember.name" class="form-input" type="text" placeholder="Nama Lengkap" required />
              <input v-model="newMember.email" class="form-input" type="email" placeholder="Email" required />
              <input v-model="newMember.password" class="form-input" type="password" placeholder="Password" required />
              <div class="modal-actions">
                <button type="button" class="btn-text" @click="showAddMemberModal = false">Tutup</button>
                <button type="submit" class="btn-primary">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<style scoped>
.org-page { display: flex; flex-direction: column; gap: 24px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--color-text); }

.back-btn {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; color: var(--color-primary);
  font-size: 14px; font-weight: 600; cursor: pointer;
  padding: 0; width: fit-content;
}

.org-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;
  margin-top: 16px;
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
.btn-primary:hover { background: var(--color-primary-dark); }
.spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Members Section */
.members-section {
  margin-top: 40px;
  background: white;
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}
.members-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.search-bar { margin-bottom: 16px; }
.members-list { display: flex; flex-direction: column; gap: 12px; }
.empty-members { text-align: center; color: var(--color-text-muted); padding: 20px; }
.member-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.member-name { font-weight: 600; color: var(--color-text); }
.member-email { font-size: 13px; color: var(--color-text-muted); }
.member-role { font-size: 12px; padding: 4px 8px; background: #eef4ff; color: var(--color-primary); border-radius: 12px; font-weight: 600; }

/* Modal styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; padding: 24px; border-radius: var(--radius-md); width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
.modal-head h3 { font-size: 16px; font-weight: 700; color: var(--color-text); }
.modal-form { display: flex; flex-direction: column; gap: 12px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.btn-text { padding: 10px 16px; background: none; border: none; font-size: 14px; font-weight: 600; color: var(--color-text-muted); cursor: pointer; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s, transform 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

@media (max-width: 900px) {
  .org-grid { grid-template-columns: 1fr; }
  .org-right { order: -1; }
}
@media (max-width: 600px) {
  .save-row { justify-content: stretch; }
  .btn-primary { width: 100%; justify-content: center; }
}
</style>

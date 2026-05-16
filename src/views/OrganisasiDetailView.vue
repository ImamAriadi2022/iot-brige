<script setup>
import { 
  getOrganizationProfile, 
  updateOrganizationProfile,
  getOrganizationMembers,
  createLocalMember,
  getProfile,
  memberInvitation,
  searchUsers,
  changeMemberRoles,
  deleteMember
} from '@/services/api.js'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const route = useRoute()
const router = useRouter()
const organizationId = ref(route.params.id)
const initialName = route.query.name || ''

const form = ref({
  nama: initialName,
  deskripsi: '',
  email: '',
  telepon: '',
  lokasi: '',
})
const charCount = ref(0)
const logoPreview = ref(null)
const logoFile = ref(null)
const saving = ref(false)
const saved = ref(false)
const error = ref('')
const isEditing = ref(false) // Mode Edit
const showSuccessModal = ref(false)

const members = ref([])
const currentUserId = ref(null)
const searchMemberQuery = ref('')
const searchResults = ref([]) // Hasil pencarian global
const searching = ref(false)
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
  if (!isEditing.value) return
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
    showSuccessModal.value = true
    isEditing.value = false // Kembali ke mode lihat
  } catch (err) {
    error.value = err?.message || 'Gagal memperbarui profil organisasi.'
  } finally {
    saving.value = false
  }
}

async function loadOrganization() {
  error.value = ''
  try {
    const res = await getOrganizationProfile(organizationId.value)
    const data = res?.data || res
    
    form.value.nama = data?.name || data?.nama || initialName
    form.value.deskripsi = data?.description || data?.deskripsi || ''
    form.value.lokasi = data?.location || data?.lokasi || ''
    charCount.value = form.value.deskripsi.length
    logoPreview.value = data?.organization_picture || data?.logo_url || data?.logo || logoPreview.value
    
    await loadMembers()
    
    // Cari admin pertama untuk mengisi email dan telepon
    const admin = members.value.find(m => m.role === 'admin' || m.role === 'Admin')
    
    // Akali dengan mengambil data profil pengguna saat ini
    try {
      const myProfileRes = await getProfile()
      const myProfile = myProfileRes?.data?.user || myProfileRes?.user || myProfileRes
      currentUserId.value = myProfile?.id
      
      form.value.email = myProfile?.email || 'Tidak ada email'
      form.value.telepon = myProfile?.phone_number || myProfile?.telepon || 'Tidak ada nomor telepon'
    } catch (e) {
      if (admin) {
        form.value.email = admin.email || 'Tidak ada email'
        form.value.telepon = admin.phone_number || admin.telepon || 'Tidak ada nomor telepon'
      } else {
        form.value.email = 'Belum ada admin'
        form.value.telepon = 'Belum ada admin'
      }
    }

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
  if (!searchMemberQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const data = await searchUsers({ identity: searchMemberQuery.value })
    searchResults.value = data?.data || data || []
    
    if (searchResults.value.length === 0) {
      alert('Tidak ada pengguna yang ditemukan dengan kata kunci tersebut.')
    }
  } catch (err) {
    alert('Gagal mencari anggota: ' + (err?.message || 'Error tidak diketahui'))
  } finally {
    searching.value = false
  }
}

async function handleInvite(user) {
  try {
    const payload = { user_id: String(user.id) }
    await memberInvitation(organizationId.value, payload)
    alert('Undangan berhasil dikirim ke ' + (user.name || user.username))
    
    searchMemberQuery.value = ''
    searchResults.value = []
  } catch (err) {
    alert('Gagal mengirim undangan: ' + (err?.message || 'Error tidak diketahui'))
  }
}

async function handleChangeRole(member) {
  try {
    const payload = {
      user_id: String(member.id),
      role: member.role
    }
    await changeMemberRoles(organizationId.value, payload)
    alert(`Berhasil mengubah role ${member.name || member.username} menjadi ${member.role}`)
  } catch (err) {
    alert('Gagal mengubah role: ' + (err?.message || 'Error tidak diketahui'))
    await loadMembers() // Reload to revert UI
  }
}

async function handleLeaveOrganization() {
  // Ambil profil untuk memastikan data terbaru
  let currentEmail = ''
  try {
    const myProfileRes = await getProfile()
    const myProfile = myProfileRes?.data?.user || myProfileRes?.user || myProfileRes
    currentUserId.value = myProfile?.id
    currentEmail = myProfile?.email
  } catch (e) {
    // Ignore error
  }

  // Cari user saat ini di dalam daftar anggota
  const currentUserInList = members.value.find(m => 
    (currentUserId.value && String(m.id) === String(currentUserId.value)) || 
    (currentEmail && m.email === currentEmail)
  )
  
  // Cek apakah user saat ini adalah admin (mengandung kata 'admin')
  const isCurrentAdmin = currentUserInList?.role?.toLowerCase().includes('admin')
  
  // Hitung jumlah admin (mengandung kata 'admin')
  const adminMembers = members.value.filter(m => m.role?.toLowerCase().includes('admin'))
  
  // Jika dia adalah admin dan jumlah admin hanya 1 (atau kurang), maka tidak boleh keluar
  if (isCurrentAdmin && adminMembers.length <= 1) {
    alert('Anda tidak bisa keluar organisasi karena Anda adalah satu-satunya admin. Silakan tunjuk admin lain terlebih dahulu.')
    return
  }


  
  if (!confirm('Apakah Anda yakin ingin keluar dari organisasi ini?')) return
  
  try {
    await deleteMember(organizationId.value, currentUserId.value)
    alert('Anda telah berhasil keluar dari organisasi.')
    router.push('/organisasi')
  } catch (err) {
    alert('Gagal keluar organisasi: ' + (err?.message || 'Error tidak diketahui'))
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
      <div class="top-row">
        <button class="back-btn" @click="router.push('/organisasi')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali ke Daftar
        </button>
        
        <button class="btn-danger-outline" @click="handleLeaveOrganization">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Keluar Organisasi
        </button>
      </div>

      <div class="section-head">
        <h2 class="section-title">Profile Organisasi</h2>
        <button v-if="!isEditing" class="btn-secondary" @click="isEditing = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Edit Profil
        </button>
      </div>

      <div v-if="error" class="form-error">{{ error }}</div>

      <div class="org-grid">
        <!-- Left column -->
        <div class="org-left">
          <div class="form-group">
            <label class="form-label">Nama Organisasi<span class="required">*</span></label>
            <input v-model="form.nama" type="text" class="form-input" readonly/>
            <p class="form-hint">*Nama Organisasi yang sudah terdaftar tidak bisa diubah.</p>
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
              :readonly="!isEditing"
            ></textarea>
            <p class="char-count">{{ charCount }} / 500</p>
          </div>

          <div class="form-group">
            <label class="form-label">Alamat Email <span class="optional">(Admin)</span></label>
            <input v-model="form.email" type="email" class="form-input" readonly placeholder="Belum ada admin"/>
            <p class="form-hint">*Menggunakan email Admin Organisasi</p>
          </div>

          <div class="form-group">
            <label class="form-label">Nomor Telepon <span class="optional">(Admin)</span></label>
            <input v-model="form.telepon" type="tel" class="form-input" readonly placeholder="Belum ada admin"/>
            <p class="form-hint">*Menggunakan nomor telepon Admin Organisasi</p>
          </div>

          <div class="form-group">
            <label class="form-label">Lokasi<span class="required">*</span></label>
            <input v-model="form.lokasi" type="text" class="form-input" placeholder="Alamat lokasi" :readonly="!isEditing"/>
          </div>
        </div>

        <!-- Right column -->
        <div class="org-right">
          <div class="form-group">
            <label class="form-label">Logo <span class="optional">(Opsional)</span></label>
            <div
              class="logo-upload"
              :class="{ 'readonly-upload': !isEditing }"
              @drop="handleLogoDrop"
              @dragover.prevent
              @click="isEditing ? $refs.logoInput.click() : null"
            >
              <img v-if="logoPreview" :src="logoPreview" alt="Logo preview" class="logo-preview"/>
              <template v-else>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.5">
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
                <p class="upload-title">Unggah Logo</p>
                <p class="upload-hint">Format .png, .jpg, .jpeg. Maksimal 2 MB.</p>
              </template>
              <input ref="logoInput" type="file" accept="image/*" style="display:none" @change="e => previewLogo(e.target.files[0])"/>
            </div>
          </div>

          <div class="save-row" v-if="isEditing">
            <button class="btn-text" @click="isEditing = false">Batal</button>
            <button id="org-save-btn" class="btn-primary" @click="handleSave" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Menyimpan...' : 'Perbarui' }}
            </button>
          </div>
          
          <Transition name="fade">
            <div v-if="saved" class="saved-msg" style="justify-content: flex-end;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Profil diperbarui!
            </div>
          </Transition>
        </div>
      </div>

      <!-- Members Section -->
      <div class="members-section">
        <div class="members-head">
          <h3 class="section-title">Anggota Organisasi</h3>
          <button class="btn-primary" @click="showAddMemberModal = true">Tambah Anggota Lokal</button>
        </div>

        <div class="search-bar">
          <div class="search-input-group">
            <input 
              v-model="searchMemberQuery" 
              type="text" 
              class="form-input" 
              placeholder="Cari & undang anggota..." 
              @keyup.enter="handleSearchMembers" 
            />
            <button class="btn-primary" @click="handleSearchMembers" :disabled="searching">
              <span v-if="searching" class="spinner"></span>
              {{ searching ? 'Mencari...' : 'Cari' }}
            </button>
          </div>
        </div>

        <!-- Search Results (Hasil Pencarian Global) -->
        <div v-if="searchResults.length > 0" class="search-results-box">
          <h4 class="sub-title">Hasil Pencarian (Global)</h4>
          <div class="members-list">
            <div v-for="u in searchResults" :key="u.id" class="member-card">
              <div class="member-info">
                <div class="member-name">{{ u.name || u.username }}</div>
                <div class="member-email">{{ u.email }}</div>
              </div>
              <button class="btn-secondary btn-sm" @click="handleInvite(u)">Undang</button>
            </div>
          </div>
        </div>

        <!-- Existing Members -->
        <h4 class="sub-title" style="margin-top: 16px;">Daftar Anggota Saat Ini</h4>
        <div class="members-list">
          <div v-if="members.length === 0" class="empty-members">Belum ada anggota.</div>
          <div v-for="m in members" :key="m.id" class="member-card">
            <div class="member-info">
              <div class="member-name">{{ m.name || m.username }}</div>
              <div class="member-email">{{ m.email }}</div>
            </div>
            <div class="member-role-select">
              <select v-model="m.role" @change="handleChangeRole(m)" class="role-dropdown">
                <option value="Admin">Admin</option>
                <option value="Operator">Operator</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <Transition name="modal">
        <div v-if="showSuccessModal" class="modal-overlay" @click.self="showSuccessModal = false">
          <div class="modal-box text-center">
            <div class="success-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3>Berhasil!</h3>
            <p style="color: var(--color-text-muted); font-size: 14px;">Profil organisasi telah berhasil diperbarui.</p>
            <div class="modal-actions" style="justify-content: center; margin-top: 8px;">
              <button class="btn-primary" @click="showSuccessModal = false">Oke</button>
            </div>
          </div>
        </div>
      </Transition>

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
.top-row { display: flex; justify-content: space-between; align-items: center; }
.section-head { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--color-text); }
.sub-title { font-size: 14px; font-weight: 700; color: var(--color-text); margin-bottom: 8px; }

.back-btn {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none; color: var(--color-primary);
  font-size: 14px; font-weight: 600; cursor: pointer;
  padding: 0; width: fit-content;
}

.btn-danger-outline {
  padding: 8px 16px; background: white; color: var(--color-danger);
  border: 1.5px solid var(--color-danger); border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition);
  display: flex; align-items: center; gap: 6px;
}
.btn-danger-outline:hover { background: var(--color-danger); color: white; }

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
.form-input:disabled { background: #f1f5f9; cursor: not-allowed; color: var(--color-text-muted); }

.textarea { resize: vertical; min-height: 120px; }

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
.logo-upload:hover:not(.readonly-upload) { border-color: var(--color-primary); background: #eef4ff; }
.logo-upload.readonly-upload { cursor: not-allowed; opacity: 0.8; }
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
  margin-top: 8px;
}
.btn-primary {
  padding: 10px 28px; background: var(--color-primary); color: white;
  border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 8px;
}
.btn-primary:hover { background: var(--color-primary-dark); }

.btn-secondary {
  padding: 8px 16px; background: white; color: var(--color-primary);
  border: 1.5px solid var(--color-primary); border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition);
  display: flex; align-items: center; gap: 6px;
}
.btn-secondary:hover { background: var(--color-primary); color: white; }
.btn-sm { padding: 4px 8px; font-size: 12px; }

.btn-text { padding: 10px 16px; background: none; border: none; font-size: 14px; font-weight: 600; color: var(--color-text-muted); cursor: pointer; }

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
.search-input-group { display: flex; gap: 8px; }
.search-input-group .form-input { flex: 1; }
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

.search-results-box {
  background: #f8fafc;
  padding: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  margin-bottom: 16px;
}

.role-dropdown {
  padding: 4px 8px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text);
  background: white;
  cursor: pointer;
  outline: none;
}
.role-dropdown:focus {
  border-color: var(--color-primary);
}

/* Modal styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; padding: 24px; border-radius: var(--radius-md); width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
.text-center { text-align: center; }
.success-icon-wrap { width: 56px; height: 56px; background: #e6f4ea; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto; }

.modal-head h3 { font-size: 16px; font-weight: 700; color: var(--color-text); }
.modal-form { display: flex; flex-direction: column; gap: 12px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s, transform 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

.spinner {
  width: 14px; height: 14px;
  border: 2px solid white; border-top-color: transparent;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .org-grid { grid-template-columns: 1fr; }
  .org-right { order: -1; }
}
@media (max-width: 600px) {
  .section-head { flex-direction: column; align-items: flex-start; gap: 10px; }
  .btn-secondary { width: 100%; justify-content: center; }
  .save-row { justify-content: stretch; }
  .btn-primary { width: 100%; justify-content: center; }
}
</style>

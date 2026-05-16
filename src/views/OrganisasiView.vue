<script setup>
import { getOrganizationsList, getOrganizationProfile, proposeOrganization, unwrapApiList } from '@/services/api.js'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const proposedName = ref('')
const organizations = ref([])
const loading = ref(false)
const error = ref('')
const showWaitingModal = ref(false)

async function loadOrgs() {
  loading.value = true
  error.value = ''
  try {
    const data = await getOrganizationsList()
    const list = unwrapApiList(data)
    
    // Fetch profiles to get the organization picture if it's not included in the list response
    const detailedList = await Promise.all(list.map(async (org) => {
      if (org.organization_picture || org.logo_url || org.logo || org.picture || org.image) return org;
      try {
        const profileData = await getOrganizationProfile(org.id || org._id);
        const profile = profileData?.data || profileData;
        return { ...org, ...profile };
      } catch (e) {
        return org;
      }
    }));
    
    organizations.value = detailedList
  } catch (err) {
    error.value = err?.message || 'Gagal memuat daftar organisasi.'
  } finally {
    loading.value = false
  }
}

async function handlePropose() {
  if (!proposedName.value) return
  error.value = ''
  try {
    await proposeOrganization({ name: proposedName.value })
    showWaitingModal.value = true
    proposedName.value = ''
    // Refresh list (it might not show pending ones depending on backend, but good to refresh)
    await loadOrgs()
  } catch (err) {
    error.value = err?.message || 'Gagal mengajukan organisasi.'
  }
}

onMounted(loadOrgs)
</script>

<template>
  <AppLayout page-title="Organisasi">
    <div class="org-page">
      <h2 class="section-title">Ajukan Organisasi Baru</h2>
      
      <div v-if="error" class="form-error">{{ error }}</div>

      <div class="org-box-empty">
        <p>Silakan masukkan nama organisasi Anda di bawah ini untuk mengajukan pendaftaran.</p>
        <div class="propose-form">
          <input v-model="proposedName" type="text" class="form-input" placeholder="Nama Organisasi Baru" required />
          <button class="btn-primary" @click="handlePropose">Ajukan</button>
        </div>
      </div>

      <div class="org-list-section">
        <h3 class="section-title">Daftar Organisasi</h3>
        <div v-if="loading" class="loading-text">Memuat...</div>
        <div v-else-if="organizations.length === 0" class="empty-list">Belum ada organisasi yang terdaftar.</div>
        <div v-else class="org-grid-list">
          <div v-for="org in organizations" :key="org.id" class="org-card" @click="router.push({ path: '/organisasi/' + org.id, query: { name: org.name || org.nama } })">

            <div class="org-card-content">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img v-if="org.organization_picture || org.logo_url || org.logo || org.picture || org.image || org.profile_picture" :src="org.organization_picture || org.logo_url || org.logo || org.picture || org.image || org.profile_picture" alt="Logo" class="org-logo" />
                  <div v-else class="org-logo-placeholder">
                    {{ (org.name || org.nama || 'O')[0].toUpperCase() }}
                  </div>
                  <div class="org-name">{{ org.name || org.nama }}</div>
                </div>
                <div v-if="org.is_verified || org.isVerified || org.verified || ['verified', 'active', 'approved'].includes(String(org.status || org.verification_status || '').toLowerCase())" class="badge-verified">Terverifikasi</div>
                <div v-else class="badge-unverified">Belum Terverifikasi</div>
              </div>
              <div class="org-meta">{{ org.description || 'Tidak ada deskripsi' }}</div>
            </div>
            <div class="org-card-action">
              <span>Detail & Anggota</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Waiting Modal -->
      <Transition name="modal">
        <div v-if="showWaitingModal" class="modal-overlay" @click.self="showWaitingModal = false">
          <div class="modal-box">
            <div class="modal-head">
              <h3 style="color: #e67e22;">Menunggu Validasi Admin</h3>
            </div>
            <div class="modal-body" style="margin-top: 10px; color: var(--color-text-muted); font-size: 14px; line-height: 1.6;">
              <p>Pengajuan organisasi Anda telah berhasil dikirim. Silakan tunggu validasi dari superadmin agar organisasi Anda muncul di daftar.</p>
            </div>
            <div class="modal-actions">
              <button class="btn-primary" @click="showWaitingModal = false">Tutup</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<style scoped>
.org-page { display: flex; flex-direction: column; gap: 24px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--color-text); }

.org-box-empty {
  background: white;
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.org-box-empty p { color: var(--color-text-muted); font-size: 14px; }
.propose-form { display: flex; gap: 12px; }

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

.btn-primary {
  padding: 10px 24px; background: var(--color-primary); color: white;
  border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 700;
  cursor: pointer; transition: var(--transition); display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
}
.btn-primary:hover { background: var(--color-primary-dark); }

.form-error {
  padding: 10px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-danger);
}

/* Org List */
.org-list-section { margin-top: 16px; display: flex; flex-direction: column; gap: 16px; }
.empty-list, .loading-text { text-align: center; color: var(--color-text-muted); padding: 40px; background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); }

.org-grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.org-card {
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  transition: var(--transition);
}
.org-card:hover { border-color: var(--color-primary); transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

.org-name { font-size: 16px; font-weight: 700; color: var(--color-text); }
.org-meta { font-size: 13px; color: var(--color-text-muted); line-height: 1.4; margin-top: 8px; }

.org-logo { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--color-border); }
.org-logo-placeholder { width: 36px; height: 36px; border-radius: 50%; background: #eef4ff; color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; border: 1px solid var(--color-border); }

.badge-verified {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  background: #def7ec;
  color: #03543f;
  border-radius: 12px;
}

.badge-unverified {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  background: #fef08a;
  color: #713f12;
  border-radius: 12px;
}

.org-card-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}

/* Modal styles */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-box { background: white; padding: 24px; border-radius: var(--radius-md); width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; }
.modal-head h3 { font-size: 16px; font-weight: 700; color: var(--color-text); }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.3s, transform 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95); }

@media (max-width: 600px) {
  .propose-form { flex-direction: column; }
  .org-grid-list { grid-template-columns: 1fr; }
}
</style>

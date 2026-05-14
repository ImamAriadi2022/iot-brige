<script setup>
import {
    createLocalMember,
    deleteMember,
    ensureOrganizationId,
    getOrganizationMembers,
    memberInvitation,
    searchUsers,
    unwrapApiList,
} from '@/services/api.js'
import { onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const showInviteModal = ref(false)
const selectedUser = ref(null)

const users = ref([])
const loading = ref(false)
const error = ref('')
const organizationId = ref(null)

const newUser = ref({ username: '', password: '' })
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)



function openDelete(user) {
  selectedUser.value = user
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!organizationId.value) return
  try {
    await deleteMember(organizationId.value, selectedUser.value.id)
    users.value = users.value.filter(u => u.id !== selectedUser.value.id)
  } catch (err) {
    error.value = err?.message || 'Gagal menghapus pengguna.'
  } finally {
    showDeleteModal.value = false
  }
}

async function addUser() {
  if (!newUser.value.username || !newUser.value.password) return
  if (!organizationId.value) {
    error.value = 'Organisasi belum tersedia.'
    return
  }
  try {
    await createLocalMember(organizationId.value, {
      username: newUser.value.username,
      password: newUser.value.password,
    })
    newUser.value = { username: '', password: '' }
    showAddModal.value = false
    await loadMembers()
  } catch (err) {
    error.value = err?.message || 'Gagal menambahkan pengguna.'
  }
}


function mapMember(u) {
  return {
    id: u?.id || u?.user_id || u?.userId || u?._id,
    nama: u?.name || u?.nama || u?.username || 'Pengguna',
    phone: u?.phone_number || u?.phone || '-',
    email: u?.email || '-',
    peran: u?.role || u?.peran || 'Operator',
  }
}

async function loadMembers() {
  loading.value = true
  error.value = ''
  try {
    organizationId.value = await ensureOrganizationId()
    if (!organizationId.value) {
      error.value = 'Organisasi belum tersedia untuk akun ini.'
      users.value = []
      return
    }
    const data = await getOrganizationMembers(organizationId.value)
    const list = unwrapApiList(data)
    users.value = list.map(mapMember).filter(u => u.id)
  } catch (err) {
    error.value = err?.message || 'Gagal memuat daftar pengguna.'
  } finally {
    loading.value = false
  }
}

async function handleSearchUsers() {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  searchLoading.value = true
  try {
    const data = await searchUsers({ q: searchQuery.value })
    const list = unwrapApiList(data)
    searchResults.value = list.map(u => ({
      id: u.id || u.user_id || u._id,
      name: u.name || u.username || 'Pengguna',
      username: u.username,
    }))
  } catch (err) {
    console.error('Failed to search users:', err)
  } finally {
    searchLoading.value = false
  }
}

async function inviteUser(userId) {
  if (!organizationId.value) return
  try {
    await memberInvitation(organizationId.value, { user_id: userId })
    alert('Undangan berhasil dikirim!')
    showInviteModal.value = false
    searchQuery.value = ''
    searchResults.value = []
  } catch (err) {
    alert(err?.message || 'Gagal mengirim undangan.')
  }
}

onMounted(loadMembers)

</script>

<template>
  <AppLayout page-title="Pokdakan Bintang Rosela Jaya">
    <div class="section-header">
      <h2 class="section-title">Daftar Pengguna</h2>
      <div class="header-actions">
        <button class="btn-outline" @click="showInviteModal = true">
          Undang Pengguna
        </button>
        <button id="add-user-btn" class="btn-accent" @click="showAddModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah Pengguna Baru
        </button>
      </div>
    </div>


    <div v-if="error" class="table-error">{{ error }}</div>
    <div v-else-if="loading" class="table-error">Memuat pengguna...</div>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Nomor Handphone</th>
            <th>Email</th>
            <th>Peran</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, idx) in users" :key="user.id">
            <td class="td-num">{{ idx + 1 }}.</td>
            <td class="td-bold">{{ user.nama }}</td>
            <td class="td-bold">{{ user.phone }}</td>
            <td class="td-email">{{ user.email }}</td>
            <td class="td-bold">{{ user.peran }}</td>
            <td class="td-actions">
              <button class="action-btn danger" @click="openDelete(user)" :title="`Hapus ${user.nama}`">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="6" class="td-empty">Belum ada pengguna.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add User Modal -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-box">
          <div class="modal-head">
            <h3>Tambah Pengguna Baru</h3>
            <button class="modal-close-x" @click="showAddModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="addUser" class="modal-form">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input v-model="newUser.username" type="text" class="form-input" placeholder="Username" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input v-model="newUser.password" type="password" class="form-input" placeholder="Password" required/>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="showAddModal = false">Batal</button>
              <button type="submit" class="btn-primary">Tambah</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirm Modal -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-box confirm-box">
          <button class="modal-close-accent" @click="showDeleteModal = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <p class="confirm-text">Hapus pengguna <strong>{{ selectedUser?.nama }}</strong>?</p>
          <div class="modal-actions center">
            <button class="btn-cancel-orange" @click="showDeleteModal = false">Batal</button>
            <button class="btn-confirm-dark" @click="confirmDelete">Hapus</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Invite Modal -->
    <Transition name="modal">
      <div v-if="showInviteModal" class="modal-overlay" @click.self="showInviteModal = false">
        <div class="modal-box">
          <div class="modal-head">
            <h3>Undang Pengguna</h3>
            <button class="modal-close-x" @click="showInviteModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label">Cari Pengguna</label>
              <div class="search-input-wrap">
                <input v-model="searchQuery" type="text" class="form-input" placeholder="Username atau nama..." @input="handleSearchUsers"/>
                <span v-if="searchLoading" class="search-loading">Mencari...</span>
              </div>
            </div>

            <div v-if="searchResults.length > 0" class="search-results">
              <div v-for="u in searchResults" :key="u.id" class="search-item">
                <div class="search-item-info">
                  <div class="search-item-name">{{ u.name }}</div>
                  <div class="search-item-username">@{{ u.username }}</div>
                </div>
                <button class="btn-primary btn-sm" @click="inviteUser(u.id)">Undang</button>
              </div>
            </div>
            <div v-else-if="searchQuery && !searchLoading" class="notif-empty">Tidak ada pengguna ditemukan.</div>

            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="showInviteModal = false">Batal</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </AppLayout>
</template>


<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.btn-accent {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.btn-accent:hover { background: var(--color-primary-dark); }

.table-wrap {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  overflow-x: auto;
}
.table-error {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 16px;
  color: var(--color-text-muted);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}
.data-table thead tr {
  background: var(--color-primary);
}
.data-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-text);
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f8fafc; }
.td-num { color: var(--color-text-muted); font-weight: 600; width: 48px; }
.td-bold { font-weight: 700; }
.td-email { color: var(--color-primary); font-weight: 600; }
.td-actions { width: 60px; }
.action-btn {
  width: 32px; height: 32px;
  border-radius: 6px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.action-btn.danger { background: #fef2f2; color: var(--color-danger); }
.action-btn.danger:hover { background: var(--color-danger); color: white; }
.td-empty { text-align: center; color: var(--color-text-muted); padding: 32px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 300; padding: 16px;
}
.modal-box {
  background: white; border-radius: var(--radius-lg);
  padding: 28px; max-width: 440px; width: 100%; position: relative;
  box-shadow: var(--shadow-lg);
}
.confirm-box { text-align: center; padding: 48px 32px 36px; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.modal-head h3 { font-size: 17px; font-weight: 700; color: var(--color-text); }
.modal-close-x {
  width: 30px; height: 30px; border: none; background: #f1f5f9;
  border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: var(--color-text); transition: var(--transition);
}
.modal-close-x:hover { background: var(--color-border); }
.modal-close-accent {
  position: absolute; top: 12px; right: 12px;
  width: 30px; height: 30px; border: none;
  background: var(--color-accent); color: white;
  border-radius: 6px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
}
.modal-close-accent:hover { background: var(--color-accent-hover); }
.confirm-text { font-size: 17px; font-weight: 700; color: var(--color-text); margin-bottom: 28px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.search-input-wrap { position: relative; }
.search-loading { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--color-text-light); }
.search-results { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 8px; }
.search-item { display: flex; align-items: center; justify-content: space-between; padding: 8px; border-bottom: 1px solid #f1f5f9; }
.search-item:last-child { border-bottom: none; }
.search-item-info { display: flex; flex-direction: column; }
.search-item-name { font-size: 14px; font-weight: 600; color: var(--color-text); }
.search-item-username { font-size: 12px; color: var(--color-text-light); }
.btn-sm { padding: 4px 12px; font-size: 12px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--color-text); }
.form-input {
  padding: 10px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  transition: var(--transition); background: #f8fafc; color: var(--color-text);
}
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.modal-actions { display: flex; gap: 12px; margin-top: 4px; }
.modal-actions.center { justify-content: center; }
.btn-primary { flex: 1; padding: 10px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; cursor: pointer; transition: var(--transition); }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-outline { flex: 1; padding: 10px; background: white; color: var(--color-text); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-weight: 600; cursor: pointer; transition: var(--transition); }
.btn-outline:hover { background: var(--color-bg); }
.btn-cancel-orange { padding: 11px 32px; background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 15px; cursor: pointer; transition: var(--transition); }
.btn-cancel-orange:hover { background: var(--color-accent-hover); }
.btn-confirm-dark { padding: 11px 32px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 15px; cursor: pointer; transition: var(--transition); }
.btn-confirm-dark:hover { background: var(--color-primary-dark); }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92); }

@media (max-width: 600px) {
  .section-header { flex-direction: column; align-items: flex-start; }
  .btn-accent { width: 100%; justify-content: center; }
}
</style>

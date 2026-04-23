<script setup>
import { ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const showAddModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)

const users = ref([
  { id: 1, nama: 'Mufita', phone: '0895353304313', email: 'mufita.fergams@gmail.com', peran: 'Admin Organisasi' },
  { id: 2, nama: 'Adil', phone: '0895353304313', email: 'adil@gmail.com', peran: 'Operator' },
  { id: 3, nama: 'Juni', phone: '0895353304313', email: 'pakjuni@gmail.com', peran: 'Viewers' },
])

const newUser = ref({ nama: '', phone: '', email: '', peran: 'Operator' })
const peranOptions = ['Admin Organisasi', 'Operator', 'Viewers']

function openDelete(user) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function confirmDelete() {
  users.value = users.value.filter(u => u.id !== selectedUser.value.id)
  showDeleteModal.value = false
}

function addUser() {
  if (!newUser.value.nama || !newUser.value.email) return
  users.value.push({
    id: Date.now(),
    ...newUser.value
  })
  newUser.value = { nama: '', phone: '', email: '', peran: 'Operator' }
  showAddModal.value = false
}
</script>

<template>
  <AppLayout page-title="Pokdakan Bintang Rosela Jaya">
    <div class="section-header">
      <h2 class="section-title">Daftar Pengguna</h2>
      <button id="add-user-btn" class="btn-accent" @click="showAddModal = true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Tambah Pengguna Baru
      </button>
    </div>

    <div class="table-wrap">
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
              <label class="form-label">Nama</label>
              <input v-model="newUser.nama" type="text" class="form-input" placeholder="Nama pengguna" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input v-model="newUser.email" type="email" class="form-input" placeholder="Alamat email" required/>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Handphone</label>
              <input v-model="newUser.phone" type="tel" class="form-input" placeholder="Nomor handphone"/>
            </div>
            <div class="form-group">
              <label class="form-label">Peran</label>
              <select v-model="newUser.peran" class="form-input">
                <option v-for="p in peranOptions" :key="p" :value="p">{{ p }}</option>
              </select>
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
  </AppLayout>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
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

<script setup>
import { ref, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'

// ── State ──────────────────────────────────────────────
const search = ref('')
const activeFilter = ref('semua')
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const selectedDevice = ref(null)
const selectAll = ref(false)
const selectedIds = ref([])

const perangkat = ref([
  {
    id: 1,
    nama: 'Hydro Monitor',
    token: 'sSKK2ew5qDafsn-LN52l1Wn0EpLlf7ZD',
    pemilik: 'hydro.monitor21@gmail.com',
    status: 'Offline',
    laporan: '3:57 PM Jan 10, 2025',
    mine: false,
  },
  {
    id: 2,
    nama: 'Kolam A – RAS',
    token: 'KsxKvWYo0nrQIpMyOxMxM2Tf0TyBQjhY',
    pemilik: 'hydro.monitor21@gmail.com',
    status: 'Online',
    laporan: '5:20 PM Nov 17, 2024',
    mine: true,
  },
  {
    id: 3,
    nama: 'Kolam B – RAS',
    token: 'sSKK2ew5qDafsn-LN52l1Wn0EpLlf7ZD',
    pemilik: 'hydro.monitor21@gmail.com',
    status: 'Offline',
    laporan: '3:57 PM Jan 10, 2025',
    mine: true,
  },
  {
    id: 4,
    nama: 'Kolam C – NON RAS',
    token: 'sSKK2ew5qDafsn-LN52l1Wn0EpLlf7ZD',
    pemilik: 'hydro.monitor21@gmail.com',
    status: 'Inactive',
    laporan: '3:57 PM Jan 10, 2025',
    mine: true,
  },
  {
    id: 5,
    nama: 'Kolam D – NON RAS',
    token: 'sSKK2ew5qDafsn-LN52l1Wn0EpLlf7ZD',
    pemilik: 'hydro.monitor21@gmail.com',
    status: 'Offline',
    laporan: '3:57 PM Jan 10, 2025',
    mine: false,
  },
  {
    id: 6,
    nama: 'Hydro Monitor',
    token: 'sSKK2ew5qDafsn-LN52l1Wn0EpLlf7ZD',
    pemilik: 'hydro.monitor21@gmail.com',
    status: 'Offline',
    laporan: '3:57 PM Jan 10, 2025',
    mine: false,
  },
])

const newDevice = ref({ nama: '', token: '', pemilik: '', status: 'Offline' })
const statusOptions = ['Online', 'Offline', 'Inactive']

// ── Computed ────────────────────────────────────────────
const filtered = computed(() => {
  let list = perangkat.value
  if (activeFilter.value === 'saya') list = list.filter(d => d.mine)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(d =>
      d.nama.toLowerCase().includes(q) ||
      d.pemilik.toLowerCase().includes(q) ||
      d.token.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Actions ─────────────────────────────────────────────
function toggleSelectAll() {
  if (selectAll.value) {
    selectedIds.value = filtered.value.map(d => d.id)
  } else {
    selectedIds.value = []
  }
}

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  } else {
    selectedIds.value.push(id)
  }
  selectAll.value = selectedIds.value.length === filtered.value.length
}

function openDelete(device) {
  selectedDevice.value = device
  showDeleteModal.value = true
}

function confirmDelete() {
  perangkat.value = perangkat.value.filter(d => d.id !== selectedDevice.value.id)
  showDeleteModal.value = false
}

function addDevice() {
  if (!newDevice.value.nama || !newDevice.value.pemilik) return
  perangkat.value.push({
    id: Date.now(),
    ...newDevice.value,
    token: newDevice.value.token || generateToken(),
    laporan: '–',
    mine: true,
  })
  newDevice.value = { nama: '', token: '', pemilik: '', status: 'Offline' }
  showAddModal.value = false
}

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function copyToken(token) {
  navigator.clipboard?.writeText(token)
}

function statusClass(status) {
  if (status === 'Online') return 'status-online'
  if (status === 'Inactive') return 'status-inactive'
  return 'status-offline'
}
</script>

<template>
  <AppLayout page-title="Pokdakan Bintang Rosela Jaya">

    <!-- ── Page Header ── -->
    <div class="page-header">
      <h2 class="page-title">Perangkat</h2>
    </div>

    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          v-model="search"
          class="search-input"
          type="text"
          placeholder="Cari Perangkat"
          id="device-search"
        />
      </div>

      <button id="add-device-btn" class="btn-add" @click="showAddModal = true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Tambahkan Perangkat
      </button>
    </div>

    <!-- ── Filter Tabs ── -->
    <div class="filter-tabs">
      <button
        class="filter-tab"
        :class="{ active: activeFilter === 'semua' }"
        @click="activeFilter = 'semua'"
      >
        Semua
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      <button
        class="filter-tab"
        :class="{ active: activeFilter === 'saya' }"
        @click="activeFilter = 'saya'"
      >
        Perangkat saya
      </button>
    </div>

    <!-- ── Table ── -->
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th class="th-check">
              <input
                type="checkbox"
                v-model="selectAll"
                @change="toggleSelectAll"
                class="check-input"
              />
            </th>
            <th>Nama</th>
            <th>Auth Token</th>
            <th>Pemilik Perangkat</th>
            <th>Status</th>
            <th>Laporan Terakhir</th>
            <th class="th-aksi">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="d in filtered"
            :key="d.id"
            :class="{ 'row-selected': selectedIds.includes(d.id) }"
          >
            <td class="td-check">
              <input
                type="checkbox"
                :checked="selectedIds.includes(d.id)"
                @change="toggleSelect(d.id)"
                class="check-input"
              />
            </td>
            <td class="td-nama">{{ d.nama }}</td>
            <td class="td-token">
              <span class="token-text" :title="d.token">{{ d.token }}</span>
              <button class="copy-btn" @click="copyToken(d.token)" title="Salin token">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
            </td>
            <td class="td-email">{{ d.pemilik }}</td>
            <td>
              <span class="status-badge" :class="statusClass(d.status)">
                <span class="status-dot"></span>
                {{ d.status }}
              </span>
            </td>
            <td class="td-laporan">{{ d.laporan }}</td>
            <td class="td-aksi">
              <button class="action-btn danger" @click="openDelete(d)" :title="`Hapus ${d.nama}`">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="td-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
              <p>Belum ada perangkat ditemukan.</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── Add Device Modal ── -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-box">
          <div class="modal-head">
            <h3>Tambahkan Perangkat</h3>
            <button class="modal-close-x" @click="showAddModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form @submit.prevent="addDevice" class="modal-form">
            <div class="form-group">
              <label class="form-label">Nama Perangkat <span class="required">*</span></label>
              <input v-model="newDevice.nama" type="text" class="form-input" placeholder="Contoh: Kolam A – RAS" required />
            </div>
            <div class="form-group">
              <label class="form-label">Pemilik (Email) <span class="required">*</span></label>
              <input v-model="newDevice.pemilik" type="email" class="form-input" placeholder="email@contoh.com" required />
            </div>
            <div class="form-group">
              <label class="form-label">Auth Token <span class="hint">(kosongkan untuk generate otomatis)</span></label>
              <input v-model="newDevice.token" type="text" class="form-input" placeholder="Token akan digenerate otomatis" />
            </div>
            <div class="form-group">
              <label class="form-label">Status Awal</label>
              <select v-model="newDevice.status" class="form-input">
                <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="showAddModal = false">Batal</button>
              <button type="submit" class="btn-primary">Tambahkan</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- ── Delete Confirm Modal ── -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-box confirm-box">
          <button class="modal-close-accent" @click="showDeleteModal = false">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <div class="confirm-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <p class="confirm-text">Hapus perangkat <strong>{{ selectedDevice?.nama }}</strong>?</p>
          <p class="confirm-sub">Tindakan ini tidak dapat dibatalkan.</p>
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
/* ── Header ── */
.page-header {
  margin-bottom: 16px;
}
.page-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 320px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}
.search-input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  background: white;
  color: var(--color-text);
  outline: none;
  transition: var(--transition);
}
.search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.search-input::placeholder { color: var(--color-text-muted); }

.btn-add {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}
.btn-add:hover {
  background: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(232,107,26,0.3);
}

/* ── Filter Tabs ── */
.filter-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.filter-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-border);
  background: white;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.filter-tab.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}
.filter-tab:hover:not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* ── Table ── */
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
  min-width: 700px;
}
.data-table thead tr {
  background: var(--color-bg);
  border-bottom: 1.5px solid var(--color-border);
}
.data-table th {
  padding: 13px 16px;
  text-align: left;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-muted);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-text);
  vertical-align: middle;
}
.data-table tbody tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: #f8fafc; }
.data-table tbody tr.row-selected { background: #eef3ff; }

.th-check, .td-check { width: 44px; }
.th-aksi, .td-aksi { width: 56px; text-align: center; }
.check-input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.td-nama { font-weight: 700; color: var(--color-primary); }
.td-token {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 240px;
}
.token-text {
  font-size: 12px;
  color: var(--color-text-muted);
  font-family: monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}
.copy-btn {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: none;
  background: var(--color-bg);
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: var(--transition);
}
.copy-btn:hover { background: var(--color-border); color: var(--color-primary); }

.td-email { color: var(--color-primary); font-size: 12.5px; }
.td-laporan { font-size: 12px; color: var(--color-text-muted); white-space: nowrap; }

/* ── Status Badge ── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-online {
  background: #dcfce7;
  color: #15803d;
}
.status-online .status-dot { background: #22c55e; }

.status-offline {
  background: #f1f5f9;
  color: var(--color-text-muted);
}
.status-offline .status-dot { background: #94a3b8; }

.status-inactive {
  background: #fef9c3;
  color: #92400e;
}
.status-inactive .status-dot { background: #f59e0b; }

/* ── Empty state ── */
.td-empty {
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
}
.td-empty p { margin-top: 12px; font-size: 14px; }

/* ── Action buttons ── */
.action-btn {
  width: 32px; height: 32px;
  border-radius: 6px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: var(--transition);
  margin: 0 auto;
}
.action-btn.danger { background: #fef2f2; color: var(--color-danger); }
.action-btn.danger:hover { background: var(--color-danger); color: white; }

/* ── Modal ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 16px;
}
.modal-box {
  background: white; border-radius: var(--radius-lg);
  padding: 28px; max-width: 460px; width: 100%; position: relative;
  box-shadow: var(--shadow-lg);
}
.confirm-box { text-align: center; padding: 48px 32px 36px; }
.modal-head {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;
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
.confirm-icon { color: var(--color-danger); margin-bottom: 12px; }
.confirm-text { font-size: 17px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.confirm-sub { font-size: 13px; color: var(--color-text-muted); margin-bottom: 24px; }
.modal-form { display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--color-text); }
.required { color: var(--color-danger); }
.hint { font-weight: 400; color: var(--color-text-muted); font-size: 11.5px; }
.form-input {
  padding: 10px 14px; border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm); font-size: 14px; outline: none;
  transition: var(--transition); background: #f8fafc; color: var(--color-text);
}
.form-input:focus { border-color: var(--color-primary); background: white; box-shadow: 0 0 0 3px rgba(30,58,95,0.08); }
.modal-actions { display: flex; gap: 12px; margin-top: 6px; }
.modal-actions.center { justify-content: center; }
.btn-primary { flex: 1; padding: 11px; background: var(--color-primary); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 14px; cursor: pointer; transition: var(--transition); }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-outline { flex: 1; padding: 11px; background: white; color: var(--color-text); border: 1.5px solid var(--color-border); border-radius: var(--radius-sm); font-weight: 600; font-size: 14px; cursor: pointer; transition: var(--transition); }
.btn-outline:hover { background: var(--color-bg); }
.btn-cancel-orange { padding: 11px 32px; background: var(--color-accent); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 15px; cursor: pointer; transition: var(--transition); }
.btn-cancel-orange:hover { background: var(--color-accent-hover); }
.btn-confirm-dark { padding: 11px 32px; background: var(--color-danger); color: white; border: none; border-radius: var(--radius-sm); font-weight: 700; font-size: 15px; cursor: pointer; transition: var(--transition); }
.btn-confirm-dark:hover { background: #dc2626; }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.93) translateY(12px); }

/* ── Responsive ── */
@media (max-width: 600px) {
  .toolbar { flex-direction: column; align-items: stretch; }
  .search-wrap { max-width: 100%; }
  .btn-add { justify-content: center; }
}
</style>

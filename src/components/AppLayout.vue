<script setup>
import { clearSession, getNotifications, deleteAllNotifications, deleteNotificationById, memberInvitationResponse, getOrganizationsList, unwrapApiList } from '@/services/api.js'
import { getNotificationMode, isLocalNotificationEnabled, showBrowserNotification } from '@/utils/notifications.js'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'

const props = defineProps({
  pageTitle: { type: String, default: 'Dashboard' }
})

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const sidebarMini = ref(JSON.parse(localStorage.getItem('iot_bridge_sidebar_mini') || 'false'))

watch(sidebarMini, (val) => {
  localStorage.setItem('iot_bridge_sidebar_mini', JSON.stringify(val))
})
const userMenuOpen = ref(false)
const notifMenuOpen = ref(false)
const showLogoutModal = ref(false)
const globalNotifications = ref([])
const notifLoading = ref(false)
const notifError = ref('')

const user = computed(() => {
  const u = localStorage.getItem('iot_bridge_user')
  return u ? JSON.parse(u) : { id: 'guest', name: 'Pengguna', email: '' }
})

const notifSeenKey = computed(() => `iot_bridge_notif_seen_${user.value.id || 'guest'}`)
const notifReadKey = computed(() => `iot_bridge_notif_read_${user.value.id || 'guest'}`)

// notifSeenIds: dipakai untuk melacak notif yang sudah dikirim ke browser notification
const notifSeenIds = ref(new Set(JSON.parse(localStorage.getItem(notifSeenKey.value) || '[]')))
// notifReadIds: dipakai untuk melacak notif yang sudah "dibaca" user (badge hilang)
const notifReadIds = ref(new Set(JSON.parse(localStorage.getItem(notifReadKey.value) || '[]')))

// Jumlah notif yang belum dibaca (untuk badge)
const unreadCount = computed(() =>
  globalNotifications.value.filter(n => !notifReadIds.value.has(n.id)).length
)

let notifTimer = null

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Notifikasi', path: '/notifikasi', icon: 'notif' },
  { label: 'Perangkat', path: '/perangkat', icon: 'device' },
  { label: 'Organisasi', path: '/organisasi', icon: 'org' },
  { label: 'Pengaturan', path: '/pengaturan', icon: 'settings' },
]

function isActive(path) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path.startsWith('/dashboard/')
  return route.path.startsWith(path)
}

function toggleSidebar() {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = !sidebarOpen.value
  } else {
    sidebarMini.value = !sidebarMini.value
  }
}

function closeSidebar() {
  if (window.innerWidth <= 768) {
    sidebarOpen.value = false
  }
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function closeUserMenu() {
  userMenuOpen.value = false
}

function toggleNotifMenu() {
  notifMenuOpen.value = !notifMenuOpen.value
  if (notifMenuOpen.value) {
    if (globalNotifications.value.length === 0) {
      loadGlobalNotifications()
    }
    // Tandai semua notifikasi yang terlihat sebagai sudah dibaca → badge hilang
    markAllAsRead()
  }
}

function markAllAsRead() {
  const updatedSet = new Set(notifReadIds.value)
  globalNotifications.value.forEach(n => updatedSet.add(n.id))
  notifReadIds.value = updatedSet
  localStorage.setItem(notifReadKey.value, JSON.stringify(Array.from(notifReadIds.value)))
}

function closeNotifMenu() {
  notifMenuOpen.value = false
}

function confirmLogout() {
  showLogoutModal.value = true
  userMenuOpen.value = false
  notifMenuOpen.value = false
}

function logout() {
  clearSession()
  showLogoutModal.value = false
  router.replace('/masuk')
}

function handleOutsideClick(e) {
  if (!e.target.closest('.user-menu-wrap')) {
    userMenuOpen.value = false
  }
  if (!e.target.closest('.notif-menu-wrap')) {
    notifMenuOpen.value = false
  }
  if (window.innerWidth <= 768 && !e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
    sidebarOpen.value = false
  }
}

function mapGlobalNotification(item) {
  const mappedTitle = item?.title || item?.subject || item?.type || 'Notifikasi'
  const mappedMessage = item?.message || item?.detail || item?.description || '-'
  return {
    raw: item,
    id: item?.id || item?.notification_id || item?.notificationId || item?._id,
    title: mappedTitle,
    message: mappedMessage,
    time: item?.time || item?.created_at || item?.createdAt || '',
    organization_id: item?.organization_id || item?.organizationId || item?.data?.organization_id || item?.meta?.organization_id || null,
    is_invitation: !!(
      (item?.type === 'invitation' ||
       mappedMessage.toLowerCase().includes('undangan') ||
       mappedTitle.toLowerCase().includes('undangan') ||
       mappedTitle.toLowerCase().includes('invitation')) &&
      !mappedTitle.toLowerCase().includes('diterima') &&
      !mappedTitle.toLowerCase().includes('ditolak') &&
      !mappedMessage.toLowerCase().includes('diterima') &&
      !mappedMessage.toLowerCase().includes('ditolak')
    ),
  }
}

async function loadGlobalNotifications() {
  notifLoading.value = true
  notifError.value = ''
  try {
    const data = await getNotifications()
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.results) ? data.results : []
    const mapped = list.map(mapGlobalNotification).filter((item) => item.id)
    
    const mode = getNotificationMode()
    const localNotificationEnabled = mode === 'Aktif' && isLocalNotificationEnabled()
    
    // eslint-disable-next-line no-console
    console.log('[loadGlobalNotifications] Mode:', mode, 'LocalEnabled:', localNotificationEnabled, 'Count:', mapped.length)

    mapped.forEach((item) => {
      if (!notifSeenIds.value.has(item.id)) {
        // Notif baru: kirim browser notification (jika diaktifkan)
        notifSeenIds.value.add(item.id)
        if (localNotificationEnabled) {
          // eslint-disable-next-line no-console
          console.log('[loadGlobalNotifications] Showing Browser Notif:', item.title)
          showBrowserNotification(item.title, item.message)
        }
        // Notif baru belum masuk notifReadIds → akan muncul di badge
      }
    })
    
    // Simpan hanya notifSeenIds ke localStorage (bukan notifReadIds — itu diupdate saat dropdown dibuka)
    localStorage.setItem(notifSeenKey.value, JSON.stringify(Array.from(notifSeenIds.value)))

    globalNotifications.value = mapped

    // Jika dropdown sedang terbuka, langsung mark as read
    if (notifMenuOpen.value) {
      markAllAsRead()
    }

  } catch (err) {
    notifError.value = err?.message || 'Gagal memuat notifikasi.'
  } finally {
    notifLoading.value = false
  }
}

async function handleClearAll() {
  if (!confirm('Hapus semua notifikasi?')) return
  try {
    await deleteAllNotifications()
    await loadGlobalNotifications()
  } catch (err) {
    notifError.value = err?.message || 'Gagal menghapus semua notifikasi.'
  }
}

function findOrgIdRecursively(obj) {
  if (!obj || typeof obj !== 'object') return null
  
  // Direct matches
  const keys = ['organization_id', 'organizationId', 'org_id', 'orgId']
  for (const k of keys) {
    if (obj[k]) return String(obj[k])
  }
  
  // Search recursively
  for (const k in obj) {
    let child = obj[k]
    if (typeof child === 'string') {
      try { child = JSON.parse(child) } catch(e) {}
    }
    if (typeof child === 'object' && child) {
      const found = findOrgIdRecursively(child)
      if (found) return found
    }
  }
  return null
}

function extractOrgId(notif) {
  if (notif?.organization_id) return String(notif.organization_id)
  
  const raw = notif?.raw || {}
  const found = findOrgIdRecursively(raw)
  if (found) return found
  
  // Try extracting from 'type' string (e.g. "organization_member_invitation, id: 123-abc")
  const typeStr = notif?.type || raw?.type || ''
  const typeMatch = typeStr.match(/id:\s*([\w-]+)/i)
  if (typeMatch) return typeMatch[1]
  
  // Fallback regex on message
  const msgMatch = (notif?.message || '').match(/organization[_\s]?id[:\s]+([\w-]+)/i)
  if (msgMatch) return msgMatch[1]
  
  return null
}

async function resolveOrgId(notif) {
  // 1. Fast offline extraction
  const offlineId = extractOrgId(notif)
  if (offlineId) return offlineId

  // 2. Fallback: extract name from message and query API
  const msgMatch = (notif?.message || '').match(/organisasi:\s*(.*)/i)
  if (msgMatch) {
    const orgName = msgMatch[1].trim()
    try {
      const data = await getOrganizationsList()
      const list = unwrapApiList(data)
      const foundOrg = list.find(o => 
        (o.name && o.name.toLowerCase() === orgName.toLowerCase()) || 
        (o.nama && o.nama.toLowerCase() === orgName.toLowerCase())
      )
      if (foundOrg && (foundOrg.id || foundOrg.organization_id || foundOrg._id)) {
        return String(foundOrg.id || foundOrg.organization_id || foundOrg._id)
      }
    } catch (e) {
      console.warn('Failed to resolve organization from list:', e)
    }
  }
  return null
}

async function handleAcceptInvite(notif) {
  const invOrgId = await resolveOrgId(notif)
  if (!invOrgId) {
    alert('Tidak dapat menentukan organisasi dari notifikasi ini. Coba hubungi pengundang secara manual.')
    return
  }
  try {
    await memberInvitationResponse(invOrgId, { is_accepted: true })
    // Hapus dari backend
    try { await deleteNotificationById(notif.id) } catch (e) {}
    
    globalNotifications.value = globalNotifications.value.filter(n => n.id !== notif.id)
    alert('Berhasil menerima undangan! Anda sekarang bergabung ke organisasi.')
  } catch (err) {
    alert('Gagal menerima undangan: ' + (err?.message || 'Terjadi kesalahan.'))
  }
}

async function handleRejectInvite(notif) {
  if (!confirm('Apakah Anda yakin ingin menolak undangan ini?')) return
  const invOrgId = await resolveOrgId(notif)
  if (!invOrgId) {
    alert('Tidak dapat menentukan organisasi dari notifikasi ini.')
    return
  }
  try {
    await memberInvitationResponse(invOrgId, { is_accepted: false })
    // Hapus dari backend
    try { await deleteNotificationById(notif.id) } catch (e) {}
    
    globalNotifications.value = globalNotifications.value.filter(n => n.id !== notif.id)
    alert('Undangan telah ditolak.')
  } catch (err) {
    alert('Gagal menolak undangan: ' + (err?.message || 'Terjadi kesalahan.'))
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onMounted(() => {
  loadGlobalNotifications()
  notifTimer = window.setInterval(loadGlobalNotifications, 30000)
})
onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  if (notifTimer) window.clearInterval(notifTimer)
})
</script>

<template>
  <div class="layout" :class="{ 'sidebar-mini': sidebarMini }">
    <!-- Sidebar Overlay (mobile) -->
    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <Sidebar :sidebar-open="sidebarOpen" :sidebar-mini="sidebarMini" :nav-items="navItems" :is-active="isActive" @close-sidebar="closeSidebar" @confirm-logout="confirmLogout" />


    <!-- Main Content -->
    <div class="main-wrap">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" @click="toggleSidebar" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <div class="notif-menu-wrap" @click.stop>
            <button class="notif-btn" @click="toggleNotifMenu" aria-label="Notifikasi global">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
            </button>
            <div v-if="notifMenuOpen" class="notif-dropdown">
              <div class="notif-dropdown-head">
                <span>Semua Notifikasi</span>
                <div class="notif-head-actions">
                  <button class="notif-action-btn danger" v-if="globalNotifications.length > 0" @click="handleClearAll">Hapus Semua</button>
                  <button class="notif-action-btn" @click="loadGlobalNotifications">Muat ulang</button>
                </div>
              </div>
              <div v-if="notifError" class="notif-dropdown-empty error">{{ notifError }}</div>
              <div v-else-if="notifLoading" class="notif-dropdown-empty">Memuat...</div>
              <div v-else-if="globalNotifications.length === 0" class="notif-dropdown-empty">Belum ada notifikasi.</div>
              <div v-else class="notif-dropdown-list">
                <div v-for="item in globalNotifications.slice(0, 5)" :key="item.id" class="notif-dropdown-item">
                  <div class="notif-dropdown-title">{{ item.title }}</div>
                  <div class="notif-dropdown-message">{{ item.message }}</div>
                  <div class="notif-dropdown-time">{{ item.time }}</div>
                  <!-- Tombol Terima/Tolak Undangan -->
                  <div v-if="item.is_invitation" class="notif-invite-actions">
                    <button class="notif-invite-btn accept-icon" @click.stop="handleAcceptInvite(item)" title="Terima Undangan">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                    <button class="notif-invite-btn reject-icon" @click.stop="handleRejectInvite(item)" title="Tolak Undangan">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="user-menu-wrap" @click.stop="toggleUserMenu">
            <button class="user-btn">
              <div class="user-avatar">
                <img v-if="user.avatar" :src="user.avatar.startsWith('/') ? 'https://iotbridge.click' + user.avatar : user.avatar" alt="Avatar" />
                <span v-else>{{ user.name?.charAt(0)?.toUpperCase() || 'U' }}</span>
              </div>
              <span class="user-name">{{ user.name }}</span>

              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            <div class="user-dropdown" v-if="userMenuOpen">
              <RouterLink to="/profile" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                Profile
              </RouterLink>
              <RouterLink to="/ubah-kata-sandi" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
                Ubah Kata Sandi
              </RouterLink>
              <RouterLink to="/ubah-email" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16v16H4z"/>
                  <path d="M4 8l8 5 8-5"/>
                </svg>
                Ubah Email
              </RouterLink>
              <hr class="dropdown-divider"/>
              <button class="dropdown-item danger" @click="confirmLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Slot Content -->
      <main class="content">
        <slot />
      </main>
    </div>

    <!-- Logout Modal -->
    <Transition name="modal">
      <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
        <div class="modal-box">
          <button class="modal-close" @click="showLogoutModal = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <p class="modal-text">Apakah yakin ingin keluar?</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showLogoutModal = false">Batal</button>
            <button class="btn-confirm" @click="logout">Iya</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
  position: relative;
}

/* ===== MAIN ===== */

.main-wrap {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
  transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
}

.layout.sidebar-mini .main-wrap {
  margin-left: 70px;
}

/* ===== TOPBAR ===== */
.topbar {
  position: sticky;
  top: 0;
  z-index: 90;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 16px;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}
.hamburger:hover { background: var(--color-bg); }
.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: var(--transition);
}
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notif-menu-wrap {
  position: relative;
}

.notif-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: none;
  color: var(--color-text);
  transition: var(--transition);
  cursor: pointer;
  position: relative;
}
.notif-btn:hover {
  background: var(--color-bg);
  color: var(--color-accent);
}

.notif-badge {
  position: absolute;
  top: -3px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--color-accent);
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.notif-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 320px;
  max-width: calc(100vw - 24px);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 10px;
  z-index: 220;
}

.notif-dropdown-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 6px 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}

.notif-head-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notif-action-btn {
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.notif-action-btn:hover {
  text-decoration: underline;
}
.notif-action-btn.danger {
  color: var(--color-danger);
}

.notif-dropdown-empty {
  padding: 16px 10px;
  text-align: center;
  color: var(--color-text-light);
  font-size: 13px;
}

.notif-dropdown-empty.error {
  color: var(--color-danger);
}

.notif-dropdown-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 320px;
  overflow: auto;
}

.notif-dropdown-item {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 10px 12px;
  background: #fff;
}

.notif-dropdown-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 2px;
}

.notif-dropdown-message {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.notif-dropdown-time {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-light);
}

.notif-invite-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  justify-content: flex-end;
}

.notif-invite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.notif-invite-btn.accept-icon {
  color: var(--color-success);
}
.notif-invite-btn.accept-icon:hover {
  background: #def7ec;
}

.notif-invite-btn.reject-icon {
  color: var(--color-danger);
}
.notif-invite-btn.reject-icon:hover {
  background: #fde8e8;
}

.user-menu-wrap {
  position: relative;
}
.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-md);
  transition: var(--transition);
  color: var(--color-text);
}
.user-btn:hover { background: var(--color-bg); }
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.user-name {

  font-weight: 600;
  font-size: 14px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: white;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 180px;
  padding: 6px;
  z-index: 200;
  animation: slideDown 0.15s ease;
}
@keyframes slideDown {
  from { opacity:0; transform:translateY(-6px); }
  to { opacity:1; transform:translateY(0); }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition);
  text-decoration: none;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}
.dropdown-item:hover { background: var(--color-bg); }
.dropdown-item.danger { color: var(--color-danger); }
.dropdown-item.danger:hover { background: #fef2f2; }

.dropdown-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 4px 0;
}

/* ===== CONTENT ===== */
.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* ===== LOGOUT MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 16px;
}
.modal-box {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px 32px 32px;
  text-align: center;
  max-width: 380px;
  width: 100%;
  position: relative;
  box-shadow: var(--shadow-lg);
}
.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}
.modal-close:hover { background: var(--color-accent-hover); }
.modal-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 28px;
}
.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.btn-cancel {
  padding: 11px 32px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: white;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}
.btn-cancel:hover { background: var(--color-accent-hover); }
.btn-confirm {
  padding: 11px 32px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  font-size: 15px;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}
.btn-confirm:hover { background: var(--color-primary-dark); }

/* Modal animation */
.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.92); }

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .main-wrap {
    margin-left: 0;
  }
  .hamburger {
    display: flex;
  }
  .user-name {
    display: none;
  }
  .content {
    padding: 16px;
  }
  .topbar {
    padding: 0 16px;
  }
  .page-title {
    font-size: 17px;
  }
}
</style>

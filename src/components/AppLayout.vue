<script setup>
import { clearSession } from '@/services/api.js'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  pageTitle: { type: String, default: 'Dashboard' }
})

const router = useRouter()
const route = useRoute()
const sidebarOpen = ref(false)
const userMenuOpen = ref(false)
const showLogoutModal = ref(false)

const user = computed(() => {
  const u = localStorage.getItem('iot_bridge_user')
  return u ? JSON.parse(u) : { name: 'Pengguna', email: '' }
})

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Notifikasi', path: '/notifikasi', icon: 'notif' },
  { label: 'Perangkat', path: '/perangkat', icon: 'device' },
  { label: 'Organisasi', path: '/organisasi', icon: 'org' },
  { label: 'Pengaturan', path: '/pengaturan', icon: 'settings' },
  { label: 'Pengguna', path: '/pengguna', icon: 'users' },
]

function isActive(path) {
  if (path === '/dashboard') return route.path === '/dashboard' || route.path.startsWith('/dashboard/')
  return route.path.startsWith(path)
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function closeUserMenu() {
  userMenuOpen.value = false
}

function confirmLogout() {
  showLogoutModal.value = true
  userMenuOpen.value = false
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
  if (window.innerWidth <= 768 && !e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
    sidebarOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <div class="layout">
    <!-- Sidebar Overlay (mobile) -->
    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sidebar-logo">
        <RouterLink to="/dashboard" @click="closeSidebar">
          <svg width="44" height="40" viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 36 L6 20 L2 20 L22 4 L42 20 L38 20 L38 36" stroke="#e86b1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <path d="M14 36 L14 22 L30 22 L30 36" stroke="#e86b1a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <line x1="10" y1="20" x2="10" y2="36" stroke="#e86b1a" stroke-width="2.5" stroke-linecap="round"/>
            <line x1="34" y1="20" x2="34" y2="36" stroke="#e86b1a" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="6" cy="8" r="2" fill="#e86b1a"/>
            <circle cx="38" cy="8" r="2" fill="#e86b1a"/>
            <path d="M6 8 Q22 1 38 8" stroke="#e86b1a" stroke-width="2" fill="none"/>
          </svg>
          <span class="logo-text">I<span class="logo-gear">⚙</span>T Bridge</span>
        </RouterLink>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActive(item.path) }"
          @click="closeSidebar"
        >
                    <!-- Notification Icon -->
                    <svg v-if="item.icon === 'notif'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
          <!-- Dashboard Icon -->
          <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
          <!-- Device Icon -->
          <svg v-if="item.icon === 'device'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
            <circle cx="12" cy="10" r="2"/>
          </svg>
          <!-- Users Icon -->
          <svg v-if="item.icon === 'users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="7" r="4"/>
            <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
            <circle cx="19" cy="7" r="2"/>
            <path d="M23 21v-2a2 2 0 0 0-2-2h-1"/>
          </svg>
          <!-- Org Icon -->
          <svg v-if="item.icon === 'org'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="2" width="6" height="4" rx="1"/>
            <rect x="2" y="18" width="6" height="4" rx="1"/>
            <rect x="9" y="18" width="6" height="4" rx="1"/>
            <rect x="16" y="18" width="6" height="4" rx="1"/>
            <path d="M12 6v6M5 18v-4h14v4"/>
          </svg>
          <!-- Stats Icon -->
          <svg v-if="item.icon === 'stats'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18"/>
            <path d="M7 16l4-5 4 3 4-6"/>
          </svg>
          <!-- Settings Icon -->
          <svg v-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-actions">
        <button class="nav-item logout-btn" @click="confirmLogout">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Keluar akun</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <span>© 2025 Teknik Informatika Universitas Lampung</span>
      </div>
    </aside>

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
          <div class="user-menu-wrap" @click.stop="toggleUserMenu">
            <button class="user-btn">
              <div class="user-avatar">{{ user.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
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

/* ===== SIDEBAR ===== */
.sidebar {
  width: var(--sidebar-width);
  background: var(--color-sidebar);
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
}

.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
}
.sidebar-overlay.active {
  display: block;
}

/* Logo area */
.sidebar-logo {
  padding: 24px 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.sidebar-logo a {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.logo-text {
  font-size: 19px;
  font-weight: 900;
  color: var(--color-white);
  letter-spacing: -0.5px;
  line-height: 1.15;
}
.logo-gear {
  color: var(--color-accent);
  font-style: normal;
}

/* Nav list — no right padding so active item can reach sidebar edge */
.sidebar-nav {
  flex: 1;
  padding: 20px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: visible;
}

/* Nav items — default state */
.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
  border-radius: 999px;
  color: var(--color-accent);
  font-weight: 600;
  font-size: 14.5px;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
}

/* Icon always orange */
.nav-item svg {
  flex-shrink: 0;
  color: var(--color-accent);
  transition: color 0.2s ease;
}

/* Hover */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent);
}

/* ===== ACTIVE — connected tab effect ===== */
.nav-item.active {
  background: #2a4f7c;
  color: white;
  font-weight: 700;
}
.nav-item.active svg {
  color: white;
}
.nav-item.active span {
  color: white;
}

.sidebar-actions {
  padding: 0 12px 12px;
}
.logout-btn {
  width: 100%;
  justify-content: flex-start;
  color: var(--color-accent);
  background: transparent;
  border: none;
}
.logout-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-footer {
  padding: 16px 12px;
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  text-align: center;
  line-height: 1.5;
}

/* ===== MAIN ===== */
.main-wrap {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-width: 0;
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
  display: none;
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

.notif-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: var(--color-text);
  transition: var(--transition);
}
.notif-btn:hover {
  background: var(--color-bg);
  color: var(--color-accent);
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

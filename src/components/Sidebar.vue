<script setup>
import { RouterLink } from 'vue-router'

defineProps({
  sidebarOpen: Boolean,
  sidebarMini: Boolean,
  navItems: Array,
  isActive: Function,
})

const emit = defineEmits(['closeSidebar', 'confirmLogout'])
</script>

<template>
  <aside class="sidebar" :class="{ open: sidebarOpen, mini: sidebarMini }">
    <div class="sidebar-logo">
      <RouterLink to="/dashboard" @click="$emit('closeSidebar')">
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
        @click="$emit('closeSidebar')"
      >
        <!-- Icons -->
        <svg v-if="item.icon === 'notif'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1"/>
          <rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/>
          <rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        <svg v-if="item.icon === 'device'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <path d="M8 21h8M12 17v4"/>
          <circle cx="12" cy="10" r="2"/>
        </svg>
        <svg v-if="item.icon === 'users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="7" r="4"/>
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
          <circle cx="19" cy="7" r="2"/>
          <path d="M23 21v-2a2 2 0 0 0-2-2h-1"/>
        </svg>
        <svg v-if="item.icon === 'org'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="2" width="6" height="4" rx="1"/>
          <rect x="2" y="18" width="6" height="4" rx="1"/>
          <rect x="9" y="18" width="6" height="4" rx="1"/>
          <rect x="16" y="18" width="6" height="4" rx="1"/>
          <path d="M12 6v6M5 18v-4h14v4"/>
        </svg>
        <svg v-if="item.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <div class="sidebar-actions">
      <button class="nav-item logout-btn" @click="$emit('confirmLogout')">
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
</template>

<style scoped>
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
.sidebar-nav {
  flex: 1;
  padding: 20px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: visible;
}
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
.nav-item svg {
  flex-shrink: 0;
  color: var(--color-accent);
  transition: color 0.2s ease;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-accent);
}
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

/* MINI SIDEBAR STATES */
.sidebar.mini {
  width: 70px;
}
.sidebar.mini .sidebar-logo a {
  justify-content: center;
  padding: 0;
}
.sidebar.mini .logo-text {
  display: none;
}
.sidebar.mini .nav-item {
  justify-content: center;
  padding: 12px;
}
.sidebar.mini .nav-item span {
  display: none;
}
.sidebar.mini .sidebar-actions .logout-btn {
  justify-content: center;
}
.sidebar.mini .sidebar-actions .logout-btn span {
  display: none;
}
.sidebar.mini .sidebar-footer {
  display: none;
}
</style>

import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import DashboardView from '../views/DashboardView.vue'
import PoolDetailView from '../views/PoolDetailView.vue'
import NotifikasiView from '../views/NotifikasiView.vue'
import PerangkatView from '../views/PerangkatView.vue'
import StatistikaView from '../views/StatistikaView.vue'
import PenggunaView from '../views/PenggunaView.vue'
import OrganisasiView from '../views/OrganisasiView.vue'
import PengaturanView from '../views/PengaturanView.vue'
import ProfileView from '../views/ProfileView.vue'
import UbahKataSandiView from '../views/UbahKataSandiView.vue'

const routes = [
  { path: '/', redirect: '/masuk' },
  { path: '/masuk', component: LoginView, meta: { auth: false } },
  { path: '/daftar', component: RegisterView, meta: { auth: false } },
  { path: '/lupa-kata-sandi', component: ForgotPasswordView, meta: { auth: false } },
  { path: '/dashboard', component: DashboardView, meta: { auth: true } },
  { path: '/dashboard/kolam/:id', component: PoolDetailView, meta: { auth: true } },
  { path: '/notifikasi', component: NotifikasiView, meta: { auth: true } },
  { path: '/perangkat', component: PerangkatView, meta: { auth: true } },
  { path: '/statistika', component: StatistikaView, meta: { auth: true } },
  { path: '/pengguna', component: PenggunaView, meta: { auth: true } },
  { path: '/organisasi', component: OrganisasiView, meta: { auth: true } },
  { path: '/pengaturan', component: PengaturanView, meta: { auth: true } },
  { path: '/profile', component: ProfileView, meta: { auth: true } },
  { path: '/ubah-kata-sandi', component: UbahKataSandiView, meta: { auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Simple navigation guard: redirect to login if auth required and not logged in
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('iot_bridge_token')
  if (to.meta.auth && !isLoggedIn) {
    next('/masuk')
  } else if (!to.meta.auth && isLoggedIn && (to.path === '/masuk' || to.path === '/daftar')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router

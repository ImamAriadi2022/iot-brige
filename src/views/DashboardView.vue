<script setup>
import { getOrganizationsList, searchDevices, getDevices, unwrapApiList, getNotifications } from '@/services/api.js'

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const pools = ref([])
const loading = ref(false)
const error = ref('')
const activeNotifsCount = ref(0)


function detectType(name) {
  const lower = String(name || '').toLowerCase()
  return lower.includes('ras') ? 'ras' : 'non-ras'
}

function mapDevice(d) {
  const id = d?.id || d?.device_id || d?.deviceId || d?._id
  const name = d?.name || d?.nama || d?.device_name || 'Perangkat'
  return { id: String(id), name: name.toUpperCase(), type: detectType(name) }
}

const organizations = ref([])
const selectedOrgId = ref(null)

async function loadOrganizations() {
  try {
    const data = await getOrganizationsList()
    organizations.value = unwrapApiList(data)
    if (organizations.value.length > 0) {
      selectedOrgId.value = organizations.value[0].id || organizations.value[0]._id
      loadDevices(selectedOrgId.value)
    }
  } catch (err) {
    error.value = 'Gagal memuat organisasi.'
  }
}

async function onOrgChange() {
  if (selectedOrgId.value) {
    loadDevices(selectedOrgId.value)
  }
}

async function loadDevices(orgId) {
  loading.value = true
  error.value = ''
  try {
    let devData
    try {
      devData = await getDevices(orgId)
    } catch (e) {
      devData = await searchDevices(orgId, { name: '' })
    }
    const list = unwrapApiList(devData)
    pools.value = list.map(mapDevice).filter(p => p.id)
  } catch (err) {
    error.value = err?.message || 'Gagal memuat daftar perangkat.'
  } finally {
    loading.value = false
  }
}

function goToPool(pool) {
  router.push(`/dashboard/kolam/${pool.id}`)
}

onMounted(async () => {
  await loadOrganizations()
})



</script>

<template>
  <AppLayout page-title="Dashboard">
    <div class="org-selector-wrap" style="margin: 0 24px 20px; display: flex; align-items: center; gap: 10px;">
      <label for="org-select" style="font-weight: 600; font-size: 14px; color: var(--color-text);">Pilih Organisasi:</label>
      <select id="org-select" v-model="selectedOrgId" @change="onOrgChange" style="padding: 8px 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: white; font-size: 14px; min-width: 200px;">
        <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
      </select>
    </div>

    <div v-if="error" class="data-error" style="margin: 0 24px;">{{ error }}</div>
    <div v-else-if="loading" class="data-loading" style="margin: 0 24px;">Memuat perangkat...</div>
    <div v-else-if="pools.length === 0" class="data-empty" style="margin: 0 24px;">Belum ada perangkat di organisasi ini.</div>
    <div v-else style="padding: 0 24px;">

      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-label">Total Perangkat</div>
          <div class="summary-val">{{ pools.length }}</div>
        </div>

      </div>

      <div class="dashboard-grid">
        <div
          v-for="pool in pools"
          :key="pool.id"
          class="pool-card"
          :class="pool.type"
          @click="goToPool(pool)"
        >
          <h3 class="pool-name">{{ pool.name }}</h3>
          <div class="pool-icon">
            <svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Fish body -->
              <ellipse cx="55" cy="50" rx="30" ry="22" fill="white" opacity="0.9"/>
              <!-- Tail -->
              <path d="M25 50 L5 30 L5 70 Z" fill="white" opacity="0.9"/>
              <!-- Eye -->
              <circle cx="75" cy="45" r="7" fill="white"/>
              <circle cx="75" cy="45" r="3.5" fill="#1e3a5f"/>
              <!-- Fin top -->
              <path d="M45 28 Q55 10 70 28" fill="white" opacity="0.8"/>
              <!-- Fin bottom -->
              <path d="M45 72 Q55 88 65 72" fill="white" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>


<style scoped>
.summary-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.summary-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.summary-val {
  font-size: 24px;
  font-weight: 800;
  color: var(--color-text);
}
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}


.data-error,
.data-loading,
.data-empty {
  padding: 24px;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-muted);
}
.data-error { color: var(--color-danger); }

.pool-card {
  background: var(--color-card-blue);
  border-radius: var(--radius-lg);
  padding: 32px 24px 24px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  min-height: 260px;
  position: relative;
  overflow: hidden;
}
.pool-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0);
  transition: var(--transition);
}
.pool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(30,58,95,0.3);
}
.pool-card:hover::before {
  background: rgba(255,255,255,0.04);
}

.pool-name {
  font-size: 22px;
  font-weight: 800;
  color: white;
  text-align: center;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.pool-icon {
  width: 130px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pool-icon svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
  transition: transform 0.3s ease;
}
.pool-card:hover .pool-icon svg {
  transform: scale(1.08);
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .pool-card {
    min-height: 200px;
    padding: 24px 20px;
  }
  .pool-name {
    font-size: 18px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>

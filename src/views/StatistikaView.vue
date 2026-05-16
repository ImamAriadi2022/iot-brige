<script setup>
import {
    ensureOrganizationId,
    getDeviceReport,
    getWidgetBoxList,
    searchDevices,
    unwrapApiList,
} from '@/services/api.js'
import { computed, onMounted, ref } from 'vue'
import AppLayout from '../components/AppLayout.vue'

const fromDate = ref('')
const toDate = ref('')
const selectedWidget = ref('')
const selectedDeviceId = ref('')
const widgets = ref([{ id: '', label: '-- Pilih Widget Box --' }])
const loading = ref(false)
const error = ref('')
const report = ref(null)
const orgId = ref(null)

const showLoadingPopup = ref(false)
const elapsedSeconds = ref(0)
let timerInterval = null

function startLoading() {
  showLoadingPopup.value = true
  elapsedSeconds.value = 0
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)
}

function stopLoading() {
  showLoadingPopup.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const canShow = computed(() => fromDate.value && toDate.value && selectedWidget.value && selectedDeviceId.value)

function mapWidget(w) {
  return {
    id: w?.id || w?.widget_box_id || w?.widgetBoxId || w?._id,
    label: w?.name || w?.nama || w?.label || 'Widget Box',
  }
}

async function loadDevicesAndWidgets() {
  loading.value = true
  error.value = ''
  startLoading()
  try {
    orgId.value = await ensureOrganizationId()
    if (!orgId.value) {
      error.value = 'Organisasi belum tersedia untuk akun ini.'
      return
    }
    const deviceData = await searchDevices(orgId.value)
    const deviceList = unwrapApiList(deviceData)
    
    // Check if device is provided in query
    const routeParams = new URLSearchParams(window.location.search)
    const queryDevice = routeParams.get('device')
    
    let targetDevice = deviceList[0]
    if (queryDevice) {
      const found = deviceList.find(d => String(d.id || d.device_id || d.deviceId || d._id) === String(queryDevice))
      if (found) targetDevice = found
    }

    selectedDeviceId.value = String(targetDevice?.id || targetDevice?.device_id || targetDevice?.deviceId || targetDevice?._id || '')
    if (!selectedDeviceId.value) return
    const widgetData = await getWidgetBoxList(orgId.value, selectedDeviceId.value)
    const widgetList = unwrapApiList(widgetData)
    const mapped = widgetList.map(mapWidget).filter(w => w.id)
    widgets.value = [{ id: '', label: '-- Pilih Widget Box --' }, ...mapped]
  } catch (err) {
    error.value = err?.message || 'Gagal memuat data widget.'
  } finally {
    loading.value = false
    stopLoading()
  }
}

async function handleShowReport() {
  if (!canShow.value) return
  loading.value = true
  error.value = ''
  report.value = null
  startLoading()
  try {
    const data = await getDeviceReport(orgId.value, selectedDeviceId.value, {
      from: fromDate.value,
      to: toDate.value,
      widget_box_id: selectedWidget.value,
    })
    report.value = data
  } catch (err) {
    error.value = err?.message || 'Gagal memuat report.'
  } finally {
    loading.value = false
    stopLoading()
  }
}

const chartData = computed(() => {
  if (!report.value || !report.value.data) return []
  return report.value.data.map(d => ({
    value: parseFloat(d.value),
    time: new Date(d.time),
  })).sort((a, b) => a.time - b.time)
})

const minMax = computed(() => {
  const data = chartData.value
  if (data.length === 0) return { min: 0, max: 100 }
  const values = data.map(d => d.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
})

const chartPoints = computed(() => {
  const data = chartData.value
  if (data.length === 0) return []
  const { min, max } = minMax.value
  const range = max - min || 1
  const width = 600
  const height = 300
  const padding = 30
  
  const startTime = data[0].time.getTime()
  const endTime = data[data.length - 1].time.getTime()
  const timeRange = endTime - startTime || 1

  return data.map(d => {
    const x = padding + (d.time.getTime() - startTime) / timeRange * (width - 2 * padding)
    const y = height - padding - (d.value - min) / range * (height - 2 * padding)
    return { x, y, value: d.value, time: d.time }
  })
})

const svgPoints = computed(() => {
  return chartPoints.value.map(p => `${p.x},${p.y}`).join(' ')
})

onMounted(loadDevicesAndWidgets)

</script>

<template>
  <AppLayout page-title="Statistika">
    <!-- Loading Popup with Timer -->
    <Transition name="popup">
      <div v-if="showLoadingPopup" class="popup-overlay">
        <div class="popup-card loading-card">
          <span class="big-spinner"></span>
          <p class="popup-message">Harap Tunggu...</p>
          <p class="popup-subtext">Sedang menarik data dari server backend.</p>
          <div class="timer-badge">{{ elapsedSeconds }} detik</div>
        </div>
      </div>
    </Transition>

    <div class="stat-page">
      <div class="date-row">
        <div class="date-field">
          <label class="field-label">Dari Tanggal &amp; Jam</label>
          <input v-model="fromDate" type="datetime-local" class="field-input" />
        </div>
        <div class="date-field">
          <label class="field-label">Sampai Tanggal &amp; Jam</label>
          <input v-model="toDate" type="datetime-local" class="field-input" />
        </div>
      </div>

      <div class="field-group">
        <label class="field-label" for="widget-select">Pilih Widget Box</label>
        <div class="select-wrap">
          <select id="widget-select" v-model="selectedWidget" class="select-input">
            <option v-for="w in widgets" :key="w.id" :value="w.id">{{ w.label }}</option>
          </select>
          <svg class="select-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      <button class="btn-report" :disabled="!canShow || loading" @click="handleShowReport">Tampilkan Report</button>
      <p v-if="error" class="empty-text error">{{ error }}</p>
      <p v-else-if="loading" class="empty-text">Memuat report...</p>
      <p v-else-if="report" class="empty-text">Report berhasil dimuat.</p>
      <p v-else class="empty-text">Tidak ada data report untuk rentang waktu yang dipilih.</p>

      <div v-if="report && chartData.length > 0" class="report-card">
        <svg width="100%" height="300" viewBox="0 0 600 300" class="chart-svg">
          <!-- Background grid -->
          <line x1="30" y1="30" x2="570" y2="30" stroke="#f1f5f9" stroke-width="1"/>
          <line x1="30" y1="150" x2="570" y2="150" stroke="#f1f5f9" stroke-width="1"/>
          <line x1="30" y1="270" x2="570" y2="270" stroke="#cbd5e1" stroke-width="1"/>
          
          <!-- Axes labels -->
          <text x="25" y="35" font-size="12" fill="#94a3b8" text-anchor="end">{{ minMax.max.toFixed(1) }}</text>
          <text x="25" y="275" font-size="12" fill="#94a3b8" text-anchor="end">{{ minMax.min.toFixed(1) }}</text>
          
          <!-- Line -->
          <polyline :points="svgPoints" fill="none" stroke="var(--color-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          
          <!-- Points -->
          <circle
            v-for="(p, i) in chartPoints"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="5"
            fill="var(--color-accent)"
            stroke="white"
            stroke-width="2"
          >
            <title>{{ p.value }} at {{ p.time.toLocaleString() }}</title>
          </circle>
        </svg>
      </div>
      <div v-else-if="report" class="empty-text">Data report kosong atau tidak valid.</div>

    </div>
  </AppLayout>
</template>

<style scoped>
.stat-page {
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.date-field, .field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}
.field-input {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  background: white;
  font-size: 14px;
  color: var(--color-text);
  outline: none;
  transition: var(--transition);
}
.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.select-wrap { position: relative; }
.select-input {
  width: 100%;
  padding: 12px 44px 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: white;
  color: var(--color-text);
  appearance: none;
  outline: none;
  transition: var(--transition);
}
.select-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.select-caret {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}
.btn-report {
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: none;
  background: #94a3b8;
  color: white;
  font-weight: 700;
  font-size: 14px;
  cursor: not-allowed;
}
.btn-report:enabled {
  background: var(--color-primary);
  cursor: pointer;
}
.empty-text {
  text-align: center;
  color: var(--color-text-light);
  font-size: 14px;
  margin-top: 6px;
}
.empty-text.error { color: var(--color-danger); }
.report-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}
.report-json {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
  overflow-x: auto;
}

@media (max-width: 768px) {
  .date-row { grid-template-columns: 1fr; }
}

/* ── Popup Modal ── */
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 33, 56, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.popup-card {
  background: white;
  border-radius: 18px;
  padding: 30px;
  max-width: 340px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.big-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(232, 107, 26, 0.2);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.popup-message {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.popup-subtext {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  margin: 0;
}
.timer-badge {
  background: #f1f5f9;
  color: var(--color-primary);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}
.popup-enter-active,
.popup-leave-active { transition: opacity 0.25s ease; }
.popup-enter-from,
.popup-leave-to { opacity: 0; }
</style>

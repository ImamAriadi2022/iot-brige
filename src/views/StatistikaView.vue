<script setup>
import {
    ensureOrganizationId,
    getDeviceReport,
    getPinList,
    searchDevices,
    unwrapApiList,
} from '@/services/api.js'
import { computed, onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'
import AppLayout from '../components/AppLayout.vue'

const fromDate = ref('')
const toDate = ref('')
const selectedPin = ref('')
const selectedDeviceId = ref('')
const pins = ref([{ value: '', label: '-- Pilih Pin --' }])
const loading = ref(false)
const error = ref('')
const report = ref(null)
const orgId = ref(null)

// ── Loading popup state ──
const showLoadingPopup = ref(false)
const elapsedSeconds = ref(0)
const loadingTooLong = ref(false)
const isReportLoading = ref(false) // true only when fetching report (not initial load)
let timerInterval = null
let reportAbortController = null

function startLoading(isReport = false) {
  showLoadingPopup.value = true
  elapsedSeconds.value = 0
  loadingTooLong.value = false
  isReportLoading.value = isReport
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    if (elapsedSeconds.value >= 10) loadingTooLong.value = true
  }, 1000)
}

function stopLoading() {
  showLoadingPopup.value = false
  isReportLoading.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

function cancelReport() {
  if (reportAbortController) {
    reportAbortController.abort()
    reportAbortController = null
  }
  loading.value = false
  stopLoading()
  error.value = ''
  report.value = null
}

const canShow = computed(() =>
  fromDate.value && toDate.value && selectedPin.value && selectedDeviceId.value
)

// ── Load devices then pins in parallel after getting orgId ──
async function loadDevicesAndPins() {
  loading.value = true
  error.value = ''
  startLoading(false)
  try {
    // Get orgId and devices in a single pass — orgId cached after first call
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
      const found = deviceList.find(
        d => String(d.id || d.device_id || d.deviceId || d._id) === String(queryDevice)
      )
      if (found) targetDevice = found
    }

    selectedDeviceId.value = String(
      targetDevice?.id || targetDevice?.device_id || targetDevice?.deviceId || targetDevice?._id || ''
    )
    if (!selectedDeviceId.value) return

    // Fetch pin list for selected device
    const pinData = await getPinList(orgId.value, selectedDeviceId.value)
    const pinList = unwrapApiList(pinData)
    const mapped = pinList
      .map(p => ({
        value: p?.pin || p?.pin_number || p?.name || String(p),
        label: p?.label || p?.name || p?.pin || String(p),
      }))
      .filter(p => p.value)
    pins.value = [{ value: '', label: '-- Pilih Pin --' }, ...mapped]
  } catch (err) {
    if (err?.name === 'AbortError') return
    error.value = err?.message || 'Gagal memuat data perangkat.'
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

  // Create abort controller for this request
  reportAbortController = new AbortController()
  startLoading(true)

  try {
    const data = await getDeviceReport(
      orgId.value,
      selectedDeviceId.value,
      {
        start: fromDate.value,
        end: toDate.value,
        pin: selectedPin.value,
      },
      reportAbortController.signal
    )
    report.value = data
  } catch (err) {
    if (err?.name === 'AbortError') {
      // User cancelled — silently ignore
      return
    }
    error.value = err?.message || 'Gagal memuat report.'
  } finally {
    loading.value = false
    stopLoading()
    reportAbortController = null
  }
}

// ── Chart computeds ──
const chartData = computed(() => {
  if (!report.value) return []
  const raw = report.value?.data || report.value?.records || report.value
  if (!Array.isArray(raw)) return []
  return raw
    .map(d => ({
      value: parseFloat(d.value ?? d.val ?? d.reading ?? 0),
      time: new Date(d.time || d.timestamp || d.created_at),
    }))
    .filter(d => !isNaN(d.value) && !isNaN(d.time))
    .sort((a, b) => a.time - b.time)
})

const minMax = computed(() => {
  const data = chartData.value
  if (data.length === 0) return { min: 0, max: 100 }
  const values = data.map(d => d.value)
  return { min: Math.min(...values), max: Math.max(...values) }
})

const chartPoints = computed(() => {
  const data = chartData.value
  if (data.length === 0) return []
  const { min, max } = minMax.value
  const range = max - min || 1
  const width = 600
  const height = 300
  const padding = 40

  const startTime = data[0].time.getTime()
  const endTime = data[data.length - 1].time.getTime()
  const timeRange = endTime - startTime || 1

  return data.map(d => {
    const x = padding + ((d.time.getTime() - startTime) / timeRange) * (width - 2 * padding)
    const y = height - padding - ((d.value - min) / range) * (height - 2 * padding)
    return { x, y, value: d.value, time: d.time }
  })
})

const svgPoints = computed(() =>
  chartPoints.value.map(p => `${p.x},${p.y}`).join(' ')
)

// ── Export helpers ──
function buildExportRows() {
  return chartData.value.map((d, i) => ({
    No: i + 1,
    Pin: selectedPin.value,
    'Waktu': d.time.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    'Nilai': d.value,
  }))
}

function exportCsv() {
  const rows = buildExportRows()
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csvLines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${String(r[h]).replace(/"/g, '""')}"`).join(',')),
  ]
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report_pin_${selectedPin.value}_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportExcel() {
  const rows = buildExportRows()
  if (!rows.length) return
  const ws = XLSX.utils.json_to_sheet(rows)
  // Set column widths
  ws['!cols'] = [{ wch: 6 }, { wch: 10 }, { wch: 24 }, { wch: 12 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, `Pin ${selectedPin.value}`)
  XLSX.writeFile(wb, `report_pin_${selectedPin.value}_${new Date().toISOString().slice(0,10)}.xlsx`)
}

onMounted(loadDevicesAndPins)
</script>

<template>
  <AppLayout page-title="Statistika">
    <!-- Loading Popup with Timer + Cancel -->
    <Transition name="popup">
      <div v-if="showLoadingPopup" class="popup-overlay">
        <div class="popup-card loading-card">
          <!-- Close / cancel button — only shown when fetching report -->
          <button v-if="isReportLoading" class="popup-close-btn" title="Batalkan" @click="cancelReport">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>

          <span class="big-spinner"></span>
          <p class="popup-message">Harap Tunggu...</p>
          <p class="popup-subtext">
            <template v-if="loadingTooLong">⚠️ Server lambat merespons. Kamu bisa batalkan dan coba lagi.</template>
            <template v-else-if="isReportLoading">Sedang menarik data report dari server.</template>
            <template v-else>Sedang memuat perangkat &amp; pin...</template>
          </p>
          <div class="timer-badge">{{ elapsedSeconds }} detik</div>

          <button v-if="isReportLoading" class="btn-cancel" @click="cancelReport">
            Batalkan Request
          </button>
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
        <label class="field-label" for="pin-select">Pilih Pin</label>
        <div class="select-wrap">
          <select id="pin-select" v-model="selectedPin" class="select-input">
            <option v-for="p in pins" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
          <svg class="select-caret" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      <button class="btn-report" :disabled="!canShow || loading" @click="handleShowReport">
        Tampilkan Report
      </button>

      <p v-if="error" class="empty-text error">{{ error }}</p>
      <p v-else-if="!report && !loading" class="empty-text">Pilih rentang waktu dan pin, lalu klik Tampilkan Report.</p>

      <!-- Chart -->
      <div v-if="report && chartData.length > 0" class="report-card">
        <div class="chart-header">
          <span class="chart-title">Data Sensor — Pin {{ selectedPin }}</span>
          <div class="chart-header-right">
            <span class="chart-count">{{ chartData.length }} titik data</span>
            <button class="btn-export btn-csv" title="Export CSV" @click="exportCsv">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
            <button class="btn-export btn-excel" title="Export Excel" @click="exportExcel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Excel
            </button>
          </div>
        </div>
        <svg width="100%" height="300" viewBox="0 0 600 300" class="chart-svg">
          <!-- Grid lines -->
          <line x1="40" y1="40" x2="570" y2="40" stroke="#f1f5f9" stroke-width="1"/>
          <line x1="40" y1="150" x2="570" y2="150" stroke="#f1f5f9" stroke-width="1"/>
          <line x1="40" y1="260" x2="570" y2="260" stroke="#cbd5e1" stroke-width="1"/>
          <line x1="40" y1="40" x2="40" y2="260" stroke="#e2e8f0" stroke-width="1"/>

          <!-- Y-axis labels -->
          <text x="35" y="45" font-size="11" fill="#94a3b8" text-anchor="end">{{ minMax?.max?.toFixed(1) ?? '' }}</text>
          <text x="35" y="155" font-size="11" fill="#94a3b8" text-anchor="end">{{ (((minMax?.max ?? 100) + (minMax?.min ?? 0)) / 2).toFixed(1) }}</text>
          <text x="35" y="265" font-size="11" fill="#94a3b8" text-anchor="end">{{ minMax?.min?.toFixed(1) ?? '' }}</text>

          <!-- Area fill under line -->
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <polygon
            v-if="chartPoints.length > 1"
            :points="`${chartPoints[0].x},260 ${svgPoints} ${chartPoints[chartPoints.length-1].x},260`"
            fill="url(#chartGradient)"
          />

          <!-- Line -->
          <polyline
            :points="svgPoints"
            fill="none"
            stroke="var(--color-primary)"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Data points -->
          <circle
            v-for="(p, i) in chartPoints"
            :key="i"
            :cx="p.x"
            :cy="p.y"
            r="4"
            fill="var(--color-accent)"
            stroke="white"
            stroke-width="2"
          >
            <title>{{ p.value }} — {{ p.time.toLocaleString('id-ID') }}</title>
          </circle>
        </svg>

        <!-- Summary stats -->
        <div class="stat-summary">
          <div class="stat-item">
            <span class="stat-label">Min</span>
            <span class="stat-value">{{ minMax.min.toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max</span>
            <span class="stat-value">{{ minMax.max.toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Rata-rata</span>
            <span class="stat-value">{{ (chartData.reduce((s, d) => s + d.value, 0) / chartData.length).toFixed(2) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Data</span>
            <span class="stat-value">{{ chartData.length }}</span>
          </div>
        </div>
      </div>
      <div v-else-if="report" class="empty-text">Data report kosong untuk rentang waktu yang dipilih.</div>
    </div>
  </AppLayout>
</template>

<style scoped>
.stat-page {
  max-width: 700px;
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
  transition: var(--transition);
}
.btn-report:enabled {
  background: var(--color-primary);
  cursor: pointer;
}
.btn-report:enabled:hover {
  opacity: 0.88;
}
.empty-text {
  text-align: center;
  color: var(--color-text-light);
  font-size: 14px;
  margin-top: 6px;
}
.empty-text.error { color: var(--color-danger); }

/* ── Chart Card ── */
.report-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.chart-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}
.chart-count {
  font-size: 12px;
  color: var(--color-text-muted);
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 20px;
}
.btn-export {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1.5px solid;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.btn-csv {
  border-color: #6b7280;
  background: #f9fafb;
  color: #374151;
}
.btn-csv:hover {
  background: #e5e7eb;
}
.btn-excel {
  border-color: #16a34a;
  background: #f0fdf4;
  color: #15803d;
}
.btn-excel:hover {
  background: #dcfce7;
}
.chart-svg { display: block; }

.stat-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .date-row { grid-template-columns: 1fr; }
  .stat-summary { grid-template-columns: repeat(2, 1fr); }
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
  position: relative;
  background: white;
  border-radius: 18px;
  padding: 32px 30px 28px;
  max-width: 340px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* X button top-right */
.popup-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}
.popup-close-btn:hover {
  background: #fee2e2;
  color: var(--color-danger);
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
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

/* Cancel button inside popup */
.btn-cancel {
  width: 100%;
  padding: 10px;
  border-radius: var(--radius-md);
  border: 1.5px solid #fca5a5;
  background: #fff1f2;
  color: var(--color-danger);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}
.btn-cancel:hover {
  background: #fee2e2;
}

.popup-enter-active,
.popup-leave-active { transition: opacity 0.25s ease; }
.popup-enter-from,
.popup-leave-to { opacity: 0; }
</style>

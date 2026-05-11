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
  try {
    orgId.value = await ensureOrganizationId()
    if (!orgId.value) {
      error.value = 'Organisasi belum tersedia untuk akun ini.'
      return
    }
    const deviceData = await searchDevices(orgId.value)
    const deviceList = unwrapApiList(deviceData)
    const firstDevice = deviceList[0]
    selectedDeviceId.value = String(firstDevice?.id || firstDevice?.device_id || firstDevice?.deviceId || firstDevice?._id || '')
    if (!selectedDeviceId.value) return
    const widgetData = await getWidgetBoxList(orgId.value, selectedDeviceId.value)
    const widgetList = unwrapApiList(widgetData)
    const mapped = widgetList.map(mapWidget).filter(w => w.id)
    widgets.value = [{ id: '', label: '-- Pilih Widget Box --' }, ...mapped]
  } catch (err) {
    error.value = err?.message || 'Gagal memuat data widget.'
  } finally {
    loading.value = false
  }
}

async function handleShowReport() {
  if (!canShow.value) return
  loading.value = true
  error.value = ''
  report.value = null
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
  }
}

const reportText = computed(() => {
  if (!report.value) return ''
  try {
    return JSON.stringify(report.value, null, 2)
  } catch {
    return String(report.value)
  }
})

onMounted(loadDevicesAndWidgets)
</script>

<template>
  <AppLayout page-title="Statistika">
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

      <div v-if="report" class="report-card">
        <pre class="report-json">{{ reportText }}</pre>
      </div>
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
</style>

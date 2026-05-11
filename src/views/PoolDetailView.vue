<script setup>
import {
    ensureOrganizationId,
    getWidgetBoxList,
    unwrapApiList,
    upsertWidgetBoxes,
} from '@/services/api.js'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()
const route = useRoute()
const widgets = ref([])
const showAddModal = ref(false)
const loading = ref(false)
const error = ref('')
const orgId = ref(null)
const deviceId = ref(route.params.id)

const newWidget = ref({
  nama: '',
  pin: '',
  satuan: '',
  minValue: '',
  maxValue: '',
  defaultValue: '',
})

function mapWidget(w) {
  return {
    id: w?.id || w?.widget_box_id || w?.widgetBoxId || w?._id,
    nama: w?.name || w?.nama || w?.label || 'Widget',
    pin: w?.pin || w?.pin_number || w?.pinNumber || '- ',
    satuan: w?.unit || w?.satuan || w?.unit_name || w?.unitName || '',
    minValue: w?.min_value ?? w?.minValue ?? w?.min ?? '',
    maxValue: w?.max_value ?? w?.maxValue ?? w?.max ?? '',
    defaultValue: w?.default_value ?? w?.defaultValue ?? w?.default ?? '',
  }
}

async function loadWidgets() {
  loading.value = true
  error.value = ''
  try {
    orgId.value = await ensureOrganizationId()
    if (!orgId.value || !deviceId.value) {
      widgets.value = []
      error.value = 'Perangkat tidak ditemukan.'
      return
    }
    const data = await getWidgetBoxList(orgId.value, deviceId.value)
    const list = unwrapApiList(data)
    widgets.value = list.map(mapWidget).filter(w => w.id)
  } catch (err) {
    error.value = err?.message || 'Gagal memuat widget.'
  } finally {
    loading.value = false
  }
}

async function addWidget() {
  if (!newWidget.value.nama || !newWidget.value.pin) return
  if (!orgId.value || !deviceId.value) {
    error.value = 'Perangkat tidak ditemukan.'
    return
  }
  try {
    await upsertWidgetBoxes(orgId.value, deviceId.value, {
      name: newWidget.value.nama,
      pin: newWidget.value.pin,
      unit: newWidget.value.satuan,
      min_value: newWidget.value.minValue,
      max_value: newWidget.value.maxValue,
      default_value: newWidget.value.defaultValue,
    })
    newWidget.value = { nama: '', pin: '', satuan: '', minValue: '', maxValue: '', defaultValue: '' }
    showAddModal.value = false
    await loadWidgets()
  } catch (err) {
    error.value = err?.message || 'Gagal menambahkan widget.'
  }
}

onMounted(loadWidgets)
</script>

<template>
  <AppLayout page-title="Widget Box">
    <div class="widget-page">
      <button class="back-btn" @click="router.push('/dashboard')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali
      </button>

      <div class="widget-list">
        <div v-if="error" class="widget-empty error">{{ error }}</div>
        <div v-else-if="loading" class="widget-empty">Memuat widget...</div>
        <div v-else-if="widgets.length === 0" class="widget-empty">Belum ada widget.</div>
        <div v-for="w in widgets" :key="w.id" class="widget-card">
          <div class="widget-title">{{ w.nama }}</div>
          <div class="widget-meta">Pin: {{ w.pin }} | Satuan: {{ w.satuan || '-' }}</div>
          <div class="widget-range">Min: {{ w.minValue || '-' }} | Max: {{ w.maxValue || '-' }} | Default: {{ w.defaultValue || '-' }}</div>
        </div>
      </div>

      <button class="widget-fab" @click="showAddModal = true" title="Tambah Widget">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <Transition name="modal">
        <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
          <div class="modal-box">
            <div class="modal-head">
              <h3>Tambah Widget</h3>
            </div>
            <form class="modal-form" @submit.prevent="addWidget">
              <input v-model="newWidget.nama" class="form-input" type="text" placeholder="Nama Widget" required />
              <input v-model="newWidget.pin" class="form-input" type="text" placeholder="Pin" required />
              <input v-model="newWidget.satuan" class="form-input" type="text" placeholder="Satuan" />
              <input v-model="newWidget.minValue" class="form-input" type="number" placeholder="Min Value" />
              <input v-model="newWidget.maxValue" class="form-input" type="number" placeholder="Max Value" />
              <input v-model="newWidget.defaultValue" class="form-input" type="number" placeholder="Default Value" />
              <div class="modal-actions">
                <button type="button" class="btn-text" @click="showAddModal = false">Tutup</button>
                <button type="submit" class="btn-primary">Tambah</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </AppLayout>
</template>

<style scoped>
.widget-page {
  position: relative;
  min-height: calc(100vh - var(--header-height) - 48px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer;
  font-size: 14px; font-weight: 500; color: var(--color-text);
  padding: 6px 12px 6px 0;
  transition: var(--transition);
}
.back-btn:hover { color: var(--color-accent); }

.widget-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.widget-empty {
  text-align: center;
  color: var(--color-text-light);
  padding: 24px 0;
}
.widget-empty.error { color: var(--color-danger); }
.widget-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px 22px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.widget-title { font-size: 16px; font-weight: 800; color: var(--color-text); }
.widget-meta, .widget-range { font-size: 13px; color: var(--color-text-muted); }

.widget-fab {
  position: fixed;
  right: 28px;
  bottom: 28px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  cursor: pointer;
  transition: var(--transition);
  z-index: 50;
}
.widget-fab:hover { transform: translateY(-2px); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 300; padding: 16px;
}
.modal-box {
  background: white; border-radius: var(--radius-lg);
  padding: 28px; width: 100%; max-width: 480px;
  box-shadow: var(--shadow-lg);
}
.modal-head { margin-bottom: 18px; }
.modal-head h3 { font-size: 18px; font-weight: 800; color: var(--color-text); }
.modal-form { display: flex; flex-direction: column; gap: 12px; }
.form-input {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  font-size: 14px;
  color: var(--color-text);
  background: white;
  outline: none;
  transition: var(--transition);
}
.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(30,58,95,0.08);
}
.modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 4px;
}
.btn-text {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-weight: 600;
  cursor: pointer;
}
.btn-primary {
  padding: 10px 22px;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: white;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}
.btn-primary:hover { background: var(--color-primary-dark); }

.modal-enter-active, .modal-leave-active { transition: all 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box { transform: scale(0.96); }

@media (max-width: 768px) {
  .widget-fab { right: 20px; bottom: 20px; }
}
</style>

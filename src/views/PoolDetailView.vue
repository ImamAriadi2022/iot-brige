<script setup>
import {
    getOrganizationsList,
    getDeviceReport,
    getWidgetBoxList,
    unwrapApiList,
    upsertWidgetBoxes,
    createWidgetBox,
} from '@/services/api.js'


import { onMounted, onUnmounted, ref } from 'vue'
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
const pollTimer = ref(null)


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
    currentValue: '--',
  }
}


async function loadWidgets() {
  loading.value = true
  error.value = ''
  try {
    // Ambil semua organisasi
    const orgsData = await getOrganizationsList()
    const orgs = unwrapApiList(orgsData)
    
    let foundOrgId = null
    let data = null
    
    // Cari organisasi mana yang memiliki device ini
    for (const org of orgs) {
      const oid = org?.id || org?.organization_id || org?._id
      if (!oid) continue
      
      try {
        // Coba ambil widget list untuk device ini di org ini
        data = await getWidgetBoxList(oid, deviceId.value)
        foundOrgId = oid
        break // Jika berhasil, hentikan loop
      } catch (e) {
        // Jika gagal (device tidak ada di org ini), coba org lain
      }
    }
    
    if (!foundOrgId) {
      widgets.value = []
      error.value = 'Perangkat tidak ditemukan di organisasi Anda.'
      return
    }
    
    orgId.value = foundOrgId
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
  
  // Ambil nilai dan pastikan diubah ke string untuk divalidasi panjangnya
  const minStr = String(newWidget.value.minValue ?? '0')
  const maxStr = String(newWidget.value.maxValue ?? '100')
  const defStr = String(newWidget.value.defaultValue ?? '0')
  
  // Validasi kriteria backend: harus string dan panjangnya 1 - 20 karakter
  if (minStr.length < 1 || minStr.length > 20) {
    error.value = 'Min value harus diisi (1 - 20 karakter).'
    return
  }
  if (maxStr.length < 1 || maxStr.length > 20) {
    error.value = 'Max value harus diisi (1 - 20 karakter).'
    return
  }
  if (defStr.length < 1 || defStr.length > 20) {
    error.value = 'Default value harus diisi (1 - 20 karakter).'
    return
  }
  
  try {
    const payload = {
      name: newWidget.value.nama,
      pin: newWidget.value.pin,
      unit: newWidget.value.satuan || '',
      min_value: minStr,
      max_value: maxStr,
      default_value: defStr,
    }
    
    // eslint-disable-next-line no-console
    console.log('[addWidget] Sending Payload (PUT):', payload)
    
    const resp = await upsertWidgetBoxes(orgId.value, deviceId.value, payload)
    // eslint-disable-next-line no-console
    console.log('[addWidget] Success Response:', resp)

    newWidget.value = { nama: '', pin: '', satuan: '', minValue: '', maxValue: '', defaultValue: '' }

    showAddModal.value = false
    await loadWidgets()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[addWidget] Error:', err)
    error.value = err?.message || 'Gagal menambahkan widget.'
  }

}

const showEditModal = ref(false)
const editingWidget = ref({
  id: '',
  nama: '',
  pin: '',
  satuan: '',
  minValue: '',
  maxValue: '',
  defaultValue: '',
})

function openEditModal(w) {
  editingWidget.value = {
    id: w.id,
    nama: w.nama,
    pin: w.pin,
    satuan: w.satuan,
    minValue: w.minValue,
    maxValue: w.maxValue,
    defaultValue: w.defaultValue,
  }
  showEditModal.value = true
}

async function saveEditWidget() {
  if (!editingWidget.value.nama || !editingWidget.value.pin) return
  try {
    await upsertWidgetBoxes(orgId.value, deviceId.value, {
      id: editingWidget.value.id,
      name: editingWidget.value.nama,
      pin: editingWidget.value.pin,
      unit: editingWidget.value.satuan || '',
      min_value: String(editingWidget.value.minValue ?? '0'),
      max_value: String(editingWidget.value.maxValue ?? '100'),
      default_value: String(editingWidget.value.defaultValue ?? '0'),
    })
    showEditModal.value = false
    await loadWidgets()
  } catch (err) {
    error.value = err?.message || 'Gagal memperbarui widget.'
  }
}

async function fetchCurrentValues() {

  if (!orgId.value || !deviceId.value || widgets.value.length === 0) return
  const now = new Date()
  const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000)
  
  const promises = widgets.value.map(async (w) => {
    try {
      const reportData = await getDeviceReport(orgId.value, deviceId.value, {
        start: fiveMinsAgo.toISOString(),
        end: now.toISOString(),
        pin: w.pin,
      })
      const dataList = reportData?.data || []
      if (dataList.length > 0) {
        const latest = dataList.sort((a, b) => new Date(b.time) - new Date(a.time))[0]
        w.currentValue = latest.value
      } else {
        w.currentValue = '--'
      }
    } catch (err) {
      w.currentValue = 'Err'
    }
  })
  
  await Promise.all(promises)
}

onMounted(async () => {
  await loadWidgets()
  fetchCurrentValues()
  pollTimer.value = setInterval(fetchCurrentValues, 10000) // Poll every 10 seconds
})

onUnmounted(() => {
  if (pollTimer.value) clearInterval(pollTimer.value)
})

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
        <div v-for="w in widgets" :key="w.id" class="widget-card" @click="openEditModal(w)" style="cursor: pointer;">

          <div class="widget-title">{{ w.nama }}</div>
          <div class="widget-value-row">
            <div class="widget-value">{{ w.currentValue }} <span class="unit">{{ w.satuan }}</span></div>
          </div>
          <div class="widget-meta">Pin: {{ w.pin }}</div>
          <div class="widget-range">Min: {{ w.minValue || '-' }} | Max: {{ w.maxValue || '-' }}</div>
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
              <div v-if="error" class="error-text" style="color: var(--color-danger); font-size: 13px; margin-bottom: 8px;">{{ error }}</div>
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

      <!-- Edit Modal -->
      <Transition name="modal">
        <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
          <div class="modal-box">
            <div class="modal-head">
              <h3>Edit Widget</h3>
            </div>
            <form class="modal-form" @submit.prevent="saveEditWidget">
              <input v-model="editingWidget.nama" class="form-input" type="text" placeholder="Nama Widget" required />
              <input v-model="editingWidget.pin" class="form-input" type="text" placeholder="Pin" required />
              <input v-model="editingWidget.satuan" class="form-input" type="text" placeholder="Satuan" />
              <input v-model="editingWidget.minValue" class="form-input" type="number" placeholder="Min Value" />
              <input v-model="editingWidget.maxValue" class="form-input" type="number" placeholder="Max Value" />
              <input v-model="editingWidget.defaultValue" class="form-input" type="number" placeholder="Default Value" />
              <div class="modal-actions">
                <button type="button" class="btn-text" @click="showEditModal = false">Tutup</button>
                <button type="submit" class="btn-primary">Simpan</button>
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
.widget-value-row { display: flex; align-items: baseline; gap: 8px; margin: 8px 0; }
.widget-value { font-size: 28px; font-weight: 800; color: var(--color-primary); }
.widget-value .unit { font-size: 14px; font-weight: 600; color: var(--color-text-muted); }
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

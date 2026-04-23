<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const route = useRoute()
const router = useRouter()

const poolData = {
  'kolam-a': { name: 'Kolam A – RAS', suhu: 30.0, ph: 6.5, amonia: 0.01, tds: 300 },
  'kolam-b': { name: 'Kolam B – RAS', suhu: 28.5, ph: 7.0, amonia: 0.05, tds: 280 },
  'kolam-c': { name: 'Kolam C – Non RAS', suhu: 27.0, ph: 6.8, amonia: 0.02, tds: 350 },
  'kolam-d': { name: 'Kolam D – Non RAS', suhu: 29.0, ph: 6.3, amonia: 0.08, tds: 400 },
}

const pool = computed(() => poolData[route.params.id] || poolData['kolam-a'])
const pageTitle = computed(() => pool.value.name)

// Gauge helper
function gaugeArc(value, min, max, radius = 44) {
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = -210 + pct * 240
  const rad = (angle * Math.PI) / 180
  const cx = 60, cy = 65
  const x = cx + radius * Math.cos(rad)
  const y = cy + radius * Math.sin(rad)
  return { x: x.toFixed(2), y: y.toFixed(2) }
}

function gaugePath(value, min, max) {
  const startRad = (-210 * Math.PI) / 180
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const endAngle = -210 + pct * 240
  const endRad = (endAngle * Math.PI) / 180
  const r = 44
  const cx = 60, cy = 65
  const x1 = cx + r * Math.cos(startRad)
  const y1 = cy + r * Math.sin(startRad)
  const x2 = cx + r * Math.cos(endRad)
  const y2 = cy + r * Math.sin(endRad)
  const largeArc = pct * 240 > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

const metrics = computed(() => [
  {
    key: 'suhu',
    label: 'Suhu',
    value: pool.value.suhu,
    unit: '°C',
    min: 0, max: 50,
    color: '#5b9da8',
    bgColor: '#5b9da8',
    iconPath: 'M12 2C10.34 2 9 3.34 9 5v8.53C7.5 14.5 7 15.94 7 17.5 7 20.54 9.24 23 12 23s5-2.46 5-5.5c0-1.56-.5-3-2-4V5c0-1.66-1.34-3-3-3zm0 18c-1.66 0-3-1.12-3-2.5 0-.64.24-1.23.66-1.68l.34-.38V5c0-.55.45-1 1-1s1 .45 1 1v10.44l.34.38c.42.45.66 1.04.66 1.68 0 1.38-1.34 2.5-3 2.5z'
  },
  {
    key: 'ph',
    label: 'Tingkat Keasaman (pH)',
    value: pool.value.ph,
    unit: '',
    min: 0, max: 14,
    color: '#5b9da8',
    bgColor: '#5b9da8',
    isText: true
  },
  {
    key: 'amonia',
    label: 'Kadar Gas Amonia',
    value: pool.value.amonia,
    unit: 'PPM',
    min: 0, max: 100,
    color: '#c8844a',
    bgColor: '#c8844a',
    isFlame: true
  },
  {
    key: 'tds',
    label: 'Padatan Terlarut Air (TDS)',
    value: pool.value.tds,
    unit: 'PPM',
    min: 0, max: 1500,
    color: '#8b6347',
    bgColor: '#8b6347',
    isDrop: true
  },
])
</script>

<template>
  <AppLayout :page-title="pageTitle">
    <div class="pool-detail">
      <button class="back-btn" @click="router.push('/dashboard')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali
      </button>

      <div class="metrics-grid">
        <div
          v-for="m in metrics"
          :key="m.key"
          class="metric-card"
          :style="{ background: m.bgColor }"
        >
          <div class="metric-header">
            <!-- Temperature icon -->
            <svg v-if="m.key==='suhu'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
            </svg>
            <!-- pH icon -->
            <svg v-if="m.key==='ph'" width="28" height="28" viewBox="0 0 24 24" fill="white">
              <text x="2" y="18" font-size="13" font-weight="800" font-family="Inter" fill="white">PH</text>
            </svg>
            <!-- Flame icon -->
            <svg v-if="m.key==='amonia'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
              <path d="M8.5 14.5A5 5 0 1 0 12 6c0 2-1.5 3-2 4.5-.6 1.7.5 4 .5 4z"/>
              <path d="M12 19a3 3 0 0 0 3-3c0-1.5-1.5-2.5-3-4-1.5 1.5-3 2.5-3 4a3 3 0 0 0 3 3z"/>
            </svg>
            <!-- Drop icon -->
            <svg v-if="m.key==='tds'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
              <path d="M12 2C6.5 11 4 15 4 17a8 8 0 0 0 16 0c0-2-2.5-6-8-15z"/>
            </svg>
            <span class="metric-label">{{ m.label }}</span>
          </div>

          <div class="gauge-wrap">
            <svg class="gauge-svg" viewBox="0 0 120 80">
              <!-- Track arc -->
              <path
                d="M 16.36 65 A 44 44 0 1 1 103.64 65"
                fill="none"
                stroke="rgba(255,255,255,0.25)"
                stroke-width="8"
                stroke-linecap="round"
              />
              <!-- Value arc -->
              <path
                :d="gaugePath(m.value, m.min, m.max)"
                fill="none"
                stroke="white"
                stroke-width="8"
                stroke-linecap="round"
              />
              <!-- Needle dot -->
              <circle
                :cx="gaugeArc(m.value, m.min, m.max).x"
                :cy="gaugeArc(m.value, m.min, m.max).y"
                r="5"
                fill="#1e3a5f"
              />
            </svg>

            <div class="gauge-value">
              <span class="val-num">{{ m.value }}</span>
              <span class="val-unit">{{ m.unit }}</span>
            </div>

            <div class="gauge-scale">
              <span>{{ m.min }}</span>
              <span>{{ m.max }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.pool-detail { display: flex; flex-direction: column; gap: 20px; }

.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: none; border: none; cursor: pointer;
  font-size: 14px; font-weight: 500; color: var(--color-text);
  padding: 6px 12px 6px 0;
  transition: var(--transition);
}
.back-btn:hover { color: var(--color-accent); }

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.metric-card {
  border-radius: var(--radius-lg);
  padding: 24px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 260px;
  transition: var(--transition);
}
.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.metric-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.gauge-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.gauge-svg {
  width: 100%;
  max-width: 180px;
}
.gauge-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: -16px;
}
.val-num {
  font-size: 40px;
  font-weight: 800;
  color: white;
  line-height: 1;
}
.val-unit {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}
.gauge-scale {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 180px;
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  .metric-card { min-height: 220px; }
  .val-num { font-size: 32px; }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

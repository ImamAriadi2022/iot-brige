<script setup>
import { ref, computed } from 'vue'
import AppLayout from '../components/AppLayout.vue'

// ── Stat Cards ────────────────────────────────────────────────
const stats = [
  { label: 'Total Perangkat', value: '18', sub: '+2 bulan ini', icon: 'device', color: '#1e3a5f' },
  { label: 'Perangkat Online', value: '11', sub: '61% aktif saat ini', icon: 'online', color: '#22c55e' },
  { label: 'Total Pengguna', value: '34', sub: '+5 bulan ini', icon: 'users', color: '#e86b1a' },
]

// ── Line Chart ────────────────────────────────────────────────
const activeTab = ref('pH')
const tabs = ['pH', 'Suhu', 'Oksigen']

const chartData = {
  pH: {
    primary: [6.8, 7.1, 7.0, 6.9, 7.2, 7.4, 7.3, 7.1, 6.8, 6.9, 7.0, 7.2],
    secondary: [7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0, 7.0],
    labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'],
    legend: ['pH Kolam A', 'pH Ideal'],
    unit: 'pH',
  },
  Suhu: {
    primary: [27.5, 28.0, 28.5, 29.0, 28.8, 29.2, 30.0, 29.5, 28.8, 28.0, 27.5, 27.0],
    secondary: [26.0, 26.5, 27.0, 28.5, 28.0, 27.5, 28.0, 27.8, 27.0, 26.5, 26.0, 25.8],
    labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'],
    legend: ['Kolam A', 'Kolam B'],
    unit: '°C',
  },
  Oksigen: {
    primary: [6.2, 6.5, 6.3, 6.8, 7.0, 7.2, 6.9, 6.7, 6.5, 6.8, 7.0, 6.9],
    secondary: [5.8, 6.0, 5.9, 6.1, 6.3, 6.5, 6.4, 6.2, 6.0, 6.3, 6.5, 6.4],
    labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'],
    legend: ['DO Kolam A', 'DO Kolam B'],
    unit: 'mg/L',
  },
}

// SVG line chart helpers
const W = 560, H = 200, PAD = 32

function normalize(arr) {
  const min = Math.min(...arr), max = Math.max(...arr)
  const range = max - min || 1
  return arr.map(v => ((v - min) / range))
}

function toPoints(arr) {
  const n = normalize(arr)
  return n.map((v, i) => {
    const x = PAD + (i / (n.length - 1)) * (W - PAD * 2)
    const y = PAD + (1 - v) * (H - PAD * 2)
    return [x, y]
  })
}

function pointsToPath(pts) {
  if (!pts.length) return ''
  let d = `M ${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`
  }
  return d
}

function areaPath(pts) {
  if (!pts.length) return ''
  const line = pointsToPath(pts)
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${line} L ${last[0]} ${H - PAD} L ${first[0]} ${H - PAD} Z`
}

const activePrimary = computed(() => toPoints(chartData[activeTab.value].primary))
const activeSecondary = computed(() => toPoints(chartData[activeTab.value].secondary))
const primaryPath = computed(() => pointsToPath(activePrimary.value))
const secondaryPath = computed(() => pointsToPath(activeSecondary.value))
const primaryArea = computed(() => areaPath(activePrimary.value))
const activeLabels = computed(() => chartData[activeTab.value].labels)
const activeLegend = computed(() => chartData[activeTab.value].legend)

// ── Radar / Polygon Chart ─────────────────────────────────────
const radarData = [
  { label: 'Kolam A', values: [0.9, 0.8, 0.75, 0.85, 0.7] },
  { label: 'Kolam B', values: [0.6, 0.7, 0.8, 0.65, 0.9] },
]
const radarAxes = ['pH', 'Suhu', 'DO', 'Salinitas', 'Uptime']

function radarPoint(val, axisIdx, total, cx, cy, radius) {
  const angle = (Math.PI * 2 * axisIdx) / total - Math.PI / 2
  const r = val * radius
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

function radarPolygon(values, cx, cy, radius) {
  const pts = values.map((v, i) => radarPoint(v, i, values.length, cx, cy, radius))
  return pts.map(p => p.join(',')).join(' ')
}

function radarAxisEnd(idx, total, cx, cy, radius) {
  const angle = (Math.PI * 2 * idx) / total - Math.PI / 2
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]
}

function radarLabelPos(idx, total, cx, cy, radius) {
  const angle = (Math.PI * 2 * idx) / total - Math.PI / 2
  const r = radius + 20
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

// ── Donut Chart ───────────────────────────────────────────────
const donutData = [
  { label: 'Online', value: 11, color: '#22c55e' },
  { label: 'Offline', value: 5, color: '#94a3b8' },
  { label: 'Inactive', value: 2, color: '#f59e0b' },
]
const donutTotal = computed(() => donutData.reduce((s, d) => s + d.value, 0))

function donutSegments() {
  const r = 54, cx = 80, cy = 80, circumference = 2 * Math.PI * r
  let offset = 0
  return donutData.map(d => {
    const pct = d.value / donutTotal.value
    const dash = pct * circumference
    const seg = { ...d, dasharray: `${dash} ${circumference - dash}`, dashoffset: -offset }
    offset += dash
    return seg
  })
}

// ── Bar Chart ─────────────────────────────────────────────────
const barMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const barOnline  = [420, 510, 490, 570, 610, 680, 720, 695, 640, 600, 580, 550]
const barOffline = [120, 90, 110, 80, 70, 60, 55, 70, 90, 100, 110, 130]
const barMax = Math.max(...barOnline.map((v, i) => v + barOffline[i]))
const barH = 130, barPad = 4

function barY(val) { return barH - (val / barMax) * barH }
function barH2(val) { return (val / barMax) * barH }

// ── Activity Feed ─────────────────────────────────────────────
const activities = [
  { device: 'Kolam A – RAS', msg: 'pH turun ke 6.3, perlu perhatian.', time: '2 mnt lalu', type: 'warn' },
  { device: 'Kolam B – RAS', msg: 'Semua parameter normal.', time: '15 mnt lalu', type: 'ok' },
  { device: 'Hydro Monitor', msg: 'Perangkat kembali online.', time: '32 mnt lalu', type: 'ok' },
  { device: 'Kolam C – NON RAS', msg: 'Suhu melebihi batas atas (31°C).', time: '1 jam lalu', type: 'danger' },
  { device: 'Kolam D – NON RAS', msg: 'Data terkirim berhasil.', time: '1 jam lalu', type: 'ok' },
]
</script>

<template>
  <AppLayout page-title="Pokdakan Bintang Rosela Jaya">

    <!-- ── Page Title ── -->
    <div class="page-header">
      <h2 class="page-title">Statistika</h2>
    </div>

    <!-- ── Row 1: Stat Cards + Radar ── -->
    <div class="row-top">
      <!-- Stat Cards -->
      <div class="stat-cards">
        <div v-for="s in stats" :key="s.label" class="stat-card">
          <div class="stat-icon-wrap" :style="{ background: s.color + '18', color: s.color }">
            <!-- device -->
            <svg v-if="s.icon === 'device'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/><circle cx="12" cy="10" r="2"/>
            </svg>
            <!-- online -->
            <svg v-if="s.icon === 'online'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 6s4-4 11-4 11 4 11 4"/><path d="M5 10s3-2.5 7-2.5S19 10 19 10"/>
              <path d="M9 14s1.5-1 3-1 3 1 3 1"/><circle cx="12" cy="18" r="1" fill="currentColor"/>
            </svg>
            <!-- users -->
            <svg v-if="s.icon === 'users'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              <circle cx="19" cy="7" r="2"/><path d="M23 21v-2a2 2 0 0 0-2-2h-1"/>
            </svg>
          </div>
          <div class="stat-text">
            <div class="stat-value" :style="{ color: s.color }">{{ s.value }}</div>
            <div class="stat-label">{{ s.label }}</div>
            <div class="stat-sub">{{ s.sub }}</div>
          </div>
        </div>
      </div>

      <!-- Radar Chart -->
      <div class="chart-card radar-card">
        <div class="chart-head">
          <span class="chart-title">Aktivitas Kolam</span>
        </div>
        <svg viewBox="0 0 200 200" class="radar-svg">
          <!-- Grid circles -->
          <circle v-for="r in [18, 36, 54, 72]" :key="r" cx="100" cy="100" :r="r" fill="none" stroke="#e2e8f0" stroke-width="1"/>
          <!-- Axes -->
          <line v-for="(ax, i) in radarAxes" :key="'ax'+i"
            x1="100" y1="100"
            :x2="radarAxisEnd(i, radarAxes.length, 100, 100, 72)[0]"
            :y2="radarAxisEnd(i, radarAxes.length, 100, 100, 72)[1]"
            stroke="#e2e8f0" stroke-width="1"/>
          <!-- Data polygons -->
          <polygon :points="radarPolygon(radarData[0].values, 100, 100, 72)"
            fill="#1e3a5f" fill-opacity="0.25" stroke="#1e3a5f" stroke-width="2"/>
          <polygon :points="radarPolygon(radarData[1].values, 100, 100, 72)"
            fill="#e86b1a" fill-opacity="0.2" stroke="#e86b1a" stroke-width="2"/>
          <!-- Labels -->
          <text v-for="(ax, i) in radarAxes" :key="'lb'+i"
            :x="radarLabelPos(i, radarAxes.length, 100, 100, 72)[0]"
            :y="radarLabelPos(i, radarAxes.length, 100, 100, 72)[1]"
            text-anchor="middle" dominant-baseline="middle"
            font-size="9" fill="#64748b">{{ ax }}</text>
        </svg>
        <div class="chart-legend">
          <span class="legend-dot" style="background:#1e3a5f"></span><span>Kolam A</span>
          <span class="legend-dot" style="background:#e86b1a"></span><span>Kolam B</span>
        </div>
      </div>
    </div>

    <!-- ── Row 2: Line Chart + Activity Feed ── -->
    <div class="row-mid">
      <!-- Line Chart -->
      <div class="chart-card line-card">
        <div class="chart-head">
          <span class="chart-title">Data Sensor</span>
          <div class="tab-group">
            <button
              v-for="tab in tabs" :key="tab"
              class="tab-btn" :class="{ active: activeTab === tab }"
              @click="activeTab = tab">
              {{ tab }}
            </button>
          </div>
        </div>
        <div class="chart-legend mb-8">
          <span class="legend-dot" style="background:#1e3a5f"></span>
          <span>{{ activeLegend[0] }}</span>
          <span class="legend-dot" style="background:#e86b1a"></span>
          <span>{{ activeLegend[1] }}</span>
        </div>
        <svg :viewBox="`0 0 ${W} ${H}`" class="line-svg">
          <defs>
            <linearGradient id="primary-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1e3a5f" stop-opacity="0.18"/>
              <stop offset="100%" stop-color="#1e3a5f" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Y grid lines -->
          <line v-for="n in 4" :key="'gy'+n"
            :x1="PAD" :y1="PAD + (n-1) * ((H - PAD*2) / 3)"
            :x2="W - PAD" :y2="PAD + (n-1) * ((H - PAD*2) / 3)"
            stroke="#e2e8f0" stroke-width="1"/>
          <!-- Area fill -->
          <path :d="primaryArea" fill="url(#primary-fill)"/>
          <!-- Lines -->
          <path :d="primaryPath" fill="none" stroke="#1e3a5f" stroke-width="2.5" stroke-linejoin="round"/>
          <path :d="secondaryPath" fill="none" stroke="#e86b1a" stroke-width="2" stroke-dasharray="6 3" stroke-linejoin="round"/>
          <!-- Dots -->
          <circle v-for="(pt, i) in activePrimary" :key="'pd'+i"
            :cx="pt[0]" :cy="pt[1]" r="4"
            fill="white" stroke="#1e3a5f" stroke-width="2"/>
          <!-- X labels -->
          <text v-for="(lbl, i) in activeLabels" :key="'xl'+i"
            :x="PAD + (i / (activeLabels.length - 1)) * (W - PAD * 2)"
            :y="H - 6"
            text-anchor="middle" font-size="10" fill="#94a3b8">{{ lbl }}</text>
        </svg>
      </div>

      <!-- Activity Feed -->
      <div class="chart-card activity-card">
        <div class="chart-head">
          <span class="chart-title">Aktivitas Terbaru</span>
        </div>
        <div class="activity-list">
          <div v-for="(act, i) in activities" :key="i" class="activity-item">
            <div class="act-dot" :class="act.type"></div>
            <div class="act-content">
              <div class="act-device">{{ act.device }}</div>
              <div class="act-msg">{{ act.msg }}</div>
            </div>
            <div class="act-time">{{ act.time }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Row 3: Donut + Bar ── -->
    <div class="row-bottom">
      <!-- Donut Chart -->
      <div class="chart-card donut-card">
        <div class="chart-head">
          <span class="chart-title">Status Perangkat</span>
        </div>
        <div class="donut-wrap">
          <svg viewBox="0 0 160 160" class="donut-svg">
            <circle cx="80" cy="80" r="54" fill="none" stroke="#f1f5f9" stroke-width="22"/>
            <circle
              v-for="(seg, i) in donutSegments()" :key="i"
              cx="80" cy="80" r="54" fill="none"
              :stroke="seg.color" stroke-width="22"
              :stroke-dasharray="seg.dasharray"
              :stroke-dashoffset="seg.dashoffset"
              stroke-linecap="butt"
              transform="rotate(-90 80 80)"/>
            <text x="80" y="76" text-anchor="middle" font-size="22" font-weight="800" fill="#1e3a5f">{{ donutTotal }}</text>
            <text x="80" y="93" text-anchor="middle" font-size="9" fill="#94a3b8">Total</text>
          </svg>
          <div class="donut-legend">
            <div v-for="d in donutData" :key="d.label" class="donut-legend-item">
              <span class="legend-dot" :style="{ background: d.color }"></span>
              <span>{{ d.label }}</span>
              <span class="donut-val">{{ d.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart -->
      <div class="chart-card bar-card">
        <div class="chart-head">
          <span class="chart-title">Transmisi Data per Bulan</span>
        </div>
        <div class="chart-legend mb-8">
          <span class="legend-dot" style="background:#1e3a5f"></span><span>Online</span>
          <span class="legend-dot" style="background:#e86b1a"></span><span>Offline</span>
        </div>
        <svg :viewBox="`0 0 ${barMonths.length * 40 + 20} ${barH + 32}`" class="bar-svg">
          <!-- Y grid lines -->
          <line v-for="n in 4" :key="'bg'+n"
            :x1="10" :y1="(n-1) * (barH/3)"
            :x2="barMonths.length * 40 + 10" :y2="(n-1) * (barH/3)"
            stroke="#e2e8f0" stroke-width="1"/>
          <!-- Bars -->
          <g v-for="(m, i) in barMonths" :key="m" :transform="`translate(${i * 40 + 10}, 0)`">
            <!-- Online bar -->
            <rect
              :x="barPad"
              :y="barY(barOnline[i])"
              :width="14"
              :height="barH2(barOnline[i])"
              fill="#1e3a5f" rx="3" opacity="0.85"/>
            <!-- Offline bar -->
            <rect
              :x="barPad + 16"
              :y="barY(barOffline[i])"
              :width="14"
              :height="barH2(barOffline[i])"
              fill="#e86b1a" rx="3" opacity="0.85"/>
            <!-- X label -->
            <text :x="barPad + 11" :y="barH + 16" text-anchor="middle" font-size="9" fill="#94a3b8">{{ m }}</text>
          </g>
        </svg>
      </div>
    </div>

  </AppLayout>
</template>

<style scoped>
/* ── Page Header ── */
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: var(--color-text); }

/* ── Grid Rows ── */
.row-top {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 20px;
  margin-bottom: 20px;
  align-items: start;
}
.row-mid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  margin-bottom: 20px;
  align-items: start;
}
.row-bottom {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
}

/* ── Stat Cards ── */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: var(--transition);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.stat-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-value { font-size: 28px; font-weight: 900; line-height: 1; }
.stat-label { font-size: 12.5px; font-weight: 600; color: var(--color-text); margin-top: 2px; }
.stat-sub { font-size: 11px; color: var(--color-text-muted); margin-top: 2px; }

/* ── Chart Card Base ── */
.chart-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}
.chart-title { font-size: 15px; font-weight: 700; color: var(--color-text); }

/* ── Tabs ── */
.tab-group { display: flex; gap: 4px; }
.tab-btn {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--color-border);
  background: white;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: var(--transition);
}
.tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}
.tab-btn:hover:not(.active) { border-color: var(--color-primary); color: var(--color-primary); }

/* ── Legend ── */
.chart-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--color-text-muted);
}
.mb-8 { margin-bottom: 12px; }
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Line Chart ── */
.line-card { overflow: hidden; }
.line-svg { width: 100%; display: block; overflow: visible; }

/* ── Radar Chart ── */
.radar-card { display: flex; flex-direction: column; align-items: center; }
.radar-svg { width: 160px; height: 160px; margin: 0 auto; }
.radar-card .chart-legend { justify-content: center; flex-wrap: wrap; }

/* ── Activity Feed ── */
.activity-list { display: flex; flex-direction: column; gap: 0; }
.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}
.activity-item:last-child { border-bottom: none; }
.act-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}
.act-dot.ok { background: #22c55e; }
.act-dot.warn { background: #f59e0b; }
.act-dot.danger { background: var(--color-danger); }
.act-content { flex: 1; min-width: 0; }
.act-device { font-size: 13px; font-weight: 700; color: var(--color-text); }
.act-msg { font-size: 12px; color: var(--color-text-muted); margin-top: 2px; line-height: 1.4; }
.act-time { font-size: 11px; color: var(--color-text-muted); white-space: nowrap; flex-shrink: 0; }

/* ── Donut Chart ── */
.donut-wrap { display: flex; align-items: center; gap: 20px; }
.donut-svg { width: 140px; height: 140px; flex-shrink: 0; }
.donut-legend { display: flex; flex-direction: column; gap: 10px; }
.donut-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}
.donut-val { margin-left: auto; font-weight: 700; color: var(--color-text); font-size: 14px; }

/* ── Bar Chart ── */
.bar-svg { width: 100%; display: block; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .row-top { grid-template-columns: 1fr; }
  .row-mid { grid-template-columns: 1fr; }
  .row-bottom { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .stat-cards { grid-template-columns: 1fr; }
  .row-bottom { grid-template-columns: 1fr; }
  .donut-wrap { flex-direction: column; }
}
</style>

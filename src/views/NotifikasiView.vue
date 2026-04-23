<script setup>
import AppLayout from '../components/AppLayout.vue'

const notifications = [
  {
    id: 1,
    title: 'Suhu Air Terlalu Tinggi!',
    type: 'suhu',
    message: 'Peringatan! Suhu air di Kolam A - RAS mencapai 40°C, melebihi batas aman! Segera periksa sistem aerasi atau lakukan tindakan pendinginan.',
    time: '1 menit',
  },
  {
    id: 2,
    title: 'pH Air Terlalu Tinggi!',
    type: 'ph',
    message: 'Peringatan! pH air di Kolam A - RAS mencapai 8.5, bisa berdampak buruk pada kesehatan ikan! Segera periksa kondisi air dan lakukan penyesuaian jika diperlukan.',
    time: '10 jam',
  },
  {
    id: 3,
    title: 'Kadar Gas Amonia Terlalu Tinggi!',
    type: 'amonia',
    message: 'Peringatan! Kadar gas amonia di Kolam A - RAS mencapai 2.0 ppm, bisa beracun bagi ikan! Segera lakukan pergantian air atau gunakan penyaringan amonia.',
    time: '1 hari',
  },
  {
    id: 4,
    title: 'Jumlah Padatan Terlarut Dalam Air (TDS) Terlalu Tinggi!',
    type: 'tds',
    message: 'Peringatan! Jumlah padatan terlarut dalam air (TDS) di Kolam A - RAS mencapai 1000 ppm, kualitas air menurun! Segera cek kondisi filter dan lakukan perawatan air.',
    time: '1 hari',
  },
  {
    id: 5,
    title: 'Jaringan Internet Terputus!',
    type: 'network',
    message: 'Koneksi Terputus! Perangkat IoT kehilangan koneksi internet. Pastikan router berfungsi dengan baik atau cek jaringan penyedia layanan.',
    time: '3 hari',
  },
  {
    id: 6,
    title: 'Listrik Padam!',
    type: 'power',
    message: 'Daya Terputus! Sistem monitoring tidak dapat berfungsi karena listrik padam. Pastikan sumber daya cadangan tersedia untuk menjaga sistem tetap berjalan.',
    time: '5 hari',
  },
]
</script>

<template>
  <AppLayout page-title="Notifikasi">
    <div class="notif-list">
      <div v-for="notif in notifications" :key="notif.id" class="notif-item">
        <div class="notif-icon-wrap">
          <!-- Suhu icon -->
          <svg v-if="notif.type==='suhu'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.8">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
          </svg>
          <!-- pH icon -->
          <svg v-if="notif.type==='ph'" width="32" height="32" viewBox="0 0 24 24" fill="#1e3a5f">
            <text x="2" y="17" font-size="11" font-weight="800" font-family="Inter" fill="#1e3a5f">PH</text>
          </svg>
          <!-- Amonia icon -->
          <svg v-if="notif.type==='amonia'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.8">
            <path d="M8.5 14.5A5 5 0 1 0 12 6c0 2-1.5 3-2 4.5-.6 1.7.5 4 .5 4z"/>
            <path d="M12 19a3 3 0 0 0 3-3c0-1.5-1.5-2.5-3-4-1.5 1.5-3 2.5-3 4a3 3 0 0 0 3 3z"/>
          </svg>
          <!-- TDS icon -->
          <svg v-if="notif.type==='tds'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.8">
            <path d="M12 2C6.5 11 4 15 4 17a8 8 0 0 0 16 0c0-2-2.5-6-8-15z"/>
          </svg>
          <!-- Network icon -->
          <svg v-if="notif.type==='network'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.8">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
            <line x1="2" y1="2" x2="22" y2="22"/>
          </svg>
          <!-- Power icon -->
          <svg v-if="notif.type==='power'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" stroke-width="1.8">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>

        <div class="notif-body">
          <h3 class="notif-title">{{ notif.title }}</h3>
          <p class="notif-message">{{ notif.message }}</p>
          <span class="notif-time">{{ notif.time }}</span>
        </div>

        <div class="notif-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#e86b1a" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="13" stroke="#e86b1a" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="12" cy="16" r="1.2" fill="#e86b1a"/>
          </svg>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.notif-list {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
  transition: var(--transition);
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: #f8fafc; }

.notif-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e8f0f8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-body {
  flex: 1;
  min-width: 0;
}
.notif-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 4px;
}
.notif-message {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 6px;
}
.notif-time {
  font-size: 12px;
  color: var(--color-text-light);
  font-weight: 500;
}

.notif-badge {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .notif-item {
    padding: 16px;
    gap: 12px;
  }
  .notif-icon-wrap { width: 40px; height: 40px; }
  .notif-title { font-size: 14px; }
  .notif-message { font-size: 12px; }
}
</style>

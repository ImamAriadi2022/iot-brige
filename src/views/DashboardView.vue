<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'

const router = useRouter()

const pools = [
  { id: 'kolam-a', name: 'KOLAM A – RAS', type: 'ras' },
  { id: 'kolam-b', name: 'KOLAM B – RAS', type: 'ras' },
  { id: 'kolam-c', name: 'KOLAM C – Non RAS', type: 'non-ras' },
  { id: 'kolam-d', name: 'KOLAM D – Non RAS', type: 'non-ras' },
]

function goToPool(pool) {
  router.push(`/dashboard/kolam/${pool.id}`)
}
</script>

<template>
  <AppLayout page-title="Dashboard">
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
  </AppLayout>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

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

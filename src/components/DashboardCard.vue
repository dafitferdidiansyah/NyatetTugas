<template>
  <div class="dashboard-card">
    <div class="greeting">
      <h3>Halo, Semangat! ✨</h3>
      <p>Kamu punya {{ pending }} tugas belum selesai.</p>
    </div>
    <div class="progress-circle">
        <svg viewBox="0 0 36 36" class="circular-chart">
          <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path class="circle" :stroke-dasharray="percentage + ', 100'" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <text x="18" y="20.35" class="percentage">{{ percentage }}%</text>
        </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const props = defineProps<{ progress: number, pending: number }>();
const percentage = computed(() => Math.round(props.progress * 100));
</script>

<style scoped>
.dashboard-card {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-primary-shade));
  color: white;
  padding: 20px;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 10px 20px rgba(181, 185, 255, 0.4);
}
.greeting h3 { margin: 0; font-weight: 700; font-size: 1.2rem; }
.greeting p { margin: 5px 0 0; opacity: 0.9; font-size: 0.9rem; }

/* Simple SVG Chart */
.circular-chart { display: block; margin: 0 auto; max-width: 60px; max-height: 60px; }
.circle-bg { fill: none; stroke: rgba(255,255,255,0.3); stroke-width: 3.8; }
.circle { fill: none; stroke: #fff; stroke-width: 2.8; stroke-linecap: round; transition: stroke-dasharray 0.6s ease; }
.percentage { fill: #fff; font-family: sans-serif; font-weight: bold; font-size: 0.5em; text-anchor: middle; }
</style>
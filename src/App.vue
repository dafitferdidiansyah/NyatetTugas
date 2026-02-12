<script setup lang="ts">
import { onMounted } from 'vue';
import { IonApp, IonRouterOutlet } from '@ionic/vue';

onMounted(() => {
  // Cek apakah user pernah simpan pilihan tema
  const savedTheme = localStorage.getItem('user-theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
  }
});
</script>

<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>
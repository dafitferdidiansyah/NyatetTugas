<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="homeOutline" />
          <ion-label>Beranda</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="tasks" href="/tabs/tasks">
          <ion-icon :icon="listOutline" />
          <ion-label>Tugas</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="courses" href="/tabs/courses">
          <ion-icon :icon="libraryOutline" />
          <ion-label>Matkul</ion-label>
        </ion-tab-button>

        
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
// Import icon libraryOutline
import { homeOutline, listOutline, libraryOutline } from 'ionicons/icons';
</script>
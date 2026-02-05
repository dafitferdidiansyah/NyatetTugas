<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Beranda</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2>Ringkasan Tugas</h2>
      
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-card color="warning">
              <ion-card-header>
                <ion-card-subtitle>Belum Selesai</ion-card-subtitle>
                <ion-card-title>{{ pendingCount }} Tugas</ion-card-title>
              </ion-card-header>
            </ion-card>
          </ion-col>
          <ion-col>
            <ion-card color="success">
              <ion-card-header>
                <ion-card-subtitle>Selesai</ion-card-subtitle>
                <ion-card-title>{{ doneCount }} Tugas</ion-card-title>
              </ion-card-header>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-button expand="block" router-link="/tabs/tab2" class="ion-margin-top">
        Lihat Semua Tugas
      </ion-button>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonButton 
} from '@ionic/vue';
import { useTasks } from '@/composables/useTasks';

const { tasks } = useTasks();

const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length);
const doneCount = computed(() => tasks.value.filter(t => t.completed).length);
</script>
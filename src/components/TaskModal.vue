<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editingId ? 'Edit Tugas' : 'Tugas Baru' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Judul Tugas</ion-label>
        <ion-input v-model="form.title"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Deadline</ion-label>
        <ion-input type="date" v-model="form.dueDate"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Catatan</ion-label>
        <ion-textarea v-model="form.description" rows="3"></ion-textarea>
      </ion-item>
      <ion-button expand="block" class="ion-margin-top" @click="save">Simpan</ion-button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonItem, IonLabel, IonInput, IonTextarea } from '@ionic/vue';

// Terima props baru: editingId dan initialData
const props = defineProps<{ 
  isOpen: boolean; 
  editingId: number | null; 
  initialData: any 
}>();

const emit = defineEmits(['close', 'save']);
const form = ref({ title: '', description: '', dueDate: '' });

// Isi form jika ada data awal (saat edit)
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.initialData) {
    form.value = { ...props.initialData };
  } else if (isOpen) {
    form.value = { title: '', description: '', dueDate: '' };
  }
});

const save = () => emit('save', form.value);
</script>
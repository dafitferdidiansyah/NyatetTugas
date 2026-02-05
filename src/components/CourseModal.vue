<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editingId ? 'Edit Matkul' : 'Tambah Matkul' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-item>
        <ion-label position="stacked">Nama Mata Kuliah</ion-label>
        <ion-input v-model="form.name" placeholder="Contoh: Algoritma"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Nama Dosen</ion-label>
        <ion-input v-model="form.lecturer" placeholder="Contoh: Pak Budi"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Hari</ion-label>
        <ion-select v-model="form.day" placeholder="Pilih Hari">
          <ion-select-option value="Senin">Senin</ion-select-option>
          <ion-select-option value="Selasa">Selasa</ion-select-option>
          <ion-select-option value="Rabu">Rabu</ion-select-option>
          <ion-select-option value="Kamis">Kamis</ion-select-option>
          <ion-select-option value="Jumat">Jumat</ion-select-option>
          <ion-select-option value="Sabtu">Sabtu</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-button expand="block" class="ion-margin-top" @click="save">
        Simpan
      </ion-button>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption 
} from '@ionic/vue';

const props = defineProps<{ isOpen: boolean; editingId: number | null; initialData: any }>();
const emit = defineEmits(['close', 'save']);

const form = ref({ name: '', lecturer: '', day: '' });

// Isi form otomatis jika sedang Edit
watch(() => props.initialData, (newVal) => {
  if (newVal) {
    form.value = { ...newVal };
  } else {
    form.value = { name: '', lecturer: '', day: '' };
  }
});

const save = () => {
  emit('save', form.value);
};
</script>
<template>
  <ion-header>
    <ion-toolbar color="primary">
      <ion-title>{{ isEditMode ? 'Edit Tugas' : 'Tambah Tugas Baru' }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="cancel">Batal</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <ion-list>
      <ion-item>
        <ion-input label="Nama Tugas" label-placement="stacked" v-model="taskData.nama_tugas"></ion-input>
      </ion-item>
      <ion-item>
        <ion-select label="Mata Kuliah" label-placement="stacked" v-model="taskData.mata_kuliah" interface="action-sheet">
          <ion-select-option v-for="course in courses" :key="course" :value="course">{{ course }}</ion-select-option>
        </ion-select>
      </ion-item>
      
      <ion-item lines="none">
        <ion-label position="stacked">Deadline</ion-label>
      </ion-item>
      <div class="datepicker-container">
        <VueDatePicker 
          v-model="selectedDate"
          format="dd-MM-yyyy"
          auto-apply
          :enable-time-picker="false"
          placeholder="Pilih Tanggal"
          text-input
          dark
          teleport-center
          class="dp-custom" />
      </div>
      
      <ion-item>
        <ion-select label="Status" label-placement="stacked" v-model="taskData.status" interface="action-sheet">
          <ion-select-option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-select label="Prioritas" label-placement="stacked" v-model="taskData.prioritas" interface="action-sheet">
          <ion-select-option v-for="priority in priorityOptions" :key="priority" :value="priority">{{ priority }}</ion-select-option>
        </ion-select>
      </ion-item>
      <ion-item>
        <ion-textarea label="Deskripsi" label-placement="stacked" v-model="taskData.deskripsi" :auto-grow="true"></ion-textarea>
      </ion-item>
    </ion-list>
    <ion-button expand="block" @click="save">Simpan</ion-button>
    <ion-button v-if="isEditMode" expand="block" color="danger" fill="outline" @click="handleDelete">Hapus</ion-button>
  </ion-content>
</template>

<style>
.datepicker-container {
  padding: 0 16px 10px 16px;
}

.dp-custom {
  --dp-primary-color: #3880ff;
}

/* Memaksa menu kalender untuk selalu tampil di atas */
.dp__menu {
  z-index: 9999 !important;
}

.dp-custom .dp__input_icon {
  display: none;
}

/* Memastikan header bulan/tahun selalu terlihat */
.dp__month_year_select {
  color: var(--dp-text-color, #ffffff) !important;
}

/* Mengatur style input field agar rapi */
.dp__input_wrap .dp__input {
  border: 1px solid var(--ion-color-step-300, #4d4d4d);
  background-color: transparent;
  color: var(--ion-text-color, #ffffff);
  font-family: var(--ion-font-family);
  font-size: inherit;
  line-height: 1.5;
  padding: 8px 12px !important;
  border-radius: 6px;
}
</style>

<script setup lang="ts">
import { ref, defineProps, onMounted, watch } from 'vue';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonInput, 
  IonSelect, IonSelectOption, IonTextarea, IonButton, IonButtons, IonLabel,
  modalController
} from '@ionic/vue';
import { useTasks, Task } from '@/composables/useTasks';

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const props = defineProps<{ task: Task | null }>();

const { courses, statusOptions, priorityOptions, saveTask, deleteTask, loadData } = useTasks();

const isEditMode = ref(false);
const selectedDate = ref<Date | null>(null);

const taskData = ref<any>({
  nama_tugas: '',
  mata_kuliah: '',
  deadline: '',
  status: statusOptions[0],
  prioritas: priorityOptions[1],
  deskripsi: ''
});

onMounted(() => {
  loadData();
  if (props.task) {
    isEditMode.value = true;
    taskData.value = { ...props.task };

    if (props.task.deadline) {
      const parts = props.task.deadline.split('-');
      selectedDate.value = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
  }
});

watch(selectedDate, (newDate) => {
  if (newDate) {
    const day = String(newDate.getDate()).padStart(2, '0');
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const year = newDate.getFullYear();
    taskData.value.deadline = `${day}-${month}-${year}`;
  } else {
    taskData.value.deadline = '';
  }
});

const cancel = () => modalController.dismiss(null, 'cancel');
const save = () => {
  saveTask(taskData.value);
  modalController.dismiss(null, 'confirm');
};
const handleDelete = () => {
  if (taskData.value.id) {
    deleteTask(taskData.value.id);
    modalController.dismiss(null, 'confirm');
  }
};
</script>
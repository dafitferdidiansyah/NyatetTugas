<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Daftar Tugas</ion-title>
        <ion-buttons slot="end">
          <ion-select v-model="sortOrder" interface="action-sheet" placeholder="Urutkan">
            <ion-select-option value="deadline">Deadline</ion-select-option>
            <ion-select-option value="createdAt">Tanggal Dibuat</ion-select-option>
            <ion-select-option value="modifiedAt">Terakhir Diubah</ion-select-option>
          </ion-select>
          <ion-button @click="triggerFileInput">
            <ion-icon slot="icon-only" :icon="cloudUploadOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json" style="display: none;" />

      <ion-list>
        <ion-item v-if="tasks.length === 0" lines="none">
          <ion-label class="ion-text-center">Belum ada tugas.</ion-label>
        </ion-item>

        <ion-card v-for="task in sortedTasks" :key="task.id">
          <ion-item lines="none">
            <ion-checkbox
              slot="start"
              :checked="isTaskDone(task.status)"
              @ionChange="toggleStatus(task.id, $event)"
            ></ion-checkbox>
            
            <ion-label @click="openTaskModal(task)" :class="{ 'task-done': isTaskDone(task.status) }">
              <h2>{{ task.nama_tugas }}</h2>
              <p>{{ task.mata_kuliah }} | {{ task.deadline }}</p>
            </ion-label>
            
            <ion-icon :icon="getPriorityIcon(task.prioritas).name" :color="getPriorityIcon(task.prioritas).color" slot="end"></ion-icon>
          </ion-item>
        </ion-card>

      </ion-list>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="openTaskModal()">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.task-done h2 {
  text-decoration: line-through;
  color: var(--ion-color-medium);
}
.task-done p {
  text-decoration: line-through;
}
ion-card {
  margin-left: 0;
  margin-right: 0;
}
ion-select {
  --padding-start: 10px;
  --padding-end: 10px;
  min-width: 110px;
}
</style>

<script setup lang="ts">
import { ref, computed } from 'vue'; // Tambahkan 'computed'
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonCard, IonFab, IonFabButton, IonIcon, IonButtons, IonButton, IonCheckbox,
  IonSelect, IonSelectOption, // Tambahkan IonSelect & IonSelectOption
  modalController, onIonViewWillEnter, toastController
} from '@ionic/vue';
import { 
  add, alertCircleOutline, removeOutline, radioButtonOffOutline, ellipseOutline, cloudUploadOutline
} from 'ionicons/icons';
import { useTasks, Task } from '@/composables/useTasks';
import TaskModal from '@/components/TaskModal.vue';

const { tasks, addMultipleTasks, loadData, toggleTaskStatus } = useTasks();
const fileInput = ref<HTMLInputElement | null>(null);
const sortOrder = ref('deadline'); // State untuk menyimpan urutan

// Logika untuk mengurutkan tugas
const sortedTasks = computed(() => {
  const tasksCopy = [...tasks.value];
  if (sortOrder.value === 'createdAt') {
    return tasksCopy.sort((a, b) => b.createdAt - a.createdAt); // Terbaru dulu
  } else if (sortOrder.value === 'modifiedAt') {
    return tasksCopy.sort((a, b) => b.modifiedAt - a.modifiedAt); // Terbaru dulu
  }
  // Default: deadline
  return tasksCopy.sort((a, b) => {
    const dateA = new Date(a.deadline.split('-').reverse().join('-')).getTime();
    const dateB = new Date(b.deadline.split('-').reverse().join('-')).getTime();
    return dateA - dateB;
  });
});

onIonViewWillEnter(() => {
  loadData();
});

const getPriorityIcon = (priority: string) => {
  const map: { [key: string]: { name: string, color: string } } = {
    "Tinggi": { name: alertCircleOutline, color: "danger" },
    "Sedang": { name: removeOutline, color: "warning" },
    "Rendah": { name: radioButtonOffOutline, color: "success" }
  };
  return map[priority] || { name: ellipseOutline, color: "medium" };
};

const openTaskModal = async (task: Task | null = null) => {
  const modal = await modalController.create({
    component: TaskModal,
    componentProps: {
      task: task ? { ...task } : null,
    },
  });
  await modal.present();
  const { role } = await modal.onDidDismiss();
  if (role === 'confirm') {
    loadData();
  }
};

const isTaskDone = (status: string) => {
  return status === 'Selesai' || status === 'Sudah Dikumpulkan';
};

const toggleStatus = (taskId: string, event: Event) => {
  event.stopPropagation();
  toggleTaskStatus(taskId);
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      const newTasks = JSON.parse(content);
      if (!Array.isArray(newTasks)) { throw new Error("Format JSON tidak valid."); }
      const validTasks: Partial<Task>[] = newTasks.filter(task => 
        task.nama_tugas && task.mata_kuliah && task.deadline
      );
      if (validTasks.length > 0) {
        addMultipleTasks(validTasks);
      }
      const toast = await toastController.create({ message: `${validTasks.length} tugas berhasil diimpor!`, duration: 2000, color: 'success' });
      await toast.present();
    } catch (error) {
      const toast = await toastController.create({ message: 'Gagal mengimpor file. Pastikan format JSON sudah benar.', duration: 3000, color: 'danger' });
      await toast.present();
    } finally {
      if(target) target.value = '';
    }
  };
  reader.readAsText(file);
};
</script>
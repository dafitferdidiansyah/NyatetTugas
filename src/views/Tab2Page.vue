<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Daftar Tugas</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="isOpen = true">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <ion-item-sliding v-for="task in tasks" :key="task.id">
          
          <ion-item>
            <ion-checkbox 
              slot="start" 
              :checked="task.completed"
              @ionChange="toggleCheck(task)"
            ></ion-checkbox>
            <ion-label :style="task.completed ? 'text-decoration: line-through; opacity: 0.6' : ''">
              <h2>{{ task.title }}</h2>
              <p>{{ task.description }}</p>
            </ion-label>
          </ion-item>

<ion-item-options side="end">
  <ion-item-option color="primary" @click="openEditModal(task)">
    <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
  </ion-item-option>
  <ion-item-option color="danger" @click="deleteTask(task.id)">
    <ion-icon :icon="trash" slot="icon-only"></ion-icon>
  </ion-item-option>
</ion-item-options>
        
        </ion-item-sliding>
      </ion-list>

      <div v-if="tasks.length === 0" class="ion-text-center ion-padding ion-margin-top">
        <p style="color: gray;">Tidak ada tugas. Tekan + untuk menambah.</p>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="isOpen = true">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <task-modal 
        :is-open="isOpen" 
        @close="isOpen = false"
        @save="handleSave"
      />

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonList, IonItem, IonLabel, IonCheckbox, IonItemSliding, IonItemOptions, IonItemOption,
  IonFab, IonFabButton, IonIcon
} from '@ionic/vue';
import { add, trash, createOutline, calendarOutline } from 'ionicons/icons';
import { useTasks, Task } from '@/composables/useTasks';
import TaskModal from '@/components/TaskModal.vue';

const { tasks, addTask, updateTask, deleteTask } = useTasks();
const isOpen = ref(false);

const toggleCheck = (task: Task) => {
  updateTask(task.id, { completed: !task.completed });
};
// Tambahkan import createOutline

// Tambahkan state baru
const editingId = ref<number | null>(null);
const selectedTask = ref<any>(null);

// Fungsi buka modal (bisa untuk Baru atau Edit)
const openEditModal = (task: any) => {
  editingId.value = task.id;
  selectedTask.value = { title: task.title, description: task.description, dueDate: task.dueDate };
  isOpen.value = true;
};

// Update handleSave agar support edit
const handleSave = (data: any) => {
  if (editingId.value) {
    updateTask(editingId.value, data);
  } else {
    addTask(data);
  }
  isOpen.value = false;
  editingId.value = null;     // Reset
  selectedTask.value = null;  // Reset
};

// Reset saat tombol tambah (+) ditekan
const openAddModal = () => {
  editingId.value = null;
  selectedTask.value = null;
  isOpen.value = true;
};
</script>
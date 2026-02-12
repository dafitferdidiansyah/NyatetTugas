<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Daftar Tugas</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openModal">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-searchbar v-model="searchQuery" placeholder="Cari tugas..." class="simple-search"></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      
      <ion-list v-if="filteredTasks.length > 0">
        <ion-item-sliding v-for="task in filteredTasks" :key="task.id">
          
          <ion-item>
            <ion-checkbox 
              slot="start" 
              :checked="task.completed" 
              @ionChange="toggleComplete(task)"
            ></ion-checkbox>

            <ion-label class="ion-text-wrap">
              <h2>{{ task.title }}</h2>
            <p>
              {{ getCourseName(task.courseId) }} 
              <ion-text :color="getDeadlineStatus(task.dueDate).color" v-if="task.dueDate">
                • {{ getDeadlineStatus(task.dueDate).label }}
              </ion-text>
            </p>
            </ion-label>

            <div slot="end" class="meta-end">
              <ion-icon 
                v-if="task.attachments && task.attachments.length > 0" 
                :icon="attachOutline" 
                color="medium" 
                size="small"
                style="margin-right: 8px;"
              ></ion-icon>

              <ion-badge :color="getPriorityColor(task.priority)">
                {{ task.priority }}
              </ion-badge>
            </div>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" @click="editTask(task)">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="handleDelete(task.id)">
              <ion-icon :icon="trash" slot="icon-only"></ion-icon>
            </ion-item-option>
          </ion-item-options>

        </ion-item-sliding>
      </ion-list>

      <div v-else class="empty-state">
        <ion-icon :icon="clipboardOutline" class="large-icon"></ion-icon>
        <p>Belum ada tugas.</p>
      </div>

      <TaskModal 
        :is-open="isModalOpen" 
        :editing-id="editingId" 
        :initial-data="editingData"
        @close="isModalOpen = false" 
        @save="handleSave" 
      />

    </ion-content>
  </ion-page>
</template>

<style scoped>
/* Meniru style simple yang Anda berikan */
.empty-state { text-align: center; margin-top: 100px; color: #888; }
.large-icon { font-size: 64px; margin-bottom: 10px; color: #ccc; }

/* Sedikit penyesuaian agar searchbar tidak terlalu tebal */
.simple-search { --box-shadow: none; padding-top: 0; padding-bottom: 0; }

/* Agar badge dan icon di kanan rapi */
.meta-end { display: flex; align-items: center; }
</style>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonCheckbox, IonButtons, IonButton, IonIcon, 
  IonItemSliding, IonItemOptions, IonItemOption, IonBadge, IonSearchbar
} from '@ionic/vue';
import { 
  add, trash, createOutline, attachOutline, clipboardOutline 
} from 'ionicons/icons';
import TaskModal from '@/components/TaskModal.vue';
import { useTasks, Task } from '@/composables/useTasks';
import { useCourses } from '@/composables/useCourses';

const { tasks, addTask, updateTask, deleteTask } = useTasks();
const { courses } = useCourses();

const isModalOpen = ref(false);
const editingId = ref<number | null>(null);
const editingData = ref<any>(null);
const searchQuery = ref('');

// Filter & Sorting Logic
const filteredTasks = computed(() => {
  let res = [...tasks.value]; // Copy array agar tidak mutasi asli

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    res = res.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  return res.sort((a, b) => {
    // 1. Tetap utamakan yang belum selesai
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    // 2. Hitung Bobot Prioritas (Tinggi: 3, Sedang: 2, Rendah: 1)
    const getPrioValue = (p: string) => (p === 'Tinggi' ? 3 : p === 'Sedang' ? 2 : 1);
    
    // 3. Hitung Sisa Hari (Urgency)
    const getDaysDiff = (dateStr: string) => {
      if (!dateStr) return 999;
      const diff = new Date(dateStr).getTime() - new Date().getTime();
      return Math.ceil(diff / (1000 * 3600 * 24));
    };

    const scoreA = (getPrioValue(a.priority) * 10) - getDaysDiff(a.dueDate);
    const scoreB = (getPrioValue(b.priority) * 10) - getDaysDiff(b.dueDate);

    return scoreB - scoreA; // Skor tinggi di atas
  });
});

// Helpers
const getCourseName = (id: number | null) => {
  const c = courses.value.find(x => x.id === id);
  return c ? c.name : 'Umum';
};

const getPriorityColor = (p: string) => {
  if (p === 'Tinggi') return 'danger';
  if (p === 'Sedang') return 'warning';
  return 'success'; // Rendah = Hijau
};

const getDeadlineStatus = (dateStr: string) => {
  if (!dateStr) return { label: '', color: 'medium' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Terlewat', color: 'danger' };
  if (diffDays === 0) return { label: 'Hari Ini', color: 'warning' };
  if (diffDays === 1) return { label: 'Besok', color: 'primary' };
  return { label: formatDate(dateStr), color: 'medium' };
};

const formatDate = (date: string) => {
  if (!date) return '';
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return new Date(date).toLocaleDateString('id-ID', options);
};

// Actions
const openModal = () => { editingId.value = null; editingData.value = null; isModalOpen.value = true; };
const editTask = (task: Task) => { editingId.value = task.id; editingData.value = task; isModalOpen.value = true; };
const handleSave = (formData: any) => {
  if (editingId.value) updateTask(editingId.value, formData);
  else addTask(formData);
  isModalOpen.value = false;
};
const handleDelete = (id: number) => deleteTask(id);
const toggleComplete = (task: Task) => {
  updateTask(task.id, { completed: !task.completed });
};
</script>
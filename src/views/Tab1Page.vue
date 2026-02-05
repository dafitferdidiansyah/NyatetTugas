<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="transparent-toolbar">
        <ion-title class="main-title">NyatetTugas</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="triggerFileInput" class="pastel-btn-icon">
             <ion-icon :icon="cloudUploadOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="pastel-bg">
      <div class="content-padding">
        
        <DashboardCard :progress="summary.progress" :pending="summary.pending" />

        <div class="search-wrapper">
          <ion-searchbar 
            v-model="searchQuery" 
            placeholder="Cari tugas..." 
            class="pastel-search"
            animated
          ></ion-searchbar>
        </div>

        <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json" style="display: none;" />

        <div v-if="groupedTasks.overdue.length > 0" class="section-group">
          <h4 class="section-title text-danger">Terlewat! 🔥</h4>
          <div v-for="task in groupedTasks.overdue" :key="task.id" class="task-card danger-card">
             <div class="task-check">
               <ion-checkbox :checked="false" @click.stop="toggleTaskStatus(task.id)"></ion-checkbox>
             </div>
             <div class="task-info" @click="openTaskModal(task)">
               <h5>{{ task.nama_tugas }}</h5>
               <p>{{ task.mata_kuliah }} • {{ task.deadline }}</p>
             </div>
             <div class="task-actions">
               <ion-button fill="clear" size="small" color="medium" @click.stop="confirmDelete(task)">
                 <ion-icon slot="icon-only" :icon="trashOutline" size="small"></ion-icon>
               </ion-button>
             </div>
          </div>
        </div>

        <div v-if="groupedTasks.today.length > 0" class="section-group">
          <h4 class="section-title">Hari Ini 📅</h4>
           <div v-for="task in groupedTasks.today" :key="task.id" class="task-card primary-card">
             <div class="task-check">
               <ion-checkbox :checked="false" @click.stop="toggleTaskStatus(task.id)"></ion-checkbox>
             </div>
             <div class="task-info" @click="openTaskModal(task)">
               <h5>{{ task.nama_tugas }}</h5>
               <span class="badge">{{ task.mata_kuliah }}</span>
             </div>
             <div class="task-actions">
                <ion-icon :icon="getPriorityIcon(task.prioritas)" :color="getPriorityColor(task.prioritas)" class="prio-icon"></ion-icon>
                <ion-button fill="clear" size="small" color="medium" @click.stop="confirmDelete(task)">
                 <ion-icon slot="icon-only" :icon="trashOutline" size="small"></ion-icon>
               </ion-button>
             </div>
          </div>
        </div>

        <div v-if="groupedTasks.upcoming.length > 0" class="section-group">
          <h4 class="section-title">Akan Datang 🚀</h4>
           <div v-for="task in groupedTasks.upcoming" :key="task.id" class="task-card default-card">
             <div class="task-check">
               <ion-checkbox :checked="false" @click.stop="toggleTaskStatus(task.id)"></ion-checkbox>
             </div>
             <div class="task-info" @click="openTaskModal(task)">
               <h5>{{ task.nama_tugas }}</h5>
               <p>{{ task.deadline }}</p>
             </div>
             <div class="task-actions">
               <ion-button fill="clear" size="small" color="medium" @click.stop="confirmDelete(task)">
                 <ion-icon slot="icon-only" :icon="trashOutline" size="small"></ion-icon>
               </ion-button>
             </div>
          </div>
        </div>
        
        <div v-if="summary.total === 0" class="empty-state">
           <ion-icon :icon="sparklesOutline" class="empty-icon"></ion-icon>
           <p>Wah, semua bersih! 😎</p>
        </div>

      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed" class="custom-fab">
        <ion-fab-button @click="openTaskModal()">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<style scoped>
/* --- Layout & Typography --- */
.transparent-toolbar { --background: transparent; }
.main-title { font-weight: 800; color: #4A5568; font-size: 1.5rem; padding-left: 10px; }
.content-padding { padding: 16px; padding-bottom: 80px; }
.pastel-bg { --background: #F7F9FC; }

/* --- Search Bar --- */
.search-wrapper { margin-bottom: 20px; }
.pastel-search { 
  --background: #ffffff; 
  --box-shadow: 0 8px 20px rgba(181, 185, 255, 0.15); 
  --border-radius: 16px; 
  padding: 0;
}

/* --- Section Headers --- */
.section-group { margin-bottom: 24px; }
.section-title { margin-left: 8px; font-weight: 700; color: #718096; font-size: 0.9rem; margin-bottom: 12px; letter-spacing: 0.5px; }
.text-danger { color: #FF9AA2; }

/* --- Task Card Design --- */
.task-card {
  background: white;
  border-radius: 20px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
  transition: all 0.2s ease;
  border: 1px solid transparent;
}
.task-card:active { transform: scale(0.98); }

/* Color Indicators (Left Border) */
.danger-card { border-left: 6px solid #FF9AA2; background: #FFF5F5; }
.primary-card { border-left: 6px solid #B5B9FF; }
.default-card { border-left: 6px solid #C7F9CC; }

/* Content Layout */
.task-check { display: flex; align-items: center; margin-right: 12px; }
.task-info { flex: 1; cursor: pointer; }
.task-info h5 { margin: 0; font-weight: 700; color: #2D3748; font-size: 1rem; line-height: 1.4; }
.task-info p { margin: 4px 0 0; font-size: 0.8rem; color: #A0AEC0; font-weight: 500; }

/* Actions (Right Side) */
.task-actions { display: flex; align-items: center; gap: 4px; }
.prio-icon { font-size: 10px; margin-right: 8px; opacity: 0.8; }

/* Badge Style */
.badge { 
  display: inline-block; margin-top: 4px;
  background: #EBEFFF; color: #5A67D8; 
  padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700;
}

/* --- FAB & Empty State --- */
.custom-fab ion-fab-button {
  --background: #B5B9FF;
  --box-shadow: 0 10px 25px rgba(181, 185, 255, 0.6);
  --border-radius: 18px;
  --color: white;
}
.empty-state { text-align: center; margin-top: 80px; color: #CBD5E0; }
.empty-icon { font-size: 4rem; margin-bottom: 10px; opacity: 0.5; }
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonFabButton, 
  IonIcon, IonButtons, IonButton, IonSearchbar, IonCheckbox,
  modalController, onIonViewWillEnter, toastController, alertController
} from '@ionic/vue';
import { 
  add, cloudUploadOutline, alertCircle, warning, ellipse, trashOutline, sparklesOutline 
} from 'ionicons/icons';
import { useTasks, Task } from '@/composables/useTasks';
import TaskModal from '@/components/TaskModal.vue';
import DashboardCard from '@/components/DashboardCard.vue';

// Mengambil fungsi dari Composable
const { groupedTasks, summary, searchQuery, addMultipleTasks, loadData, toggleTaskStatus, deleteTask } = useTasks();
const fileInput = ref<HTMLInputElement | null>(null);

onIonViewWillEnter(() => loadData());

// Helper untuk Ikon & Warna Prioritas
const getPriorityIcon = (p: string) => {
  if (p === 'Tinggi') return alertCircle;
  if (p === 'Sedang') return warning;
  return ellipse;
};

const getPriorityColor = (p: string) => {
    if (p === 'Tinggi') return 'danger';
    if (p === 'Sedang') return 'warning';
    return 'medium';
}

// --- FUNGSI HAPUS DENGAN KONFIRMASI ---
const confirmDelete = async (task: Task) => {
  const alert = await alertController.create({
    header: 'Hapus Tugas?',
    message: `Yakin ingin menghapus "${task.nama_tugas}"?`,
    cssClass: 'custom-alert',
    buttons: [
      { text: 'Batal', role: 'cancel', cssClass: 'alert-button-cancel' },
      { 
        text: 'Hapus', 
        role: 'destructive',
        cssClass: 'alert-button-confirm',
        handler: async () => {
          deleteTask(task.id);
          const toast = await toastController.create({
            message: 'Tugas berhasil dihapus', duration: 1500, color: 'dark', position: 'bottom'
          });
          await toast.present();
        } 
      }
    ]
  });
  await alert.present();
};

const openTaskModal = async (task: Task | null = null) => {
  const modal = await modalController.create({
    component: TaskModal,
    componentProps: { task: task ? { ...task } : null },
    cssClass: 'my-custom-modal'
  });
  await modal.present();
  const { role } = await modal.onDidDismiss();
  if (role === 'confirm') loadData();
};

const triggerFileInput = () => fileInput.value?.click();

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      const newTasks = JSON.parse(content);
      if (!Array.isArray(newTasks)) throw new Error("Format JSON tidak valid.");
      
      const validTasks: Partial<Task>[] = newTasks.filter(task => 
        task.nama_tugas && task.mata_kuliah && task.deadline
      );
      
      if (validTasks.length > 0) addMultipleTasks(validTasks);
      
      const toast = await toastController.create({ 
        message: `${validTasks.length} tugas diimpor!`, duration: 2000, color: 'success' 
      });
      await toast.present();
    } catch (error) {
      const toast = await toastController.create({ 
        message: 'Gagal impor. Cek format JSON.', duration: 3000, color: 'danger' 
      });
      await toast.present();
    } finally {
      if(target) target.value = '';
    }
  };
  reader.readAsText(file);
};
</script>
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard Statistik</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="stats-section">
        <h3>Progres Tugas</h3>
        <ion-card class="progress-card">
          <ion-card-content>
            <div class="progress-info">
              <div class="progress-text">
                <h1>{{ completionRate }}%</h1>
                <p>Tugas Selesai</p>
              </div>
              <div class="progress-numbers">
                <ion-badge color="success">{{ doneCount }} Completed</ion-badge>
                <ion-badge color="warning">{{ pendingCount }} Pending</ion-badge>
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-fill" :style="{ width: completionRate + '%' }"></div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div class="stats-section ion-margin-top">
        <h3>Beban Mata Kuliah</h3>
        <ion-list class="stats-list">
          <ion-item v-for="stat in courseStats" :key="stat.name" lines="none">
            <ion-icon :icon="bookOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>{{ stat.name }}</h2>
              <p>{{ stat.count }} Tugas Total</p>
            </ion-label>
            <ion-note slot="end" color="primary">{{ stat.pending }} Pending</ion-note>
          </ion-item>
          <ion-item v-if="courseStats.length === 0" lines="none">
            <p class="empty-text">Belum ada data matkul.</p>
          </ion-item>
        </ion-list>
      </div>

      <div class="stats-section ion-margin-top">
        <h3>Distribusi Prioritas</h3>
        <ion-grid class="ion-no-padding">
          <ion-row>
            <ion-col size="4">
              <div class="prio-box prio-high">
                <small>Tinggi</small>
                <h2>{{ priorityStats.high }}</h2>
              </div>
            </ion-col>
            <ion-col size="4">
              <div class="prio-box prio-med">
                <small>Sedang</small>
                <h2>{{ priorityStats.med }}</h2>
              </div>
            </ion-col>
            <ion-col size="4">
              <div class="prio-box prio-low">
                <small>Rendah</small>
                <h2>{{ priorityStats.low }}</h2>
              </div>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <div class="ion-margin-top">
        <h3>Sistem & Backup</h3>
        <ion-list class="settings-list">
          <ion-item button @click="exportDataNative" lines="full">
            <ion-icon :icon="downloadOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>Export JSON</h2>
              <p>Simpan backup ke Documents</p>
            </ion-label>
          </ion-item>
          <ion-item button @click="triggerImport" lines="full">
            <input type="file" ref="fileInput" style="display: none" accept=".json" @change="handleImport" />
            <ion-icon :icon="cloudUploadOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>Import JSON</h2>
              <p>Pulihkan data dari file</p>
            </ion-label>
          </ion-item>
          <ion-item button @click="handleCleanup" lines="none">
            <ion-icon :icon="trashOutline" slot="start" color="danger"></ion-icon>
            <ion-label>
              <h2>Bersihkan Storage</h2>
              <p>Hapus file sampah</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonGrid, IonRow, IonCol, IonCard, IonCardContent, 
  IonIcon, IonList, IonItem, IonLabel, IonBadge, IonNote, IonText, alertController 
} from '@ionic/vue';
import { downloadOutline, cloudUploadOutline, trashOutline, bookOutline } from 'ionicons/icons';
import { useTasks } from '@/composables/useTasks';
import { useCourses } from '@/composables/useCourses';
import { useNotifications } from '@/composables/useNotifications';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { storageService } from '@/services/storage';

const { tasks, importTasks, ensureFolder, cleanupStorage } = useTasks();
const { courses } = useCourses();
const { requestPermissions } = useNotifications();

const fileInput = ref<HTMLInputElement | null>(null);

onMounted(() => { requestPermissions(); });

const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length);
const doneCount = computed(() => tasks.value.filter(t => t.completed).length);

const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0;
  return Math.round((doneCount.value / tasks.value.length) * 100);
});

const priorityStats = computed(() => ({
  high: tasks.value.filter(t => t.priority === 'Tinggi').length,
  med: tasks.value.filter(t => t.priority === 'Sedang').length,
  low: tasks.value.filter(t => t.priority === 'Rendah').length,
}));

const courseStats = computed(() => {
  return courses.value.map(c => {
    const relatedTasks = tasks.value.filter(t => t.courseId === c.id);
    return {
      name: c.name,
      count: relatedTasks.length,
      pending: relatedTasks.filter(t => !t.completed).length
    };
  }).sort((a, b) => b.count - a.count).slice(0, 3);
});

const exportDataNative = async () => {
  const backupData = { tasks: tasks.value, courses: courses.value, exportedAt: new Date().toISOString() };
  const fileName = `backup-nyatettugas-${Date.now()}.json`;
  try {
    await ensureFolder();
    const result = await Filesystem.writeFile({
      path: `NyatetTugas/${fileName}`,
      data: JSON.stringify(backupData, null, 2),
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    await Share.share({ title: 'Backup NyatetTugas', url: result.uri, dialogTitle: 'Simpan Backup' });
  } catch (e) { alert('Gagal export data.'); }
};

const triggerImport = () => fileInput.value?.click();
const handleImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target?.result as string);
      const alert = await alertController.create({
        header: 'Timpa Data?',
        message: 'Data saat ini akan diganti sepenuhnya.',
        buttons: [
          { text: 'Batal', role: 'cancel' },
          { text: 'Ya, Timpa', handler: () => {
            if (json.tasks) importTasks(json.tasks);
            if (json.courses) {
              storageService.set('my_courses_app', json.courses); // Lebih rapi dan aman
              window.location.reload();
            }
          }}
        ]
      });
      await alert.present();
    } catch (err) { alert('JSON tidak valid!'); }
  };
  reader.readAsText(file);
};

const handleCleanup = async () => {
  await cleanupStorage();
  alert('Storage bersih!');
};
</script>

<style scoped>
/* Layout Global */
h3 { font-weight: bold; margin-bottom: 12px; margin-top: 20px; font-size: 18px; }

/* Progress Card */
.progress-card { background: #1e1e1e; border-radius: 16px; margin: 0; border: 1px solid #333; }
.progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.progress-text h1 { margin: 0; font-size: 32px; font-weight: 800; color: var(--ion-color-primary); }
.progress-text p { margin: 0; color: #888; font-size: 12px; }
.progress-numbers { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.progress-bar-container { width: 100%; height: 8px; background: #333; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--ion-color-primary); transition: width 0.5s ease-out; }

/* Stats List */
.stats-list { background: transparent; padding: 0; }
.stats-list ion-item { --background: transparent; margin-bottom: 8px; border: 1px solid #222; border-radius: 12px; }

/* --- PERBAIKAN WARNA PENUH DI TENGAH --- */
.prio-box { 
  text-align: center; 
  padding: 12px; 
  border-radius: 12px; 
  margin: 2px;
  border: 1px solid #333;
  transition: transform 0.2s;
}
.prio-box:active { transform: scale(0.95); }
.prio-box small { color: #ffffff; font-size: 10px; text-transform: uppercase; font-weight: bold; opacity: 0.8; }
.prio-box h2 { margin: 5px 0 0 0; font-weight: bold; color: #ffffff; }

/* Kotak Tinggi (Merah) */
/* Ganti di Tab1Page.vue bagian style */
.prio-high { background: rgba(235, 68, 90, 0.25) !important; border: 1px solid #eb445a; }
.prio-med { background: rgba(255, 196, 9, 0.25) !important; border: 1px solid #ffc409; }
.prio-low { background: rgba(45, 211, 111, 0.25) !important; border: 1px solid #2dd36f; }

/* Settings List */
.settings-list { background: #1a1a1a; border-radius: 12px; overflow: hidden; }
.empty-text { color: #666; font-size: 14px; padding: 10px; }
</style>
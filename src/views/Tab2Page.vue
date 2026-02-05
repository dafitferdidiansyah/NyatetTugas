<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Mata Kuliah</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="triggerFileInput">
            <ion-icon slot="icon-only" :icon="cloudUploadOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json" style="display: none;" />
      <ion-list>
        <ion-item v-if="courses.length === 0">
          <ion-label class="ion-text-center">Belum ada mata kuliah.</ion-label>
        </ion-item>
        <ion-item-sliding v-for="course in courses" :key="course">
          <ion-item button @click="handleEdit(course)">
            <ion-label>{{ course }}</ion-label>
          </ion-item>
          <ion-item-options side="end">
            <ion-item-option color="danger" @click="handleDelete(course)">
              <ion-icon slot="icon-only" :icon="trash"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="handleAdd()">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonItemSliding, IonItemOptions, IonItemOption, IonFab, IonFabButton, IonIcon, 
  IonButtons, IonButton,
  alertController, onIonViewWillEnter, toastController
} from '@ionic/vue';
import { add, trash, cloudUploadOutline } from 'ionicons/icons';
import { useTasks } from '@/composables/useTasks';

const { courses, addCourse, deleteCourse, updateCourse, loadData } = useTasks(); // Tambahkan updateCourse
const fileInput = ref<HTMLInputElement | null>(null);

onIonViewWillEnter(() => {
  loadData();
});

const handleDelete = (courseName: string) => {
  deleteCourse(courseName);
};

// --- FUNGSI EDIT BARU ---
const handleEdit = async (oldCourseName: string) => {
  const alert = await alertController.create({
    header: 'Edit Mata Kuliah',
    inputs: [{ name: 'newCourseName', type: 'text', value: oldCourseName, placeholder: 'Nama Mata Kuliah' }],
    buttons: [
      { text: 'Batal', role: 'cancel' },
      {
        text: 'Simpan',
        handler: (data) => {
          if (data.newCourseName && data.newCourseName.trim() !== oldCourseName) {
            updateCourse(oldCourseName, data.newCourseName.trim());
          }
        },
      },
    ],
  });
  await alert.present();
};

const handleAdd = async () => {
  const alert = await alertController.create({
    header: 'Tambah Mata Kuliah',
    inputs: [{ name: 'courseName', type: 'text', placeholder: 'Nama Mata Kuliah Baru' }],
    buttons: [
      { text: 'Batal', role: 'cancel' },
      {
        text: 'Simpan',
        handler: (data) => {
          if (data.courseName) {
            addCourse(data.courseName.trim());
          }
        },
      },
    ],
  });
  await alert.present();
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string;
      const newCourses = JSON.parse(content);
      if (!Array.isArray(newCourses)) throw new Error("Format JSON tidak valid.");
      let importedCount = 0;
      newCourses.forEach((course: any) => {
        if (typeof course === 'string') {
          addCourse(course.trim());
          importedCount++;
        }
      });
      const toast = await toastController.create({ message: `${importedCount} mata kuliah berhasil diimpor!`, duration: 2000, color: 'success' });
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
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mata Kuliah</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list v-if="courses.length > 0" ref="listRef">
        <ion-item-sliding v-for="course in courses" :key="course.id">
          <ion-item>
            <ion-icon :icon="bookOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>{{ course.name }}</h2>
              <p>{{ course.lecturer }} 
                <span v-if="course.time"> • {{ course.time }}</span>
                <span v-if="course.room"> • {{ course.room }}</span>
              </p>
            </ion-label>
            <ion-badge slot="end" color="medium">{{ course.day }}</ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" @click="openModal(course)">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="handleDelete(course.id)">
              <ion-icon :icon="trash" slot="icon-only"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <div v-else class="empty-state">
        <ion-icon :icon="schoolOutline" class="large-icon"></ion-icon>
        <p>Belum ada jadwal kuliah.</p>
      </div>

      <course-modal 
        :is-open="isModalOpen" 
        :editing-id="editingId"
        :initial-data="selectedCourse"
        @close="isModalOpen = false"
        @save="handleSave"
      />

        <ion-fab slot="fixed" vertical="bottom" horizontal="end">
      <ion-fab-button color="primary" @click="openModal">
        <ion-icon :icon="add"></ion-icon>
      </ion-fab-button>
    </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonBadge, IonFab, IonFabButton,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/vue';
import { bookOutline, schoolOutline, add, trash, createOutline } from 'ionicons/icons';
import { useCourses, Course } from '@/composables/useCourses';
import CourseModal from '@/components/CourseModal.vue';

const { courses, addCourse, updateCourse, deleteCourse } = useCourses();

const isModalOpen = ref(false);
const editingId = ref<number | null>(null);
const selectedCourse = ref<any>(null);
const listRef = ref<any>(null);

// Fungsi pembantu untuk menutup geseran list
const closeSliding = () => {
  if (listRef.value && listRef.value.$el) {
    listRef.value.$el.closeSlidingItems();
  }
};

const openModal = (course: Course | null) => {
  closeSliding(); // Menutup geseran saat tombol edit di-klik
  
  if (course) {
    editingId.value = course.id;
    selectedCourse.value = { 
      name: course.name, 
      lecturer: course.lecturer, 
      day: course.day,
      time: course.time,
      room: course.room
    };
  } else {
    editingId.value = null;
    selectedCourse.value = null;
  }
  isModalOpen.value = true;
};

// Fungsi perantara hapus untuk menutup geseran
const handleDelete = (id: number) => {
  closeSliding(); // Menutup geseran saat dihapus
  deleteCourse(id);
};

const handleSave = (data: any) => {
  if (editingId.value) {
    updateCourse(editingId.value, data);
  } else {
    addCourse(data);
  }
  isModalOpen.value = false;
};
</script>

<style scoped>
.empty-state { text-align: center; margin-top: 100px; color: #888; }
.large-icon { font-size: 64px; margin-bottom: 10px; color: #ccc; }
</style>
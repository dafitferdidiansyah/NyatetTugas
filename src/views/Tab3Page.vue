<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mata Kuliah</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openModal(null)">
            <ion-icon :icon="add" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-list v-if="courses.length > 0">
        <ion-item-sliding v-for="course in courses" :key="course.id">
          <ion-item>
            <ion-icon :icon="bookOutline" slot="start" color="primary"></ion-icon>
            <ion-label>
              <h2>{{ course.name }}</h2>
              <p>{{ course.lecturer }}</p>
            </ion-label>
            <ion-badge slot="end" color="medium">{{ course.day }}</ion-badge>
          </ion-item>

          <ion-item-options side="end">
            <ion-item-option color="primary" @click="openModal(course)">
              <ion-icon :icon="createOutline" slot="icon-only"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="deleteCourse(course.id)">
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonList, IonItem, IonLabel, IonIcon, IonBadge, IonButtons, IonButton,
  IonItemSliding, IonItemOptions, IonItemOption
} from '@ionic/vue';
import { bookOutline, schoolOutline, add, trash, createOutline } from 'ionicons/icons';
import { useCourses, Course } from '@/composables/useCourses';
import CourseModal from '@/components/CourseModal.vue';

const { courses, addCourse, updateCourse, deleteCourse } = useCourses();

const isModalOpen = ref(false);
const editingId = ref<number | null>(null);
const selectedCourse = ref<any>(null);

const openModal = (course: Course | null) => {
  if (course) {
    editingId.value = course.id;
    selectedCourse.value = { name: course.name, lecturer: course.lecturer, day: course.day };
  } else {
    editingId.value = null;
    selectedCourse.value = null;
  }
  isModalOpen.value = true;
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
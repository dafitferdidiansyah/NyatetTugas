// src/composables/useCourses.ts
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'my_courses_app';

export interface Course {
  id: number;
  name: string;
  lecturer: string;
  day: string;
}

export function useCourses() {
  const courses = ref<Course[]>([]);

  const loadCourses = () => {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) courses.value = JSON.parse(value);
  };

  const saveCourses = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses.value));
  };

  const addCourse = (course: Omit<Course, 'id'>) => {
    courses.value.push({ id: Date.now(), ...course });
    saveCourses();
  };

  const updateCourse = (id: number, updatedCourse: Partial<Course>) => {
    const index = courses.value.findIndex(c => c.id === id);
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...updatedCourse };
      saveCourses();
    }
  };

  const deleteCourse = (id: number) => {
    courses.value = courses.value.filter(c => c.id !== id);
    saveCourses();
  };

  onMounted(loadCourses);

  return { courses, addCourse, updateCourse, deleteCourse };
}
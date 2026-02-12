import { ref, onMounted } from 'vue';
import { storageService } from '@/services/storage';

const STORAGE_KEY = 'my_courses_app';

export interface Course {
  id: number;
  name: string;
  lecturer: string;
  day: string;
}

// Global State (Di luar fungsi)
const courses = ref<Course[]>([]);

export function useCourses() {
  const loadCourses = () => {
    courses.value = storageService.get<Course[]>(STORAGE_KEY, []);
  };

  const saveCourses = () => {
    storageService.set(STORAGE_KEY, courses.value);
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
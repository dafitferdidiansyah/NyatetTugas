import { ref, onMounted } from 'vue';

export interface Task {
  id: string;
  mata_kuliah: string;
  nama_tugas: string;
  deadline: string;
  status: string;
  prioritas: string;
  deskripsi: string;
  createdAt: number;
  modifiedAt: number;
}

const courses = ref<string[]>([]);
const tasks = ref<Task[]>([]);

export function useTasks() {
  const statusOptions = ["Belum Dikerjakan", "Sedang Dikerjakan", "Selesai", "Sudah Dikumpulkan"];
  const priorityOptions = ["Rendah", "Sedang", "Tinggi"];

  const loadData = () => {
    const storedCourses = localStorage.getItem('courses');
    courses.value = storedCourses ? JSON.parse(storedCourses) : [];
    const storedTasks = localStorage.getItem('tasks');
    tasks.value = storedTasks ? JSON.parse(storedTasks) : [];
  };

  const saveData = () => {
    localStorage.setItem('courses', JSON.stringify(courses.value.sort()));
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
  };

  onMounted(loadData);

  const addCourse = (name: string) => {
    if (name && !courses.value.includes(name)) {
      courses.value.push(name);
      saveData();
    }
  };

  const deleteCourse = (name: string) => {
    courses.value = courses.value.filter(c => c !== name);
    tasks.value = tasks.value.filter(t => t.mata_kuliah !== name);
    saveData();
  };

  const updateCourse = (oldName: string, newName: string) => {
    const courseIndex = courses.value.findIndex(c => c === oldName);
    if (courseIndex > -1) { courses.value[courseIndex] = newName; }
    tasks.value.forEach(task => {
      if (task.mata_kuliah === oldName) { task.mata_kuliah = newName; }
    });
    saveData();
    loadData();
  };

  const saveTask = (task: Task) => {
    const now = new Date().getTime();
    if (task.id) {
      const index = tasks.value.findIndex(t => t.id === task.id);
      if (index > -1) {
        // Saat update, pastikan createdAt tetap ada jika sebelumnya sudah ada
        const originalTask = tasks.value[index];
        tasks.value[index] = { ...originalTask, ...task, modifiedAt: now };
      }
    } else {
      task.id = now.toString();
      task.createdAt = now;
      task.modifiedAt = now;
      tasks.value.push(task);
    }
    addCourse(task.mata_kuliah);
    saveData();
    loadData();
  };

  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter(t => t.id !== id);
    saveData();
  };

  // --- PERUBAHAN DI SINI ---
  const addMultipleTasks = (newTasks: Partial<Task>[]) => {
    const now = new Date().getTime();
    newTasks.forEach(task => {
      // Jika id tidak ada, buat baru
      if (!task.id) {
        task.id = new Date().getTime().toString() + Math.random();
      }
      // Jika createdAt tidak ada, tambahkan dengan waktu sekarang
      if (!task.createdAt) {
        task.createdAt = now;
      }
      // Jika modifiedAt tidak ada, tambahkan dengan waktu sekarang
      if (!task.modifiedAt) {
        task.modifiedAt = now;
      }
      
      tasks.value.push(task as Task);
      
      if (task.mata_kuliah) {
        addCourse(task.mata_kuliah);
      }
    });
    saveData();
    loadData();
  };
  
  const toggleTaskStatus = (taskId: string) => {
    const task = tasks.value.find(t => t.id === taskId);
    if (task) {
      if (task.status === "Selesai" || task.status === "Sudah Dikumpulkan") {
        task.status = "Sedang Dikerjakan";
      } else {
        task.status = "Selesai";
      }
      task.modifiedAt = new Date().getTime();
      saveData();
    }
  };

  return {
    courses, tasks, statusOptions, priorityOptions,
    addCourse, deleteCourse, updateCourse, saveTask, deleteTask,
    addMultipleTasks, toggleTaskStatus, loadData
  };
}
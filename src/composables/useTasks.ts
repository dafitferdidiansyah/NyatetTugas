// src/composables/useTasks.ts
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'my_tasks_app';

export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export function useTasks() {
  const tasks = ref<Task[]>([]);

  // Load data dari LocalStorage
  const loadTasks = () => {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) {
      try {
        tasks.value = JSON.parse(value);
      } catch (e) {
        console.error('Data rusak, reset ulang');
        tasks.value = [];
      }
    }
  };

  // Simpan data ke LocalStorage
  const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value));
  };

  const addTask = (task: { title: string; description: string }) => {
    tasks.value.unshift({
      id: Date.now(),
      title: task.title,
      description: task.description,
      completed: false,
    });
    saveTasks();
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates };
      saveTasks();
    }
  };

  const deleteTask = (id: number) => {
    tasks.value = tasks.value.filter(t => t.id !== id);
    saveTasks();
  };

  onMounted(loadTasks);

  return { tasks, addTask, updateTask, deleteTask };
}
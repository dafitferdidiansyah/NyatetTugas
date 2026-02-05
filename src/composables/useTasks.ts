// src/composables/useTasks.ts
import { ref, computed, onMounted } from 'vue';

export interface Task {
  id: string;
  mata_kuliah: string;
  nama_tugas: string;
  deadline: string; // DD-MM-YYYY
  status: string;
  prioritas: string;
  deskripsi: string;
  createdAt: number;
  modifiedAt: number;
}

const courses = ref<string[]>([]);
const tasks = ref<Task[]>([]);
const searchQuery = ref(''); 

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
    localStorage.setItem('courses', JSON.stringify(courses.value));
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
  };

  onMounted(loadData);

  // --- FITUR BARU: Statistik Ringkasan ---
  const summary = computed(() => {
    const total = tasks.value.length;
    const completed = tasks.value.filter(t => t.status === 'Selesai' || t.status === 'Sudah Dikumpulkan').length;
    const progress = total === 0 ? 0 : (completed / total);
    return { total, completed, progress, pending: total - completed };
  });

  // --- FITUR BARU: Smart Grouping & Search ---
  const parseDate = (d: string) => {
    const p = d.split('-'); return new Date(Number(p[2]), Number(p[1])-1, Number(p[0]));
  };

  const groupedTasks = computed(() => {
    let result = tasks.value;
    
    // 1. Search Logic
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(t => t.nama_tugas.toLowerCase().includes(q) || t.mata_kuliah.toLowerCase().includes(q));
    }

    const groups = { overdue: [] as Task[], today: [] as Task[], upcoming: [] as Task[], completed: [] as Task[] };
    const now = new Date(); now.setHours(0,0,0,0);

    result.forEach(task => {
      if (task.status === 'Selesai' || task.status === 'Sudah Dikumpulkan') {
        groups.completed.push(task);
        return;
      }
      const tDate = parseDate(task.deadline);
      if (tDate < now) groups.overdue.push(task);
      else if (tDate.getTime() === now.getTime()) groups.today.push(task);
      else groups.upcoming.push(task);
    });
    
    // Sort by deadline
    const sorter = (a: Task, b: Task) => parseDate(a.deadline).getTime() - parseDate(b.deadline).getTime();
    groups.overdue.sort(sorter); groups.today.sort(sorter); groups.upcoming.sort(sorter);
    
    return groups;
  });

  // --- CRUD (Disederhanakan untuk brevity) ---
  const saveTask = (task: Partial<Task>) => {
    const now = Date.now();
    if (task.id) {
        const idx = tasks.value.findIndex(t => t.id === task.id);
        if (idx > -1) tasks.value[idx] = { ...tasks.value[idx], ...task, modifiedAt: now } as Task;
    } else {
        tasks.value.push({ ...task, id: Date.now().toString(), createdAt: now, modifiedAt: now } as Task);
        if(task.mata_kuliah && !courses.value.includes(task.mata_kuliah)) {
           courses.value.push(task.mata_kuliah); 
        }
    }
    saveData(); loadData();
  };

  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter(t => t.id !== id);
    saveData();
  };
  
  const toggleTaskStatus = (id: string) => {
      const t = tasks.value.find(x => x.id === id);
      if(t) {
          t.status = (t.status === 'Selesai') ? 'Belum Dikerjakan' : 'Selesai';
          saveData();
      }
  };

  // Fungsi Import JSON
  const addMultipleTasks = (newTasks: Partial<Task>[]) => {
      newTasks.forEach(t => saveTask(t));
  };

  return { 
    courses, tasks, groupedTasks, summary, searchQuery, // Export baru
    statusOptions, priorityOptions, saveTask, deleteTask, toggleTaskStatus, addMultipleTasks, loadData 
  };
}
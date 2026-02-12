import { ref, onMounted } from 'vue';
import { useNotifications } from './useNotifications';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { storageService } from '@/services/storage';

const STORAGE_KEY = 'my_tasks_app';
const APP_FOLDER = 'NyatetTugas'; // Folder publik di Documents

export interface Attachment {
  filePath: string;
  fileName: string;
  fileType: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  courseId: number | null;
  priority: string;
  completed: boolean;
  attachments: Attachment[];
}

const tasks = ref<Task[]>([]);

export function useTasks() {
  const { scheduleNotification, cancelNotification } = useNotifications();

  const loadTasks = () => {
      tasks.value = storageService.get<Task[]>(STORAGE_KEY, []);
    };

  const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value));
  };

  const ensureFolder = async () => {
    try {
      await Filesystem.mkdir({
        path: APP_FOLDER,
        directory: Directory.Documents,
        recursive: true
      });
    } catch (e) { /* Folder sudah ada */ }
  };

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now(),
      title: task.title || 'Tanpa Judul',
      description: task.description || '',
      dueDate: task.dueDate || '',
      courseId: task.courseId || null,
      priority: task.priority || 'Sedang',
      completed: false,
      attachments: task.attachments || []
    };
    tasks.value.unshift(newTask);
    saveTasks();
    scheduleNotification(newTask);
  };

  const updateTask = (id: number, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates };
      saveTasks();
      const updatedTask = tasks.value[index];
      if (updatedTask.completed) cancelNotification(id);
      else scheduleNotification(updatedTask);
    }
  };

  const deleteTask = async (id: number) => {
    const task = tasks.value.find(t => t.id === id);
    if (task?.attachments) {
      for (const file of task.attachments) {
        try {
          await Filesystem.deleteFile({
             path: `${APP_FOLDER}/${file.filePath}`,
             directory: Directory.Documents
          });
        } catch (e) { console.log('File cleanup skip'); }
      }
    }
    tasks.value = tasks.value.filter(t => t.id !== id);
    saveTasks();
    cancelNotification(id);
  };

  const importTasks = (newTasks: Task[]) => {
    tasks.value = newTasks;
    saveTasks();
    newTasks.forEach(t => { if (!t.completed) scheduleNotification(t); });
  };

  // Algoritma Deep Cleanup Terpadu
  const cleanupStorage = async () => {
    try {
      await ensureFolder();
      const result = await Filesystem.readdir({ path: APP_FOLDER, directory: Directory.Documents });
      const activeFiles = tasks.value.flatMap(t => t.attachments.map(a => a.filePath));
      
      for (const file of result.files) {
        if (!activeFiles.includes(file.name)) {
          await Filesystem.deleteFile({ path: `${APP_FOLDER}/${file.name}`, directory: Directory.Documents });
          console.log(`Menghapus file sampah: ${file.name}`);
        }
      }
    } catch (e) { console.error('Cleanup gagal', e); }
  };

  onMounted(loadTasks);

  return { tasks, addTask, updateTask, deleteTask, importTasks, ensureFolder, cleanupStorage };
}
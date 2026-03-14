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
let isLoaded = false;

export function useTasks() {
  const { scheduleNotification, cancelNotification } = useNotifications();

  const loadTasks = () => {
    if (isLoaded) return; // Mencegah reload berulang
    tasks.value = storageService.get<Task[]>(STORAGE_KEY, []);
    isLoaded = true;
  };

  const saveTasks = () => {
    storageService.set(STORAGE_KEY, tasks.value);
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

  // --- FUNGSI BARU: Helper untuk Hapus File Fisik dengan Aman ---
  const deletePhysicalFile = async (filePath: string) => {
    try {
      // Ambil nama filenya saja (memotong path bawaan sistem agar tidak dobel/error di HP Xiaomi)
      const fileName = filePath.split('/').pop();
      if (!fileName) return;

      await Filesystem.deleteFile({
        path: `${APP_FOLDER}/${fileName}`,
        directory: Directory.Documents
      });
      console.log(`[Berhasil] File fisik dihapus: ${fileName}`);
    } catch (e) {
      console.log(`[Skip] File mungkin sudah tidak ada: ${filePath}`);
    }
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

  const updateTask = async (id: number, updates: Partial<Task>) => {
    const index = tasks.value.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldTask = tasks.value[index];

      // --- LOGIKA BARU: Jika ada gambar/file yang disilang (dihapus) saat Edit Tugas ---
      if (updates.attachments) {
        const oldFiles = oldTask.attachments.map(a => a.filePath);
        const newFiles = updates.attachments.map(a => a.filePath);
        
        // Cari file yang ada di tugas lama tapi TIDAK ADA di form edit baru
        const removedFiles = oldFiles.filter(f => !newFiles.includes(f));
        for (const file of removedFiles) {
          await deletePhysicalFile(file); // Hapus fisiknya dari memory HP
        }
      }

      tasks.value[index] = { ...oldTask, ...updates };
      saveTasks();
      const updatedTask = tasks.value[index];
      if (updatedTask.completed) cancelNotification(id);
      else scheduleNotification(updatedTask);
    }
  };

  const deleteTask = async (id: number) => {
    const task = tasks.value.find(t => t.id === id);
    
    // --- LOGIKA BARU: Hapus file fisik saat Tugas Dihapus sepenuhnya ---
    if (task?.attachments) {
      for (const file of task.attachments) {
        await deletePhysicalFile(file.filePath);
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
      
      // Amankan pembacaan nama file
      const activeFiles = tasks.value.flatMap(t => t.attachments.map(a => a.filePath.split('/').pop()));
      
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
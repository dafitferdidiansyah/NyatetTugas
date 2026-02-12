// src/composables/useNotifications.ts
import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotifications() {
  
  // Minta izin notifikasi saat aplikasi dibuka
  const requestPermissions = async () => {
    try {
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.log('Browser tidak support notifikasi native');
    }
  };

  // Jadwalkan Notifikasi
  const scheduleNotification = async (task: { id: number; title: string; dueDate: string }) => {
    if (!task.dueDate) return;

    const date = new Date(task.dueDate);
   date.setDate(date.getDate() - 1); 

  
  date.setHours(7, 0, 0, 0); 

  
  if (date.getTime() < Date.now()) return;

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Reminder Tugas",
            body: `Jangan lupa: ${task.title} deadline hari ini!`,
            id: task.id, // ID unik berdasarkan ID tugas
            schedule: { at: date },
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (e) {
      console.error("Gagal set notifikasi", e);
    }
  };

  // Hapus notifikasi jika tugas dihapus/selesai
  const cancelNotification = async (id: number) => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (e) {
      // ignore
    }
  };

  return { requestPermissions, scheduleNotification, cancelNotification };
}
import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotifications() {
  
  // Minta izin dan Buat Channel
  const requestPermissions = async () => {
    try {
      // 1. Channel Biasa (Untuk Tugas)
      await LocalNotifications.createChannel({
        id: 'tugas_channel',
        name: 'Pengingat Tugas',
        description: 'Notifikasi untuk deadline tugas',
        importance: 5, 
        vibration: true,
        visibility: 1, 
       
      });

      // 2. TAMBAHAN: Channel Brutal (Untuk Matkul)
      await LocalNotifications.createChannel({
        id: 'channel_matkul_brutal',
        name: 'Peringatan Kuliah Penting',
        description: 'Notifikasi yang tembus DND untuk jadwal kuliah',
        importance: 5, // MAX
        vibration: true,
        visibility: 1, 
       
      });

      // 3. Minta Izin
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.log('Browser tidak support notifikasi native', e);
    }
  };

  // Jadwalkan Notifikasi Tugas (Tetap seperti milik Anda)
  const scheduleNotification = async (task: { id: number; title: string; dueDate: string }) => {
    if (!task.dueDate) return;

    const safeId = Number(task.id.toString().slice(-9));
    const date = new Date(task.dueDate);
    date.setDate(date.getDate() - 1); 
    date.setHours(7, 0, 0, 0); 

    if (date.getTime() < Date.now()) {
      console.log("Waktu H-1 sudah lewat, set notifikasi 10 detik dari sekarang untuk testing");
      date.setTime(Date.now() + 10000); 
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Reminder Tugas",
            body: `Jangan lupa: ${task.title} batas waktunya semakin dekat!`,
            id: safeId, 
            channelId: 'tugas_channel', 
            schedule: { at: date },
          }
        ]
      });
      console.log("Notifikasi sukses disetel untuk:", date.toLocaleString());
    } catch (e) {
      console.error("Gagal set notifikasi", e);
    }
  };

  // Hapus notifikasi tugas
  const cancelNotification = async (id: number) => {
    try {
      const safeId = Number(id.toString().slice(-9));
      await LocalNotifications.cancel({ notifications: [{ id: safeId }] });
    } catch (e) {
      console.error("Gagal batalkan notif", e);
    }
  };

  return { requestPermissions, scheduleNotification, cancelNotification };
}
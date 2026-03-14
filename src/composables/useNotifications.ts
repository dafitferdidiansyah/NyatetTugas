import { LocalNotifications } from '@capacitor/local-notifications';

export function useNotifications() {
  
  // Minta izin dan Buat Channel
  const requestPermissions = async () => {
    try {
      // 1. BUAT CHANNEL DULU (Wajib untuk Android 8+)
      await LocalNotifications.createChannel({
        id: 'tugas_channel',
        name: 'Pengingat Tugas',
        description: 'Notifikasi untuk deadline tugas',
        importance: 5, // Importance.HIGH agar muncul pop-up di atas layar
        vibration: true,
      });

      // 2. Minta Izin (Hanya muncul popup di Android 13+)
      await LocalNotifications.requestPermissions();
    } catch (e) {
      console.log('Browser tidak support notifikasi native', e);
    }
  };

  // Jadwalkan Notifikasi
  const scheduleNotification = async (task: { id: number; title: string; dueDate: string }) => {
    if (!task.dueDate) return;

    // FIX 1: Potong ID Date.now() jadi angka yang lebih kecil agar Android tidak crash
    const safeId = Number(task.id.toString().slice(-9));

    const date = new Date(task.dueDate);
    date.setDate(date.getDate() - 1); 
    date.setHours(7, 0, 0, 0); 

    // FIX 2: Jika disetel untuk H-1 jam 7 pagi tapi ternyata waktunya SUDAH LEWAT,
    // kita jadwalkan saja 10 detik dari sekarang agar notif tetap ada dan Anda bisa TESTING.
    if (date.getTime() < Date.now()) {
      console.log("Waktu H-1 sudah lewat, set notifikasi 10 detik dari sekarang untuk testing");
      date.setTime(Date.now() + 10000); // Set 10 detik kedepan
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Reminder Tugas",
            body: `Jangan lupa: ${task.title} batas waktunya semakin dekat!`,
            id: safeId, // Pakai ID yang sudah aman
            channelId: 'tugas_channel', // FIX 3: Wajib diisi sesuai dengan ID channel di atas
            schedule: { at: date },
          }
        ]
      });
      console.log("Notifikasi sukses disetel untuk:", date.toLocaleString());
    } catch (e) {
      console.error("Gagal set notifikasi", e);
    }
  };

  // Hapus notifikasi jika tugas dihapus/selesai
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
import { ref, onMounted } from 'vue';
import { storageService } from '@/services/storage';
import { LocalNotifications } from '@capacitor/local-notifications';

const STORAGE_KEY = 'my_courses_app';

export interface Course {
  id: number;
  name: string;
  lecturer: string;
  day: string;
  time: string; // Waktu Mulai (Patokan Alarm)
  endTime?: string;
  room: string;
}

const courses = ref<Course[]>([]);

export function useCourses() {
  const loadCourses = () => {
    courses.value = storageService.get<Course[]>(STORAGE_KEY, []);
  };

  const saveCourses = () => {
    storageService.set(STORAGE_KEY, courses.value);
  };

  // --- ALGORITMA PENJADWALAN MATKUL ---
  const scheduleMatkulNotification = async (course: Course) => {
    if (!course.day || !course.time) return;

    // 1. CEK & REQUEST PERMISSION (Wajib agar tidak diblokir Android/iOS)
    let permStatus = await LocalNotifications.checkPermissions();
    if (permStatus.display !== 'granted') {
      permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        console.warn('Izin notifikasi ditolak oleh pengguna.');
        return; // Batal menjadwalkan karena tidak diizinkan
      }
    }

    // 2. PASTIKAN CHANNEL DIBUAT (Solusi Wajib untuk HP POCO/MIUI/Android 8+)
    await LocalNotifications.createChannel({
      id: 'channel_matkul_brutal',
      name: 'Pengingat Matkul',
      description: 'Alarm brutal agar tidak telat kelas',
      importance: 5, // 5 = High importance (Popup/Heads-up)
      visibility: 1, // 1 = Public (Muncul di lockscreen)
      vibration: true,
    });

    const dayMap: Record<string, number> = {
      'Minggu': 1, 'Senin': 2, 'Selasa': 3, 'Rabu': 4, 'Kamis': 5, 'Jumat': 6, 'Sabtu': 7
    };
    let weekday = dayMap[course.day];
    if (!weekday) return;

    const [hours, minutes] = course.time.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes - 15, 0, 0);

    if (dateObj.getHours() > hours) {
      weekday = weekday === 1 ? 7 : weekday - 1;
    }

    // FIX: Gunakan safeId agar Android tidak Crash!
    const safeId = Number(course.id.toString().slice(-9));

    await LocalNotifications.schedule({
      notifications: [
        {
          id: safeId, 
          title: `🚨 MATKUL SEBENTAR LAGI!`,
          body: `${course.name} di ruang ${course.room} mulai jam ${course.time}. Jangan telat!`,
          channelId: 'channel_matkul_brutal', 
          schedule: {
            on: {
              weekday: weekday,
              hour: dateObj.getHours(),
              minute: dateObj.getMinutes()
            }
          }
        }
      ]
    });
    console.log(`Pengingat matkul ${course.name} disetel mingguan pada hari ke-${weekday} jam ${dateObj.getHours()}:${dateObj.getMinutes()}`);
  };

  const cancelMatkulNotification = async (id: number) => {
    // FIX: Gunakan safeId juga saat menghapus
    const safeId = Number(id.toString().slice(-9));
    await LocalNotifications.cancel({ notifications: [{ id: safeId }] });
  };
  // ------------------------------------
  
  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse = { id: Date.now(), ...course }; // Simpan ke variabel dulu
    courses.value.push(newCourse);
    saveCourses();
    scheduleMatkulNotification(newCourse); // FIX: Panggil notifikasi
  };

  const updateCourse = (id: number, updatedCourse: Partial<Course>) => {
    const index = courses.value.findIndex(c => c.id === id);
    if (index !== -1) {
      courses.value[index] = { ...courses.value[index], ...updatedCourse };
      saveCourses();
      scheduleMatkulNotification(courses.value[index]); // FIX: Update notifikasi
    }
  };

  const deleteCourse = (id: number) => {
    courses.value = courses.value.filter(c => c.id !== id);
    saveCourses();
    cancelMatkulNotification(id); // FIX: Batalkan notifikasi jika matkul dihapus
  };

  const importCourses = (newCourses: Course[]) => {
    courses.value = newCourses;
    saveCourses();
    newCourses.forEach(c => scheduleMatkulNotification(c));
  };

  onMounted(loadCourses);

  return { courses, addCourse, updateCourse, deleteCourse, importCourses };
}
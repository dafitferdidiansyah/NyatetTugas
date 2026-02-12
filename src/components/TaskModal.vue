<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('close')">
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>{{ editingId ? 'Edit Tugas' : 'Tugas Baru' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">Batal</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding bg-light">
      <ion-item class="input-item">
        <ion-label position="stacked">Judul Tugas <span class="text-danger">*</span></ion-label>
        <ion-input v-model="form.title" placeholder="Contoh: Makalah Kelompok"></ion-input>
      </ion-item>

      <ion-grid class="ion-no-padding">
        <ion-row>
          <ion-col size="6">
            <ion-item class="input-item">
              <ion-label position="stacked">Mata Kuliah</ion-label>
              <ion-select v-model="form.courseId" placeholder="Pilih" interface="popover">
                <ion-select-option :value="null">Umum</ion-select-option>
                <ion-select-option v-for="c in courses" :key="c.id" :value="c.id">{{ c.name }}</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-col>
          <ion-col size="6">
            <ion-item class="input-item">
              <ion-label position="stacked">Prioritas</ion-label>
              <ion-select v-model="form.priority" interface="popover">
                <ion-select-option value="Tinggi">Tinggi</ion-select-option>
                <ion-select-option value="Sedang">Sedang</ion-select-option>
                <ion-select-option value="Rendah">Rendah</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-item class="input-item">
        <ion-label position="stacked">Tenggat Waktu</ion-label>
        <ion-input type="date" v-model="form.dueDate"></ion-input>
      </ion-item>

      <div class="rich-input-wrapper">
        <label class="rich-label">Catatan & Lampiran</label>
        <div class="rich-container">
          <ion-textarea 
            v-model="form.description" 
            :rows="4" 
            placeholder="Tulis detail tugas di sini..."
            class="custom-textarea"
          ></ion-textarea>

          <div class="attachments-area" v-if="form.attachments.length > 0">
            <div 
              v-for="(file, index) in form.attachments" 
              :key="index" 
              class="file-chip"
              @click="openFile(file)"
            >
              <ion-icon 
                :icon="file.fileType.startsWith('image/') ? imageOutline : documentTextOutline" 
                class="chip-icon"
              ></ion-icon>
              <span class="chip-text">{{ truncateName(file.fileName) }}</span>
              <div class="chip-delete" @click.stop="removeAttachment(index)">
                <ion-icon :icon="closeCircle" color="danger"></ion-icon>
              </div>
            </div>
          </div>

          <div class="rich-toolbar">
            <ion-button fill="clear" size="small" @click="triggerFileSelect">
              <ion-icon slot="icon-only" :icon="attachOutline"></ion-icon>
            </ion-button>
            <span v-if="form.attachments.length === 0" class="placeholder-text">Tambahkan foto atau dokumen...</span>
          </div>
        </div>
      </div>

      <input type="file" multiple ref="fileInputRef" @change="handleFileSelect" style="display: none" />

      <ion-button expand="block" class="ion-margin-top btn-save" @click="save" :disabled="!form.title">
        <ion-icon slot="start" :icon="saveOutline"></ion-icon>
        Simpan Tugas
      </ion-button>

    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
import { 
  IonModal, IonHeader, IonToolbar, IonTitle, IonContent, 
  IonButtons, IonButton, IonItem, IonLabel, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonIcon, IonGrid, IonRow, IonCol, toastController
} from '@ionic/vue';
import { attachOutline, imageOutline, documentTextOutline, closeCircle, saveOutline } from 'ionicons/icons';
import { useCourses } from '@/composables/useCourses';
import { useTasks, Attachment } from '@/composables/useTasks';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FileOpener } from '@capacitor-community/file-opener';

const props = defineProps<{ isOpen: boolean; editingId: number | null; initialData: any }>();
const emit = defineEmits(['close', 'save']);

const { courses } = useCourses();
const { ensureFolder } = useTasks(); // Mendukung logika folder baru
const fileInputRef = ref<HTMLInputElement | null>(null);

const form = ref({
  title: '', description: '', dueDate: '', courseId: null, priority: 'Sedang', attachments: [] as Attachment[]
});

watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.initialData) {
    form.value = { ...props.initialData, attachments: [...(props.initialData.attachments || [])] };
  } else if (isOpen) {
    form.value = { title: '', description: '', dueDate: '', courseId: null, priority: 'Sedang', attachments: [] };
  }
});

const triggerFileSelect = () => fileInputRef.value?.click();

const handleFileSelect = async (event: any) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // ANTI-CRASH: Batasi file > 50MB karena RAM WebView terbatas saat konversi Base64
    if (file.size > 50 * 1024 * 1024) {
      const toast = await toastController.create({
        message: `File ${file.name} terlalu besar (Maks 50MB)`,
        duration: 3000,
        color: 'danger'
      });
      toast.present();
      continue;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const uniqueName = Date.now() + '_' + i + '_' + file.name;
      try {
        await ensureFolder(); // Pastikan folder NyatetTugas di Documents ada
        await Filesystem.writeFile({ 
          path: `NyatetTugas/${uniqueName}`, 
          data: base64, 
          directory: Directory.Documents 
        });
        form.value.attachments.push({ filePath: uniqueName, fileName: file.name, fileType: file.type });
      } catch (e) {
        console.error('Gagal simpan file:', e);
      }
    };
  }
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const openFile = async (file: Attachment) => {
  try {
    const fileData = await Filesystem.readFile({ 
      path: `NyatetTugas/${file.filePath}`, 
      directory: Directory.Documents 
    });
    // Simpan ke cache sementara agar bisa dibuka oleh aplikasi pihak ketiga
    await Filesystem.writeFile({ path: file.filePath, data: fileData.data, directory: Directory.Cache });
    const uriResult = await Filesystem.getUri({ path: file.filePath, directory: Directory.Cache });
    await FileOpener.open({ filePath: uriResult.uri, contentType: file.fileType });
  } catch (e) {
    const toast = await toastController.create({ message: 'Gagal membuka file.', duration: 2000, color: 'danger' });
    toast.present();
  }
};

// Ganti fungsi removeAttachment yang lama dengan yang ini
const removeAttachment = async (index: number) => {
  const file = form.value.attachments[index];
  
  try {
    // 1. Hapus file fisik dari folder NyatetTugas di Documents
    await Filesystem.deleteFile({
      path: `NyatetTugas/${file.filePath}`,
      directory: Directory.Documents
    });
    console.log('File fisik berhasil dihapus dari storage');
  } catch (e) {
    // Jika file tidak ditemukan (mungkin sudah terhapus manual), tetap lanjut hapus dari list UI
    console.error('Gagal menghapus file fisik atau file tidak ditemukan:', e);
  }

  // 2. Hapus dari daftar tampilan (UI)
  form.value.attachments.splice(index, 1);
};
const truncateName = (name: string) => name.length > 15 ? name.substring(0, 12) + '...' : name;
const save = () => emit('save', form.value);
</script>

<style scoped>
/* 1. Styling Input Field Standar (Mengikuti Tema Gelap Aplikasi) */
.input-item {
  --background: var(--ion-item-background); 
  margin-bottom: 12px;
  border: 1px solid #333; 
  border-radius: 8px;
}

.text-danger { color: var(--ion-color-danger); }

/* 2. Styling AREA CATATAN (Putih Kontras agar teks hitam terlihat jelas) */
.rich-input-wrapper { margin-top: 15px; }

.rich-label {
  font-size: 12px; 
  color: #bbb; /* Warna terang di atas latar belakang gelap modal */
  margin-left: 5px; 
  margin-bottom: 5px; 
  display: block;
}

.rich-container {
  border: 1px solid #444;
  border-radius: 8px;
  background: #ffffff !important; /* PAKSA PUTIH untuk area catatan */
  display: flex; 
  flex-direction: column;
  overflow: hidden;
}

.custom-textarea {
  --padding-start: 12px; 
  --padding-end: 12px; 
  --padding-top: 12px;
  --color: #000000 !important; /* PAKSA TEKS HITAM */
  --placeholder-color: #666666 !important;
  border: none; 
  margin: 0;
}

/* 3. Attachment Chips (Di dalam kotak putih catatan) */
.attachments-area {
  display: flex; 
  flex-wrap: wrap; 
  gap: 8px; 
  padding: 0 12px 8px 12px;
}

.file-chip {
  background: #f0f2f5; 
  border: 1px solid #dcdcdc;
  border-radius: 20px; 
  padding: 6px 10px;
  display: flex; 
  align-items: center; 
  font-size: 11px; 
  cursor: pointer;
  color: #333 !important; /* Teks chip juga harus gelap */
}

.chip-icon { font-size: 16px; margin-right: 6px; color: #555; }
.chip-text { max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #333; }

/* 4. Toolbar Bawah (Bagian dari kotak catatan putih) */
.rich-toolbar {
  border-top: 1px solid #ddd; 
  padding: 4px 8px;
  display: flex; 
  align-items: center; 
  background: #f0f0f0; 
}

.placeholder-text { font-size: 11px; color: #999; margin-left: 8px; font-style: italic; }

.btn-save { margin-top: 20px; --border-radius: 8px; font-weight: bold; }
</style>
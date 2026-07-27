<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Hero Banner -->
    <div class="bg-white p-4 p-md-5 rounded-4 shadow-sm border mb-4">
      <div class="row align-items-center g-4">
        <div class="col-lg-8">
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-primary text-white fw-bold px-3 py-2 rounded-pill fs-6">
              <i class="bi bi-patch-check-fill me-1"></i> RajinKerja.id Work Suite v2.5
            </span>
            <span class="badge bg-success-subtle text-success fw-bold px-3 py-2 rounded-pill" v-if="isOnline">
              <i class="bi bi-wifi me-1"></i> Online & Synced
            </span>
            <span class="badge bg-warning-subtle text-warning fw-bold px-3 py-2 rounded-pill" v-else>
              <i class="bi bi-wifi-off me-1"></i> Offline Mode Ready
            </span>
          </div>

          <h1 class="fw-extrabold text-dark display-6 mb-2">Pusat Bantuan, FAQ & Tentang RajinKerja.id</h1>
          <p class="lead text-muted mb-3">
            Panduan lengkap penggunaan, informasi privasi data lokal, fitur offline PWA, dan solusi pertanyaan umum untuk karyawan & profesional.
          </p>

          <div class="d-flex flex-wrap gap-2">
            <a href="#faqSection" class="btn btn-primary px-4 py-2 rounded-3 fw-bold shadow-sm">
              <i class="bi bi-question-circle me-1"></i> Baca FAQ Terbaru
            </a>
            <a href="#systemInfo" class="btn btn-outline-secondary px-4 py-2 rounded-3 fw-bold">
              <i class="bi bi-cpu me-1"></i> Info Sistem & Data Lokal
            </a>
          </div>
        </div>

        <div class="col-lg-4 text-center">
          <div class="bg-light p-4 rounded-4 border d-inline-block shadow-sm">
            <img src="/logo.svg" alt="RajinKerja Logo" style="width: 90px; height: 90px;" class="mb-3" />
            <h5 class="fw-extrabold text-dark mb-1">RajinKerja<span class="text-primary">.id</span></h5>
            <p class="small text-muted mb-2">Task OS & Work Suite OS</p>
            <span class="badge bg-dark text-white rounded-pill px-3 py-1 small">Local-First PWA</span>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <!-- FAQ Accordion (Left) -->
      <div class="col-lg-8" id="faqSection">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
          <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h4 class="fw-bold text-dark mb-0">
              <i class="bi bi-question-square-fill text-primary me-2"></i>Pertanyaan Sering Diajukan (FAQ)
            </h4>
            <div class="input-group style-search" style="max-width: 250px;">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control form-control-sm bg-light border-start-0" placeholder="Cari pertanyaan..." v-model="faqSearch" />
            </div>
          </div>

          <div class="accordion accordion-flush" id="faqAccordion">
            <div
              v-for="(item, idx) in filteredFaqs"
              :key="idx"
              class="accordion-item border-bottom py-2"
            >
              <h2 class="accordion-header" :id="'heading' + idx">
                <button
                  class="accordion-button collapsed fw-bold text-dark px-0 bg-transparent fs-6"
                  type="button"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#collapse' + idx"
                  aria-expanded="false"
                  :aria-controls="'collapse' + idx"
                >
                  <i class="bi bi-check2-circle text-primary me-2"></i>
                  {{ item.question }}
                </button>
              </h2>
              <div
                :id="'collapse' + idx"
                class="accordion-collapse collapse"
                :aria-labelledby="'heading' + idx"
                data-bs-parent="#faqAccordion"
              >
                <div class="accordion-body px-0 text-secondary lh-lg small" v-html="item.answer"></div>
              </div>
            </div>

            <div v-if="filteredFaqs.length === 0" class="text-center py-4 text-muted">
              Tidak ditemukan FAQ yang sesuai dengan pencarian "{{ faqSearch }}".
            </div>
          </div>
        </div>
      </div>

      <!-- System Diagnostics & Offline Storage Card (Right) -->
      <div class="col-lg-4" id="systemInfo">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
          <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart-fill text-success me-2"></i>Status Data & Storage</h5>

          <div class="p-3 bg-light rounded-3 mb-3 border">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-semibold text-muted">Status Koneksi:</span>
              <span class="badge rounded-pill" :class="isOnline ? 'bg-success text-white' : 'bg-warning text-dark'">
                {{ isOnline ? 'Online (Internet Active)' : 'Offline (Local SW Mode)' }}
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-semibold text-muted">Service Worker PWA:</span>
              <span class="badge bg-primary text-white rounded-pill">Aktif & Caching</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="small fw-semibold text-muted">Arsitektur Data:</span>
              <strong class="small text-dark">Local Storage (Browser)</strong>
            </div>
          </div>

          <h6 class="fw-bold text-dark mb-2">Ringkasan Item Tersimpan:</h6>
          <ul class="list-group list-group-flush small mb-3">
            <li class="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
              <span><i class="bi bi-kanban text-primary me-2"></i>Tugas & Kanban</span>
              <strong class="text-dark">{{ totalTasksCount }} item</strong>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
              <span><i class="bi bi-receipt text-success me-2"></i>Invoice Tagihan</span>
              <strong class="text-dark">{{ totalInvoicesCount }} item</strong>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
              <span><i class="bi bi-journal-text text-warning me-2"></i>Catatan & Notes</span>
              <strong class="text-dark">{{ totalNotesCount }} item</strong>
            </li>
            <li class="list-group-item px-0 d-flex justify-content-between align-items-center bg-transparent">
              <span><i class="bi bi-lightning-charge text-danger me-2"></i>Habit Tracker</span>
              <strong class="text-dark">{{ totalHabitsCount }} item</strong>
            </li>
          </ul>

          <div class="d-grid gap-2 border-top pt-3">
            <button class="btn btn-outline-primary btn-sm rounded-3 fw-bold" @click="exportBackupJSON">
              <i class="bi bg-download me-1"></i> Ekspor Full Backup Data (.json)
            </button>
            <label class="btn btn-outline-secondary btn-sm rounded-3 fw-bold text-center mb-0 cursor-pointer">
              <i class="bi bi-upload me-1"></i> Import Backup Data (.json)
              <input type="file" accept=".json" class="d-none" @change="importBackupJSON" />
            </label>
          </div>
        </div>

        <!-- About App Card -->
        <div class="card border-0 shadow-sm rounded-4 bg-primary text-white p-4">
          <h5 class="fw-bold mb-2"><i class="bi bi-info-circle-fill me-2"></i>Tentang RajinKerja.id</h5>
          <p class="small opacity-90 mb-3">
            Dioptimalkan khusus untuk karyawan kantor, freelancer, dan profesional mandiri yang menginginkan privasi penuh tanpa ketergantungan server berbayar.
          </p>
          <hr class="border-light opacity-25 my-2" />
          <div class="d-flex justify-content-between small opacity-75">
            <span>Framework:</span>
            <strong>Vue 3 + Vuex + PWA</strong>
          </div>
          <div class="d-flex justify-content-between small opacity-75 mt-1">
            <span>Keamanan:</span>
            <strong>100% Client-side Isolated</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-dark border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span>{{ toast.message }}</span>
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show = false"></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'FaqAboutView',
  setup() {
    const store = useStore();
    const faqSearch = ref('');
    const isOnline = ref(navigator.onLine);
    const toast = ref({ show: false, message: '' });

    const updateOnlineStatus = () => {
      isOnline.value = navigator.onLine;
    };

    onMounted(() => {
      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOnlineStatus);
    });

    onUnmounted(() => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    });

    const showToastMsg = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    const totalTasksCount = computed(() => (store.getters.getTasks || []).length);
    const totalInvoicesCount = computed(() => (store.getters.getInvoices || []).length);
    const totalNotesCount = computed(() => (store.getters.getNotes || []).length);
    const totalHabitsCount = computed(() => (store.getters.getHabits || []).length);

    const faqs = [
      {
        question: 'Apakah data pekerjaan saya aman dan tetap ada jika tidak ada koneksi internet?',
        answer: '<strong>Ya, 100% Aman.</strong> RajinKerja.id dirancang dengan arsitektur <em>Local-First Storage</em>. Semua data tugas, proyek, transaksi keuangan, dan catatan disimpan di penyimpanan lokal browser (LocalStorage). Aplikasi ini didukung PWA Service Worker sehingga dapat dibuka sepenuhnya tanpa koneksi internet.'
      },
      {
        question: 'Bagaimana cara mengunduh invoice tagihan dalam bentuk PDF dan Excel?',
        answer: 'Buka menu <strong>Invoice Generator</strong> di navigasi samping. Isi rincian layanan atau impor secara bulk, lalu klik tombol <strong>Unduh PDF (.pdf)</strong> atau <strong>Export Excel (.xlsx)</strong> di sudut kanan atas.'
      },
      {
        question: 'Bagaimana cara menambahkan banyak item pekerjaan atau catatan secara sekaligus (Bulk Input)?',
        answer: 'Hampir seluruh modul di RajinKerja.id (seperti Invoice Generator dan Notes & Scratchpad) memiliki fitur <strong>Bulk Form Multi-Input</strong>. Cukup klik tombol Bulk Input untuk membuka form multi-baris tanpa perlu membuka modal satu per satu.'
      },
      {
        question: 'Apakah saya bisa memindahkan data RajinKerja.id ke laptop / komputer lain?',
        answer: 'Bisa! Di panel sebelah kanan halaman ini (atau menu Preferences), klik <strong>Ekspor Full Backup Data (.json)</strong>. Buka RajinKerja.id di perangkat baru lalu pilih <strong>Import Backup Data (.json)</strong> untuk memulihkan seluruh data Anda.'
      },
      {
        question: 'Bagaimana cara menginstall RajinKerja.id sebagai aplikasi Desktop / Mobile (PWA)?',
        answer: 'Pada browser Chrome / Edge / Safari, klik ikon <strong>Install App / Tambahkan ke Layar Utama</strong> di address bar browser Anda. Aplikasi akan terinstall secara mandiri tanpa memerlukan Google Play Store atau App Store.'
      }
    ];

    const filteredFaqs = computed(() => {
      if (!faqSearch.value.trim()) return faqs;
      const q = faqSearch.value.toLowerCase();
      return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    });

    const exportBackupJSON = () => {
      const backupData = {
        app: 'RajinKerja.id',
        version: '2.5',
        exportedAt: new Date().toISOString(),
        tasks: store.getters.getTasks,
        projects: store.getters.getProjects,
        finances: store.getters.getTransactions,
        invoices: store.getters.getInvoices,
        notes: store.getters.getNotes,
        habits: store.getters.getHabits,
        contacts: store.getters.getContacts,
        myBusiness: store.getters.getMyBusiness
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RajinKerja_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToastMsg('Backup data berhasil diunduh dalam format JSON!');
    };

    const importBackupJSON = (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.app && data.app.includes('RajinKerja')) {
            if (data.tasks) localStorage.setItem('ft_tasks', JSON.stringify(data.tasks));
            if (data.invoices) localStorage.setItem('ft_invoices', JSON.stringify(data.invoices));
            if (data.notes) localStorage.setItem('ft_notes', JSON.stringify(data.notes));
            if (data.habits) localStorage.setItem('ft_habits', JSON.stringify(data.habits));
            showToastMsg('Data berhasil di-import! Silakan muat ulang halaman.');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            showToastMsg('Format berkas JSON backup tidak valid.');
          }
        } catch (err) {
          console.error(err);
          showToastMsg('Gagal membaca file JSON.');
        }
      };
      reader.readAsText(file);
    };

    return {
      faqSearch,
      isOnline,
      faqs,
      filteredFaqs,
      totalTasksCount,
      totalInvoicesCount,
      totalNotesCount,
      totalHabitsCount,
      toast,
      exportBackupJSON,
      importBackupJSON
    };
  }
};
</script>

<style scoped>
.style-search {
  border-radius: 20px;
  overflow: hidden;
}

.cursor-pointer {
  cursor: pointer;
}
</style>

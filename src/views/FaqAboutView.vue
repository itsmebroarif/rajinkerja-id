<template>
  <div class="container-fluid p-0 max-w-100 overflow-x-hidden">
    <!-- Header Hero Banner -->
    <div class="bg-gradient-dark text-white p-4 p-md-5 rounded-4 shadow-sm mb-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
      <div class="row align-items-center g-4">
        <div class="col-lg-8">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge bg-primary text-white fw-bold px-3 py-1.5 rounded-pill fs-6">
              <i class="bi bi-patch-check-fill me-1"></i> RajinKerja.id Work Suite v2.5
            </span>
            <span class="badge bg-success text-white fw-bold px-3 py-1.5 rounded-pill" v-if="isOnline">
              <i class="bi bi-wifi me-1"></i> Online & PWA Active
            </span>
            <span class="badge bg-warning text-dark fw-bold px-3 py-1.5 rounded-pill" v-else>
              <i class="bi bi-wifi-off me-1"></i> Offline Local Mode
            </span>
          </div>

          <h1 class="fw-extrabold text-white display-6 mb-2">Pusat Panduan, FAQ & Repositori Sistem</h1>
          <p class="lead text-slate-300 mb-4">
            Dokumentasi lengkap penggunaan RajinKerja.id, repositori open-source GitHub, informasi developer, serta panduan PWA Android.
          </p>

          <div class="d-flex flex-wrap gap-2">
            <a href="https://github.com/itsmebroarif/rajinkerja-id" target="_blank" class="btn btn-light px-4 py-2 rounded-pill fw-bold text-dark shadow-sm d-inline-flex align-items-center gap-2">
              <i class="bi bi-github fs-5"></i> GitHub Repo: rajinkerja-id
            </a>
            <a href="#devProfile" class="btn btn-outline-light px-4 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-2">
              <i class="bi bi-person-badge"></i> Profil Developer
            </a>
          </div>
        </div>

        <div class="col-lg-4 text-center">
          <div class="bg-white bg-opacity-10 p-4 rounded-4 border border-white border-opacity-10 shadow-sm backdrop-blur">
            <img src="/logo.svg" alt="RajinKerja Logo" style="width: 80px; height: 80px;" class="mb-3 p-1 bg-white rounded-3 shadow-sm" />
            <h5 class="fw-extrabold text-white mb-1">RajinKerja<span class="text-primary">.id</span></h5>
            <p class="small text-slate-300 mb-2">Workflow & Productivity OS</p>
            <span class="badge bg-success rounded-pill px-3 py-1 small fw-bold">100% Privacy Local-First</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Official GitHub Repository & Developer Section -->
    <div class="row g-4 mb-4" id="devProfile">
      <!-- Developer Information Card -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
          <div class="d-flex align-items-center gap-3 mb-3 border-bottom pb-3">
            <div class="bg-primary bg-opacity-10 rounded-circle p-3 text-primary d-flex align-items-center justify-content-center" style="width: 54px; height: 54px;">
              <i class="bi bi-person-fill-check fs-2"></i>
            </div>
            <div>
              <span class="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-bold small mb-1">Lead Architect & Developer</span>
              <h5 class="fw-extrabold text-dark mb-0">Arif Permana Putrasuryana</h5>
              <small class="text-muted">Creator of RajinKerja.id Work Suite</small>
            </div>
          </div>

          <p class="small text-secondary lh-base mb-4">
            RajinKerja.id dikembangkan secara independen oleh Arif Permana Putrasuryana sebagai solusi sistem operasi produktivitas (Workflow & Task OS) yang memprioritaskan portabilitas data, privasi penuh tanpa tracking, serta kenyamanan di berbagai perangkat mobile dan desktop.
          </p>

          <h6 class="fw-bold text-dark mb-2 small"><i class="bi bi-link-45deg me-1 text-primary"></i>Media Sosial & Portofolio Resmi:</h6>
          <div class="d-flex flex-column gap-2 mb-3">
            <a href="https://www.linkedin.com/in/arif-permana-putrasuryana-121b761b9/?locale=in" target="_blank" class="btn btn-outline-primary rounded-pill d-flex align-items-center justify-content-between p-2.5 text-start">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-linkedin fs-5 text-primary"></i>
                <div>
                  <span class="fw-bold text-dark d-block small">LinkedIn Profile</span>
                  <small class="text-muted" style="font-size: 10px;">Arif Permana Putrasuryana</small>
                </div>
              </div>
              <i class="bi bi-box-arrow-up-right small"></i>
            </a>

            <a href="https://itsmebroarif.medium.com/" target="_blank" class="btn btn-outline-dark rounded-pill d-flex align-items-center justify-content-between p-2.5 text-start">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-medium fs-5 text-dark"></i>
                <div>
                  <span class="fw-bold text-dark d-block small">Medium Technical Blog</span>
                  <small class="text-muted" style="font-size: 10px;">itsmebroarif.medium.com</small>
                </div>
              </div>
              <i class="bi bi-box-arrow-up-right small"></i>
            </a>

            <a href="https://www.instagram.com/eexxvvn/" target="_blank" class="btn btn-outline-danger rounded-pill d-flex align-items-center justify-content-between p-2.5 text-start">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-instagram fs-5 text-danger"></i>
                <div>
                  <span class="fw-bold text-dark d-block small">Instagram Official</span>
                  <small class="text-muted" style="font-size: 10px;">@eexxvvn</small>
                </div>
              </div>
              <i class="bi bi-box-arrow-up-right small"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- GitHub Repository Card -->
      <div class="col-lg-6">
        <div class="card border-0 shadow-sm rounded-4 bg-dark text-white p-4 h-100">
          <div class="d-flex align-items-center gap-3 mb-3 border-bottom border-secondary border-opacity-25 pb-3">
            <div class="bg-white bg-opacity-10 rounded-3 p-3 text-white d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
              <i class="bi bi-github fs-2"></i>
            </div>
            <div>
              <span class="badge bg-success rounded-pill px-2.5 py-1 fw-bold small mb-1">Open Source Repository</span>
              <h5 class="fw-bold text-white mb-0">itsmebroarif/rajinkerja-id</h5>
              <small class="text-slate-300">Public GitHub Repository</small>
            </div>
          </div>

          <p class="small text-slate-300 lh-base mb-3">
            Source code lengkap RajinKerja.id tersedia secara terbuka di GitHub. Anda dapat melakukan fork, kloning, kontribusi, atau self-hosting aplikasi ini secara gratis.
          </p>

          <div class="p-3 bg-black bg-opacity-50 rounded-3 mb-3 border border-secondary border-opacity-25">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-slate-400 font-mono">Git Clone Repository:</small>
              <button @click="copyRepoUrl" class="btn btn-xs btn-outline-light rounded-pill px-2">
                <i class="bi bi-clipboard me-1"></i> Copy URL
              </button>
            </div>
            <code class="text-success small d-block font-mono text-break">https://github.com/itsmebroarif/rajinkerja-id.git</code>
          </div>

          <a href="https://github.com/itsmebroarif/rajinkerja-id" target="_blank" class="btn btn-primary btn-lg rounded-pill fw-bold w-100 mt-auto d-flex align-items-center justify-content-center gap-2">
            <i class="bi bi-box-arrow-up-right"></i> Buka Repository di GitHub
          </a>
        </div>
      </div>
    </div>

    <!-- System Modules Manual & Features -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
      <h4 class="fw-bold text-dark mb-3"><i class="bi bi-book-fill text-primary me-2"></i>Panduan Modul & Fitur Utama RajinKerja.id</h4>

      <div class="row g-3">
        <div class="col-md-4">
          <div class="p-3 bg-light rounded-3 border h-100">
            <h6 class="fw-bold text-primary mb-1"><i class="bi bi-kanban-fill me-1"></i>1. To-Do & Board Kanban</h6>
            <p class="small text-muted mb-0">Kelola tugas harian dengan kolom status Todo, In Progress, dan Done. Dilengkapi filter tingkat urgensi dan deadline.</p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="p-3 bg-light rounded-3 border h-100">
            <h6 class="fw-bold text-info mb-1"><i class="bi bi-folder-fill me-1"></i>2. Proyek & Kontrak</h6>
            <p class="small text-muted mb-0">Pantau progres pengerjaan proyek kantor atau klien freelance, nilai rate kontrak, serta riwayat pembayaran DP/Pelunasan.</p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="p-3 bg-light rounded-3 border h-100">
            <h6 class="fw-bold text-danger mb-1"><i class="bi bi-camera-fill me-1"></i>3. Kamera & Scan Dokumen</h6>
            <p class="small text-muted mb-0">Pindai berkas nota fisik atau dokumen menggunakan kamera perangkat secara langsung. Ekspor ke PDF atau simpan di Notes.</p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="p-3 bg-light rounded-3 border h-100">
            <h6 class="fw-bold text-success mb-1"><i class="bi bi-person-lines-fill me-1"></i>4. Kontak Tim & Broadcast WA</h6>
            <p class="small text-muted mb-0">Manajemen direktori tim dan kontak klien. Kirim pesan broadcast WhatsApp cepat tanpa membuka halaman modal terpisah.</p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="p-3 bg-light rounded-3 border h-100">
            <h6 class="fw-bold text-warning-emphasis mb-1"><i class="bi bi-wallet2 me-1"></i>5. Keuangan & Invoice PDF</h6>
            <p class="small text-muted mb-0">Pencatatan arus kas Pemasukan & Pengeluaran serta invoice generator otomatis dengan export PDF resmi dan Excel.</p>
          </div>
        </div>

        <div class="col-md-4">
          <div class="p-3 bg-light rounded-3 border h-100">
            <h6 class="fw-bold text-purple mb-1"><i class="bi bi-sliders me-1"></i>6. Preferences & Recovery JSON</h6>
            <p class="small text-muted mb-0">Instalasi PWA ke HP Android, notifikasi On-Device, kustomisasi warna aksen, serta tombol recovery backup JSON terstruktur.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Accordion -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4" id="faqSection">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom gap-2">
        <h4 class="fw-bold text-dark mb-0">
          <i class="bi bi-question-square-fill text-primary me-2"></i>Pertanyaan Sering Diajukan (FAQ)
        </h4>
        <div class="input-group style-search" style="max-width: 280px;">
          <span class="input-group-text bg-light border-end-0"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control form-control-sm bg-light border-start-0" placeholder="Cari pertanyaan..." v-model="faqSearch" />
        </div>
      </div>

      <div class="accordion accordion-flush" id="faqAccordion">
        <div v-for="(item, idx) in filteredFaqs" :key="idx" class="accordion-item border-bottom py-2">
          <h2 class="accordion-header" :id="'heading' + idx">
            <button class="accordion-button collapsed fw-bold text-dark px-0 bg-transparent fs-6" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + idx" aria-expanded="false" :aria-controls="'collapse' + idx">
              <i class="bi bi-check2-circle text-primary me-2"></i>
              {{ item.question }}
            </button>
          </h2>
          <div :id="'collapse' + idx" class="accordion-collapse collapse" :aria-labelledby="'heading' + idx" data-bs-parent="#faqAccordion">
            <div class="accordion-body px-0 text-secondary lh-lg small" v-html="item.answer"></div>
          </div>
        </div>

        <div v-if="filteredFaqs.length === 0" class="text-center py-4 text-muted">
          Tidak ditemukan FAQ yang sesuai dengan kata kunci "{{ faqSearch }}".
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { sendOnDeviceNotification } from '../utils/notification';

export default {
  name: 'FaqAboutView',
  setup() {
    const faqSearch = ref('');
    const isOnline = ref(navigator.onLine);

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

    const copyRepoUrl = () => {
      navigator.clipboard.writeText('https://github.com/itsmebroarif/rajinkerja-id.git');
      sendOnDeviceNotification('📋 URL Repository Disalin!', {
        body: 'https://github.com/itsmebroarif/rajinkerja-id.git telah tersimpan di clipboard.',
        type: 'success'
      });
    };

    const faqs = [
      {
        question: 'Di mana saya dapat mengakses repositori resmi kode sumber aplikasi ini?',
        answer: 'Repositori resmi kode sumber RajinKerja.id dikelola secara terbuka di GitHub dengan alamat: <a href="https://github.com/itsmebroarif/rajinkerja-id" target="_blank" class="fw-bold text-primary">https://github.com/itsmebroarif/rajinkerja-id</a>.'
      },
      {
        question: 'Bagaimana cara menginstall RajinKerja.id ke HP Android saya (PWA)?',
        answer: 'Buka menu <strong>Preferences</strong> di navigasi samping atau klik tombol <strong>Install to Your Device</strong>. Pada browser Google Chrome Android, klik titik tiga (⋮) di kanan atas lalu pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.'
      },
      {
        question: 'Bagaimana cara menggunakan fitur Kamera Scan Dokumen?',
        answer: 'Buka menu <strong>Kamera & Scan Dokumen</strong>. Arahkan kamera ke berkas/nota fisik Anda, lalu tekan tombol shutter. Hasil foto pindaian dapat disesuaikan filter warnanya, disimpan ke Scratchpad Notes, diunduh sebagai gambar, atau diexport menjadi PDF.'
      },
      {
        question: 'Bagaimana cara menggunakan tombol Recovery saat melakukan import file JSON backup?',
        answer: 'Buka menu <strong>Preferences</strong> -> Pilih file `.json` di bagian Import & Recovery Data. Sistem akan menampilkan kartu preview data. Klik tombol <strong>Pulihkan & Timpa (Full Recovery)</strong> untuk merestorasi seluruh data Anda.'
      },
      {
        question: 'Apakah data saya aman dan privasi terjaga?',
        answer: 'Sangat aman! RajinKerja.id menggunakan konsep <em>Local-First Architecture</em>. Seluruh data disimpan langsung di memori browser perangkat Anda tanpa dikirim ke server pihak ketiga.'
      }
    ];

    const filteredFaqs = computed(() => {
      if (!faqSearch.value.trim()) return faqs;
      const q = faqSearch.value.toLowerCase();
      return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    });

    return {
      faqSearch,
      isOnline,
      faqs,
      filteredFaqs,
      copyRepoUrl
    };
  }
};
</script>

<style scoped>
.style-search {
  border-radius: 20px;
  overflow: hidden;
}
.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.btn-xs {
  font-size: 11px;
}
</style>

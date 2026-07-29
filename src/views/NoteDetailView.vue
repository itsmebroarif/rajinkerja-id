<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Top Action Bar -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div class="d-flex align-items-center gap-3">
        <router-link to="/notes" class="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-2 fw-semibold">
          <i class="bi bi-arrow-left fs-5"></i>
          <span>Kembali ke Daftar Notes</span>
        </router-link>
        <div class="border-start ps-3 d-none d-sm-block" v-if="note">
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill mb-1">
            <i class="bi bi-file-earmark-text me-1"></i> Detail Preview Catatan
          </span>
          <h4 class="fw-bold text-dark mb-0 text-truncate" style="max-width: 420px;">{{ note.title || 'Untitled Note' }}</h4>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex flex-wrap align-items-center gap-2" v-if="note">
        <button class="btn btn-light border rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2" @click="copyContent">
          <i class="bi bi-clipboard"></i>
          <span>Salin Teks</span>
        </button>
        <button class="btn btn-light border rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2" @click="printNote">
          <i class="bi bi-printer"></i>
          <span>Cetak / Export</span>
        </button>
        <button class="btn btn-warning rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-dark" @click="openEditor">
          <i class="bi bi-pencil-square"></i>
          <span>Edit Catatan</span>
        </button>
        <button class="btn btn-outline-danger rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2" @click="deleteNote">
          <i class="bi bi-trash"></i>
          <span>Hapus</span>
        </button>
      </div>
    </div>

    <!-- MAIN NOTE DETAIL CARD -->
    <div v-if="note" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4" :style="{ backgroundColor: note.color || '#ffffff' }">
      <!-- Note Header Bar -->
      <div class="p-4 p-md-5 border-bottom bg-white bg-opacity-75 backdrop-blur d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge bg-dark text-white rounded-pill px-3 py-1 text-uppercase fw-bold" style="font-size: 11px;">
              Markdown Document
            </span>
            <span class="small text-muted d-flex align-items-center gap-1">
              <i class="bi bi-clock me-1"></i> Terakhir diperbarui: {{ formatDate(note.updatedAt) }}
            </span>
          </div>
          <h1 class="display-6 fw-extrabold text-dark mb-0">{{ note.title || 'Untitled Note' }}</h1>
        </div>

        <div class="d-flex align-items-center gap-3 bg-light p-3 rounded-3 border">
          <div class="text-center px-2">
            <span class="small text-muted d-block fw-semibold" style="font-size: 11px;">KATA</span>
            <span class="fs-5 fw-extrabold text-dark">{{ getWordCount(note.content) }}</span>
          </div>
          <div class="border-start ps-3 text-center px-2">
            <span class="small text-muted d-block fw-semibold" style="font-size: 11px;">KARAKTER</span>
            <span class="fs-5 fw-extrabold text-dark">{{ (note.content || '').length }}</span>
          </div>
        </div>
      </div>

      <!-- Note Rendered Markdown Body -->
      <div class="card-body p-4 p-md-5 bg-white">
        <div class="note-markdown-body" v-html="renderedMarkdown"></div>
      </div>

      <!-- Note Footer Info -->
      <div class="card-footer bg-light p-4 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
        <span class="small text-muted">
          <i class="bi bi-shield-check text-success me-1"></i> Catatan ini tersimpan aman di sistem penyimpanan lokal aplikasi Anda.
        </span>
        <span class="small text-muted">ID: <code class="text-primary">{{ note.id }}</code></span>
      </div>
    </div>

    <!-- NOTE NOT FOUND STATE -->
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
      <div class="display-1 text-muted opacity-50 mb-3">📑</div>
      <h3 class="fw-bold text-dark">Catatan Tidak Ditemukan</h3>
      <p class="text-muted max-w-md mx-auto">Catatan yang Anda cari mungkin telah dihapus atau ID tidak valid.</p>
      <router-link to="/notes" class="btn btn-primary rounded-3 px-4 py-2 mt-2 fw-semibold">
        <i class="bi bi-arrow-left me-1"></i> Kembali ke Daftar Notes
      </router-link>
    </div>

    <!-- Edit Note Inline Offcanvas / Drawer -->
    <div v-if="isEditing" class="drawer-backdrop" @click="isEditing = false"></div>
    <div class="drawer-panel bg-white shadow-lg border-start" :class="{ 'drawer-show': isEditing }">
      <div class="drawer-header p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
        <div>
          <span class="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-1">
            ✏️ Quick Edit Mode
          </span>
          <h5 class="fw-bold text-dark mb-0">Edit Catatan</h5>
        </div>
        <button type="button" class="btn btn-light rounded-circle border p-2" @click="isEditing = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="drawer-body p-4 overflow-y-auto" style="height: calc(100vh - 85px);">
        <form @submit.prevent="saveEditNote" class="row g-3" v-if="editForm">
          <div class="col-12">
            <label class="form-label fw-bold small text-dark">Judul Catatan</label>
            <input type="text" class="form-control form-control-lg border-2 fs-6" v-model="editForm.title" required />
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small text-dark">Warna Note</label>
            <div class="d-flex gap-2">
              <button
                type="button"
                v-for="c in colorOptions"
                :key="c.code"
                class="btn rounded-3 p-0 flex-grow-1"
                :style="{ backgroundColor: c.code, height: '36px' }"
                :class="{ 'border border-3 border-dark': editForm.color === c.code }"
                @click="editForm.color = c.code"
              ></button>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small text-dark">Isi Markdown</label>
            <textarea class="form-control font-monospace border-2 p-3" rows="12" v-model="editForm.content"></textarea>
          </div>

          <div class="col-12 pt-3 border-top mt-4 d-flex gap-2">
            <button type="button" class="btn btn-light rounded-3 px-4 flex-grow-1" @click="isEditing = false">Batal</button>
            <button type="submit" class="btn btn-primary rounded-3 px-4 py-2 fw-bold flex-grow-1 shadow-sm">
              <i class="bi bi-check-circle-fill me-1"></i> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sleek Toast Notification -->
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
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { marked } from 'marked';

export default {
  name: 'NoteDetailView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();

    const toast = ref({ show: false, message: '' });
    const isEditing = ref(false);
    const editForm = ref(null);

    const colorOptions = [
      { name: 'Kuning', code: '#fef08a' },
      { name: 'Biru', code: '#bae6fd' },
      { name: 'Hijau', code: '#bbf7d0' },
      { name: 'Merah Muda', code: '#fbcfe8' },
      { name: 'Ungu', code: '#e9d5ff' }
    ];

    const note = computed(() => {
      const id = route.params.id;
      const allNotes = store.getters.getNotes || [];
      return allNotes.find(n => n.id === id) || null;
    });

    const renderedMarkdown = computed(() => {
      if (!note.value || !note.value.content) return '<p class="text-muted italic">Tidak ada isi teks pada catatan ini.</p>';
      try {
        return marked.parse(note.value.content);
      } catch (e) {
        return note.value.content;
      }
    });

    const getWordCount = (text) => {
      if (!text) return 0;
      return text.trim().split(/\s+/).filter(Boolean).length;
    };

    const formatDate = (isoStr) => {
      if (!isoStr) return 'Hari ini';
      try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return isoStr;
      }
    };

    const copyContent = () => {
      if (!note.value) return;
      navigator.clipboard.writeText(note.value.content || '');
      showToast('Isi catatan berhasil disalin ke clipboard!');
    };

    const printNote = () => {
      window.print();
    };

    const openEditor = () => {
      if (!note.value) return;
      editForm.value = { ...note.value };
      isEditing.value = true;
    };

    const saveEditNote = () => {
      if (!editForm.value) return;
      const updated = {
        ...editForm.value,
        updatedAt: new Date().toISOString()
      };
      store.commit('UPDATE_NOTE', updated);
      isEditing.value = false;
      showToast('Catatan berhasil diperbarui!');
    };

    const deleteNote = () => {
      if (!note.value) return;
      if (confirm(`Apakah Anda yakin ingin menghapus catatan "${note.value.title}"?`)) {
        store.commit('DELETE_NOTE', note.value.id);
        router.push('/notes');
      }
    };

    const showToast = (msg) => {
      toast.value = { show: true, message: msg };
      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    return {
      note,
      renderedMarkdown,
      getWordCount,
      formatDate,
      copyContent,
      printNote,
      isEditing,
      editForm,
      colorOptions,
      openEditor,
      saveEditNote,
      deleteNote,
      toast
    };
  }
};
</script>

<style scoped>
.backdrop-blur {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.note-markdown-body {
  font-size: 1.05rem;
  line-height: 1.75;
  color: #1e293b;
}

.note-markdown-body :deep(h1),
.note-markdown-body :deep(h2),
.note-markdown-body :deep(h3) {
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #0f172a;
}

.note-markdown-body :deep(pre) {
  background-color: #0f172a;
  color: #f8fafc;
  padding: 1rem 1.25rem;
  border-radius: 0.75rem;
  overflow-x: auto;
  font-family: monospace;
}

.note-markdown-body :deep(code) {
  background-color: #f1f5f9;
  color: #0284c7;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
}

.note-markdown-body :deep(blockquote) {
  border-left: 4px solid #2563eb;
  padding-left: 1rem;
  margin-left: 0;
  color: #475569;
  font-style: italic;
}

.note-markdown-body :deep(ul),
.note-markdown-body :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

/* Slide-over Drawer Styles */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  z-index: 1070;
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 520px;
  max-width: 100vw;
  height: 100vh;
  z-index: 1080;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer-panel.drawer-show {
  transform: translateX(0);
}

@media print {
  .drawer-panel, .drawer-backdrop, .toast-container, button, .router-link {
    display: none !important;
  }
}
</style>

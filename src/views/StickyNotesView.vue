<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-light text-dark border fw-semibold px-3 py-2 rounded-pill">Scratchpad & Docs</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">📌 Sticky Notes & Markdown Scratchpad</h2>
        <p class="text-muted mb-0">Catatan cepat, coretan ide, dan dokumentasi proyek berbasis Markdown dengan live preview.</p>
      </div>
      <div>
        <button class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm" @click="openAddModal">
          <i class="bi bi-plus-lg fs-5"></i>
          <span>Buat Note Baru</span>
        </button>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-white p-3 rounded-4 shadow-sm border mb-4">
      <div class="row g-3 align-items-center">
        <div class="col-md-6 col-lg-5">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control bg-light border-start-0 ps-0"
              placeholder="Cari judul atau isi catatan..."
              v-model="searchQuery"
            />
            <button v-if="searchQuery" class="btn btn-light border" @click="searchQuery = ''">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <div class="col-md-6 col-lg-7 d-flex align-items-center justify-content-md-end gap-2 overflow-auto">
          <span class="small fw-semibold text-muted d-none d-sm-inline">Warna:</span>
          <button
            class="btn btn-sm rounded-pill px-3"
            :class="selectedColor === 'all' ? 'btn-dark' : 'btn-light border'"
            @click="selectedColor = 'all'"
          >
            Semua ({{ notes.length }})
          </button>
          <button
            v-for="c in colorOptions"
            :key="c.code"
            class="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
            :class="selectedColor === c.code ? 'border-2 border-dark shadow-sm' : 'border'"
            :style="{ backgroundColor: c.code, color: '#000' }"
            @click="selectedColor = c.code"
          >
            <span>{{ c.name }}</span>
            <span class="badge bg-white text-dark rounded-circle px-1" style="font-size: 10px;">
              {{ getNotesCountByColor(c.code) }}
            </span>
          </button>
        </div>
      </div>
      <div v-if="searchQuery || selectedColor !== 'all'" class="mt-2 pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
        <span>
          Menampilkan <strong>{{ filteredNotes.length }}</strong> dari <strong>{{ notes.length }}</strong> catatan
        </span>
        <button class="btn btn-link btn-sm text-decoration-none p-0 text-danger" @click="resetFilters">
          <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filter
        </button>
      </div>
    </div>

    <!-- Notes Grid -->
    <div class="row g-3" v-if="filteredNotes.length > 0">
      <div v-for="note in filteredNotes" :key="note.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 p-4 hover-card" :style="{ backgroundColor: note.color || '#fef08a' }">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <h5 class="fw-bold text-dark mb-0">{{ note.title || 'Untitled Note' }}</h5>
            <div class="d-flex gap-1">
              <button class="btn btn-xs btn-light rounded-circle" @click="editNote(note)"><i class="bi bi-pencil-fill"></i></button>
              <button class="btn btn-xs btn-light text-danger rounded-circle" @click="deleteNote(note.id)"><i class="bi bi-trash-fill"></i></button>
            </div>
          </div>

          <!-- Live Rendered Markdown Content -->
          <div class="markdown-preview text-dark small flex-grow-1 my-2 border-top border-bottom py-2" v-html="renderMarkdown(note.content)"></div>

          <div class="d-flex justify-content-between align-items-center mt-2 pt-2 text-muted style-footer">
            <span><i class="bi bi-clock me-1"></i>{{ formatDate(note.updatedAt) }}</span>
            <span class="badge bg-white text-dark border px-2 py-1 rounded-pill">Markdown</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
      <i class="bi bi-journal-text display-1 text-muted opacity-50"></i>
      <h4 class="fw-bold mt-3 text-dark">Belum Ada Catatan</h4>
      <p class="text-muted">Buat sticky notes pertama Anda untuk mencatat requirement atau todolist singkat.</p>
      <button class="btn btn-primary rounded-3 px-4 py-2 mt-2" @click="openAddModal">
        <i class="bi bi-plus-lg me-1"></i> Buat Note Baru
      </button>
    </div>

    <!-- Modal Form (Add / Edit Note with Live Markdown Preview) -->
    <div class="modal fade" id="noteModal" tabindex="-1" ref="noteModalRef" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 p-4 pb-0">
            <h5 class="modal-title fw-bold text-dark">
              {{ isEditing ? '✏️ Edit Markdown Note' : '➕ Buat Note Baru' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveNote" class="row g-3">
              <div class="col-md-8">
                <label class="form-label fw-semibold">Judul Catatan</label>
                <input type="text" class="form-control" v-model="form.title" placeholder="Contoh: Checklist Launching Website" required />
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Warna Sticky Note</label>
                <div class="d-flex gap-2 pt-1">
                  <button
                    type="button"
                    v-for="c in colorOptions"
                    :key="c.code"
                    class="btn rounded-circle p-0 style-color-btn"
                    :style="{ backgroundColor: c.code }"
                    :class="{ 'border border-3 border-dark': form.color === c.code }"
                    @click="form.color = c.code"
                  ></button>
                </div>
              </div>

              <!-- Dual Pane Editor & Live Preview -->
              <div class="col-md-6">
                <label class="form-label fw-semibold">Teks Markdown</label>
                <textarea class="form-control" rows="10" v-model="form.content" placeholder="Gunakan sintaks Markdown (# Header, - List, **Bold**, dll)..."></textarea>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Live Preview</label>
                <div class="card p-3 rounded-3 border bg-light h-100 overflow-auto" style="max-height: 250px;">
                  <div class="markdown-preview small text-dark" v-html="renderMarkdown(form.content)"></div>
                </div>
              </div>

              <div class="col-12 text-end pt-3 border-top">
                <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="closeModal">Batal</button>
                <button type="submit" class="btn btn-primary px-4 rounded-3 fw-semibold">Simpan Note</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { marked } from 'marked';

export default {
  name: 'StickyNotesView',
  setup() {
    const store = useStore();
    const isEditing = ref(false);
    const editingId = ref(null);

    const noteModalRef = ref(null);
    let modalInstance = null;

    const colorOptions = [
      { name: 'Kuning', code: '#fef08a' },
      { name: 'Biru', code: '#bae6fd' },
      { name: 'Hijau', code: '#bbf7d0' },
      { name: 'Merah Muda', code: '#fbcfe8' },
      { name: 'Ungu', code: '#e9d5ff' }
    ];

    const form = ref({
      title: '',
      content: '',
      color: '#fef08a'
    });

    const searchQuery = ref('');
    const selectedColor = ref('all');

    const notes = computed(() => store.getters.getNotes);

    const filteredNotes = computed(() => {
      return notes.value.filter(n => {
        const matchesQuery = !searchQuery.value ||
          (n.title && n.title.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
          (n.content && n.content.toLowerCase().includes(searchQuery.value.toLowerCase()));

        const matchesColor = selectedColor.value === 'all' || n.color === selectedColor.value;

        return matchesQuery && matchesColor;
      });
    });

    const getNotesCountByColor = (colorCode) => {
      return notes.value.filter(n => n.color === colorCode).length;
    };

    const resetFilters = () => {
      searchQuery.value = '';
      selectedColor.value = 'all';
    };

    const getModal = () => {
      if (noteModalRef.value && window.bootstrap && window.bootstrap.Modal) {
        return window.bootstrap.Modal.getOrCreateInstance(noteModalRef.value, { backdrop: true, keyboard: true });
      }
      return null;
    };

    const cleanupBackdrop = () => {
      setTimeout(() => {
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length === 0) {
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
          document.body.classList.remove('modal-open');
          document.body.style.removeProperty('overflow');
          document.body.style.removeProperty('padding-right');
        }
      }, 300);
    };

    onMounted(() => {
      // Lazy init
    });

    const renderMarkdown = (text) => {
      if (!text) return '<em class="text-muted">Ketik teks untuk melihat preview...</em>';
      try {
        return marked.parse(text);
      } catch (e) {
        return text;
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      form.value = {
        title: '',
        content: '# Catatan Baru\n\n- [ ] Poin penting 1\n- [ ] Poin penting 2',
        color: '#fef08a'
      };
      const modal = getModal();
      if (modal) modal.show();
    };

    const editNote = (note) => {
      isEditing.value = true;
      editingId.value = note.id;
      form.value = { ...note };
      const modal = getModal();
      if (modal) modal.show();
    };

    const closeModal = () => {
      const modal = getModal();
      if (modal) modal.hide();
      cleanupBackdrop();
    };

    const saveNote = () => {
      if (isEditing.value) {
        store.dispatch('updateNote', { ...form.value, id: editingId.value });
      } else {
        store.dispatch('addNote', form.value);
      }
      closeModal();
    };

    const deleteNote = (id) => {
      if (confirm('Hapus note ini?')) {
        store.dispatch('deleteNote', id);
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      notes,
      filteredNotes,
      colorOptions,
      isEditing,
      form,
      searchQuery,
      selectedColor,
      getNotesCountByColor,
      resetFilters,
      noteModalRef,
      renderMarkdown,
      openAddModal,
      editNote,
      closeModal,
      saveNote,
      deleteNote,
      formatDate
    };
  }
};
</script>

<style scoped>
.style-color-btn {
  width: 28px;
  height: 28px;
  cursor: pointer;
}

.style-footer {
  font-size: 11px;
}

.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
}

.markdown-preview :deep(h1), .markdown-preview :deep(h2), .markdown-preview :deep(h3) {
  font-size: 1.1rem;
  font-weight: 700;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.markdown-preview :deep(ul), .markdown-preview :deep(ol) {
  padding-left: 1.2rem;
  margin-bottom: 0.5rem;
}
</style>

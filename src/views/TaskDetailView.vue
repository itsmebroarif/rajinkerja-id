<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Top Bar Navigation -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div class="d-flex align-items-center gap-3">
        <router-link to="/tasks" class="btn btn-outline-secondary rounded-3 px-3 py-2 d-flex align-items-center gap-2 fw-semibold">
          <i class="bi bi-arrow-left fs-5"></i>
          <span>Kembali ke Daftar Tasks</span>
        </router-link>
        <div class="border-start ps-3 d-none d-sm-block" v-if="task">
          <span class="badge bg-warning-subtle text-warning-emphasis fw-bold px-3 py-1.5 rounded-pill mb-1">
            <i class="bi bi-check2-square me-1"></i> Detail Tugas & Aktivitas
          </span>
          <h4 class="fw-bold text-dark mb-0 text-truncate" style="max-width: 420px;">{{ task.name }}</h4>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex flex-wrap align-items-center gap-2" v-if="task">
        <button
          class="btn rounded-3 px-3 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
          :class="task.done ? 'btn-success' : 'btn-outline-success'"
          @click="toggleTaskDone"
        >
          <i :class="task.done ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
          <span>{{ task.done ? 'Selesai (Completed)' : 'Tandai Selesai' }}</span>
        </button>
        <button class="btn btn-warning rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2 text-dark" @click="openEditModal">
          <i class="bi bi-pencil-square"></i>
          <span>Edit Task</span>
        </button>
        <button class="btn btn-outline-danger rounded-3 px-3 py-2 fw-semibold d-flex align-items-center gap-2" @click="deleteTask">
          <i class="bi bi-trash"></i>
          <span>Hapus</span>
        </button>
      </div>
    </div>

    <!-- MAIN TASK DETAIL CARD -->
    <div v-if="task" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
      <!-- Task Header -->
      <div class="p-4 p-md-5 border-bottom bg-light bg-opacity-50 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
        <div>
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge rounded-pill px-3 py-1.5 fw-semibold" :class="getCategoryBadgeClass(task.category)">
              {{ getCategoryLabel(task.category) }}
            </span>
            <span class="badge bg-light text-dark border px-3 py-1.5 rounded-pill">
              <i class="bi bi-tag-fill me-1 text-primary"></i>{{ task.projectTag || 'Umum' }}
            </span>
            <span :class="badgeClass(task.level)" class="px-3 py-1.5 rounded-pill small fw-bold">
              Prioritas: {{ task.level }}
            </span>
            <span v-if="task.recurring && task.recurring !== 'none'" class="badge bg-info-subtle text-info fw-bold px-3 py-1.5 rounded-pill">
              <i class="bi bi-repeat me-1"></i>{{ task.recurring }}
            </span>
          </div>

          <h1 class="display-6 fw-extrabold text-dark mb-2" :class="{ 'text-decoration-line-through text-muted': task.done }">
            {{ task.name }}
          </h1>

          <div class="d-flex flex-wrap align-items-center gap-3 text-muted small">
            <span><i class="bi bi-calendar-event me-1 text-primary"></i> Deadline: <strong class="text-dark">{{ formatDate(task.deadline) }}</strong></span>
            <span class="border-start ps-3"><i class="bi bi-kanban me-1 text-info"></i> Status Kolom: <strong class="text-dark">{{ getStatusLabel(task.statusColumn) }}</strong></span>
            <span class="border-start ps-3"><i class="bi bi-grid-1x2 me-1 text-warning"></i> Eisenhower: <strong class="text-dark">{{ getEisenhowerLabel(task.eisenhower) }}</strong></span>
          </div>
        </div>

        <div class="p-4 rounded-4 text-center border shadow-sm style-status-box" :class="task.done ? 'bg-success-subtle border-success text-success' : 'bg-warning-subtle border-warning text-warning-emphasis'">
          <i :class="task.done ? 'bi bi-check-circle-fill display-4' : 'bi bi-hourglass-split display-4'"></i>
          <div class="fw-extrabold fs-5 mt-1">{{ task.done ? 'STATUS: SELESAI' : 'MENUNGGU PENYELESAIAN' }}</div>
          <small class="d-block text-muted mt-1" v-if="task.deadline">
            {{ isOverdue(task.deadline, task.done) ? '⚠️ Melewati Deadline!' : 'Tepat Waktu' }}
          </small>
        </div>
      </div>

      <!-- Task Details & Notes Body -->
      <div class="card-body p-4 p-md-5">
        <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-journal-text text-primary fs-4"></i>
          <span>Catatan & Petunjuk Pekerjaan</span>
        </h5>

        <div class="p-4 bg-light rounded-4 border min-vh-20" style="min-height: 180px;">
          <div v-if="task.notes" class="text-dark fs-6 style-notes-text" style="line-height: 1.8; white-space: pre-wrap;">
            {{ task.notes }}
          </div>
          <div v-else class="text-muted italic py-4 text-center">
            <i class="bi bi-info-circle me-1"></i> Tidak ada catatan khusus untuk tugas ini.
          </div>
        </div>

        <!-- Task Metadata Info Grid -->
        <div class="row g-3 mt-4 pt-4 border-top">
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded-3 border">
              <span class="small text-muted d-block fw-semibold mb-1">ID TUGAS</span>
              <code class="text-primary fw-bold">{{ task.id }}</code>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded-3 border">
              <span class="small text-muted d-block fw-semibold mb-1">KATEGORI</span>
              <span class="fw-bold text-dark">{{ getCategoryLabel(task.category) }}</span>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded-3 border">
              <span class="small text-muted d-block fw-semibold mb-1">RECURRING</span>
              <span class="fw-bold text-dark">{{ task.recurring || 'Tidak' }}</span>
            </div>
          </div>
          <div class="col-sm-6 col-md-3">
            <div class="p-3 bg-light rounded-3 border">
              <span class="small text-muted d-block fw-semibold mb-1">DEADLINE</span>
              <span class="fw-bold text-dark">{{ formatDate(task.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer bg-light p-4 border-top d-flex justify-content-between align-items-center">
        <span class="small text-muted">
          <i class="bi bi-shield-check text-success me-1"></i> Task ini tersimpan otomatis di Vuex Store lokal.
        </span>
        <router-link to="/tasks" class="btn btn-sm btn-outline-primary rounded-pill px-3">
          Lihat Semua Task
        </router-link>
      </div>
    </div>

    <!-- TASK NOT FOUND -->
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
      <div class="display-1 text-muted opacity-50 mb-3">📝</div>
      <h3 class="fw-bold text-dark">Tugas Tidak Ditemukan</h3>
      <p class="text-muted max-w-md mx-auto">Tugas yang Anda cari tidak ada atau mungkin telah dihapus.</p>
      <router-link to="/tasks" class="btn btn-primary rounded-3 px-4 py-2 mt-2 fw-semibold">
        <i class="bi bi-arrow-left me-1"></i> Kembali ke Daftar Tasks
      </router-link>
    </div>

    <!-- Edit Task Drawer / Modal -->
    <div v-if="isEditing" class="drawer-backdrop" @click="isEditing = false"></div>
    <div class="drawer-panel bg-white shadow-lg border-start" :class="{ 'drawer-show': isEditing }">
      <div class="drawer-header p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
        <div>
          <span class="badge bg-warning text-dark fw-bold px-3 py-1 rounded-pill mb-1">
            ✏️ Quick Edit
          </span>
          <h5 class="fw-bold text-dark mb-0">Edit Task / Activity</h5>
        </div>
        <button type="button" class="btn btn-light rounded-circle border p-2" @click="isEditing = false">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="drawer-body p-4 overflow-y-auto" style="height: calc(100vh - 85px);" v-if="editForm">
        <form @submit.prevent="saveEditTask" class="row g-3">
          <div class="col-12">
            <label class="form-label fw-bold small text-dark">Nama Tugas <span class="text-danger">*</span></label>
            <input type="text" class="form-control form-control-lg border-2 fs-6" v-model="editForm.name" required />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark">Kategori</label>
            <select class="form-select" v-model="editForm.category">
              <option value="Work">💼 Work / Pekerjaan</option>
              <option value="Personal">🏠 Personal / Pribadi</option>
              <option value="Urgent">🔥 Urgent / Mendesak</option>
              <option value="Client">🤝 Client Project</option>
              <option value="Routine">🔄 Routine / Rutinitas</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark">Prioritas</label>
            <select class="form-select" v-model="editForm.level">
              <option value="Menengah">Menengah</option>
              <option value="Penting">Penting</option>
              <option value="Biasa">Biasa</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark">Proyek / Tag</label>
            <input type="text" class="form-control" v-model="editForm.projectTag" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark">Target Deadline</label>
            <input type="date" class="form-control" v-model="editForm.deadline" />
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark">Status Kolom</label>
            <select class="form-select" v-model="editForm.statusColumn">
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Completed</option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label fw-bold small text-dark">Matriks Eisenhower</label>
            <select class="form-select" v-model="editForm.eisenhower">
              <option value="do_first">Do First</option>
              <option value="schedule">Schedule</option>
              <option value="delegate">Delegate</option>
              <option value="eliminate">Eliminate</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label fw-bold small text-dark">Catatan / Detail</label>
            <textarea class="form-control" rows="4" v-model="editForm.notes"></textarea>
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
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'TaskDetailView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();

    const toast = ref({ show: false, message: '' });
    const isEditing = ref(false);
    const editForm = ref(null);

    const task = computed(() => {
      const id = route.params.id;
      const allTasks = store.getters.getTasks || [];
      return allTasks.find(t => String(t.id) === String(id)) || null;
    });

    const toggleTaskDone = () => {
      if (!task.value) return;
      store.commit('TOGGLE_TASK', task.value.id);
      showToast(task.value.done ? 'Status tugas diubah menjadi Selesai!' : 'Status tugas dikembalikan!');
    };

    const openEditModal = () => {
      if (!task.value) return;
      editForm.value = { ...task.value };
      isEditing.value = true;
    };

    const saveEditTask = () => {
      if (!editForm.value) return;
      store.commit('UPDATE_TASK', editForm.value);
      isEditing.value = false;
      showToast('Data tugas berhasil diperbarui!');
    };

    const deleteTask = () => {
      if (!task.value) return;
      if (confirm(`Apakah Anda yakin ingin menghapus tugas "${task.value.name}"?`)) {
        store.commit('DELETE_TASK', task.value.id);
        router.push('/tasks');
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      } catch (e) {
        return dateStr;
      }
    };

    const isOverdue = (deadlineStr, done) => {
      if (done || !deadlineStr) return false;
      const today = new Date().toISOString().split('T')[0];
      return deadlineStr < today;
    };

    const badgeClass = (level) => {
      if (level === 'Penting') return 'bg-danger text-white';
      if (level === 'Biasa') return 'bg-secondary text-white';
      return 'bg-warning text-dark';
    };

    const getCategoryBadgeClass = (cat) => {
      if (cat === 'Work') return 'bg-primary-subtle text-primary';
      if (cat === 'Personal') return 'bg-success-subtle text-success';
      if (cat === 'Urgent') return 'bg-danger-subtle text-danger';
      if (cat === 'Client') return 'bg-info-subtle text-info';
      return 'bg-secondary-subtle text-secondary';
    };

    const getCategoryLabel = (cat) => {
      const map = {
        Work: '💼 Work',
        Personal: '🏠 Personal',
        Urgent: '🔥 Urgent',
        Client: '🤝 Client',
        Routine: '🔄 Routine'
      };
      return map[cat] || cat || 'Umum';
    };

    const getStatusLabel = (col) => {
      const map = {
        backlog: 'Backlog',
        todo: 'To Do',
        in_progress: 'In Progress',
        done: 'Completed'
      };
      return map[col] || 'To Do';
    };

    const getEisenhowerLabel = (e) => {
      const map = {
        do_first: '🔥 Do First (Kerjakan Sekarang)',
        schedule: '📅 Schedule (Jadwalkan)',
        delegate: '👥 Delegate (Delegasikan)',
        eliminate: '🧹 Eliminate (Eliminasi)'
      };
      return map[e] || 'General';
    };

    const showToast = (msg) => {
      toast.value = { show: true, message: msg };
      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    return {
      task,
      toggleTaskDone,
      openEditModal,
      saveEditTask,
      deleteTask,
      isEditing,
      editForm,
      formatDate,
      isOverdue,
      badgeClass,
      getCategoryBadgeClass,
      getCategoryLabel,
      getStatusLabel,
      getEisenhowerLabel,
      toast
    };
  }
};
</script>

<style scoped>
.style-status-box {
  min-width: 220px;
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
</style>

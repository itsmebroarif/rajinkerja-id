<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-warning-subtle text-warning-emphasis fw-semibold px-3 py-2 rounded-pill">Agenda & Reminders</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">📅 Calendar, Timed Events & Reminders</h2>
        <p class="text-muted mb-0">Kelola agenda meeting jam, pengingat, deadline proyek, dan tanggal jatuh tempo invoice.</p>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary px-3 rounded-3" @click="changeMonth(-1)"><i class="bi bi-chevron-left"></i></button>
        <span class="fw-bold fs-5 text-dark px-2 min-w-160 text-center">{{ monthYearLabel }}</span>
        <button class="btn btn-outline-secondary px-3 rounded-3" @click="changeMonth(1)"><i class="bi bi-chevron-right"></i></button>
        <button class="btn btn-primary px-3 py-2 rounded-3 fw-semibold ms-2" @click="openAddEventModal()">
          <i class="bi bi-calendar-plus me-1"></i> Tambah Event
        </button>
      </div>
    </div>

    <!-- Calendar Legend Bar -->
    <div class="d-flex flex-wrap align-items-center gap-3 bg-white p-3 rounded-4 shadow-sm border mb-3">
      <span class="small fw-bold text-muted me-2">Kategori Event:</span>
      <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1"><i class="bi bi-clock-fill me-1"></i>Timed Event / Meeting</span>
      <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1"><i class="bi bi-check2-square me-1"></i>Deadline Task</span>
      <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1"><i class="bi bi-folder me-1"></i>Deadline Proyek</span>
      <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1"><i class="bi bi-receipt me-1"></i>Jatuh Tempo Invoice</span>
    </div>

    <!-- Calendar Grid -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-4">
      <!-- Days Header -->
      <div class="calendar-grid-header text-center fw-bold text-muted small mb-2 border-bottom pb-2">
        <div v-for="day in weekDays" :key="day" class="p-1">{{ day }}</div>
      </div>

      <!-- Days Cells -->
      <div class="calendar-grid-body">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="calendar-cell p-2 border rounded-3 cursor-pointer cell-hover"
          :class="[
            cell.currentMonth ? 'cell-active' : 'cell-inactive opacity-50',
            cell.isToday ? 'border-primary border-2 shadow-sm' : ''
          ]"
          @click="openDayDetailModal(cell)"
        >
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small fw-bold" :class="cell.isToday ? 'text-primary fs-6' : (cell.currentMonth ? 'text-dark' : 'text-muted opacity-50')">
              {{ cell.dayNum }}
            </span>
            <span v-if="cell.isToday" class="badge bg-primary style-mini">HARI INI</span>
          </div>

          <!-- Items on this date -->
          <div class="d-flex flex-column gap-1 overflow-hidden">
            <!-- Timed Events -->
            <div
              v-for="e in getEventsForDate(cell.dateStr)"
              :key="e.id"
              class="p-1 rounded bg-primary-subtle text-primary fw-semibold style-event d-flex align-items-center justify-content-between"
            >
              <span class="text-truncate"><i class="bi bi-clock-fill me-1"></i>{{ e.startTime }} {{ e.title }}</span>
              <span v-if="e.reminder && e.reminder !== 'None'" class="badge bg-primary text-white p-0 px-1 style-mini ms-1" title="Reminder set">🔔</span>
            </div>

            <!-- Tasks -->
            <div v-for="t in getTasksForDate(cell.dateStr)" :key="t.id" class="p-1 rounded bg-warning-subtle text-warning-emphasis style-event text-truncate">
              <i class="bi bi-check2-square me-1"></i>{{ t.name }}
            </div>

            <!-- Projects -->
            <div v-for="p in getProjectsForDate(cell.dateStr)" :key="p.id" class="p-1 rounded bg-info-subtle text-info-emphasis style-event text-truncate">
              <i class="bi bi-folder me-1"></i>{{ p.projectTitle }}
            </div>

            <!-- Invoices -->
            <div v-for="inv in getInvoicesForDate(cell.dateStr)" :key="inv.id" class="p-1 rounded bg-danger-subtle text-danger style-event text-truncate">
              <i class="bi bi-receipt me-1"></i>{{ inv.invoiceNumber }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form: Add / Edit Timed Event -->
    <div class="modal fade" id="eventModal" tabindex="-1" ref="eventModalRef" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 p-4 pb-0">
            <h5 class="modal-title fw-bold text-dark">
              {{ isEditingEvent ? '✏️ Edit Event / Agenda' : '⏰ Tambah Event / Agenda Jam' }}
            </h5>
            <button type="button" class="btn-close" @click="closeEventModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveEvent" class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Judul Agenda / Meeting <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="eventForm.title" placeholder="Contoh: Client Demo Meeting" required />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Tanggal <span class="text-danger">*</span></label>
                <input type="date" class="form-control" v-model="eventForm.date" required />
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Jam Mulai</label>
                <input type="time" class="form-control" v-model="eventForm.startTime" />
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Jam Selesai</label>
                <input type="time" class="form-control" v-model="eventForm.endTime" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Kategori Agenda</label>
                <select class="form-select" v-model="eventForm.category">
                  <option value="Meeting">Meeting / Client Call</option>
                  <option value="Milestone">Milestone Proyek</option>
                  <option value="Reminder">Pengingat Penting</option>
                  <option value="Personal">Personal / Rutinitas</option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Pengingat / Reminder</label>
                <select class="form-select" v-model="eventForm.reminder">
                  <option value="None">Tanpa Pengingat</option>
                  <option value="15m">15 Menit Sebelum</option>
                  <option value="30m">30 Menit Sebelum</option>
                  <option value="1h">1 Jam Sebelum</option>
                  <option value="1d">1 Hari Sebelum</option>
                </select>
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Catatan / Detail Agenda</label>
                <textarea class="form-control" rows="2" v-model="eventForm.notes" placeholder="Lokasi, link Zoom, atau catatan pendukung..."></textarea>
              </div>

              <div class="col-12 text-end pt-3 border-top">
                <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="closeEventModal">Batal</button>
                <button type="submit" class="btn btn-primary px-4 rounded-3 fw-semibold">Simpan Agenda</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Detail Modal -->
    <div class="modal fade" id="dayDetailModal" tabindex="-1" ref="dayDetailModalRef" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content rounded-4 border-0 shadow" v-if="selectedCell">
          <div class="modal-header border-bottom p-4">
            <div>
              <span class="badge bg-primary-subtle text-primary fw-semibold mb-1">Agenda Detail</span>
              <h5 class="modal-title fw-bold text-dark">
                📅 Agenda Tanggal: {{ formatFullDate(selectedCell.dateStr) }}
              </h5>
            </div>
            <button type="button" class="btn-close" @click="closeDayDetailModal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-dark mb-0">Daftar Kegiatan & Deadline Hari Ini:</h6>
              <button class="btn btn-sm btn-primary rounded-3" @click="openAddEventModal(selectedCell.dateStr)">
                <i class="bi bi-plus-lg me-1"></i> Tambah Event di Tanggal Ini
              </button>
            </div>

            <!-- Timed Events Section -->
            <div class="mb-4">
              <span class="fw-bold text-primary small d-block mb-2"><i class="bi bi-clock-fill me-1"></i>TIMED EVENTS & MEETINGS ({{ getEventsForDate(selectedCell.dateStr).length }})</span>
              <div v-if="getEventsForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-2">
                <div v-for="e in getEventsForDate(selectedCell.dateStr)" :key="e.id" class="p-3 bg-primary bg-opacity-10 rounded-3 border border-primary border-opacity-25 d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold text-dark">
                      <span class="badge bg-primary me-2">{{ e.startTime || 'All Day' }} <span v-if="e.endTime">- {{ e.endTime }}</span></span>
                      {{ e.title }}
                    </div>
                    <div class="small text-muted mt-1" v-if="e.notes"><i class="bi bi-info-circle me-1"></i>{{ e.notes }}</div>
                    <div class="small text-primary mt-1" v-if="e.reminder && e.reminder !== 'None'"><i class="bi bi-bell-fill me-1"></i>Reminder: {{ e.reminder }}</div>
                  </div>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-light text-primary rounded-circle" @click="editEvent(e)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-light text-danger rounded-circle" @click="deleteEvent(e.id)"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
              <div v-else class="small text-muted italic bg-light p-3 rounded-3 border">Tidak ada event jam terjadwal pada tanggal ini.</div>
            </div>

            <!-- Tasks Section -->
            <div class="mb-4">
              <span class="fw-bold text-warning-emphasis small d-block mb-2"><i class="bi bi-check2-square me-1"></i>DEADLINE TUGAS ({{ getTasksForDate(selectedCell.dateStr).length }})</span>
              <div v-if="getTasksForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-2">
                <div v-for="t in getTasksForDate(selectedCell.dateStr)" :key="t.id" class="p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25 d-flex justify-content-between align-items-center">
                  <div>
                    <div class="fw-bold text-dark" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</div>
                    <small class="text-muted">Eisenhower: {{ t.eisenhower || 'Do First' }} | Recurring: {{ t.recurring || 'none' }}</small>
                  </div>
                  <button class="btn btn-sm rounded-pill px-3" :class="t.done ? 'btn-success' : 'btn-outline-warning'" @click="toggleTask(t.id)">
                    {{ t.done ? 'Selesai' : 'Tandai Selesai' }}
                  </button>
                </div>
              </div>
              <div v-else class="small text-muted italic bg-light p-3 rounded-3 border">Tidak ada deadline tugas pada tanggal ini.</div>
            </div>

            <!-- Projects & Invoices Section -->
            <div class="row g-3">
              <div class="col-md-6">
                <span class="fw-bold text-info-emphasis small d-block mb-2"><i class="bi bi-folder me-1"></i>DEADLINE PROYEK</span>
                <div v-if="getProjectsForDate(selectedCell.dateStr).length > 0">
                  <div v-for="p in getProjectsForDate(selectedCell.dateStr)" :key="p.id" class="p-2 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25 mb-1 small fw-semibold">
                    {{ p.projectTitle }} ({{ p.clientName }})
                  </div>
                </div>
                <div v-else class="small text-muted italic bg-light p-2 rounded-3 border">Tidak ada.</div>
              </div>

              <div class="col-md-6">
                <span class="fw-bold text-danger small d-block mb-2"><i class="bi bi-receipt me-1"></i>JATUH TEMPO INVOICE</span>
                <div v-if="getInvoicesForDate(selectedCell.dateStr).length > 0">
                  <div v-for="inv in getInvoicesForDate(selectedCell.dateStr)" :key="inv.id" class="p-2 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-25 mb-1 small fw-semibold text-danger">
                    {{ inv.invoiceNumber }} - {{ inv.clientName }}
                  </div>
                </div>
                <div v-else class="small text-muted italic bg-light p-2 rounded-3 border">Tidak ada.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'CalendarView',
  setup() {
    const store = useStore();
    const currentDate = ref(new Date());

    const eventModalRef = ref(null);
    const dayDetailModalRef = ref(null);
    let eventModalInstance = null;
    let dayDetailModalInstance = null;

    const selectedCell = ref(null);
    const isEditingEvent = ref(false);
    const editingEventId = ref(null);

    const eventForm = ref({
      title: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      category: 'Meeting',
      reminder: '30m',
      notes: ''
    });

    const weekDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const monthYearLabel = computed(() => {
      return currentDate.value.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    });

    const changeMonth = (delta) => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + delta, 1);
    };

    const tasks = computed(() => store.getters.getTasks);
    const projects = computed(() => store.getters.getProjects);
    const invoices = computed(() => store.getters.getInvoices);
    const events = computed(() => store.getters.getEvents);

    const getEventModal = () => {
      if (eventModalRef.value && window.bootstrap && window.bootstrap.Modal) {
        return window.bootstrap.Modal.getOrCreateInstance(eventModalRef.value, { backdrop: true, keyboard: true });
      }
      return null;
    };

    const getDayDetailModal = () => {
      if (dayDetailModalRef.value && window.bootstrap && window.bootstrap.Modal) {
        return window.bootstrap.Modal.getOrCreateInstance(dayDetailModalRef.value, { backdrop: true, keyboard: true });
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

    const openAddEventModal = (dateStr = null) => {
      isEditingEvent.value = false;
      editingEventId.value = null;
      eventForm.value = {
        title: '',
        date: dateStr || new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        category: 'Meeting',
        reminder: '30m',
        notes: ''
      };
      const dayModal = getDayDetailModal();
      if (dayModal) dayModal.hide();
      const evModal = getEventModal();
      if (evModal) evModal.show();
    };

    const editEvent = (ev) => {
      isEditingEvent.value = true;
      editingEventId.value = ev.id;
      eventForm.value = { ...ev };
      const dayModal = getDayDetailModal();
      if (dayModal) dayModal.hide();
      const evModal = getEventModal();
      if (evModal) evModal.show();
    };

    const closeEventModal = () => {
      const evModal = getEventModal();
      if (evModal) evModal.hide();
      cleanupBackdrop();
    };

    const saveEvent = () => {
      if (isEditingEvent.value) {
        store.dispatch('updateEvent', { ...eventForm.value, id: editingEventId.value });
      } else {
        store.dispatch('addEvent', eventForm.value);
      }
      closeEventModal();
    };

    const deleteEvent = (id) => {
      if (confirm('Hapus agenda/event ini?')) {
        store.dispatch('deleteEvent', id);
      }
    };

    const openDayDetailModal = (cell) => {
      selectedCell.value = cell;
      const dayModal = getDayDetailModal();
      if (dayModal) dayModal.show();
    };

    const closeDayDetailModal = () => {
      const dayModal = getDayDetailModal();
      if (dayModal) dayModal.hide();
      cleanupBackdrop();
    };

    const calendarCells = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const cells = [];
      const startDayOfWeek = firstDay.getDay();

      // Prev month padding
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, prevMonthLastDay - i);
        cells.push({
          dayNum: d.getDate(),
          dateStr: d.toISOString().split('T')[0],
          currentMonth: false,
          isToday: false
        });
      }

      // Current month
      const todayStr = new Date().toISOString().split('T')[0];
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const d = new Date(year, month, day);
        const dateStr = d.toISOString().split('T')[0];
        cells.push({
          dayNum: day,
          dateStr: dateStr,
          currentMonth: true,
          isToday: dateStr === todayStr
        });
      }

      // Remaining cells to complete grid
      const totalSoFar = cells.length;
      const needed = 35 - totalSoFar > 0 ? 35 - totalSoFar : (42 - totalSoFar > 0 ? 42 - totalSoFar : 0);
      for (let i = 1; i <= needed; i++) {
        const d = new Date(year, month + 1, i);
        cells.push({
          dayNum: d.getDate(),
          dateStr: d.toISOString().split('T')[0],
          currentMonth: false,
          isToday: false
        });
      }

      return cells;
    });

    const getEventsForDate = (dateStr) => {
      return events.value.filter(e => e.date === dateStr);
    };

    const getTasksForDate = (dateStr) => {
      return tasks.value.filter(t => t.deadline === dateStr);
    };

    const getProjectsForDate = (dateStr) => {
      return projects.value.filter(p => p.deadline === dateStr);
    };

    const getInvoicesForDate = (dateStr) => {
      return invoices.value.filter(i => i.dueDate === dateStr);
    };

    const toggleTask = (id) => {
      store.dispatch('toggleTask', id);
    };

    const formatFullDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    return {
      weekDays,
      monthYearLabel,
      changeMonth,
      calendarCells,
      getEventsForDate,
      getTasksForDate,
      getProjectsForDate,
      getInvoicesForDate,
      eventModalRef,
      dayDetailModalRef,
      selectedCell,
      isEditingEvent,
      eventForm,
      openAddEventModal,
      editEvent,
      closeEventModal,
      saveEvent,
      deleteEvent,
      openDayDetailModal,
      closeDayDetailModal,
      toggleTask,
      formatFullDate
    };
  }
};
</script>

<style scoped>
.calendar-grid-header,
.calendar-grid-body {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-cell {
  min-height: 110px;
  transition: all 0.2s ease;
}

.cell-active {
  background-color: var(--bg-surface, #ffffff);
}

.cell-inactive {
  background-color: var(--bg-app, #f8fafc);
}

:deep(.dark-theme) .cell-active {
  background-color: #1a233a !important;
}

:deep(.dark-theme) .cell-inactive {
  background-color: #0f172a !important;
}

.cell-hover:hover {
  border-color: var(--primary-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.style-event {
  font-size: 11px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.style-mini {
  font-size: 9px;
}

.cursor-pointer {
  cursor: pointer;
}

.min-w-160 {
  min-width: 160px;
}
</style>

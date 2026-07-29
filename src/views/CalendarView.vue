<template>
  <div class="container-fluid p-0 position-relative" data-aos="fade-up">
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
        <button class="btn btn-primary px-3 py-2 rounded-3 fw-semibold ms-2" @click="openAddEventForm()">
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
          @click="openDayDetailDrawer(cell)"
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

    <!-- RIGHT SLIDE-OVER DRAWER BACKDROP -->
    <div
      v-if="drawerOpen"
      class="drawer-backdrop"
      @click="closeDrawer"
    ></div>

    <!-- RIGHT SLIDE-OVER DRAWER PANEL -->
    <div
      class="drawer-panel bg-white shadow-lg border-start transition-all"
      :class="{ 'drawer-show': drawerOpen }"
    >
      <div class="drawer-header p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
        <div>
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill mb-1" style="font-size: 11px;">
            <i class="bi bi-calendar-event me-1"></i> {{ drawerMode === 'form' ? 'Event Form' : 'Agenda Detail' }}
          </span>
          <h5 class="fw-bold text-dark mb-0">
            {{ drawerTitle }}
          </h5>
        </div>
        <button type="button" class="btn btn-light rounded-circle border shadow-sm p-2" @click="closeDrawer" title="Tutup">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <div class="drawer-body p-4 overflow-y-auto" style="height: calc(100vh - 90px);">
        <!-- MODE 1: FORM SLIDE (ADD / EDIT EVENT) -->
        <div v-if="drawerMode === 'form'">
          <form @submit.prevent="saveEvent" class="row g-3">
            <div class="col-12">
              <label class="form-label fw-bold text-dark small">Judul Agenda / Meeting <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-lg border-2 fs-6" v-model="eventForm.title" placeholder="Contoh: Demo Project Klien Q3" required />
            </div>

            <div class="col-12">
              <label class="form-label fw-bold text-dark small">Tanggal Agenda <span class="text-danger">*</span></label>
              <input type="date" class="form-control border-2" v-model="eventForm.date" required />
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small">Jam Mulai</label>
              <input type="time" class="form-control border-2" v-model="eventForm.startTime" />
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small">Jam Selesai</label>
              <input type="time" class="form-control border-2" v-model="eventForm.endTime" />
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small">Kategori Agenda</label>
              <select class="form-select border-2" v-model="eventForm.category">
                <option value="Meeting">Meeting / Client Call</option>
                <option value="Milestone">Milestone Proyek</option>
                <option value="Reminder">Pengingat Penting</option>
                <option value="Personal">Personal / Rutinitas</option>
              </select>
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small">Pengingat / Reminder</label>
              <select class="form-select border-2" v-model="eventForm.reminder">
                <option value="None">Tanpa Pengingat</option>
                <option value="15m">15 Menit Sebelum</option>
                <option value="30m">30 Menit Sebelum</option>
                <option value="1h">1 Jam Sebelum</option>
                <option value="1d">1 Hari Sebelum</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-bold text-dark small">Catatan / Detail Agenda</label>
              <textarea class="form-control border-2" rows="3" v-model="eventForm.notes" placeholder="Lokasi, link Zoom, atau catatan pendukung..."></textarea>
            </div>

            <div class="col-12 d-flex gap-2 pt-3 border-top mt-4">
              <button type="button" class="btn btn-light rounded-3 px-4 flex-grow-1" @click="closeDrawer">Batal</button>
              <button type="submit" class="btn btn-primary rounded-3 px-4 py-2 fw-bold flex-grow-1 shadow-sm">
                <i class="bi bi-check-circle-fill me-1"></i> Simpan Agenda
              </button>
            </div>
          </form>
        </div>

        <!-- MODE 2: DAY DETAIL SLIDE -->
        <div v-else-if="drawerMode === 'detail' && selectedCell">
          <div class="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded-3 border">
            <div>
              <span class="small text-muted d-block fw-bold">Tanggal Dipilih</span>
              <strong class="text-dark">{{ formatFullDate(selectedCell.dateStr) }}</strong>
            </div>
            <button class="btn btn-sm btn-primary rounded-3 fw-bold" @click="openAddEventForm(selectedCell.dateStr)">
              <i class="bi bi-plus-lg me-1"></i> Tambah Event
            </button>
          </div>

          <!-- Timed Events Section -->
          <div class="mb-4">
            <span class="fw-bold text-primary small d-block mb-2"><i class="bi bi-clock-fill me-1"></i>TIMED EVENTS & MEETINGS ({{ getEventsForDate(selectedCell.dateStr).length }})</span>
            <div v-if="getEventsForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-2">
              <div v-for="e in getEventsForDate(selectedCell.dateStr)" :key="e.id" class="p-3 bg-primary-subtle rounded-3 border border-primary-subtle d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold text-dark">
                    <span class="badge bg-primary me-2">{{ e.startTime || 'All Day' }} <span v-if="e.endTime">- {{ e.endTime }}</span></span>
                    {{ e.title }}
                  </div>
                  <div class="small text-muted mt-1" v-if="e.notes"><i class="bi bi-info-circle me-1"></i>{{ e.notes }}</div>
                  <div class="small text-primary mt-1" v-if="e.reminder && e.reminder !== 'None'"><i class="bi bi-bell-fill me-1"></i>Reminder: {{ e.reminder }}</div>
                </div>
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-light text-primary rounded-circle border" @click="editEvent(e)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-light text-danger rounded-circle border" @click="deleteEvent(e.id)"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
            <div v-else class="small text-muted italic bg-light p-3 rounded-3 border">Tidak ada event jam terjadwal pada tanggal ini.</div>
          </div>

          <!-- Tasks Section -->
          <div class="mb-4">
            <span class="fw-bold text-warning-emphasis small d-block mb-2"><i class="bi bi-check2-square me-1"></i>DEADLINE TUGAS ({{ getTasksForDate(selectedCell.dateStr).length }})</span>
            <div v-if="getTasksForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-2">
              <div v-for="t in getTasksForDate(selectedCell.dateStr)" :key="t.id" class="p-3 bg-warning-subtle rounded-3 border border-warning-subtle d-flex justify-content-between align-items-center">
                <div>
                  <div class="fw-bold text-dark" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</div>
                  <small class="text-muted">Eisenhower: {{ t.eisenhower || 'Do First' }} | Priority: {{ t.priority || 'Normal' }}</small>
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
            <div class="col-12">
              <span class="fw-bold text-info-emphasis small d-block mb-2"><i class="bi bi-folder me-1"></i>DEADLINE PROYEK</span>
              <div v-if="getProjectsForDate(selectedCell.dateStr).length > 0">
                <div v-for="p in getProjectsForDate(selectedCell.dateStr)" :key="p.id" class="p-3 bg-info-subtle rounded-3 border border-info-subtle mb-2 small fw-semibold">
                  {{ p.projectTitle }} (Klien: {{ p.clientName }})
                </div>
              </div>
              <div v-else class="small text-muted italic bg-light p-3 rounded-3 border">Tidak ada deadline proyek.</div>
            </div>

            <div class="col-12">
              <span class="fw-bold text-danger small d-block mb-2"><i class="bi bi-receipt me-1"></i>JATUH TEMPO INVOICE</span>
              <div v-if="getInvoicesForDate(selectedCell.dateStr).length > 0">
                <div v-for="inv in getInvoicesForDate(selectedCell.dateStr)" :key="inv.id" class="p-3 bg-danger-subtle rounded-3 border border-danger-subtle mb-2 small fw-semibold text-danger">
                  {{ inv.invoiceNumber }} - {{ inv.clientName }}
                </div>
              </div>
              <div v-else class="small text-muted italic bg-light p-3 rounded-3 border">Tidak ada invoice jatuh tempo.</div>
            </div>
          </div>
        </div>
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
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'CalendarView',
  setup() {
    const store = useStore();
    const currentDate = ref(new Date());

    const drawerOpen = ref(false);
    const drawerMode = ref('detail'); // 'detail' or 'form'
    const selectedCell = ref(null);
    const isEditingEvent = ref(false);
    const editingEventId = ref(null);

    const toast = ref({ show: false, message: '' });

    const showToast = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

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

    const drawerTitle = computed(() => {
      if (drawerMode.value === 'form') {
        return isEditingEvent.value ? 'Edit Agenda Meeting' : 'Tambah Agenda Meeting';
      }
      return selectedCell.value ? `Agenda ${formatFullDate(selectedCell.value.dateStr)}` : 'Detail Agenda Tanggal';
    });

    const changeMonth = (delta) => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + delta, 1);
    };

    const tasks = computed(() => store.getters.getTasks);
    const projects = computed(() => store.getters.getProjects);
    const invoices = computed(() => store.getters.getInvoices);
    const events = computed(() => store.getters.getEvents);

    const openAddEventForm = (dateStr = null) => {
      isEditingEvent.value = false;
      editingEventId.value = null;
      eventForm.value = {
        title: '',
        date: dateStr || (selectedCell.value ? selectedCell.value.dateStr : new Date().toISOString().split('T')[0]),
        startTime: '09:00',
        endTime: '10:00',
        category: 'Meeting',
        reminder: '30m',
        notes: ''
      };
      drawerMode.value = 'form';
      drawerOpen.value = true;
    };

    const editEvent = (ev) => {
      isEditingEvent.value = true;
      editingEventId.value = ev.id;
      eventForm.value = { ...ev };
      drawerMode.value = 'form';
      drawerOpen.value = true;
    };

    const saveEvent = () => {
      if (!eventForm.value.title || !eventForm.value.title.trim()) {
        showToast('Judul agenda tidak boleh kosong.');
        return;
      }

      if (isEditingEvent.value) {
        store.dispatch('updateEvent', { ...eventForm.value, id: editingEventId.value });
        showToast('Agenda berhasil diperbarui!');
      } else {
        store.dispatch('addEvent', eventForm.value);
        showToast('Agenda baru berhasil ditambahkan!');
      }

      if (selectedCell.value) {
        drawerMode.value = 'detail';
      } else {
        drawerOpen.value = false;
      }
    };

    const deleteEvent = (id) => {
      store.dispatch('deleteEvent', id);
      showToast('Agenda dihapus.');
    };

    const openDayDetailDrawer = (cell) => {
      selectedCell.value = cell;
      drawerMode.value = 'detail';
      drawerOpen.value = true;
    };

    const closeDrawer = () => {
      drawerOpen.value = false;
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
      drawerOpen,
      drawerMode,
      drawerTitle,
      selectedCell,
      isEditingEvent,
      eventForm,
      toast,
      openAddEventForm,
      editEvent,
      saveEvent,
      deleteEvent,
      openDayDetailDrawer,
      closeDrawer,
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

/* RIGHT SLIDE-OVER DRAWER STYLES */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1070;
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 480px;
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

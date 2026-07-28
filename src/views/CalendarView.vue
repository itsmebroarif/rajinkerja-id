<template>
  <div class="calendar-container container-fluid p-3 p-md-4 position-relative animate-fade-in" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="calendar-header-banner d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 bg-white p-3 p-md-4 rounded-4 shadow-sm border mb-3">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-warning-subtle text-warning-emphasis fw-semibold px-2.5 py-1 rounded-pill style-mini">Agenda & Reminders</span>
        </div>
        <h2 class="fw-bold mb-0 text-dark fs-4">📅 Calendar & Agenda</h2>
        <p class="text-muted mb-0 small d-none d-sm-block">Kelola agenda meeting jam, pengingat, deadline proyek, dan tanggal jatuh tempo invoice.</p>
      </div>
      
      <!-- Navigasi Bulan -->
      <div class="d-flex align-items-center gap-2 justify-content-between justify-content-md-center flex-grow-1 flex-md-grow-0">
        <button class="btn btn-sm btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" @click="changeMonth(-1)"><i class="bi bi-chevron-left"></i></button>
        <span class="fw-bold fs-6 text-dark px-2 min-w-160 text-center">{{ monthYearLabel }}</span>
        <button class="btn btn-sm btn-outline-secondary rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;" @click="changeMonth(1)"><i class="bi bi-chevron-right"></i></button>
      </div>

      <!-- Tambah Event Button -->
      <button class="btn btn-primary px-3 py-2 rounded-3 fw-semibold text-white d-flex align-items-center justify-content-center gap-1.5 align-self-stretch align-self-md-auto" @click="openAddEventForm()">
        <i class="bi bi-calendar-plus"></i> <span>Tambah Event</span>
      </button>
    </div>

    <!-- Calendar Legend Bar -->
    <div class="d-flex flex-wrap align-items-center gap-2 bg-white p-2.5 rounded-4 shadow-sm border mb-3 text-muted style-mini">
      <span class="fw-bold me-1">Kategori:</span>
      <span class="badge bg-primary-subtle text-primary border border-primary-subtle py-1"><i class="bi bi-clock-fill me-1"></i>Meeting</span>
      <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle py-1"><i class="bi bi-check2-square me-1"></i>Task</span>
      <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle py-1"><i class="bi bi-folder me-1"></i>Proyek</span>
      <span class="badge bg-danger-subtle text-danger border border-danger-subtle py-1"><i class="bi bi-receipt me-1"></i>Invoice</span>
    </div>

    <!-- Calendar Grid -->
    <div class="card border-0 shadow-sm rounded-4 bg-white p-3 p-md-4">
      <!-- Days Header -->
      <div class="calendar-grid-header text-center fw-bold text-muted small mb-2 border-bottom pb-2">
        <div v-for="day in weekDays" :key="day" class="p-1">
          <span class="d-none d-md-inline">{{ day }}</span>
          <span class="d-inline d-md-none">{{ day.substring(0, 3) }}</span>
        </div>
      </div>

      <!-- Days Cells -->
      <div class="calendar-grid-body">
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="calendar-cell p-2 border rounded-3 cursor-pointer cell-hover d-flex flex-column justify-content-between"
          :class="[
            cell.currentMonth ? 'cell-active' : 'cell-inactive opacity-50',
            cell.isToday ? 'border-primary border-2 today-cell shadow-sm' : 'border-light-subtle'
          ]"
          @click="openDayDetailDrawer(cell)"
        >
          <div class="d-flex justify-content-between align-items-center mb-1 w-100">
            <span class="small fw-bold date-number" :class="cell.isToday ? 'text-primary' : (cell.currentMonth ? 'text-dark' : 'text-muted opacity-50')">
              {{ cell.dayNum }}
            </span>
            <span v-if="cell.isToday" class="badge bg-primary style-mini px-1.5 py-0.5 rounded-pill d-none d-md-inline">HARI INI</span>
          </div>

          <!-- Items on this date (Desktop) -->
          <div class="d-none d-md-flex flex-column gap-1 overflow-hidden flex-grow-1 justify-content-end w-100 mt-1">
            <!-- Unified List of Items (Max 3 shown) -->
            <div
              v-for="item in getAllItemsForDate(cell.dateStr).slice(0, 3)"
              :key="item.type + '_' + item.id"
              class="p-1 rounded style-event d-flex align-items-center text-truncate w-100"
              :class="[
                item.color === 'primary' ? 'bg-primary-subtle text-primary' : '',
                item.color === 'warning' ? 'bg-warning-subtle text-warning-emphasis' : '',
                item.color === 'info' ? 'bg-info-subtle text-info-emphasis' : '',
                item.color === 'danger' ? 'bg-danger-subtle text-danger' : ''
              ]"
              :title="item.title"
            >
              <i class="bi me-1" :class="item.icon"></i>
              <span class="text-truncate">
                <span v-if="item.time" class="fw-bold me-0.5">{{ item.time }} </span>{{ item.title }}
              </span>
            </div>
            <div v-if="getAllItemsForDate(cell.dateStr).length > 3" class="text-muted fw-bold text-center mt-1 style-mini">
              +{{ getAllItemsForDate(cell.dateStr).length - 3 }} lainnya
            </div>
          </div>

          <!-- Items on this date (Mobile Dots) -->
          <div class="d-flex d-md-none flex-wrap gap-1 justify-content-center align-items-center w-100 mt-1">
            <div
              v-for="item in getAllItemsForDate(cell.dateStr).slice(0, 3)"
              :key="'dot_' + item.type + '_' + item.id"
              class="mobile-event-dot"
              :class="[
                item.color === 'primary' ? 'bg-primary' : '',
                item.color === 'warning' ? 'bg-warning' : '',
                item.color === 'info' ? 'bg-info' : '',
                item.color === 'danger' ? 'bg-danger' : ''
              ]"
              :title="item.title"
            ></div>
            <div v-if="getAllItemsForDate(cell.dateStr).length > 3" class="mobile-event-dot bg-secondary" title="Lebih banyak event"></div>
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
      <div class="drawer-header p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
        <div>
          <span class="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1 rounded-pill mb-1 style-mini">
            <i class="bi bi-calendar-event me-1"></i> {{ drawerMode === 'form' ? 'Event Form' : 'Agenda Detail' }}
          </span>
          <h5 class="fw-bold text-dark mb-0 fs-6">
            {{ drawerTitle }}
          </h5>
        </div>
        <button type="button" class="btn btn-light rounded-circle border shadow-sm p-1.5" @click="closeDrawer" title="Tutup">
          <i class="bi bi-x-lg fs-6"></i>
        </button>
      </div>

      <div class="drawer-body p-3 overflow-y-auto" style="height: calc(100vh - 75px);">
        <!-- MODE 1: FORM SLIDE (ADD / EDIT EVENT) -->
        <div v-if="drawerMode === 'form'">
          <form @submit.prevent="saveEvent" class="row g-2">
            <div class="col-12">
              <label class="form-label fw-bold text-dark small mb-1">Judul Agenda / Meeting <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm border-2 fs-7" v-model="eventForm.title" placeholder="Contoh: Demo Project Klien Q3" required />
            </div>

            <div class="col-12">
              <label class="form-label fw-bold text-dark small mb-1">Tanggal Agenda <span class="text-danger">*</span></label>
              <input type="date" class="form-control form-control-sm border-2 fs-7" v-model="eventForm.date" required />
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small mb-1">Jam Mulai</label>
              <input type="time" class="form-control form-control-sm border-2 fs-7" v-model="eventForm.startTime" />
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small mb-1">Jam Selesai</label>
              <input type="time" class="form-control form-control-sm border-2 fs-7" v-model="eventForm.endTime" />
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small mb-1">Kategori</label>
              <select class="form-select form-select-sm border-2 fs-7" v-model="eventForm.category">
                <option value="Meeting">Meeting / Client Call</option>
                <option value="Milestone">Milestone Proyek</option>
                <option value="Reminder">Pengingat Penting</option>
                <option value="Personal">Personal / Rutinitas</option>
              </select>
            </div>

            <div class="col-6">
              <label class="form-label fw-bold text-dark small mb-1">Reminder</label>
              <select class="form-select form-select-sm border-2 fs-7" v-model="eventForm.reminder">
                <option value="None">Tanpa Pengingat</option>
                <option value="15m">15 Menit Sebelum</option>
                <option value="30m">30 Menit Sebelum</option>
                <option value="1h">1 Jam Sebelum</option>
                <option value="1d">1 Hari Sebelum</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-bold text-dark small mb-1">Catatan / Detail Agenda</label>
              <textarea class="form-control border-2 fs-7" rows="3" v-model="eventForm.notes" placeholder="Lokasi, link Zoom, atau catatan pendukung..."></textarea>
            </div>

            <div class="col-12 d-flex gap-2 pt-2 border-top mt-3">
              <button type="button" class="btn btn-sm btn-light rounded-3 px-3 flex-grow-1" @click="closeDrawer">Batal</button>
              <button type="submit" class="btn btn-sm btn-primary rounded-3 px-3 py-2 fw-bold flex-grow-1 shadow-sm text-white">
                <i class="bi bi-check-circle-fill me-1"></i> Simpan Agenda
              </button>
            </div>
          </form>
        </div>

        <!-- MODE 2: DAY DETAIL SLIDE -->
        <div v-else-if="drawerMode === 'detail' && selectedCell">
          <div class="d-flex justify-content-between align-items-center mb-3 bg-light p-2.5 rounded-3 border">
            <div class="min-width-0">
              <span class="style-mini text-muted d-block fw-bold">Tanggal Dipilih</span>
              <strong class="text-dark small text-truncate d-block">{{ formatFullDate(selectedCell.dateStr) }}</strong>
            </div>
            <button class="btn btn-xs btn-primary rounded-3 fw-bold flex-shrink-0 text-white" @click="openAddEventForm(selectedCell.dateStr)">
              <i class="bi bi-plus-lg me-1"></i> Tambah
            </button>
          </div>

          <!-- Timed Events Section -->
          <div class="mb-3">
            <span class="fw-bold text-primary style-mini d-block mb-1.5"><i class="bi bi-clock-fill me-1"></i>TIMED EVENTS & MEETINGS ({{ getEventsForDate(selectedCell.dateStr).length }})</span>
            <div v-if="getEventsForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-1.5">
              <div v-for="e in getEventsForDate(selectedCell.dateStr)" :key="e.id" class="p-2.5 bg-primary-subtle rounded-3 border border-primary-subtle d-flex justify-content-between align-items-center">
                <div class="min-width-0 pe-2">
                  <div class="fw-bold text-dark fs-7 text-truncate">
                    <span class="badge bg-primary me-1 style-mini">{{ e.startTime || 'All Day' }} <span v-if="e.endTime">- {{ e.endTime }}</span></span>
                    {{ e.title }}
                  </div>
                  <div class="style-mini text-muted mt-1 text-truncate" v-if="e.notes"><i class="bi bi-info-circle me-1"></i>{{ e.notes }}</div>
                  <div class="style-mini text-primary mt-1 text-truncate" v-if="e.reminder && e.reminder !== 'None'"><i class="bi bi-bell-fill me-1"></i>Reminder: {{ e.reminder }}</div>
                </div>
                <div class="d-flex gap-1 flex-shrink-0">
                  <button class="btn btn-sm btn-light text-primary rounded-circle border p-1" @click="editEvent(e)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-light text-danger rounded-circle border p-1" @click="deleteEvent(e.id)"><i class="bi bi-trash"></i></button>
                </div>
              </div>
            </div>
            <div v-else class="style-mini text-muted italic bg-light p-2 rounded-3 border">Tidak ada event jam terjadwal.</div>
          </div>

          <!-- Tasks Section -->
          <div class="mb-3">
            <span class="fw-bold text-warning-emphasis style-mini d-block mb-1.5"><i class="bi bi-check2-square me-1"></i>DEADLINE TUGAS ({{ getTasksForDate(selectedCell.dateStr).length }})</span>
            <div v-if="getTasksForDate(selectedCell.dateStr).length > 0" class="d-flex flex-column gap-1.5">
              <div v-for="t in getTasksForDate(selectedCell.dateStr)" :key="t.id" class="p-2.5 bg-warning-subtle rounded-3 border border-warning-subtle d-flex justify-content-between align-items-center">
                <div class="min-width-0 pe-2">
                  <div class="fw-bold text-dark fs-7 text-truncate" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</div>
                  <small class="text-muted style-mini">Priority: {{ t.priority || 'Normal' }}</small>
                </div>
                <button class="btn btn-xs rounded-pill px-2.5 py-1 flex-shrink-0" :class="t.done ? 'btn-success text-white' : 'btn-outline-warning'" @click="toggleTask(t.id)">
                  {{ t.done ? 'Selesai' : 'Selesaikan' }}
                </button>
              </div>
            </div>
            <div v-else class="style-mini text-muted italic bg-light p-2 rounded-3 border">Tidak ada deadline tugas.</div>
          </div>

          <!-- Projects & Invoices Section -->
          <div class="row g-2">
            <div class="col-12">
              <span class="fw-bold text-info-emphasis style-mini d-block mb-1"><i class="bi bi-folder me-1"></i>DEADLINE PROYEK</span>
              <div v-if="getProjectsForDate(selectedCell.dateStr).length > 0">
                <div v-for="p in getProjectsForDate(selectedCell.dateStr)" :key="p.id" class="p-2 bg-info-subtle rounded-3 border border-info-subtle mb-1.5 style-mini fw-semibold text-truncate">
                  {{ p.projectTitle }} (Klien: {{ p.clientName }})
                </div>
              </div>
              <div v-else class="style-mini text-muted italic bg-light p-2 rounded-3 border">Tidak ada deadline proyek.</div>
            </div>

            <div class="col-12">
              <span class="fw-bold text-danger style-mini d-block mb-1"><i class="bi bi-receipt me-1"></i>JATUH TEMPO INVOICE</span>
              <div v-if="getInvoicesForDate(selectedCell.dateStr).length > 0">
                <div v-for="inv in getInvoicesForDate(selectedCell.dateStr)" :key="inv.id" class="p-2 bg-danger-subtle rounded-3 border border-danger-subtle mb-1.5 style-mini fw-semibold text-danger text-truncate">
                  {{ inv.invoiceNumber }} - {{ inv.clientName }}
                </div>
              </div>
              <div v-else class="style-mini text-muted italic bg-light p-2 rounded-3 border">Tidak ada invoice jatuh tempo.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sleek Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-dark border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2 py-2">
            <i class="bi bi-check-circle-fill text-success fs-5"></i>
            <span class="small">{{ toast.message }}</span>
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

const getLocalDateString = (d = new Date()) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

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
      date: getLocalDateString(),
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
        date: dateStr || (selectedCell.value ? selectedCell.value.dateStr : getLocalDateString()),
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
      if (confirm('Apakah Anda yakin ingin menghapus agenda ini?')) {
        store.dispatch('deleteEvent', id);
        showToast('Agenda dihapus.');
      }
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
          dateStr: getLocalDateString(d),
          currentMonth: false,
          isToday: false
        });
      }

      // Current month
      const todayStr = getLocalDateString();
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const d = new Date(year, month, day);
        const dateStr = getLocalDateString(d);
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
          dateStr: getLocalDateString(d),
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

    const getAllItemsForDate = (dateStr) => {
      const list = [];
      getEventsForDate(dateStr).forEach(e => list.push({ type: 'event', id: e.id, title: e.title, color: 'primary', icon: 'bi-clock-fill', time: e.startTime }));
      getTasksForDate(dateStr).forEach(t => list.push({ type: 'task', id: t.id, title: t.name, color: 'warning', icon: 'bi-check2-square' }));
      getProjectsForDate(dateStr).forEach(p => list.push({ type: 'project', id: p.id, title: p.projectTitle, color: 'info', icon: 'bi-folder' }));
      getInvoicesForDate(dateStr).forEach(inv => list.push({ type: 'invoice', id: inv.id, title: inv.invoiceNumber, color: 'danger', icon: 'bi-receipt' }));
      return list;
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
      getAllItemsForDate,
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
.calendar-container {
  overflow-x: hidden;
  max-width: 100%;
}

.calendar-grid-header,
.calendar-grid-body {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
}

.calendar-cell {
  aspect-ratio: 1.15 / 1;
  min-height: 85px;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid var(--border-color, #e2e8f0) !important;
  background-color: var(--bg-surface, #ffffff);
  border-radius: 6px;
  padding: 6px !important;
}

.cell-active {
  background-color: var(--bg-surface, #ffffff);
}

.cell-inactive {
  background-color: var(--bg-app, #f8fafc);
  opacity: 0.45;
}

.cell-hover:hover {
  border-color: var(--primary-color) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.today-cell {
  background-color: rgba(37, 99, 235, 0.03) !important;
  border-color: var(--primary-color) !important;
}

.date-number {
  font-size: 0.85rem;
  font-weight: 600;
}

.style-event {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 5px !important;
  border-radius: 4px !important;
  letter-spacing: 0.1px;
  max-height: 18px;
  line-height: 1.2;
}

.style-mini {
  font-size: 9px;
  font-weight: 700;
}

.fs-7 {
  font-size: 0.78rem !important;
}

.cursor-pointer {
  cursor: pointer;
}

.min-w-160 {
  min-width: 160px;
}

.mobile-event-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  display: inline-block;
}

/* RIGHT SLIDE-OVER DRAWER STYLES */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1070;
}

.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(420px, 100vw);
  height: 100vh;
  z-index: 1080;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background-color: var(--bg-surface, #ffffff) !important;
  border-left: 1px solid var(--border-color, #e2e8f0) !important;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.drawer-panel.drawer-show {
  transform: translateX(0);
}

@media (max-width: 768px) {
  .calendar-cell {
    aspect-ratio: 1 / 1;
    min-height: 48px;
    padding: 4px !important;
  }
  .date-number {
    font-size: 0.75rem;
  }
}
</style>

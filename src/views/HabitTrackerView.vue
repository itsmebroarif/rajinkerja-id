<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-danger-subtle text-danger fw-semibold px-3 py-2 rounded-pill">Daily Consistency & Streak Counter</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">⚡ Habit Tracker & Streak Counter</h2>
        <p class="text-muted mb-0">Latih kebiasaan harian dan kumpulkan streak hari secara beruntun tanpa terputus.</p>
      </div>
      <div>
        <button class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm" @click="openAddModal">
          <i class="bi bi-plus-lg fs-5"></i>
          <span>Tambah Habit Baru</span>
        </button>
      </div>
    </div>

    <!-- Summary Stats Row -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-primary">
          <div class="text-muted small fw-semibold">Total Kebiasaan</div>
          <div class="fs-3 fw-bold text-dark mt-1">{{ habits.length }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-danger">
          <div class="text-muted small fw-semibold">Streak Aktif</div>
          <div class="fs-3 fw-bold text-danger mt-1">
            <i class="bi bi-fire me-1"></i>{{ activeStreakCount }}
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-success">
          <div class="text-muted small fw-semibold">Selesai Hari Ini</div>
          <div class="fs-3 fw-bold text-success mt-1">{{ todayDoneCount }} / {{ habits.length }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-4 border-warning">
          <div class="text-muted small fw-semibold">Streak Tertinggi</div>
          <div class="fs-3 fw-bold text-warning-emphasis mt-1">
            <i class="bi bi-trophy-fill me-1"></i>{{ bestStreakEver }} Hari
          </div>
        </div>
      </div>
    </div>

    <!-- Habit Grid Table -->
    <div class="card border-0 shadow-sm rounded-4 bg-white">
      <div class="card-header bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold text-dark mb-0"><i class="bi bi-calendar-check text-danger me-2"></i>Tracking 7 Hari Terakhir</h5>
        <span class="badge bg-light text-muted border">Otomatis hitung streak harian</span>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive" v-if="habits.length > 0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="min-width: 200px;">Nama Kebiasaan / Habit</th>
                <th style="width: 120px;">Kategori</th>
                <th v-for="day in past7Days" :key="day.dateStr" class="text-center" style="width: 80px;">
                  <div class="small fw-bold">{{ day.dayName }}</div>
                  <small class="text-muted" style="font-size: 11px;">{{ day.shortDate }}</small>
                </th>
                <th class="text-center" style="width: 130px;">Current Streak</th>
                <th class="text-center" style="width: 110px;">Best Streak</th>
                <th class="text-end pe-4" style="width: 80px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="habit in habits" :key="habit.id">
                <td>
                  <span class="fw-bold text-dark d-block">{{ habit.name }}</span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border px-2 py-1 rounded-pill small">
                    {{ habit.category || 'General' }}
                  </span>
                </td>
                <td v-for="day in past7Days" :key="day.dateStr" class="text-center">
                  <button
                    class="btn btn-sm rounded-circle p-0 style-check-btn"
                    :class="isHabitDone(habit, day.dateStr) ? 'btn-success shadow-sm' : 'btn-outline-secondary opacity-75'"
                    @click="toggleHabit(habit.id, day.dateStr)"
                  >
                    <i :class="isHabitDone(habit, day.dateStr) ? 'bi bi-check-lg text-white' : 'bi bi-plus'"></i>
                  </button>
                </td>
                <td class="text-center">
                  <span
                    class="badge rounded-pill px-3 py-2 fw-bold"
                    :class="getStreakBadgeClass(calculateStreak(habit))"
                  >
                    <i class="bi bi-fire me-1"></i>{{ calculateStreak(habit) }} Hari
                  </span>
                </td>
                <td class="text-center fw-semibold text-muted">
                  <i class="bi bi-award me-1 text-warning"></i>{{ calculateBestStreak(habit) }} Hari
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-light text-danger rounded-circle" @click="deleteHabit(habit.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-5">
          <i class="bi bi-lightning-charge display-1 text-muted opacity-50"></i>
          <h4 class="fw-bold mt-3 text-dark">Belum Ada Habit</h4>
          <p class="text-muted">Tambahkan rutinitas harian seperti "Coding 2 Jam" atau "Membaca Buku".</p>
          <button class="btn btn-primary rounded-3 px-4 py-2 mt-2" @click="openAddModal">
            <i class="bi bi-plus-lg me-1"></i> Tambah Habit
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div class="modal fade" id="habitModal" tabindex="-1" ref="habitModalRef" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow">
          <div class="modal-header border-bottom-0 p-4 pb-0">
            <h5 class="modal-title fw-bold text-dark">➕ Tambah Kebiasaan Baru</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveHabit" class="row g-3">
              <div class="col-12">
                <label class="form-label fw-semibold">Nama Kebiasaan <span class="text-danger">*</span></label>
                <input type="text" class="form-control" v-model="form.name" placeholder="Contoh: Coding 2 Jam Sehari" required />
              </div>

              <div class="col-12">
                <label class="form-label fw-semibold">Kategori</label>
                <select class="form-select" v-model="form.category">
                  <option value="Productivity">Productivity / Deep Work</option>
                  <option value="Business">Business / Client Outreach</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Learning">Learning & Reading</option>
                </select>
              </div>

              <div class="col-12 text-end pt-3 border-top">
                <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="closeModal">Batal</button>
                <button type="submit" class="btn btn-primary px-4 rounded-3 fw-semibold">Simpan Habit</button>
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

export default {
  name: 'HabitTrackerView',
  setup() {
    const store = useStore();
    const habitModalRef = ref(null);
    let modalInstance = null;

    const form = ref({ name: '', category: 'Productivity' });
    const habits = computed(() => store.getters.getHabits);

    const past7Days = computed(() => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
        const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;
        days.push({ dateStr, dayName, shortDate });
      }
      return days;
    });

    onMounted(() => {
      if (window.bootstrap && habitModalRef.value) {
        modalInstance = new window.bootstrap.Modal(habitModalRef.value);
      }
    });

    const isHabitDone = (habit, dateStr) => {
      return habit.history && habit.history[dateStr] === true;
    };

    const toggleHabit = (id, dateStr) => {
      store.dispatch('toggleHabitDate', { id, dateStr });
    };

    const todayStr = computed(() => new Date().toISOString().split('T')[0]);

    const calculateStreak = (habit) => {
      if (!habit || !habit.history) return 0;
      let streak = 0;
      const today = new Date();

      // Check if today is completed
      const todayDateStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateStr = yesterday.toISOString().split('T')[0];

      let startOffset = 0;
      if (habit.history[todayDateStr]) {
        startOffset = 0;
      } else if (habit.history[yesterdayDateStr]) {
        startOffset = 1;
      } else {
        return 0;
      }

      for (let i = startOffset; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        if (habit.history[dateStr]) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const calculateBestStreak = (habit) => {
      if (!habit || !habit.history) return 0;
      const dates = Object.keys(habit.history).filter(d => habit.history[d]).sort();
      if (dates.length === 0) return 0;

      let maxStreak = 0;
      let currentSeq = 0;
      let prevTime = null;

      for (const dStr of dates) {
        const time = new Date(dStr).getTime();
        if (prevTime === null) {
          currentSeq = 1;
        } else {
          const diffDays = Math.round((time - prevTime) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            currentSeq++;
          } else {
            currentSeq = 1;
          }
        }
        if (currentSeq > maxStreak) maxStreak = currentSeq;
        prevTime = time;
      }
      return Math.max(maxStreak, calculateStreak(habit));
    };

    const activeStreakCount = computed(() => {
      return habits.value.filter(h => calculateStreak(h) > 0).length;
    });

    const todayDoneCount = computed(() => {
      const t = todayStr.value;
      return habits.value.filter(h => isHabitDone(h, t)).length;
    });

    const bestStreakEver = computed(() => {
      if (habits.value.length === 0) return 0;
      return Math.max(0, ...habits.value.map(h => calculateBestStreak(h)));
    });

    const getStreakBadgeClass = (streak) => {
      if (streak >= 14) return 'bg-warning text-dark border border-warning shadow-sm';
      if (streak >= 7) return 'bg-danger text-white shadow-sm';
      if (streak >= 3) return 'bg-danger-subtle text-danger border border-danger-subtle';
      if (streak > 0) return 'bg-primary-subtle text-primary border border-primary-subtle';
      return 'bg-light text-muted border';
    };

    const getModal = () => {
      if (habitModalRef.value && window.bootstrap && window.bootstrap.Modal) {
        return window.bootstrap.Modal.getOrCreateInstance(habitModalRef.value, { backdrop: true, keyboard: true });
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

    const openAddModal = () => {
      form.value = { name: '', category: 'Productivity' };
      const modal = getModal();
      if (modal) modal.show();
    };

    const closeModal = () => {
      const modal = getModal();
      if (modal) modal.hide();
      cleanupBackdrop();
    };

    const saveHabit = () => {
      store.dispatch('addHabit', form.value);
      closeModal();
    };

    const deleteHabit = (id) => {
      if (confirm('Hapus habit ini?')) {
        store.dispatch('deleteHabit', id);
      }
    };

    return {
      habits,
      past7Days,
      form,
      habitModalRef,
      isHabitDone,
      toggleHabit,
      calculateStreak,
      calculateBestStreak,
      activeStreakCount,
      todayDoneCount,
      bestStreakEver,
      getStreakBadgeClass,
      openAddModal,
      closeModal,
      saveHabit,
      deleteHabit
    };
  }
};
</script>

<style scoped>
.style-check-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
</style>

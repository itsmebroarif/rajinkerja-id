<template>
  <div class="container-fluid p-0 position-relative" data-aos="fade-up">
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
        <button class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm" @click="openDrawer">
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
                  <button class="btn btn-sm btn-light text-danger rounded-circle" @click="deleteHabitDirect(habit.id)">
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
          <button class="btn btn-primary rounded-3 px-4 py-2 mt-2 fw-semibold" @click="openDrawer">
            <i class="bi bi-plus-lg me-1"></i> Tambah Habit Baru
          </button>
        </div>
      </div>
    </div>

    <!-- RIGHT SLIDE-OVER DRAWER BACKDROP -->
    <div
      v-if="drawerOpen"
      class="drawer-backdrop"
      @click="closeDrawer"
    ></div>

    <!-- RIGHT SLIDE-OVER DRAWER PANEL (FORM ADD HABIT) -->
    <div
      class="drawer-panel bg-white shadow-lg border-start transition-all"
      :class="{ 'drawer-show': drawerOpen }"
    >
      <div class="drawer-header p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
        <div>
          <span class="badge bg-danger-subtle text-danger fw-bold px-3 py-1.5 rounded-pill mb-1" style="font-size: 11px;">
            <i class="bi bi-lightning-charge-fill me-1"></i> Habit Form
          </span>
          <h5 class="fw-bold text-dark mb-0">
            ➕ Tambah Kebiasaan Baru
          </h5>
        </div>
        <button type="button" class="btn btn-light rounded-circle border shadow-sm p-2" @click="closeDrawer" title="Tutup">
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <div class="drawer-body p-4 overflow-y-auto" style="height: calc(100vh - 90px);">
        <form @submit.prevent="saveHabit" class="row g-3">
          <div class="col-12">
            <label class="form-label fw-bold text-dark small">Nama Kebiasaan / Habit <span class="text-danger">*</span></label>
            <input
              type="text"
              class="form-control form-control-lg border-2 fs-6"
              v-model="form.name"
              placeholder="Contoh: Coding 2 Jam Sehari / Deep Work 90m"
              required
            />
          </div>

          <div class="col-12">
            <label class="form-label fw-bold text-dark small">Kategori Rutinitas</label>
            <select class="form-select border-2" v-model="form.category">
              <option value="Productivity">Productivity / Deep Work</option>
              <option value="Business">Business & Client Outreach</option>
              <option value="Health">Health & Fitness</option>
              <option value="Learning">Learning & Skill Upgrade</option>
              <option value="Routine">Rutinitas Harian Kantor</option>
            </select>
          </div>

          <div class="col-12 pt-3 border-top mt-4 d-flex gap-2">
            <button type="button" class="btn btn-light rounded-3 px-4 flex-grow-1" @click="closeDrawer">Batal</button>
            <button type="submit" class="btn btn-primary rounded-3 px-4 py-2 fw-bold flex-grow-1 shadow-sm">
              <i class="bi bi-check-circle-fill me-1"></i> Simpan Habit
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
import { computed, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'HabitTrackerView',
  setup() {
    const store = useStore();

    const drawerOpen = ref(false);
    const form = ref({ name: '', category: 'Productivity' });
    const toast = ref({ show: false, message: '' });

    const habits = computed(() => store.getters.getHabits);

    const showToast = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

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

    const openDrawer = () => {
      form.value = { name: '', category: 'Productivity' };
      drawerOpen.value = true;
    };

    const closeDrawer = () => {
      drawerOpen.value = false;
    };

    const saveHabit = () => {
      if (!form.value.name || !form.value.name.trim()) {
        showToast('Nama kebiasaan tidak boleh kosong.');
        return;
      }
      store.dispatch('addHabit', form.value);
      showToast('Habit baru berhasil ditambahkan!');
      closeDrawer();
    };

    const deleteHabitDirect = (id) => {
      store.dispatch('deleteHabit', id);
      showToast('Habit berhasil dihapus.');
    };

    return {
      habits,
      past7Days,
      form,
      drawerOpen,
      toast,
      isHabitDone,
      toggleHabit,
      calculateStreak,
      calculateBestStreak,
      activeStreakCount,
      todayDoneCount,
      bestStreakEver,
      getStreakBadgeClass,
      openDrawer,
      closeDrawer,
      saveHabit,
      deleteHabitDirect
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
  width: 440px;
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

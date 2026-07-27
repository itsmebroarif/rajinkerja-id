<template>
  <div id="app" :class="['app-container', themeMode === 'dark' ? 'dark-theme' : 'light-theme']" :style="{ '--primary-color': accentColor }">
    <!-- Desktop Material Navigation Drawer -->
    <aside :class="['sidebar-nav', { collapsed: isCollapsed }]">
      <div class="sidebar-brand p-3 d-flex align-items-center justify-content-between">
        <div v-if="!isCollapsed" class="d-flex align-items-center gap-2">
          <div class="brand-logo rounded-3 d-flex align-items-center justify-content-center text-white fw-extrabold shadow-sm px-2 py-1 fs-6" :style="{ backgroundColor: accentColor }">
            RK
          </div>
          <div class="lh-1">
            <span class="fw-extrabold text-app fs-5 d-block" style="letter-spacing: -0.3px;">RajinKerja<span :style="{ color: accentColor }">.id</span></span>
            <small class="text-sub fw-bold text-uppercase d-block mt-1" style="font-size: 9px; letter-spacing: 0.8px;">WORKFLOW & TASK OS</small>
          </div>
        </div>
        <button class="btn btn-sm text-sub p-1 rounded-circle border-0 icon-hover" @click="isCollapsed = !isCollapsed" title="Toggle Material Drawer">
          <i :class="isCollapsed ? 'bi bi-layout-sidebar-reverse fs-5' : 'bi bi-layout-sidebar fs-5'"></i>
        </button>
      </div>

      <!-- Material Navigation Links -->
      <nav class="sidebar-links p-2 flex-grow-1">
        <router-link to="/" class="material-nav-link" title="Dashboard">
          <i class="bi bi-grid-1x2-fill me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Dashboard</span>
        </router-link>

        <router-link to="/todo" class="material-nav-link" title="To-Do & Kanban (Standard/Kanban)">
          <i class="bi bi-kanban-fill me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">To-Do & Kanban</span>
          <span v-if="!isCollapsed && pendingTasksCount > 0" class="badge rounded-pill bg-warning text-dark ms-auto small">
            {{ pendingTasksCount }}
          </span>
        </router-link>

        <router-link to="/project" class="material-nav-link" title="Proyek & Kontrak">
          <i class="bi bi-folder-fill me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Proyek</span>
          <span v-if="!isCollapsed && activeProjectsCount > 0" class="badge rounded-pill bg-info text-dark ms-auto small">
            {{ activeProjectsCount }}
          </span>
        </router-link>

        <router-link to="/finance" class="material-nav-link" title="Keuangan & Tracker">
          <i class="bi bi-wallet2 me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Keuangan</span>
          <span v-if="!isCollapsed && isBudgetExceeded" class="badge rounded-pill bg-danger text-white ms-auto small fw-bold">
            Over Budget
          </span>
        </router-link>

        <router-link to="/invoice" class="material-nav-link" title="Invoice Generator (PDF)">
          <i class="bi bi-receipt me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Invoice Generator</span>
        </router-link>

        <router-link to="/contacts" class="material-nav-link" title="Kontak Klien">
          <i class="bi bi-person-lines-fill me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Kontak Klien</span>
          <span v-if="!isCollapsed && totalClientsCount > 0" class="badge rounded-pill bg-secondary text-white ms-auto small">
            {{ totalClientsCount }}
          </span>
        </router-link>

        <router-link to="/habits" class="material-nav-link" title="Habit Tracker & Streaks">
          <i class="bi bi-lightning-charge-fill me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Habit Tracker</span>
        </router-link>

        <router-link to="/calendar" class="material-nav-link" title="Kalender Agenda & Timed Events">
          <i class="bi bi-calendar3 me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Kalender & Agenda</span>
        </router-link>

        <router-link to="/notes" class="material-nav-link" title="Sticky Notes & Search">
          <i class="bi bi-journal-text me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Notes & Scratchpad</span>
        </router-link>

        <div class="my-2 border-top divider-color"></div>

        <router-link to="/preferences" class="material-nav-link" title="Preferences, Theme & Backup">
          <i class="bi bi-sliders me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">Preferences</span>
        </router-link>

        <router-link to="/chat" class="material-nav-link" title="AI Assistant">
          <i class="bi bi-robot me-3 fs-5 nav-icon"></i>
          <span v-if="!isCollapsed" class="nav-label">AI Chat Assistant</span>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-top divider-color" v-if="!isCollapsed">
        <router-link to="/preferences" class="btn btn-sm btn-outline-theme w-100 rounded-pill text-start mb-2 d-flex align-items-center gap-2">
          <i class="bi bi-palette"></i> Theme & Color Settings
        </router-link>
        <a href="https://trakteer.id/itsmebroarif/tip?open=true" target="_blank" class="btn btn-sm btn-success w-100 rounded-pill fw-semibold text-center">
          ☕ Dukung Dev
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div :class="['main-content', { expanded: isCollapsed }]">
      <!-- Top Bar Header -->
      <header class="top-header border-bottom px-4 py-2 d-flex align-items-center justify-content-between sticky-top">
        <div class="d-flex align-items-center gap-3">
          <button class="btn btn-light d-md-none rounded-3" @click="mobileDrawer = true">
            <i class="bi bi-list fs-4"></i>
          </button>
          <div class="d-none d-sm-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary fw-bold rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1 shadow-sm" style="font-size: 11px; letter-spacing: 0.4px;">
              <i class="bi bi-patch-check-fill text-primary me-1"></i>RajinKerja Work Suite v2.5
            </span>
            <span class="text-muted small fw-medium d-none d-lg-inline opacity-75" style="letter-spacing: 0.2px;">• Organizer Pekerjaan Karyawan & Profesional</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <!-- Budget Alert Warning if exceeded -->
          <div v-if="isBudgetExceeded" class="badge bg-danger-subtle text-danger border border-danger px-3 py-2 rounded-pill d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span class="d-none d-sm-inline">Pengeluaran Melebihi Anggaran!</span>
          </div>

          <!-- Quick Theme Toggle -->
          <button
            class="btn btn-sm rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2 border"
            :class="themeMode === 'dark' ? 'btn-dark' : 'btn-light'"
            @click="toggleThemeMode"
            :title="themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <i :class="themeMode === 'dark' ? 'bi bi-sun-fill text-warning' : 'bi bi-moon-stars-fill text-primary'"></i>
            <span class="d-none d-sm-inline">{{ themeMode === 'dark' ? 'Light' : 'Dark' }}</span>
          </button>

          <!-- Preferences Link -->
          <router-link to="/preferences" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1">
            <i class="bi bi-gear-fill me-1"></i> Preferences
          </router-link>
        </div>
      </header>

      <!-- Mobile Offcanvas Drawer -->
      <div class="offcanvas-overlay" v-if="mobileDrawer" @click="mobileDrawer = false"></div>
      <div class="mobile-drawer p-3" v-if="mobileDrawer">
        <div class="d-flex justify-content-between align-items-center pb-3 border-bottom mb-3">
          <div class="fw-bold fs-5 text-app">Menu Utama</div>
          <button class="btn btn-sm btn-light rounded-circle" @click="mobileDrawer = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <nav class="d-flex flex-column gap-2" @click="mobileDrawer = false">
          <router-link to="/" class="material-nav-link"><i class="bi bi-grid-1x2-fill me-3 text-primary"></i>Dashboard</router-link>
          <router-link to="/todo" class="material-nav-link"><i class="bi bi-kanban-fill me-3 text-warning"></i>To-Do & Kanban</router-link>
          <router-link to="/project" class="material-nav-link"><i class="bi bi-folder-fill me-3 text-info"></i>Proyek</router-link>
          <router-link to="/finance" class="material-nav-link"><i class="bi bi-wallet2 me-3 text-success"></i>Keuangan</router-link>
          <router-link to="/invoice" class="material-nav-link"><i class="bi bi-receipt me-3 text-primary"></i>Invoice Generator</router-link>
          <router-link to="/contacts" class="material-nav-link"><i class="bi bi-person-lines-fill me-3 text-info"></i>Kontak Klien</router-link>
          <router-link to="/habits" class="material-nav-link"><i class="bi bi-lightning-charge-fill me-3 text-danger"></i>Habit Tracker</router-link>
          <router-link to="/calendar" class="material-nav-link"><i class="bi bi-calendar3 me-3 text-warning"></i>Kalender & Agenda</router-link>
          <router-link to="/notes" class="material-nav-link"><i class="bi bi-journal-text me-3 text-secondary"></i>Notes & Scratchpad</router-link>
          <router-link to="/preferences" class="material-nav-link"><i class="bi bi-sliders me-3 text-primary"></i>Preferences</router-link>
        </nav>
      </div>

      <!-- Main Router View Container with Fade-Slide Animation -->
      <div class="p-3 p-md-4">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

      <!-- Mobile Bottom Nav Bar -->
      <nav class="mobile-bottom-bar d-md-none border-top fixed-bottom d-flex justify-content-around py-2 shadow-lg">
        <router-link to="/" class="mobile-nav-btn" active-class="active">
          <i class="bi bi-grid-1x2-fill"></i>
          <span>Home</span>
        </router-link>
        <router-link to="/todo" class="mobile-nav-btn" active-class="active">
          <i class="bi bi-check2-square"></i>
          <span>To-Do</span>
        </router-link>
        <router-link to="/finance" class="mobile-nav-btn" active-class="active">
          <i class="bi bi-wallet2"></i>
          <span>Keuangan</span>
        </router-link>
        <router-link to="/invoice" class="mobile-nav-btn" active-class="active">
          <i class="bi bi-receipt"></i>
          <span>Invoice</span>
        </router-link>
        <router-link to="/preferences" class="mobile-nav-btn" active-class="active">
          <i class="bi bi-sliders"></i>
          <span>Settings</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  setup() {
    const store = useStore();
    const isCollapsed = ref(false);
    const mobileDrawer = ref(false);

    const pendingTasksCount = computed(() => store.getters.pendingTasksCount);
    const activeProjectsCount = computed(() => store.getters.activeProjectsCount);
    const totalClientsCount = computed(() => store.getters.totalClientsCount);
    const isBudgetExceeded = computed(() => store.getters.isBudgetExceeded);
    const themeMode = computed(() => store.getters.getThemeMode);
    const accentColor = computed(() => store.getters.getAccentColor);

    const applyThemeToBody = (mode) => {
      if (mode === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        document.body.style.backgroundColor = '#090d16';
        document.body.style.color = '#f1f5f9';
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      }
    };

    watch(themeMode, (newVal) => {
      applyThemeToBody(newVal);
    }, { immediate: true });

    onMounted(() => {
      applyThemeToBody(themeMode.value);
    });

    const toggleThemeMode = () => {
      const next = themeMode.value === 'dark' ? 'light' : 'dark';
      store.dispatch('setThemeMode', next);
    };

    return {
      isCollapsed,
      mobileDrawer,
      pendingTasksCount,
      activeProjectsCount,
      totalClientsCount,
      isBudgetExceeded,
      themeMode,
      accentColor,
      toggleThemeMode
    };
  }
};
</script>

<style>
/* CSS Variables & Themes */
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 76px;
  --primary-color: #2563eb;
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --border-color: #e2e8f0;
  --sidebar-bg: #0f172a;
  --sidebar-text: #94a3b8;
  --sidebar-active-bg: rgba(37, 99, 235, 0.15);
}

/* Light Theme Variables */
.light-theme {
  --bg-app: #f8fafc;
  --bg-surface: #ffffff;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --border-color: #e2e8f0;
  --sidebar-bg: #0f172a;
  --sidebar-text: #94a3b8;
}

/* Dark Theme Variables */
.dark-theme {
  --bg-app: #090d16;
  --bg-surface: #131b2e;
  --text-main: #f1f5f9;
  --text-sub: #94a3b8;
  --border-color: #1e293b;
  --sidebar-bg: #090d16;
  --sidebar-text: #94a3b8;
}

body {
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: var(--bg-app);
  color: var(--text-main);
  margin: 0;
  padding: 0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.dark-theme .bg-white,
.dark-theme .card,
.dark-theme .top-header,
.dark-theme .modal-content,
.dark-theme .mobile-bottom-bar,
.dark-theme .accordion-item,
.dark-theme .offcanvas {
  background-color: var(--bg-surface) !important;
  color: var(--text-main) !important;
  border-color: var(--border-color) !important;
}

.dark-theme .text-dark,
.dark-theme .text-black,
.dark-theme h1, .dark-theme h2, .dark-theme h3, .dark-theme h4, .dark-theme h5, .dark-theme h6 {
  color: #f1f5f9 !important;
}

.dark-theme .text-muted,
.dark-theme .text-secondary {
  color: #94a3b8 !important;
}

.dark-theme .bg-light,
.dark-theme .table-light,
.dark-theme .input-group-text,
.dark-theme .dropdown-menu {
  background-color: #1a233a !important;
  color: #e2e8f0 !important;
  border-color: #1e293b !important;
}

.dark-theme .btn-light {
  background-color: #1e293b !important;
  color: #f1f5f9 !important;
  border-color: #334155 !important;
}

.dark-theme .btn-light:hover {
  background-color: #334155 !important;
  color: #ffffff !important;
}

.dark-theme .btn-outline-secondary {
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

.dark-theme .btn-outline-secondary:hover {
  background-color: #1e293b !important;
  color: #ffffff !important;
}

.dark-theme .table {
  color: #e2e8f0 !important;
  border-color: #1e293b !important;
}

.dark-theme .table-hover tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04) !important;
  color: #ffffff !important;
}

.dark-theme .form-control,
.dark-theme .form-select,
.dark-theme textarea {
  background-color: #1a233a !important;
  color: #ffffff !important;
  border-color: #334155 !important;
}

.dark-theme .form-control::placeholder,
.dark-theme textarea::placeholder {
  color: #64748b !important;
}

.dark-theme .form-control:focus,
.dark-theme .form-select:focus {
  background-color: #1e293b !important;
  color: #ffffff !important;
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 0.25rem rgba(37, 99, 235, 0.25) !important;
}

.dark-theme .modal-header,
.dark-theme .modal-footer {
  border-color: #1e293b !important;
}

.dark-theme .btn-close {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.dark-theme .border,
.dark-theme .border-top,
.dark-theme .border-bottom,
.dark-theme .border-start,
.dark-theme .border-end {
  border-color: #1e293b !important;
}

.dark-theme .badge.bg-light {
  background-color: #1e293b !important;
  color: #e2e8f0 !important;
  border-color: #334155 !important;
}

/* Modals backdrop styling */
.modal-backdrop {
  background-color: rgba(15, 23, 42, 0.7);
}

.modal-backdrop.show {
  opacity: 0.7 !important;
}

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-app);
  color: var(--text-main);
}

/* Material Design Sidebar Drawer */
.sidebar-nav {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  display: flex;
  flex-direction: column;
  transition: width 0.25s cubic-bezier(0.2, 0, 0, 1);
  z-index: 1040;
  border-right: 1px solid var(--border-color);
}

.sidebar-nav.collapsed {
  width: var(--sidebar-collapsed-width);
}

.sidebar-links {
  overflow-y: auto;
}

.material-nav-link {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  border-radius: 28px; /* Material 3 Pill shape */
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
}

.material-nav-link:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  transform: translateX(2px);
}

.material-nav-link.router-link-active,
.material-nav-link.router-link-exact-active {
  background-color: var(--primary-color);
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.btn-outline-theme {
  border-color: var(--sidebar-text);
  color: var(--sidebar-text);
}

.btn-outline-theme:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.divider-color {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Main Content Area */
.main-content {
  margin-left: var(--sidebar-width);
  flex: 1;
  min-width: 0;
  transition: margin-left 0.25s cubic-bezier(0.2, 0, 0, 1);
  padding-bottom: 60px;
  background-color: var(--bg-app);
}

.main-content.expanded {
  margin-left: var(--sidebar-collapsed-width);
}

.top-header {
  height: 64px;
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  z-index: 1020;
}

/* Route Transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Mobile Drawer & Overlay */
.offcanvas-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1050;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 290px;
  background-color: var(--sidebar-bg);
  z-index: 1060;
  overflow-y: auto;
}

/* Mobile Bottom Bar */
.mobile-bottom-bar {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  z-index: 1030;
}

.mobile-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-sub);
  text-decoration: none;
  font-size: 11px;
}

.mobile-nav-btn i {
  font-size: 18px;
}

.mobile-nav-btn.active {
  color: var(--primary-color);
  font-weight: 700;
}

@media (max-width: 768px) {
  .sidebar-nav {
    display: none;
  }
  .main-content {
    margin-left: 0 !important;
  }
}

@media print {
  .sidebar-nav, .top-header, .mobile-bottom-bar {
    display: none !important;
  }
  .main-content {
    margin-left: 0 !important;
    padding-bottom: 0 !important;
  }
}
</style>

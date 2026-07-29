<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-warning-subtle text-warning-emphasis fw-semibold px-3 py-2 rounded-pill">Task Manager Pro</span>
          <span class="badge bg-light text-dark border px-3 py-2 rounded-pill">5 View Modes</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">📝 To-Do & Activity Tracker</h2>
        <p class="text-muted mb-0">Atur prioritas, tugas berulang (recurring), papan Kanban, matriks Eisenhower, dan timeline deadline.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel
        </button>
        <button
          class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          @click="toggleShowForm"
        >
          <i :class="showForm ? 'bi bi-x-lg' : 'bi bi-plus-lg'" class="fs-5"></i>
          <span>{{ showForm ? 'Tutup Form' : 'Tambah / Bulk Input' }}</span>
        </button>
      </div>
    </div>

    <!-- Inline Collapsible Form Panel (Single / Bulk Input) -->
    <div v-if="showForm" class="card border-0 shadow-lg rounded-4 mb-4 bg-white border-start border-4 border-primary">
      <div class="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-3">
          <div class="btn-group" role="group">
            <button
              class="btn btn-sm px-3 py-1 fw-semibold"
              :class="formTab === 'single' ? 'btn-primary' : 'btn-outline-primary'"
              @click="formTab = 'single'"
            >
              <i class="bi bi-pencil-square me-1"></i> Input Tunggal {{ isEditing ? '(Edit)' : '' }}
            </button>
            <button
              v-if="!isEditing"
              class="btn btn-sm px-3 py-1 fw-semibold"
              :class="formTab === 'bulk' ? 'btn-primary' : 'btn-outline-primary'"
              @click="formTab = 'bulk'"
            >
              <i class="bi bi-stack me-1"></i> Input Bulk (Banyak Task)
            </button>
          </div>
        </div>
        <button type="button" class="btn-close" @click="showForm = false" aria-label="Close"></button>
      </div>

      <div class="card-body p-4">
        <!-- SINGLE ITEM FORM -->
        <form v-if="formTab === 'single'" @submit.prevent="saveTask">
          <div class="row g-3">
            <div class="col-md-8">
              <label class="form-label fw-semibold">Nama Tugas / Activity <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.name }"
                placeholder="Contoh: Selesaikan Wireframe UI Landing Page"
                v-model="form.name"
              />
              <div class="invalid-feedback" v-if="formErrors.name">{{ formErrors.name }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Kategori Organisasi</label>
              <select class="form-select" v-model="form.category">
                <option value="Work">💼 Work / Pekerjaan</option>
                <option value="Personal">🏠 Personal / Pribadi</option>
                <option value="Urgent">🔥 Urgent / Mendesak</option>
                <option value="Client">🤝 Client Project</option>
                <option value="Routine">🔄 Routine / Rutinitas</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Tingkat Prioritas</label>
              <select class="form-select" v-model="form.level">
                <option value="Menengah">Menengah (Sedang)</option>
                <option value="Penting">🔥 Penting / Urgent</option>
                <option value="Biasa">Biasa (Rendah)</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Proyek / Tag</label>
              <input type="text" class="form-control" placeholder="Contoh: Mobile App, Design" v-model="form.projectTag" />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Status / Kolom</label>
              <select class="form-select" v-model="form.statusColumn">
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed / Selesai</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Target Deadline <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                :class="{ 'is-invalid': formErrors.deadline }"
                v-model="form.deadline"
              />
              <div class="invalid-feedback" v-if="formErrors.deadline">{{ formErrors.deadline }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Frekuensi Berulang (Recurring)</label>
              <select class="form-select" v-model="form.recurring">
                <option value="none">Tidak Berulang (Sekali)</option>
                <option value="daily">Harian (Daily)</option>
                <option value="weekly">Mingguan (Weekly)</option>
                <option value="monthly">Bulanan (Monthly)</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Kategori Matriks Eisenhower</label>
              <select class="form-select" v-model="form.eisenhower">
                <option value="do_first">🔥 Kerjakan Sekarang (Penting & Mendesak)</option>
                <option value="schedule">📅 Jadwalkan (Penting, Tidak Mendesak)</option>
                <option value="delegate">👥 Delegasikan (Mendesak, Tidak Penting)</option>
                <option value="eliminate">🧹 Eliminasi (Tidak Penting & Tidak Mendesak)</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Catatan / Detail Pekerjaan</label>
              <textarea class="form-control" rows="2" placeholder="Detail petunjuk atau link..." v-model="form.notes"></textarea>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-primary px-4 rounded-3 fw-semibold">
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Tugas' }}
              </button>
            </div>
          </div>
        </form>

        <!-- BULK INPUT FORM -->
        <form v-else @submit.prevent="saveBulkTasks">
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info py-2 small mb-2 d-flex align-items-center gap-2">
                <i class="bi bi-info-circle-fill fs-5"></i>
                <span>Tulis atau paste daftar nama tugas (1 nama tugas per baris). Semua akan dimasukkan sekaligus secara otomatis!</span>
              </div>
              <label class="form-label fw-semibold">Daftar Task (Satu per baris) <span class="text-danger">*</span></label>
              <textarea
                class="form-control font-monospace"
                rows="5"
                placeholder="Design logo landing page&#10;Kirim email penawaran ke Pak Budi&#10;Selesaikan skema database PostgreSQL"
                v-model="bulkText"
                :class="{ 'is-invalid': bulkError }"
              ></textarea>
              <div class="invalid-feedback" v-if="bulkError">{{ bulkError }}</div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Proyek / Tag Default</label>
              <input type="text" class="form-control" placeholder="Umum" v-model="bulkDefault.projectTag" />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Prioritas Default</label>
              <select class="form-select" v-model="bulkDefault.level">
                <option value="Menengah">Menengah</option>
                <option value="Penting">Penting</option>
                <option value="Biasa">Biasa</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Deadline Default</label>
              <input type="date" class="form-control" v-model="bulkDefault.deadline" />
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-semibold">
                <i class="bi bi-stack me-1"></i> Simpan Semua Task (Bulk)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Progress Card -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
      <div class="row align-items-center">
        <div class="col-md-8">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="fw-bold text-dark mb-0"><i class="bi bi-bar-chart-line-fill text-primary me-2"></i>Kemajuan Tugas Keseluruhan</h6>
            <span class="fw-bold text-primary fs-5">{{ completionPercent }}% Selesai</span>
          </div>
          <div class="progress rounded-pill style-progress" style="height: 12px;">
            <div
              class="progress-bar bg-success progress-bar-striped progress-bar-animated"
              role="progressbar"
              :style="{ width: completionPercent + '%' }"
            ></div>
          </div>
          <div class="d-flex flex-wrap gap-4 mt-3 small text-muted">
            <div><i class="bi bi-list-task text-primary me-1"></i> Total: <strong>{{ tasks.length }}</strong></div>
            <div><i class="bi bi-check-circle-fill text-success me-1"></i> Selesai: <strong>{{ completedCount }}</strong></div>
            <div><i class="bi bi-clock-history text-warning me-1"></i> Pending: <strong>{{ pendingCount }}</strong></div>
          </div>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0" v-if="completedCount > 0">
          <button class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="clearCompleted">
            <i class="bi bi-trash me-1"></i> Bersihkan Selesai
          </button>
        </div>
      </div>
    </div>

    <!-- View Mode Switcher & Bulk Actions Toolbar -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <!-- 5 View Modes Buttons -->
        <div class="btn-group flex-wrap" role="group">
          <button
            class="btn btn-outline-primary px-3 py-2 fw-semibold"
            :class="{ active: currentViewMode === 'list' }"
            @click="currentViewMode = 'list'"
          >
            <i class="bi bi-list-ul me-1"></i> 1. Standard List
          </button>
          <button
            class="btn btn-outline-primary px-3 py-2 fw-semibold"
            :class="{ active: currentViewMode === 'kanban' }"
            @click="currentViewMode = 'kanban'"
          >
            <i class="bi bi-kanban me-1"></i> 2. Kanban Board
          </button>
          <button
            class="btn btn-outline-primary px-3 py-2 fw-semibold"
            :class="{ active: currentViewMode === 'eisenhower' }"
            @click="currentViewMode = 'eisenhower'"
          >
            <i class="bi bi-grid-fill me-1"></i> 3. Matriks Eisenhower
          </button>
          <button
            class="btn btn-outline-primary px-3 py-2 fw-semibold"
            :class="{ active: currentViewMode === 'timeline' }"
            @click="currentViewMode = 'timeline'"
          >
            <i class="bi bi-calendar-range me-1"></i> 4. Timeline Deadline
          </button>
          <button
            class="btn btn-outline-primary px-3 py-2 fw-semibold"
            :class="{ active: currentViewMode === 'compact' }"
            @click="currentViewMode = 'compact'"
          >
            <i class="bi bi-check-square me-1"></i> 5. Checklist Ringkas
          </button>
        </div>

        <!-- Category Filter & Search input -->
        <div class="d-flex align-items-center gap-2">
          <select class="form-select bg-light border" style="width: 160px;" v-model="selectedCategory">
            <option value="all">Semua Kategori</option>
            <option value="Work">💼 Work</option>
            <option value="Personal">🏠 Personal</option>
            <option value="Urgent">🔥 Urgent</option>
            <option value="Client">🤝 Client</option>
            <option value="Routine">🔄 Routine</option>
          </select>
          <div class="input-group" style="max-width: 240px;">
            <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control bg-light border-start-0" placeholder="Cari task..." v-model="searchQuery" />
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Action Toolbar (When 1 or more items selected) -->
    <div v-if="selectedIds.length > 0" class="alert alert-primary d-flex flex-wrap justify-content-between align-items-center rounded-4 shadow-sm mb-4 py-2 px-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-square fs-5"></i>
        <span class="fw-bold">{{ selectedIds.length }} task terpilih</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success rounded-pill px-3" @click="bulkMarkDone">
          <i class="bi bi-check-all me-1"></i> Tandai Selesai
        </button>
        <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDelete">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
        <button class="btn btn-sm btn-light rounded-pill px-3" @click="selectedIds = []">
          Batal Pilih
        </button>
      </div>
    </div>

    <!-- VIEW MODE 1: Standard Table / List -->
    <div v-if="currentViewMode === 'list'" class="card border-0 shadow-sm rounded-4 bg-white">
      <div class="card-body p-0">
        <div class="table-responsive" v-if="filteredTasks.length > 0">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 40px;" class="text-center">
                  <input type="checkbox" class="form-check-input" :checked="isAllSelected" @change="toggleSelectAll" />
                </th>
                <th style="width: 50px;" class="text-center">#</th>
                <th style="width: 50px;">Status</th>
                <th>Nama Kegiatan / Tugas</th>
                <th>Kategori</th>
                <th>Proyek / Tag</th>
                <th>Prioritas</th>
                <th>Frekuensi Recurring</th>
                <th>Deadline</th>
                <th class="text-end pe-4" style="width: 140px;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(task, index) in filteredTasks" :key="task.id" :class="{ 'bg-light opacity-75': task.done }">
                <td class="text-center">
                  <input type="checkbox" class="form-check-input" :value="task.id" v-model="selectedIds" />
                </td>
                <td class="text-center text-muted fw-bold">{{ index + 1 }}</td>
                <td>
                  <input
                    type="checkbox"
                    class="form-check-input style-checkbox"
                    :checked="task.done"
                    @change="toggleTaskDone(task.id)"
                  />
                </td>
                <td>
                  <router-link :to="'/tasks/' + task.id" class="text-decoration-none">
                    <div class="fw-bold hover-primary text-dark" :class="{ 'text-decoration-line-through text-muted': task.done }">
                      {{ task.name }}
                    </div>
                  </router-link>
                  <small class="text-muted d-block text-truncate" style="max-width: 320px;" v-if="task.notes">{{ task.notes }}</small>
                </td>
                <td>
                  <span class="badge rounded-pill px-2.5 py-1.5 fw-semibold" :class="getCategoryBadgeClass(task.category)">
                    {{ getCategoryLabel(task.category) }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border px-2 py-1 rounded-pill">
                    <i class="bi bi-tag-fill me-1 text-primary"></i>{{ task.projectTag || 'Umum' }}
                  </span>
                </td>
                <td>
                  <span :class="badgeClass(task.level)" class="px-3 py-1 rounded-pill small">
                    {{ task.level }}
                  </span>
                </td>
                <td>
                  <span v-if="task.recurring && task.recurring !== 'none'" class="badge bg-info-subtle text-info fw-semibold px-2 py-1 rounded-pill small">
                    <i class="bi bi-repeat me-1"></i>{{ task.recurring }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td>
                  <div class="small fw-semibold" :class="isOverdue(task.deadline, task.done) ? 'text-danger' : 'text-dark'">
                    <i class="bi bi-calendar-event me-1"></i>{{ formatDate(task.deadline) }}
                  </div>
                </td>
                <td class="text-end pe-4">
                  <div class="d-flex justify-content-end gap-1">
                    <router-link :to="'/tasks/' + task.id" class="btn btn-sm btn-light text-info rounded-circle" title="Detail Preview Tugas">
                      <i class="bi bi-eye-fill"></i>
                    </router-link>
                    <button class="btn btn-sm btn-light text-primary rounded-circle" @click="editTask(task)" title="Edit Tugas">
                      <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="btn btn-sm btn-light text-danger rounded-circle" @click="removeTask(task.id)" title="Hapus Tugas">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-5">
          <p class="text-muted">Tidak ada tugas ditemukan.</p>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 2: Kanban Board -->
    <div v-else-if="currentViewMode === 'kanban'" class="row g-3">
      <div v-for="col in kanbanColumns" :key="col.id" class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm rounded-4 bg-white h-100">
          <div class="card-header bg-transparent border-0 d-flex justify-content-between align-items-center pt-3 px-3">
            <div class="d-flex align-items-center gap-2">
              <span class="badge rounded-pill px-3 py-2" :class="col.badgeBg">{{ col.title }}</span>
              <span class="fw-bold small text-muted">({{ getTaskCountInCol(col.id) }})</span>
            </div>
            <button class="btn btn-sm btn-light rounded-circle" @click="openAddForCol(col.id)" title="Tambah di kolom ini">
              <i class="bi bi-plus-lg"></i>
            </button>
          </div>
          <div class="card-body p-2 min-vh-25">
            <div
              v-for="task in getTasksInCol(col.id)"
              :key="task.id"
              class="card border shadow-sm rounded-3 mb-2 p-3 hover-card"
              :class="{ 'border-success bg-success-subtle opacity-75': task.done }"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input style-checkbox"
                    :checked="task.done"
                    @change="toggleTaskDone(task.id)"
                  />
                  <label class="form-check-label fw-bold ms-1" :class="{ 'text-decoration-line-through text-muted': task.done }">
                    {{ task.name }}
                  </label>
                </div>
              </div>
              <p class="text-muted small mb-2" v-if="task.notes">{{ task.notes }}</p>
              <div class="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top gap-1 style-mini">
                <span class="badge rounded-pill px-2 py-0.5" :class="getCategoryBadgeClass(task.category)">
                  {{ getCategoryLabel(task.category) }}
                </span>
                <span class="badge bg-light text-dark border">{{ task.projectTag || 'Umum' }}</span>
                <span :class="badgeClass(task.level)" class="px-2 py-0.5 rounded-pill">{{ task.level }}</span>
                <span class="text-muted"><i class="bi bi-clock me-1"></i>{{ formatDate(task.deadline) }}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-light btn-sm px-2"
                    v-if="getPrevCol(col.id)"
                    @click="moveTaskCol(task, getPrevCol(col.id))"
                    title="Mundur Kolom"
                  >
                    <i class="bi bi-arrow-left"></i>
                  </button>
                  <button
                    class="btn btn-light btn-sm px-2"
                    v-if="getNextCol(col.id)"
                    @click="moveTaskCol(task, getNextCol(col.id))"
                    title="Maju Kolom"
                  >
                    <i class="bi bi-arrow-right"></i>
                  </button>
                </div>
                <div class="d-flex gap-1">
                  <router-link :to="'/tasks/' + task.id" class="btn btn-sm btn-light text-info px-2" title="Detail Preview">
                    <i class="bi bi-eye-fill"></i>
                  </router-link>
                  <button class="btn btn-sm btn-light text-primary px-2" @click="editTask(task)" title="Edit">
                    <i class="bi bi-pencil-fill"></i>
                  </button>
                  <button class="btn btn-sm btn-light text-danger px-2" @click="removeTask(task.id)" title="Hapus">
                    <i class="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 3: Matriks Eisenhower -->
    <div v-else-if="currentViewMode === 'eisenhower'" class="row g-3">
      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-danger shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-danger"><i class="bi bi-fire me-2"></i>🔥 1. Kerjakan Sekarang (Do First)</h6>
          <p class="text-muted small mb-2">Penting & Mendesak</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('do_first')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div>
                <input type="checkbox" class="form-check-input me-2" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
              </div>
              <span class="badge bg-danger-subtle text-danger rounded-pill">{{ formatDate(t.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-primary shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-primary"><i class="bi bi-calendar-event me-2"></i>📅 2. Jadwalkan (Schedule)</h6>
          <p class="text-muted small mb-2">Penting, Tidak Mendesak</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('schedule')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div>
                <input type="checkbox" class="form-check-input me-2" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
              </div>
              <span class="badge bg-primary-subtle text-primary rounded-pill">{{ formatDate(t.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-warning shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-warning"><i class="bi bi-people me-2"></i>👥 3. Delegasikan (Delegate)</h6>
          <p class="text-muted small mb-2">Mendesak, Tidak Penting</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('delegate')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div>
                <input type="checkbox" class="form-check-input me-2" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
              </div>
              <span class="badge bg-warning-subtle text-warning rounded-pill">{{ formatDate(t.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card border-0 border-start border-4 border-secondary shadow-sm rounded-4 bg-white p-3 h-100">
          <h6 class="fw-bold text-secondary"><i class="bi bi-trash me-2"></i>🧹 4. Eliminasi (Eliminate)</h6>
          <p class="text-muted small mb-2">Tidak Penting & Tidak Mendesak</p>
          <div class="list-group list-group-flush">
            <div
              v-for="t in getEisenhowerTasks('eliminate')"
              :key="t.id"
              class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
            >
              <div>
                <input type="checkbox" class="form-check-input me-2" :checked="t.done" @change="toggleTaskDone(t.id)" />
                <span :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
              </div>
              <span class="badge bg-secondary-subtle text-secondary rounded-pill">{{ formatDate(t.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 4: Timeline Deadline -->
    <div v-else-if="currentViewMode === 'timeline'" class="card border-0 shadow-sm rounded-4 bg-white p-4">
      <h6 class="fw-bold text-dark mb-3"><i class="bi bi-clock-history me-2 text-primary"></i>Timeline Deadline Pekerjaan</h6>
      <div v-for="(groupTasks, dateStr) in timelineGroupedTasks" :key="dateStr" class="mb-4">
        <div class="d-flex align-items-center gap-2 mb-2">
          <span class="badge bg-primary px-3 py-2 rounded-pill"><i class="bi bi-calendar3 me-1"></i>{{ formatDate(dateStr) }}</span>
          <span class="text-muted small">({{ groupTasks.length }} task)</span>
        </div>
        <div class="row g-2 ps-3 border-start border-2 border-primary ms-2">
          <div v-for="t in groupTasks" :key="t.id" class="col-md-6">
            <div class="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
              <div>
                <span class="fw-bold d-block" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
                <div class="d-flex align-items-center gap-1 mt-1">
                  <span class="badge rounded-pill px-2 py-0.5" :class="getCategoryBadgeClass(t.category)">
                    {{ getCategoryLabel(t.category) }}
                  </span>
                  <span class="badge bg-white text-dark border small">{{ t.projectTag || 'Umum' }}</span>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-success rounded-circle" @click="toggleTaskDone(t.id)">
                <i :class="t.done ? 'bi bi-check-circle-fill' : 'bi bi-circle'"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- VIEW MODE 5: Checklist Ringkas -->
    <div v-else-if="currentViewMode === 'compact'" class="card border-0 shadow-sm rounded-4 bg-white p-4">
      <h6 class="fw-bold text-dark mb-3"><i class="bi bi-check-square-fill text-success me-2"></i>Checklist Pekerjaan Ringkas</h6>
      <div class="list-group list-group-flush">
        <div
          v-for="t in filteredTasks"
          :key="t.id"
          class="list-group-item d-flex justify-content-between align-items-center border-bottom py-2 bg-transparent"
        >
          <div class="d-flex align-items-center gap-2">
            <input type="checkbox" class="form-check-input style-checkbox" :checked="t.done" @change="toggleTaskDone(t.id)" />
            <span class="fw-semibold" :class="{ 'text-decoration-line-through text-muted': t.done }">{{ t.name }}</span>
          </div>
          <div class="d-flex align-items-center gap-2">
            <span class="badge rounded-pill px-2 py-0.5" :class="getCategoryBadgeClass(t.category)">
              {{ getCategoryLabel(t.category) }}
            </span>
            <span class="badge bg-light text-dark border small">{{ t.projectTag }}</span>
            <span class="text-muted small">{{ formatDate(t.deadline) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090;">
      <div v-if="toast.show" class="toast align-items-center text-white bg-success border-0 show shadow-lg rounded-3" role="alert">
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill fs-5"></i>
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
import * as XLSX from 'xlsx';

export default {
  name: 'TodoList',
  setup() {
    const store = useStore();

    const currentViewMode = ref('list');
    const searchQuery = ref('');
    const selectedCategory = ref('all');
    const showForm = ref(false);
    const formTab = ref('single'); // 'single' | 'bulk'
    const isEditing = ref(false);
    const editingId = ref(null);
    const selectedIds = ref([]);

    const toast = ref({ show: false, message: '' });

    const form = ref({
      name: '',
      category: 'Work',
      level: 'Menengah',
      projectTag: 'Umum',
      deadline: new Date().toISOString().split('T')[0],
      notes: '',
      recurring: 'none',
      statusColumn: 'todo',
      eisenhower: 'do_first',
      done: false
    });

    const formErrors = ref({});

    const bulkText = ref('');
    const bulkError = ref('');
    const bulkDefault = ref({
      category: 'Work',
      projectTag: 'Umum',
      level: 'Menengah',
      deadline: new Date().toISOString().split('T')[0]
    });

    const kanbanColumns = [
      { id: 'backlog', title: 'Backlog', badgeBg: 'bg-secondary text-white' },
      { id: 'todo', title: 'To Do', badgeBg: 'bg-primary text-white' },
      { id: 'in_progress', title: 'In Progress', badgeBg: 'bg-warning text-dark' },
      { id: 'done', title: 'Completed', badgeBg: 'bg-success text-white' }
    ];

    const tasks = computed(() => store.getters.getTasks);
    const completedCount = computed(() => tasks.value.filter(t => t.done || t.statusColumn === 'done').length);
    const pendingCount = computed(() => tasks.value.filter(t => !t.done && t.statusColumn !== 'done').length);
    const completionPercent = computed(() => {
      if (tasks.value.length === 0) return 0;
      return Math.round((completedCount.value / tasks.value.length) * 100);
    });

    const filteredTasks = computed(() => {
      return tasks.value.filter(t => {
        const query = searchQuery.value.toLowerCase();
        const matchesQuery = !query ||
          t.name.toLowerCase().includes(query) ||
          (t.projectTag && t.projectTag.toLowerCase().includes(query));

        const matchesCategory = selectedCategory.value === 'all' || (t.category || 'Work') === selectedCategory.value;

        return matchesQuery && matchesCategory;
      });
    });

    const isAllSelected = computed(() => {
      if (filteredTasks.value.length === 0) return false;
      return filteredTasks.value.every(t => selectedIds.value.includes(t.id));
    });

    const toggleSelectAll = () => {
      if (isAllSelected.value) {
        selectedIds.value = [];
      } else {
        selectedIds.value = filteredTasks.value.map(t => t.id);
      }
    };

    const getTasksInCol = (colId) => {
      return filteredTasks.value.filter(t => (t.statusColumn || 'todo') === colId);
    };

    const getTaskCountInCol = (colId) => {
      return getTasksInCol(colId).length;
    };

    const getEisenhowerTasks = (quadrant) => {
      return filteredTasks.value.filter(t => (t.eisenhower || 'do_first') === quadrant);
    };

    const timelineGroupedTasks = computed(() => {
      const groups = {};
      filteredTasks.value.forEach(t => {
        const dateKey = t.deadline || 'Tanpa Deadline';
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(t);
      });
      return groups;
    });

    const showToastMsg = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => (toast.value.show = false), 3000);
    };

    const toggleShowForm = () => {
      if (showForm.value) {
        showForm.value = false;
      } else {
        openAddModal();
      }
    };

    const openAddModal = () => {
      isEditing.value = false;
      editingId.value = null;
      formErrors.value = {};
      form.value = {
        name: '',
        level: 'Menengah',
        projectTag: 'Umum',
        deadline: new Date().toISOString().split('T')[0],
        notes: '',
        recurring: 'none',
        statusColumn: 'todo',
        eisenhower: 'do_first',
        done: false
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const openAddForCol = (colId) => {
      openAddModal();
      form.value.statusColumn = colId;
    };

    const editTask = (task) => {
      isEditing.value = true;
      editingId.value = task.id;
      formErrors.value = {};
      form.value = { ...task };
      formTab.value = 'single';
      showForm.value = true;
    };

    const saveTask = () => {
      formErrors.value = {};
      if (!form.value.name || !form.value.name.trim()) {
        formErrors.value.name = 'Nama tugas tidak boleh kosong!';
        return;
      }
      if (!form.value.deadline) {
        formErrors.value.deadline = 'Target deadline wajib diisi!';
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateTask', { ...form.value, id: editingId.value });
        showToastMsg('Tugas berhasil diperbarui!');
      } else {
        store.dispatch('addTask', form.value);
        showToastMsg('Tugas baru berhasil ditambahkan!');
      }
      showForm.value = false;
    };

    const saveBulkTasks = () => {
      bulkError.value = '';
      if (!bulkText.value || !bulkText.value.trim()) {
        bulkError.value = 'Silakan tuliskan minimal 1 nama tugas!';
        return;
      }

      const lines = bulkText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) {
        bulkError.value = 'Silakan tuliskan minimal 1 nama tugas valid!';
        return;
      }

      const tasksToAdd = lines.map(name => ({
        name,
        projectTag: bulkDefault.value.projectTag || 'Umum',
        level: bulkDefault.value.level || 'Menengah',
        deadline: bulkDefault.value.deadline || new Date().toISOString().split('T')[0],
        statusColumn: 'todo',
        done: false
      }));

      store.dispatch('addTasksBulk', tasksToAdd);
      showToastMsg(`Berhasil menambahkan ${lines.length} tugas sekaligus!`);
      bulkText.value = '';
      showForm.value = false;
    };

    const toggleTaskDone = (id) => {
      store.dispatch('toggleTask', id);
    };

    const moveTaskCol = (task, newCol) => {
      if (!newCol) return;
      store.dispatch('updateTaskStatus', { id: task.id, statusColumn: newCol });
      showToastMsg(`Status dipindah ke ${newCol}`);
    };

    const getPrevCol = (colId) => {
      if (colId === 'done') return 'in_progress';
      if (colId === 'in_progress') return 'todo';
      if (colId === 'todo') return 'backlog';
      return null;
    };

    const getNextCol = (colId) => {
      if (colId === 'backlog') return 'todo';
      if (colId === 'todo') return 'in_progress';
      if (colId === 'in_progress') return 'done';
      return null;
    };

    const removeTask = (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        store.dispatch('deleteTask', id);
        showToastMsg('Tugas dihapus.');
      }
    };

    const bulkDelete = () => {
      if (selectedIds.value.length === 0) return;
      if (confirm(`Hapus ${selectedIds.value.length} tugas terpilih?`)) {
        store.dispatch('deleteTasksBulk', selectedIds.value);
        showToastMsg(`${selectedIds.value.length} tugas berhasil dihapus.`);
        selectedIds.value = [];
      }
    };

    const bulkMarkDone = () => {
      if (selectedIds.value.length === 0) return;
      selectedIds.value.forEach(id => {
        const t = tasks.value.find(item => item.id === id);
        if (t && !t.done) {
          store.dispatch('toggleTask', id);
        }
      });
      showToastMsg(`${selectedIds.value.length} tugas ditandai selesai.`);
      selectedIds.value = [];
    };

    const clearCompleted = () => {
      if (confirm('Bersihkan semua tugas yang sudah selesai?')) {
        const completedIds = tasks.value.filter(t => t.done || t.statusColumn === 'done').map(t => t.id);
        store.dispatch('deleteTasksBulk', completedIds);
        showToastMsg('Tugas selesai berhasil dibersihkan.');
      }
    };

    const badgeClass = (level) => {
      switch (level) {
        case 'Penting':
          return 'bg-danger text-white';
        case 'Menengah':
          return 'bg-warning text-dark';
        default:
          return 'bg-secondary text-white';
      }
    };

    const getCategoryBadgeClass = (category) => {
      switch (category) {
        case 'Work':
          return 'bg-primary-subtle text-primary border border-primary-subtle';
        case 'Personal':
          return 'bg-purple-subtle text-purple border border-purple-subtle';
        case 'Urgent':
          return 'bg-danger text-white fw-bold shadow-sm';
        case 'Client':
          return 'bg-info-subtle text-info-emphasis border border-info-subtle';
        case 'Routine':
          return 'bg-success-subtle text-success border border-success-subtle';
        default:
          return 'bg-light text-dark border';
      }
    };

    const getCategoryLabel = (category) => {
      switch (category) {
        case 'Work': return '💼 Work';
        case 'Personal': return '🏠 Personal';
        case 'Urgent': return '🔥 Urgent';
        case 'Client': return '🤝 Client';
        case 'Routine': return '🔄 Routine';
        default: return category || '💼 Work';
      }
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '-';
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch (e) {
        return dateStr;
      }
    };

    const isOverdue = (dateStr, done) => {
      if (done || !dateStr) return false;
      return new Date(dateStr) < new Date(new Date().setHours(0, 0, 0, 0));
    };

    const exportToExcel = () => {
      const exportData = tasks.value.map((t, idx) => ({
        No: idx + 1,
        NamaTugas: t.name,
        Kategori: t.category || 'Work',
        ProyekTag: t.projectTag || 'Umum',
        Prioritas: t.level,
        Recurring: t.recurring || 'none',
        KolomStatus: t.statusColumn || 'todo',
        Deadline: t.deadline,
        Status: t.done ? 'Selesai' : 'Pending',
        Catatan: t.notes || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Tugas');
      XLSX.writeFile(workbook, 'daftar_tugas_freelance.xlsx');
      showToastMsg('File Excel daftar tugas berhasil diunduh!');
    };

    return {
      currentViewMode,
      kanbanColumns,
      searchQuery,
      selectedCategory,
      tasks,
      filteredTasks,
      completedCount,
      pendingCount,
      completionPercent,
      getTasksInCol,
      getTaskCountInCol,
      getEisenhowerTasks,
      timelineGroupedTasks,
      showForm,
      formTab,
      isEditing,
      form,
      formErrors,
      bulkText,
      bulkError,
      bulkDefault,
      selectedIds,
      isAllSelected,
      toggleSelectAll,
      toast,
      getCategoryBadgeClass,
      getCategoryLabel,
      toggleShowForm,
      openAddModal,
      openAddForCol,
      editTask,
      saveTask,
      saveBulkTasks,
      toggleTaskDone,
      moveTaskCol,
      getPrevCol,
      getNextCol,
      removeTask,
      bulkDelete,
      bulkMarkDone,
      clearCompleted,
      badgeClass,
      formatDate,
      isOverdue,
      exportToExcel
    };
  }
};
</script>

<style scoped>
.style-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.style-mini {
  font-size: 10px;
}

.min-vh-25 {
  min-height: 200px;
}

.hover-card {
  transition: transform 0.15s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
}
</style>

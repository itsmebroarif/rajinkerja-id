<template>
  <div class="container-fluid p-3 p-md-4" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-primary-subtle text-primary fw-bold px-3 py-2 rounded-pill">RajinKerja Notes & Docs</span>
          <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill d-flex align-items-center gap-1">
            <span class="pulse-dot bg-success"></span> Auto-Save Active
          </span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">📝 Notes, Scratchpad & Bulk Documenter</h2>
        <p class="text-muted mb-0">Kelola catatan harian, dokumentasi proyek, dan coretan ide karyawan dengan auto-save interval otomatis.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button
          class="btn px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 border"
          :class="activeMode === 'scratchpad' ? 'btn-warning text-dark shadow-sm' : 'btn-light text-dark'"
          @click="toggleMode('scratchpad')"
        >
          <i class="bi bi-sticky-fill fs-5 text-warning"></i>
          <span>Quick Scratchpad</span>
        </button>
        <button
          class="btn px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 border"
          :class="activeMode === 'editor' ? 'btn-primary text-white shadow-sm' : 'btn-light text-dark'"
          @click="toggleMode('editor')"
        >
          <i class="bi bi-pencil-square fs-5"></i>
          <span>{{ isEditing ? 'Edit Note Inline' : 'Buat Note Baru' }}</span>
        </button>
        <button
          class="btn px-3 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 border"
          :class="activeMode === 'bulk' ? 'btn-success text-white shadow-sm' : 'btn-light text-dark'"
          @click="toggleMode('bulk')"
        >
          <i class="bi bi-ui-checks-grid fs-5"></i>
          <span>Bulk Multi-Form Input</span>
        </button>
      </div>
    </div>

    <!-- QUICK SCRATCHPAD PANEL (Auto-saves continuously every 2s) -->
    <div v-if="activeMode === 'scratchpad'" class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 border-start border-4 border-warning">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom gap-2">
        <div>
          <h5 class="fw-bold text-dark mb-0">
            <i class="bi bi-sticky-fill text-warning me-2"></i>Quick Scratchpad (Coretan Serbaguna)
          </h5>
          <small class="text-muted">Tulis ide cepat, nomor kontak, atau snippet. Otomatis tersimpan ke browser (localStorage) setiap 2 detik.</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="toggleScratchpadWidescreen">
            <i class="bi" :class="isScratchpadWidescreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'"></i> {{ isScratchpadWidescreen ? 'Tampilan Standar' : 'Preview Luas' }}
          </button>
          <div class="d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border small">
            <i class="bi bi-floppy-fill text-success" :class="{ 'spin-icon': isAutoSavingScratchpad }"></i>
            <span class="fw-semibold text-dark">{{ scratchpadSaveStatus }}</span>
          </div>
          <button type="button" class="btn btn-sm btn-outline-danger rounded-pill px-3" @click="clearScratchpad" v-if="scratchpadContent">
            <i class="bi bi-eraser me-1"></i> Bersihkan
          </button>
          <button type="button" class="btn btn-sm btn-light rounded-circle" @click="activeMode = 'list'">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <div class="row g-3">
        <div :class="isScratchpadWidescreen ? 'col-md-6' : 'col-md-7'">
          <textarea
            class="form-control font-monospace border-2 p-3 rounded-3"
            :rows="isScratchpadWidescreen ? 16 : 8"
            v-model="scratchpadContent"
            @input="handleScratchpadInput"
            placeholder="Tulis coretan sementara di sini...&#10;- Ide produk baru&#10;- No WA Klien: 0812-3456-xxxx&#10;- Script SQL / Command terminal&#10;&#10;Isi ini tersimpan otomatis tanpa perlu tombol simpan!"
          ></textarea>
        </div>
        <div :class="isScratchpadWidescreen ? 'col-md-6' : 'col-md-5'">
          <div class="card p-3 rounded-3 border bg-light h-100">
            <h6 class="fw-bold text-dark mb-2"><i class="bi bi-eye me-1"></i> Live Markdown Preview</h6>
            <div class="markdown-preview small text-dark overflow-auto flex-grow-1" :style="{ maxHeight: isScratchpadWidescreen ? '360px' : '180px' }" v-html="renderMarkdown(scratchpadContent)"></div>
            <div class="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
              <span class="small text-muted">{{ scratchpadContent.length }} karakter</span>
              <button class="btn btn-xs btn-primary rounded-pill px-3" @click="convertScratchpadToNote" v-if="scratchpadContent.trim()">
                <i class="bi bi-arrow-right-circle me-1"></i> Ubah Jadi Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- INLINE EDITOR PANEL (No Modal!) -->
    <div v-if="activeMode === 'editor'" class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 transition-all">
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <h5 class="fw-bold text-dark mb-0">
            <i class="bi" :class="isEditing ? 'bi-pencil-fill text-warning' : 'bi-plus-circle-fill text-primary'"></i>
            {{ isEditing ? 'Edit Note' : 'Tulis Note / Scratchpad Baru' }}
          </h5>
          <span v-if="draftSaved" class="badge bg-success-subtle text-success small rounded-pill px-2 py-1">
            <i class="bi bi-cloud-check me-1"></i>Draft Tersimpan Otomatis
          </span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="toggleEditorWidescreen">
            <i class="bi" :class="isEditorWidescreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'"></i> {{ isEditorWidescreen ? 'Tampilan Standar' : 'Preview Luas' }}
          </button>
          <button v-if="form.title || form.content" type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="resetEditorForm">
            <i class="bi bi-x-circle me-1"></i> Bersihkan Draft
          </button>
          <button type="button" class="btn btn-sm btn-light rounded-circle" @click="activeMode = 'list'">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <form @submit.prevent="saveNote" class="row g-3">
        <div class="col-md-7 col-lg-8">
          <label class="form-label small fw-bold text-dark">Judul Catatan / Dokumen <span class="text-danger">*</span></label>
          <input
            type="text"
            class="form-control form-control-lg border-2 shadow-none fs-6"
            v-model="form.title"
            @input="onFormInput"
            placeholder="Contoh: Checklist Meeting Proyek & KPI Q3"
            required
          />
        </div>

        <div class="col-md-5 col-lg-4">
          <label class="form-label small fw-bold text-dark">Warna Tema Sticky Note</label>
          <div class="d-flex gap-2 pt-1">
            <button
              type="button"
              v-for="c in colorOptions"
              :key="c.code"
              class="btn rounded-3 p-0 flex-grow-1 color-selector-btn"
              :style="{ backgroundColor: c.code }"
              :class="{ 'active-color-ring': form.color === c.code }"
              @click="selectColor(c.code)"
              :title="c.name"
            >
              <i v-if="form.color === c.code" class="bi bi-check-lg text-dark fw-bold"></i>
            </button>
          </div>
        </div>

        <!-- Markdown Editor Side-by-Side Live Preview -->
        <div class="col-md-6">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label class="form-label small fw-bold text-dark mb-0">Teks Markdown Editor</label>
            <span class="small text-muted">{{ form.content.length }} Karakter | {{ getWordCount(form.content) }} Kata</span>
          </div>
          <textarea
            class="form-control font-monospace border-2 p-3"
            :rows="isEditorWidescreen ? 18 : 9"
            v-model="form.content"
            @input="onFormInput"
            placeholder="Ketik dengan format Markdown...&#10;# Judul Sesi&#10;- [x] Tugas 1&#10;- [ ] Tugas 2&#10;**Penting:** Target selesai hari ini."
          ></textarea>
        </div>

        <div class="col-md-6">
          <label class="form-label small fw-bold text-dark mb-1">Live Preview Markdown</label>
          <div class="card p-3 rounded-3 border-2 bg-light h-100 overflow-auto preview-box" :style="{ maxHeight: isEditorWidescreen ? '430px' : '230px' }">
            <div class="markdown-preview small text-dark" v-html="renderMarkdown(form.content)"></div>
          </div>
        </div>

        <div class="col-12 d-flex justify-content-end gap-2 pt-3 border-top">
          <button type="button" class="btn btn-light rounded-3 px-4 fw-semibold" @click="activeMode = 'list'">Tutup Editor</button>
          <button type="submit" class="btn btn-primary rounded-3 px-4 py-2 fw-bold shadow-sm">
            <i class="bi bi-check-circle-fill me-1"></i> {{ isEditing ? 'Update Catatan' : 'Simpan ke Local Database' }}
          </button>
        </div>
      </form>
    </div>

    <!-- BULK MULTI-FORM INPUT PANEL (Insert Form yang Banyak) -->
    <div v-if="activeMode === 'bulk'" class="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4 transition-all">
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h5 class="fw-bold text-dark mb-0"><i class="bi bi-ui-checks-grid text-success me-2"></i>Bulk Form Multi-Input Note</h5>
          <small class="text-muted">Tambahkan banyak form note sekaligus tanpa reload halaman.</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="addBulkRow">
            <i class="bi bi-plus-lg me-1"></i> Tambah 1 Baris Form Lagi
          </button>
          <button class="btn btn-sm btn-outline-secondary rounded-pill px-3" @click="addMultipleRows(3)">
            <i class="bi bi-plus-circle me-1"></i> +3 Baris
          </button>
          <button type="button" class="btn btn-sm btn-light rounded-circle" @click="activeMode = 'list'">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>

      <!-- Bulk Form Mode Switcher -->
      <div class="d-flex gap-2 mb-3">
        <button
          class="btn btn-sm rounded-pill px-3"
          :class="bulkTab === 'rows' ? 'btn-dark' : 'btn-outline-secondary'"
          @click="bulkTab = 'rows'"
        >
          <i class="bi bi-list-task me-1"></i> Multi-Form Builder ({{ bulkRows.length }} Card)
        </button>
        <button
          class="btn btn-sm rounded-pill px-3"
          :class="bulkTab === 'paste' ? 'btn-dark' : 'btn-outline-secondary'"
          @click="bulkTab = 'paste'"
        >
          <i class="bi bi-file-earmark-text me-1"></i> Quick Paste Delimited
        </button>
      </div>

      <!-- Tab 1: Multi-Form Builder Cards -->
      <div v-if="bulkTab === 'rows'">
        <div class="row g-3">
          <div v-for="(row, idx) in bulkRows" :key="idx" class="col-md-6 col-lg-4">
            <div class="card border p-3 rounded-3 bg-light position-relative">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-dark text-white rounded-pill px-2 py-1 small">Form Note #{{ idx + 1 }}</span>
                <button
                  type="button"
                  class="btn btn-xs btn-outline-danger border-0 p-0 rounded-circle"
                  @click="removeBulkRow(idx)"
                  v-if="bulkRows.length > 1"
                  title="Hapus baris form ini"
                >
                  <i class="bi bi-x-circle-fill fs-6"></i>
                </button>
              </div>

              <input
                type="text"
                class="form-control form-control-sm mb-2 fw-semibold"
                v-model="row.title"
                placeholder="Judul Catatan..."
              />

              <textarea
                class="form-control form-control-sm mb-2 font-monospace"
                rows="4"
                v-model="row.content"
                placeholder="Isi catatan (Markdown supported)..."
              ></textarea>

              <div class="d-flex align-items-center justify-content-between pt-1">
                <span class="small fw-semibold text-muted">Warna:</span>
                <div class="d-flex gap-1">
                  <button
                    type="button"
                    v-for="c in colorOptions"
                    :key="c.code"
                    class="btn rounded-circle p-0"
                    :style="{ backgroundColor: c.code, width: '20px', height: '20px' }"
                    :class="{ 'border border-2 border-dark': row.color === c.code }"
                    @click="row.color = c.code"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top gap-2">
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary rounded-3" @click="addBulkRow">
              <i class="bi bi-plus-lg me-1"></i> Tambah Baris Form
            </button>
            <button class="btn btn-sm btn-outline-secondary rounded-3" @click="addMultipleRows(5)">
              <i class="bi bi-plus-square me-1"></i> +5 Baris Sekaligus
            </button>
          </div>
          <button class="btn btn-success px-4 py-2 rounded-3 fw-bold shadow-sm" @click="saveBulkRows">
            <i class="bi bi-check-all me-1"></i> Simpan Semua Note ({{ validBulkRowsCount }} Valid)
          </button>
        </div>
      </div>

      <!-- Tab 2: Quick Delimited Paste -->
      <div v-else>
        <div class="alert alert-info small py-2 px-3 rounded-3 mb-2">
          Format paste: Pisahkan antar catatan menggunakan tanda <code>---</code> pada baris tersendiri. Baris pertama dari setiap blok akan dijadikan Judul.
        </div>
        <textarea
          class="form-control font-monospace border-2 mb-3"
          rows="8"
          v-model="bulkPasteText"
          placeholder="Judul Catatan 1&#10;- Poin 1&#10;- Poin 2&#10;---&#10;Judul Catatan 2&#10;Isi ringkas catatan kedua..."
        ></textarea>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-light rounded-3 px-3" @click="bulkPasteText = ''">Bersihkan</button>
          <button class="btn btn-success rounded-3 px-4 py-2 fw-bold" @click="processBulkPaste">
            <i class="bi bi-file-earmark-plus me-1"></i> Import & Simpan Catatan
          </button>
        </div>
      </div>
    </div>

    <!-- SEARCH & FILTER BAR -->
    <div class="bg-white p-3 rounded-4 shadow-sm border mb-4">
      <div class="row g-3 align-items-center">
        <div class="col-md-5">
          <div class="input-group">
            <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control bg-light border-start-0 ps-0"
              placeholder="Cari judul atau kata kunci catatan..."
              v-model="searchQuery"
            />
            <button v-if="searchQuery" class="btn btn-light border" @click="searchQuery = ''">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <div class="col-md-7 d-flex align-items-center justify-content-md-end gap-2 overflow-auto">
          <span class="small fw-semibold text-muted d-none d-sm-inline">Filter:</span>
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

      <!-- Bulk Selection Toolbar -->
      <div v-if="selectedIds.length > 0" class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center bg-primary-subtle p-2 rounded-3">
        <span class="small fw-bold text-primary">
          <i class="bi bi-check-square-fill me-1"></i> {{ selectedIds.length }} catatan terpilih
        </span>
        <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDeleteSelected">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
      </div>
    </div>

    <!-- NOTES GRID -->
    <div class="row g-3" v-if="filteredNotes.length > 0">
      <div v-for="note in filteredNotes" :key="note.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 p-4 hover-card position-relative" :style="{ backgroundColor: note.color || '#fef08a' }">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div class="d-flex align-items-center gap-2">
              <input type="checkbox" class="form-check-input mt-0 cursor-pointer" :value="note.id" v-model="selectedIds" />
              <h5 class="fw-bold text-dark mb-0 text-break">{{ note.title || 'Untitled Note' }}</h5>
            </div>
            <div class="d-flex gap-1">
              <button class="btn btn-xs btn-light rounded-circle shadow-sm" @click="openWidePreview(note)" title="Preview Luas">
                <i class="bi bi-arrows-angle-expand"></i>
              </button>
              <button class="btn btn-xs btn-light rounded-circle shadow-sm" @click="copyNoteContent(note.content)" title="Salin Isi Catatan">
                <i class="bi bi-clipboard"></i>
              </button>
              <button class="btn btn-xs btn-light rounded-circle shadow-sm" @click="editNoteInline(note)" title="Edit Note">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-xs btn-light text-danger rounded-circle shadow-sm" @click="deleteNoteDirect(note.id)" title="Hapus Note">
                <i class="bi bi-trash-fill"></i>
              </button>
            </div>
          </div>

          <!-- Live Rendered Markdown Content -->
          <div class="markdown-preview text-dark small flex-grow-1 my-2 border-top border-bottom py-2 overflow-hidden" style="max-height: 200px;" v-html="renderMarkdown(note.content)"></div>

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
      <p class="text-muted">Buat note pertama Anda atau gunakan fitur Bulk Multi-Form untuk menambah banyak catatan sekaligus.</p>
      <div class="d-flex justify-content-center gap-2 mt-3">
        <button class="btn btn-primary rounded-3 px-4 py-2 fw-semibold" @click="toggleMode('editor')">
          <i class="bi bi-plus-lg me-1"></i> Buat Note Baru
        </button>
        <button class="btn btn-success rounded-3 px-4 py-2 fw-semibold" @click="toggleMode('bulk')">
          <i class="bi bi-ui-checks-grid me-1"></i> Bulk Form Input
        </button>
      </div>
    </div>

    <!-- WIDE PREVIEW MODAL FOR STICKY NOTES -->
    <transition name="overlay-fade">
      <div v-if="selectedPreviewNote" class="wide-preview-backdrop" @click="closeWidePreview">
        <div class="wide-preview-modal bg-white shadow-lg rounded-4 border p-4" :style="{ borderTop: '8px solid ' + (selectedPreviewNote.color || '#fef08a') + ' !important' }" @click.stop>
          <div class="d-flex justify-content-between align-items-start mb-3 pb-2 border-bottom">
            <div>
              <span class="badge bg-secondary text-white rounded-pill px-3 py-1 small mb-1">
                <i class="bi bi-file-earmark-text me-1"></i> Preview Detail Catatan
              </span>
              <h3 class="fw-bold text-dark mb-0">{{ selectedPreviewNote.title || 'Untitled Note' }}</h3>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-light border px-3 rounded-pill" @click="copyNoteContent(selectedPreviewNote.content)">
                <i class="bi bi-clipboard me-1"></i> Salin Teks
              </button>
              <button class="btn btn-sm btn-light text-primary border px-3 rounded-pill" @click="editNoteFromPreview(selectedPreviewNote)">
                <i class="bi bi-pencil-fill me-1"></i> Edit
              </button>
              <button class="btn btn-sm btn-light rounded-circle p-2" @click="closeWidePreview" title="Tutup">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="row g-4 flex-grow-1 overflow-hidden" style="max-height: calc(80vh - 120px);">
            <!-- Left Side: Rendered Markdown -->
            <div class="col-md-7 d-flex flex-column h-100">
              <span class="fw-bold text-muted small mb-2"><i class="bi bi-eye-fill text-primary"></i> Live Rendered Markdown</span>
              <div class="card p-4 rounded-3 bg-light overflow-auto flex-grow-1 border-0" style="max-height: 480px; min-height: 350px;">
                <div class="markdown-preview text-dark" v-html="renderMarkdown(selectedPreviewNote.content)"></div>
              </div>
            </div>
            <!-- Right Side: Metadata & Statistics -->
            <div class="col-md-5 d-flex flex-column justify-content-between h-100">
              <div>
                <span class="fw-bold text-muted small d-block mb-2"><i class="bi bi-info-circle-fill text-info"></i> Informasi Catatan</span>
                <div class="p-3 bg-light rounded-3 mb-3 border">
                  <div class="d-flex justify-content-between mb-2 pb-1 border-bottom">
                    <span class="text-muted">Karakter</span>
                    <strong class="text-dark">{{ selectedPreviewNote.content ? selectedPreviewNote.content.length : 0 }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2 pb-1 border-bottom">
                    <span class="text-muted">Kata</span>
                    <strong class="text-dark">{{ getWordCount(selectedPreviewNote.content) }}</strong>
                  </div>
                  <div class="d-flex justify-content-between mb-2 pb-1 border-bottom">
                    <span class="text-muted">Terakhir Diperbarui</span>
                    <strong class="text-dark">{{ formatDate(selectedPreviewNote.updatedAt) }}</strong>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="text-muted">Warna Sticky Note</span>
                    <span class="badge px-3 py-1.5 rounded-pill border" :style="{ backgroundColor: selectedPreviewNote.color || '#fef08a', color: '#000' }">
                      {{ getColorName(selectedPreviewNote.color) }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="d-flex gap-2 border-top pt-3">
                <button class="btn btn-outline-danger w-100 py-2.5 rounded-3 fw-bold" @click="deleteNoteFromPreview(selectedPreviewNote.id)">
                  <i class="bi bi-trash-fill me-1"></i> Hapus Catatan
                </button>
                <button class="btn btn-secondary w-100 py-2.5 rounded-3 fw-bold" @click="closeWidePreview">
                  Tutup Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

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
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useStore } from 'vuex';
import { marked } from 'marked';

const DRAFT_KEY = 'rk_note_draft';
const SCRATCHPAD_KEY = 'rk_quick_scratchpad';

export default {
  name: 'StickyNotesView',
  setup() {
    const store = useStore();

    const activeMode = ref('list'); // 'list', 'editor', 'bulk', 'scratchpad'
    const isEditing = ref(false);
    const editingId = ref(null);
    const draftSaved = ref(false);
    const lastSavedTime = ref('');
    const selectedIds = ref([]);
    const selectedPreviewNote = ref(null);
    const isScratchpadWidescreen = ref(false);
    const isEditorWidescreen = ref(false);

    // Quick Scratchpad Auto-save state
    const scratchpadContent = ref('');
    const scratchpadSaveStatus = ref('Otomatis tersimpan');
    const isAutoSavingScratchpad = ref(false);
    let scratchpadTimer = null;
    let noteDraftTimer = null;

    const toast = ref({ show: false, message: '' });

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

    // Bulk rows builder
    const bulkTab = ref('rows'); // 'rows', 'paste'
    const bulkRows = ref([
      { title: '', content: '', color: '#fef08a' },
      { title: '', content: '', color: '#bae6fd' },
      { title: '', content: '', color: '#bbf7d0' }
    ]);
    const bulkPasteText = ref('');

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

    const showToast = (msg) => {
      toast.value.message = msg;
      toast.value.show = true;
      setTimeout(() => {
        toast.value.show = false;
      }, 3000);
    };

    // Auto-load draft & scratchpad from localStorage on mount
    onMounted(() => {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.title || parsed.content) {
            form.value = parsed;
            draftSaved.value = true;
            lastSavedTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
        }

        const savedScratchpad = localStorage.getItem(SCRATCHPAD_KEY);
        if (savedScratchpad !== null) {
          scratchpadContent.value = savedScratchpad;
        } else {
          scratchpadContent.value = '';
        }
      } catch (e) {
        console.error('Failed to load storage:', e);
      }
    });

    onUnmounted(() => {
      if (scratchpadTimer) clearTimeout(scratchpadTimer);
      if (noteDraftTimer) clearTimeout(noteDraftTimer);
    });

    // Auto-save scratchpad logic with debounced timer
    const handleScratchpadInput = () => {
      scratchpadSaveStatus.value = 'Menyimpan...';
      isAutoSavingScratchpad.value = true;

      if (scratchpadTimer) clearTimeout(scratchpadTimer);

      scratchpadTimer = setTimeout(() => {
        try {
          localStorage.setItem(SCRATCHPAD_KEY, scratchpadContent.value);
          const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          scratchpadSaveStatus.value = `Tersimpan ${nowStr}`;
          isAutoSavingScratchpad.value = false;
        } catch (err) {
          scratchpadSaveStatus.value = 'Gagal menyimpan';
          isAutoSavingScratchpad.value = false;
        }
      }, 1500); // 1.5 seconds auto-save interval
    };

    const clearScratchpad = () => {
      if (confirm('Apakah Anda yakin ingin membersihkan seluruh coretan scratchpad? Coretan yang dihapus tidak dapat dikembalikan.')) {
        scratchpadContent.value = '';
        localStorage.removeItem(SCRATCHPAD_KEY);
        scratchpadSaveStatus.value = 'Scratchpad dibersihkan';
        showToast('Quick Scratchpad berhasil dibersihkan.');
      }
    };

    const convertScratchpadToNote = () => {
      if (!scratchpadContent.value.trim()) return;
      const lines = scratchpadContent.value.split('\n');
      const title = lines[0].replace(/^#+\s*/, '').trim() || 'Note dari Scratchpad';
      const content = scratchpadContent.value;

      form.value = {
        title,
        content,
        color: '#fef08a'
      };
      isEditing.value = false;
      activeMode.value = 'editor';
      showToast('Scratchpad dipindahkan ke Editor Note!');
    };

    // Auto-save note form on input
    const onFormInput = () => {
      if (!isEditing.value) {
        if (noteDraftTimer) clearTimeout(noteDraftTimer);
        noteDraftTimer = setTimeout(() => {
          localStorage.setItem(DRAFT_KEY, JSON.stringify(form.value));
          draftSaved.value = true;
          lastSavedTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }, 1200);
      }
    };

    const toggleMode = (mode) => {
      if (activeMode.value === mode) {
        activeMode.value = 'list';
      } else {
        activeMode.value = mode;
        if (mode === 'editor' && !isEditing.value && !form.value.title && !form.value.content) {
          form.value = {
            title: '',
            content: '# Catatan Baru\n\n- [ ] Checklist tugas 1\n- [ ] Checklist tugas 2',
            color: '#fef08a'
          };
        }
      }
    };

    const selectColor = (code) => {
      form.value.color = code;
      onFormInput();
    };

    const resetEditorForm = () => {
      form.value = {
        title: '',
        content: '',
        color: '#fef08a'
      };
      isEditing.value = false;
      editingId.value = null;
      localStorage.removeItem(DRAFT_KEY);
      draftSaved.value = false;
      showToast('Draft dibersihkan.');
    };

    const editNoteInline = (note) => {
      isEditing.value = true;
      editingId.value = note.id;
      form.value = { ...note };
      activeMode.value = 'editor';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const saveNote = () => {
      if (!form.value.title || !form.value.title.trim()) {
        showToast('Judul catatan tidak boleh kosong.');
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateNote', { ...form.value, id: editingId.value });
        showToast('Note berhasil diperbarui!');
      } else {
        store.dispatch('addNote', form.value);
        showToast('Note baru berhasil disimpan!');
      }

      localStorage.removeItem(DRAFT_KEY);
      draftSaved.value = false;
      form.value = { title: '', content: '', color: '#fef08a' };
      isEditing.value = false;
      editingId.value = null;
      activeMode.value = 'list';
    };

    const deleteNoteDirect = (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
        store.dispatch('deleteNote', id);
        showToast('Catatan berhasil dihapus.');
      }
    };

    const bulkDeleteSelected = () => {
      if (selectedIds.value.length === 0) return;
      if (confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.value.length} catatan terpilih?`)) {
        store.dispatch('deleteNotesBulk', selectedIds.value);
        showToast(`${selectedIds.value.length} catatan dihapus.`);
        selectedIds.value = [];
      }
    };

    // Bulk Rows Logic
    const addBulkRow = () => {
      const colors = ['#fef08a', '#bae6fd', '#bbf7d0', '#fbcfe8', '#e9d5ff'];
      const nextColor = colors[bulkRows.value.length % colors.length];
      bulkRows.value.push({ title: '', content: '', color: nextColor });
    };

    const addMultipleRows = (count) => {
      for (let i = 0; i < count; i++) {
        addBulkRow();
      }
    };

    const removeBulkRow = (idx) => {
      bulkRows.value.splice(idx, 1);
    };

    const validBulkRowsCount = computed(() => {
      return bulkRows.value.filter(r => r.title && r.title.trim()).length;
    });

    const saveBulkRows = () => {
      const validRows = bulkRows.value.filter(r => r.title && r.title.trim());
      if (validRows.length === 0) {
        showToast('Mohon isi minimal 1 Judul Catatan pada form bulk.');
        return;
      }

      store.dispatch('addNotesBulk', validRows);
      showToast(`${validRows.length} catatan baru berhasil ditambahkan!`);

      // Reset bulk rows
      bulkRows.value = [
        { title: '', content: '', color: '#fef08a' },
        { title: '', content: '', color: '#bae6fd' },
        { title: '', content: '', color: '#bbf7d0' }
      ];
      activeMode.value = 'list';
    };

    const processBulkPaste = () => {
      if (!bulkPasteText.value || !bulkPasteText.value.trim()) {
        showToast('Teks paste kosong.');
        return;
      }

      const blocks = bulkPasteText.value.split(/^---$/m).map(b => b.trim()).filter(b => b.length > 0);
      if (blocks.length === 0) {
        showToast('Format paste tidak valid.');
        return;
      }

      const colors = ['#fef08a', '#bae6fd', '#bbf7d0', '#fbcfe8', '#e9d5ff'];
      const notesToInsert = blocks.map((block, idx) => {
        const lines = block.split('\n');
        const title = lines[0].replace(/^#+\s*/, '').trim() || `Catatan Import #${idx + 1}`;
        const content = lines.slice(1).join('\n').trim() || lines[0];
        return {
          title,
          content,
          color: colors[idx % colors.length]
        };
      });

      store.dispatch('addNotesBulk', notesToInsert);
      showToast(`${notesToInsert.length} catatan berhasil di-import dari paste!`);
      bulkPasteText.value = '';
      activeMode.value = 'list';
    };

    const copyNoteContent = (content) => {
      if (!content) return;
      navigator.clipboard.writeText(content).then(() => {
        showToast('Isi catatan berhasil disalin ke clipboard!');
      }).catch(() => {
        showToast('Gagal menyalin teks.');
      });
    };

    const renderMarkdown = (text) => {
      if (!text) return '<em class="text-muted">Preview teks markdown...</em>';
      try {
        return marked.parse(text);
      } catch (e) {
        return text;
      }
    };

    const getWordCount = (str) => {
      if (!str) return 0;
      return str.trim().split(/\s+/).filter(Boolean).length;
    };

    const getNotesCountByColor = (colorCode) => {
      return notes.value.filter(n => n.color === colorCode).length;
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

    const openWidePreview = (note) => {
      selectedPreviewNote.value = note;
    };

    const closeWidePreview = () => {
      selectedPreviewNote.value = null;
    };

    const toggleScratchpadWidescreen = () => {
      isScratchpadWidescreen.value = !isScratchpadWidescreen.value;
    };

    const toggleEditorWidescreen = () => {
      isEditorWidescreen.value = !isEditorWidescreen.value;
    };

    const editNoteFromPreview = (note) => {
      closeWidePreview();
      editNoteInline(note);
    };

    const deleteNoteFromPreview = (id) => {
      closeWidePreview();
      deleteNoteDirect(id);
    };

    const getColorName = (code) => {
      const found = colorOptions.find(c => c.code === code);
      return found ? found.name : 'Kuning';
    };

    return {
      notes,
      filteredNotes,
      colorOptions,
      activeMode,
      isEditing,
      form,
      draftSaved,
      lastSavedTime,
      selectedIds,
      toast,
      bulkTab,
      bulkRows,
      bulkPasteText,
      searchQuery,
      selectedColor,
      validBulkRowsCount,
      scratchpadContent,
      scratchpadSaveStatus,
      isAutoSavingScratchpad,
      handleScratchpadInput,
      clearScratchpad,
      convertScratchpadToNote,
      toggleMode,
      selectColor,
      onFormInput,
      resetEditorForm,
      editNoteInline,
      saveNote,
      deleteNoteDirect,
      bulkDeleteSelected,
      addBulkRow,
      addMultipleRows,
      removeBulkRow,
      saveBulkRows,
      processBulkPaste,
      copyNoteContent,
      renderMarkdown,
      getWordCount,
      getNotesCountByColor,
      formatDate,
      selectedPreviewNote,
      isScratchpadWidescreen,
      isEditorWidescreen,
      openWidePreview,
      closeWidePreview,
      toggleScratchpadWidescreen,
      toggleEditorWidescreen,
      editNoteFromPreview,
      deleteNoteFromPreview,
      getColorName
    };
  }
};
</script>

<style scoped>
.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  animation: pulseDot 1.8s infinite ease-in-out;
}

@keyframes pulseDot {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

.spin-icon {
  animation: spinIcon 1s linear infinite;
}

@keyframes spinIcon {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.color-selector-btn {
  height: 36px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.color-selector-btn:hover {
  transform: translateY(-2px);
}

.active-color-ring {
  border-color: #0f172a !important;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.2);
}

.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08) !important;
}

.style-footer {
  font-size: 11px;
}

.cursor-pointer {
  cursor: pointer;
}

.markdown-preview :deep(h1), .markdown-preview :deep(h2), .markdown-preview :deep(h3) {
  font-size: 1.05rem;
  font-weight: 700;
  margin-top: 0.4rem;
  margin-bottom: 0.4rem;
}

.markdown-preview :deep(ul), .markdown-preview :deep(ol) {
  padding-left: 1.2rem;
  margin-bottom: 0.4rem;
}

/* WIDE PREVIEW MODAL STYLES */
.wide-preview-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  z-index: 1070;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.wide-preview-modal {
  width: 960px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-surface, #ffffff) !important;
  color: var(--text-main, #0f172a) !important;
  border-color: var(--border-color, #e2e8f0) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.dark-theme .wide-preview-modal {
  background-color: var(--bg-surface, #131b2e) !important;
  border-color: var(--border-color, #1e293b) !important;
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

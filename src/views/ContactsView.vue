<template>
  <div class="container-fluid p-0" data-aos="fade-up">
    <!-- Header Banner -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
      <div>
        <div class="d-flex align-items-center gap-2 mb-1">
          <span class="badge bg-info-subtle text-info fw-semibold px-3 py-2 rounded-pill">Client Database</span>
        </div>
        <h2 class="fw-bold mb-1 text-dark">👥 Contact & Client Management</h2>
        <p class="text-muted mb-0">Kelola riwayat kontak klien, email, alamat, dan status relasi bisnis Anda.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-outline-success px-3 py-2 rounded-3 fw-semibold" @click="exportToExcel">
          <i class="bi bi-file-earmark-excel-fill me-1 text-success"></i> Export Excel (.xlsx)
        </button>
        <button
          class="btn btn-primary px-4 py-2 rounded-3 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          @click="toggleShowForm"
        >
          <i :class="showForm ? 'bi bi-x-lg' : 'bi bi-person-plus-fill'" class="fs-5"></i>
          <span>{{ showForm ? 'Tutup Form' : 'Tambah / Bulk Klien' }}</span>
        </button>
      </div>
    </div>

    <!-- Inline Form Panel (Single / Bulk Input) -->
    <div v-if="showForm" class="card border-0 shadow-lg rounded-4 mb-4 bg-white border-start border-4 border-info">
      <div class="card-header bg-transparent border-bottom p-4 d-flex justify-content-between align-items-center">
        <div class="btn-group" role="group">
          <button
            class="btn btn-sm px-3 py-1 fw-semibold"
            :class="formTab === 'single' ? 'btn-info text-white' : 'btn-outline-info'"
            @click="formTab = 'single'"
          >
            <i class="bi bi-person-lines-fill me-1"></i> Input Tunggal {{ isEditing ? '(Edit)' : '' }}
          </button>
          <button
            v-if="!isEditing"
            class="btn btn-sm px-3 py-1 fw-semibold"
            :class="formTab === 'bulk' ? 'btn-info text-white' : 'btn-outline-info'"
            @click="formTab = 'bulk'"
          >
            <i class="bi bi-file-earmark-spreadsheet me-1"></i> Bulk Input (Banyak Klien)
          </button>
        </div>
        <button type="button" class="btn-close" @click="showForm = false"></button>
      </div>

      <div class="card-body p-4">
        <!-- SINGLE FORM -->
        <form v-if="formTab === 'single'" @submit.prevent="saveContact">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Nama Lengkap / PIC <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                :class="{ 'is-invalid': formErrors.name }"
                v-model="form.name"
                placeholder="Contoh: Budi Santoso"
              />
              <div class="invalid-feedback" v-if="formErrors.name">{{ formErrors.name }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nama Perusahaan / Organisasi</label>
              <input type="text" class="form-control" v-model="form.company" placeholder="Contoh: PT Teknologi Nusantara" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Alamat Email</label>
              <input
                type="email"
                class="form-control"
                :class="{ 'is-invalid': formErrors.email }"
                v-model="form.email"
                placeholder="client@perusahaan.com"
              />
              <div class="invalid-feedback" v-if="formErrors.email">{{ formErrors.email }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Nomor WhatsApp / Telepon</label>
              <input type="text" class="form-control" v-model="form.phone" placeholder="081234567890" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Kategori Klien</label>
              <select class="form-select" v-model="form.category">
                <option value="Corporate Client">Corporate Client</option>
                <option value="International">International</option>
                <option value="SME / UMKM">SME / UMKM</option>
                <option value="Agency">Agency Partner</option>
                <option value="Personal">Personal Client</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Status Relasi</label>
              <select class="form-select" v-model="form.status">
                <option value="Active">Active Client</option>
                <option value="VIP">⭐ VIP Client</option>
                <option value="Lead">Potential Lead</option>
                <option value="Inactive">Inactive / Past Client</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Alamat Kantor / Domisili</label>
              <input type="text" class="form-control" v-model="form.address" placeholder="Jl. Sudirman No. 45, Jakarta" />
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Catatan Khusus / Ringkasan Klien</label>
              <textarea class="form-control" rows="2" v-model="form.notes" placeholder="Preferensi komunikasi, jadwal meeting, dsb..."></textarea>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-info text-white px-4 rounded-3 fw-semibold">
                {{ isEditing ? 'Simpan Perubahan' : 'Simpan Klien' }}
              </button>
            </div>
          </div>
        </form>

        <!-- BULK FORM -->
        <form v-else @submit.prevent="saveBulkContacts">
          <div class="row g-3">
            <div class="col-12">
              <div class="alert alert-info py-2 small mb-2">
                Format per baris: <strong>Nama PIC, Nama Perusahaan, Email, Telepon</strong> (Atau tulis nama saja per baris).
              </div>
              <label class="form-label fw-semibold">Daftar Klien (Satu per baris) <span class="text-danger">*</span></label>
              <textarea
                class="form-control font-monospace"
                rows="5"
                placeholder="Budi Santoso, PT Teknologi Nusantara, budi@teknus.co.id, 081234567890&#10;Sarah Jenkins, Global Tech, sarah@globaltech.com, 081987654321"
                v-model="bulkText"
                :class="{ 'is-invalid': bulkError }"
              ></textarea>
              <div class="invalid-feedback" v-if="bulkError">{{ bulkError }}</div>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Kategori Default</label>
              <select class="form-select" v-model="bulkDefault.category">
                <option value="Corporate Client">Corporate Client</option>
                <option value="International">International</option>
                <option value="SME / UMKM">SME / UMKM</option>
                <option value="Agency">Agency Partner</option>
                <option value="Personal">Personal Client</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Status Default</label>
              <select class="form-select" v-model="bulkDefault.status">
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div class="col-12 text-end pt-3 border-top">
              <button type="button" class="btn btn-light px-4 me-2 rounded-3" @click="showForm = false">Batal</button>
              <button type="submit" class="btn btn-success px-4 rounded-3 fw-semibold">
                Simpan Semua Klien (Bulk)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Search Bar & Category Filter -->
    <div class="card border-0 shadow-sm rounded-4 mb-4 bg-white">
      <div class="card-body p-3">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control bg-light border-start-0 py-2"
                placeholder="Cari berdasarkan nama klien, nama perusahaan, atau email..."
                v-model="searchQuery"
              />
              <button class="btn btn-light border" v-if="searchQuery" @click="searchQuery = ''">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="col-md-3">
            <select class="form-select bg-light py-2" v-model="filterCategory">
              <option value="">Semua Kategori</option>
              <option value="Corporate Client">Corporate Client</option>
              <option value="International">International</option>
              <option value="SME / UMKM">SME / UMKM</option>
              <option value="Agency">Agency Partner</option>
              <option value="Personal">Personal Client</option>
            </select>
          </div>

          <div class="col-md-3 text-end">
            <button class="btn btn-outline-secondary w-100 py-2 rounded-3" @click="resetSearch">
              <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Search
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Selection Bar -->
    <div v-if="selectedIds.length > 0" class="alert alert-info d-flex justify-content-between align-items-center rounded-4 shadow-sm mb-4 py-2 px-3">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-check2-square fs-5"></i>
        <span class="fw-bold">{{ selectedIds.length }} kontak terpilih</span>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-danger rounded-pill px-3" @click="bulkDelete">
          <i class="bi bi-trash-fill me-1"></i> Hapus Terpilih
        </button>
        <button class="btn btn-sm btn-light rounded-pill px-3" @click="selectedIds = []">
          Batal Pilih
        </button>
      </div>
    </div>

    <!-- Client Cards Grid -->
    <div class="row g-3 mb-4" v-if="filteredContacts.length > 0">
      <div v-for="c in filteredContacts" :key="c.id" class="col-md-6 col-lg-4">
        <div class="card border-0 shadow-sm rounded-4 h-100 bg-white hover-card">
          <div class="card-body p-4 d-flex flex-column justify-content-between">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div class="d-flex align-items-center gap-2">
                  <input type="checkbox" class="form-check-input" :value="c.id" v-model="selectedIds" />
                  <span class="badge bg-light text-dark border px-3 py-1 rounded-pill small">
                    {{ c.category || 'General' }}
                  </span>
                </div>
                <span :class="getStatusBadgeClass(c.status)" class="badge px-3 py-1 rounded-pill small">
                  {{ c.status || 'Active' }}
                </span>
              </div>

              <h5 class="fw-bold text-dark mb-1">{{ c.name }}</h5>
              <div class="small fw-semibold text-primary mb-3" v-if="c.company">
                <i class="bi bi-building me-1"></i>{{ c.company }}
              </div>

              <!-- Details -->
              <div class="small text-secondary d-flex flex-column gap-2 mb-3">
                <div v-if="c.email" class="d-flex align-items-center gap-2">
                  <i class="bi bi-envelope text-muted"></i>
                  <a :href="'mailto:' + c.email" class="text-decoration-none text-dark text-truncate">{{ c.email }}</a>
                </div>
                <div v-if="c.phone" class="d-flex align-items-center gap-2">
                  <i class="bi bi-telephone text-muted"></i>
                  <a :href="'https://wa.me/' + cleanPhone(c.phone)" target="_blank" class="text-decoration-none text-dark fw-semibold">
                    {{ c.phone }} <i class="bi bi-whatsapp text-success ms-1"></i>
                  </a>
                </div>
                <div v-if="c.address" class="d-flex align-items-start gap-2 text-muted">
                  <i class="bi bi-geo-alt text-muted mt-1"></i>
                  <span>{{ c.address }}</span>
                </div>
              </div>

              <p class="small text-muted bg-light p-2 rounded-3 mb-0" v-if="c.notes">
                <i class="bi bi-sticky me-1 text-warning"></i>{{ c.notes }}
              </p>
            </div>

            <!-- Card Actions -->
            <div class="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
              <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="createProjectForClient(c)">
                <i class="bi bi-folder-plus me-1"></i> Buat Proyek
              </button>

              <div class="d-flex gap-1">
                <button class="btn btn-sm btn-light text-primary rounded-circle" @click="editContact(c)" title="Edit">
                  <i class="bi bi-pencil-fill"></i>
                </button>
                <button class="btn btn-sm btn-light text-danger rounded-circle" @click="deleteContact(c.id)" title="Hapus">
                  <i class="bi bi-trash-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 bg-white rounded-4 shadow-sm border my-4">
      <i class="bi bi-person-x display-1 text-muted opacity-50"></i>
      <h4 class="fw-bold mt-3 text-dark">Tidak Ada Klien Ditemukan</h4>
      <p class="text-muted">Gunakan tombol di atas untuk menambahkan kontak klien baru Anda.</p>
      <button class="btn btn-primary rounded-3 px-4 py-2 mt-2" @click="openAddModal">
        <i class="bi bi-person-plus-fill me-1"></i> Tambah Klien Sekarang
      </button>
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
import { useRouter } from 'vue-router';
import * as XLSX from 'xlsx';

export default {
  name: 'ContactsView',
  setup() {
    const store = useStore();
    const router = useRouter();

    const searchQuery = ref('');
    const filterCategory = ref('');
    const showForm = ref(false);
    const formTab = ref('single');
    const isEditing = ref(false);
    const editingId = ref(null);
    const selectedIds = ref([]);

    const toast = ref({ show: false, message: '' });

    const form = ref({
      name: '',
      company: '',
      email: '',
      phone: '',
      category: 'Corporate Client',
      status: 'Active',
      address: '',
      notes: ''
    });

    const formErrors = ref({});
    const bulkText = ref('');
    const bulkError = ref('');
    const bulkDefault = ref({
      category: 'Corporate Client',
      status: 'Active'
    });

    const contacts = computed(() => store.getters.getContacts);

    const filteredContacts = computed(() => {
      return contacts.value.filter(c => {
        const query = searchQuery.value.toLowerCase();
        const matchesQuery =
          !query ||
          c.name.toLowerCase().includes(query) ||
          (c.company && c.company.toLowerCase().includes(query)) ||
          (c.email && c.email.toLowerCase().includes(query));

        const matchesCat = !filterCategory.value || c.category === filterCategory.value;

        return matchesQuery && matchesCat;
      });
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
        company: '',
        email: '',
        phone: '',
        category: 'Corporate Client',
        status: 'Active',
        address: '',
        notes: ''
      };
      formTab.value = 'single';
      showForm.value = true;
    };

    const editContact = (c) => {
      isEditing.value = true;
      editingId.value = c.id;
      formErrors.value = {};
      form.value = { ...c };
      formTab.value = 'single';
      showForm.value = true;
    };

    const saveContact = () => {
      formErrors.value = {};
      if (!form.value.name || !form.value.name.trim()) {
        formErrors.value.name = 'Nama lengkap / PIC wajib diisi!';
        return;
      }

      if (form.value.email && !form.value.email.includes('@')) {
        formErrors.value.email = 'Format email tidak valid!';
        return;
      }

      if (isEditing.value) {
        store.dispatch('updateContact', { ...form.value, id: editingId.value });
        showToastMsg('Data kontak berhasil diperbarui!');
      } else {
        store.dispatch('addContact', form.value);
        showToastMsg('Kontak klien baru berhasil ditambahkan!');
      }
      showForm.value = false;
    };

    const saveBulkContacts = () => {
      bulkError.value = '';
      if (!bulkText.value || !bulkText.value.trim()) {
        bulkError.value = 'Tuliskan minimal 1 nama kontak!';
        return;
      }

      const lines = bulkText.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const listToAdd = lines.map(line => {
        const parts = line.split(',').map(p => p.trim());
        return {
          name: parts[0] || 'Klien Baru',
          company: parts[1] || '',
          email: parts[2] || '',
          phone: parts[3] || '',
          category: bulkDefault.value.category,
          status: bulkDefault.value.status,
          notes: ''
        };
      });

      store.dispatch('addContactsBulk', listToAdd);
      showToastMsg(`Berhasil menambahkan ${listToAdd.length} kontak klien secara bulk!`);
      bulkText.value = '';
      showForm.value = false;
    };

    const deleteContact = (id) => {
      if (confirm('Apakah Anda yakin ingin menghapus kontak klien ini?')) {
        store.dispatch('deleteContact', id);
        showToastMsg('Kontak berhasil dihapus.');
      }
    };

    const bulkDelete = () => {
      if (selectedIds.value.length === 0) return;
      if (confirm(`Hapus ${selectedIds.value.length} kontak terpilih?`)) {
        store.dispatch('deleteContactsBulk', selectedIds.value);
        showToastMsg(`${selectedIds.value.length} kontak berhasil dihapus.`);
        selectedIds.value = [];
      }
    };

    const resetSearch = () => {
      searchQuery.value = '';
      filterCategory.value = '';
    };

    const createProjectForClient = (c) => {
      router.push({ path: '/projects', query: { clientName: c.name, clientEmail: c.email, clientPhone: c.phone } });
    };

    const cleanPhone = (phone) => {
      if (!phone) return '';
      return phone.replace(/[^0-9]/g, '');
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'VIP':
          return 'bg-warning text-dark fw-bold';
        case 'Active':
          return 'bg-success text-white';
        case 'Lead':
          return 'bg-primary text-white';
        case 'Inactive':
          return 'bg-secondary text-white';
        default:
          return 'bg-light text-dark border';
      }
    };

    const exportToExcel = () => {
      const exportData = contacts.value.map((c, idx) => ({
        No: idx + 1,
        NamaPIC: c.name,
        Perusahaan: c.company || '-',
        Email: c.email || '-',
        Telepon: c.phone || '-',
        Kategori: c.category || '-',
        Status: c.status || '-',
        Alamat: c.address || '-',
        Catatan: c.notes || '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Klien');
      XLSX.writeFile(workbook, 'daftar_klien_freelance.xlsx');
      showToastMsg('File Excel daftar klien berhasil diunduh!');
    };

    return {
      searchQuery,
      filterCategory,
      showForm,
      formTab,
      isEditing,
      form,
      formErrors,
      bulkText,
      bulkError,
      bulkDefault,
      selectedIds,
      contacts,
      filteredContacts,
      toast,
      toggleShowForm,
      openAddModal,
      editContact,
      saveContact,
      saveBulkContacts,
      deleteContact,
      bulkDelete,
      resetSearch,
      createProjectForClient,
      cleanPhone,
      getStatusBadgeClass,
      exportToExcel
    };
  }
};
</script>

<style scoped>
.hover-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.hover-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08) !important;
}
</style>

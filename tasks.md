# 📱 Rencana Integrasi Mobile OS (Capacitor) & Evaluasi UI

Dokumen ini berisi analisis kelayakan, panduan integrasi **Capacitor**, serta daftar tugas (checklist) untuk membuat **RajinKerja.id** berjalan sebagai aplikasi mobile native (.apk/.ipa).

---

## 🔍 Evaluasi UI: Apakah Perlu Dirombak Total?

**Jawabannya: Tidak perlu dirombak total.** 
Karena RajinKerja.id sudah menggunakan sistem grid responsif dari **Bootstrap 5** dan CSS Flexbox/Grid, sebagian besar halaman (Dashboard, To-Do List, Finance Tracker, Sticky Notes) secara otomatis akan menyesuaikan diri dengan layar smartphone.

Namun, untuk mencapai kualitas **aplikasi native premium**, beberapa penyesuaian mikro berikut sangat direkomendasikan:

1.  **Bottom Navigation Bar (Navigasi Bawah Mobile):**
    *   Pada layar desktop, kita menggunakan *Sidebar Drawer*. Pada layar mobile, sidebar ini sebaiknya disembunyikan dan diganti dengan bilah navigasi bawah (floating bottom bar) dengan ikon besar (Home, To-Do, Finance, Notes, Games) agar mudah dijangkau jempol.
2.  **Touch Target Size (Ukuran Tombol Sentuh):**
    *   Beberapa tombol kecil (seperti ikon hapus sampah, checkbox baris) harus memiliki area klik minimal **44px x 44px** untuk menghindari kesalahan ketuk pada layar sentuh.
3.  **Safe Area Insets (Antisipasi Poni/Notch):**
    *   Gunakan CSS variabel seperti `padding-top: env(safe-area-inset-top)` pada container atas agar UI tidak tertutup oleh kamera notch atau status bar sistem (terutama iOS/iPhone).
4.  **Optimasi Game Viewport (Kunci Rotasi):**
    *   Saat membuka modul game 3D (seperti Dunia Yuki), pasang plugin Capacitor Screen Orientation untuk memaksa layar berputar ke mode landscape (horizontal) agar gameplay 3D lebih leluasa.

---

## 🛠️ Langkah-Langkah Integrasi Capacitor

Ikuti langkah berikut pada terminal workspace Anda untuk membungkus aplikasi:

### 1. Instalasi Library Capacitor
```bash
npm install @capacitor/core @capacitor/cli
```

### 2. Inisialisasi Project
```bash
npx cap init RajinKerja id.rajinkerja.app --web-dir=dist
```

### 3. Tambahkan Platform Target (Android / iOS)
```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
```

### 4. Compile & Sinkronisasi Kode
Setiap kali Anda mengubah kode Vue, lakukan kompilasi ulang dan kirimkan hasilnya ke folder mobile:
```bash
npm run build
npx cap sync
```

### 5. Jalankan Emulator / Buka di IDE Native
```bash
# Membuka project di Android Studio untuk dijalankan ke HP/Emulator
npx cap open android
```

---

## 📝 Daftar Tugas Pengembangan Mobile (TODO Checklist)

- [ ] **Langkah 1: Setup Core & CLI**
  - [ ] Pasang dependensi `@capacitor/core` dan `@capacitor/cli`
  - [ ] Jalankan perintah inisialisasi `npx cap init`
- [ ] **Langkah 2: Optimasi Responsivitas UI**
  - [ ] Tambahkan component Bottom Navigation Bar khusus untuk viewport `< 768px`
  - [ ] Terapkan CSS `env(safe-area-inset-top)` di `App.vue`
  - [ ] Ubah tombol-tombol kecil agar memiliki minimal padding sentuh 10px
- [ ] **Langkah 3: Integrasi Plugin Native**
  - [ ] Pasang `@capacitor/status-bar` agar status bar HP sewarna dengan tema aplikasi
  - [ ] Pasang `@capacitor/screen-orientation` khusus untuk mengunci landscape layar game 3D
- [ ] **Langkah 4: Pengujian & Build APK**
  - [ ] Jalankan build produksi dan lakukan `npx cap sync android`
  - [ ] Jalankan debugging di HP android asli untuk memantau performa render 3D Three.js
  - [ ] Ekspor file menjadi format `.apk` / `.aab` siap rilis



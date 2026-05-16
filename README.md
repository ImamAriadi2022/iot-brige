# 🌉 IoT Bridge — Web Frontend Dashboard

Dashboard web modern berbasis **Vue 3 + Vite** untuk mengelola perangkat IoT, memantau data sensor secara real-time, dan mengadministrasi organisasi beserta anggotanya.

> **Base API URL:** `https://iotbridge.click`  
> **API Docs:** `https://iotbridge.click/api-docs`

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Technology Stack](#️-technology-stack)
- [Struktur Proyek](#-struktur-proyek)
- [Instalasi & Menjalankan](#️-instalasi--menjalankan)
- [Routing & Halaman](#-routing--halaman)
- [Komponen](#-komponen)
- [Services (API Layer)](#-services-api-layer)
- [Utilities](#-utilities)
- [Design System](#-design-system)
- [API Reference](#-api-reference)
- [Testing E2E](#-testing-e2e)
- [Session & Storage](#-session--storage)

---

## 🚀 Fitur Utama

| Fitur | Deskripsi |
|---|---|
| **Autentikasi JWT** | Login, registrasi, lupa kata sandi, reset, ubah email & password |
| **Manajemen Organisasi** | Buat, lihat, edit profil organisasi; undang & kelola anggota |
| **Manajemen Perangkat** | CRUD perangkat IoT, konfigurasi Widget Box, lihat pin list |
| **Statistika & Laporan** | Filter data sensor by pin & rentang waktu, visualisasi grafik SVG interaktif |
| **Export Data** | Export laporan sensor ke format **CSV** dan **Excel (.xlsx)** |
| **Notifikasi** | Notifikasi real-time dari backend + browser push notification |
| **Manajemen Pengguna** | Cari & lihat pengguna (khusus Admin System) |
| **Pengaturan Akun** | Edit profil, avatar, ubah email, ubah kata sandi |
| **Cancel Request** | Tombol batal saat loading laporan menggunakan `AbortController` |

---

## 🛠️ Technology Stack

| Teknologi | Versi | Kegunaan |
|---|---|---|
| [Vue 3](https://v3.vuejs.org/) | `^3.5.32` | Framework UI (Composition API + `<script setup>`) |
| [Vue Router 4](https://router.vuejs.org/) | `^4.6.4` | Client-side SPA routing + navigation guard |
| [Vite](https://vitejs.dev/) | `^8.0.10` | Build tool & dev server dengan HMR |
| [SheetJS (xlsx)](https://sheetjs.com/) | latest | Export data ke format Excel `.xlsx` |
| Vanilla CSS | — | Design system custom, scoped per komponen |
| Inter (Google Fonts) | — | Tipografi utama |

---

## 📂 Struktur Proyek

```
iot-brige/
├── public/                    # Static assets publik
├── src/
│   ├── assets/                # Gambar, logo, ilustrasi
│   ├── components/            # Komponen reusable
│   │   ├── AppLayout.vue      # Layout utama (sidebar + header + konten)
│   │   └── Sidebar.vue        # Navigasi sidebar
│   ├── router/
│   │   └── index.js           # Definisi route + navigation guard
│   ├── services/
│   │   └── api.js             # Semua fungsi HTTP ke backend API
│   ├── utils/
│   │   └── notifications.js   # Helper browser push notification
│   ├── views/                 # Halaman (page-level components)
│   │   ├── LoginView.vue
│   │   ├── RegisterView.vue
│   │   ├── ForgotPasswordView.vue
│   │   ├── DashboardView.vue
│   │   ├── PerangkatView.vue
│   │   ├── StatistikaView.vue
│   │   ├── OrganisasiView.vue
│   │   ├── OrganisasiDetailView.vue
│   │   ├── PenggunaView.vue
│   │   ├── NotifikasiView.vue
│   │   ├── PoolDetailView.vue
│   │   ├── PengaturanView.vue
│   │   ├── ProfileView.vue
│   │   ├── UbahEmailView.vue
│   │   └── UbahKataSandiView.vue
│   ├── App.vue                # Root komponen Vue
│   ├── main.js                # Entry point aplikasi
│   └── style.css              # CSS global & design tokens
├── tests/                     # Skrip E2E testing
├── api.md                     # Dokumentasi lengkap API endpoint
├── vite.config.js             # Konfigurasi Vite
└── package.json
```

---

## ⚙️ Instalasi & Menjalankan

### Prasyarat

- **Node.js** v16+ ([download](https://nodejs.org/))
- **npm** (sudah termasuk dalam Node.js)

### Langkah Instalasi

```bash
# 1. Clone repositori
git clone <repository-url>
cd iot-brige

# 2. Install semua dependensi
npm install

# 3. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di: **`http://localhost:5173`**

### Build Production

```bash
npm run build       # Output ke folder /dist
npm run preview     # Preview hasil build
```

---

## 🗺️ Routing & Halaman

Semua route didefinisikan di `src/router/index.js` menggunakan **Vue Router 4** dengan mode **HTML5 History**.

### Navigation Guard

Router memiliki guard otomatis:
- Route dengan `meta: { auth: true }` → redirect ke `/masuk` jika belum login
- Route dengan `meta: { auth: false }` → redirect ke `/dashboard` jika sudah login

### Daftar Route

| Path | Komponen | Auth | Deskripsi |
|---|---|:---:|---|
| `/` | — | — | Redirect ke `/masuk` |
| `/masuk` | `LoginView` | ❌ | Halaman login |
| `/daftar` | `RegisterView` | ❌ | Halaman registrasi |
| `/lupa-kata-sandi` | `ForgotPasswordView` | ❌ | Kirim email reset password |
| `/dashboard` | `DashboardView` | ✅ | Beranda & ringkasan |
| `/dashboard/kolam/:id` | `PoolDetailView` | ✅ | Detail kolam/pool |
| `/perangkat` | `PerangkatView` | ✅ | Manajemen perangkat IoT |
| `/statistika` | `StatistikaView` | ✅ | Laporan & grafik sensor |
| `/notifikasi` | `NotifikasiView` | ✅ | Daftar notifikasi |
| `/pengguna` | `PenggunaView` | ✅ | Manajemen pengguna (Admin) |
| `/organisasi` | `OrganisasiView` | ✅ | Daftar organisasi |
| `/organisasi/:id` | `OrganisasiDetailView` | ✅ | Detail organisasi |
| `/pengaturan` | `PengaturanView` | ✅ | Pengaturan aplikasi |
| `/profile` | `ProfileView` | ✅ | Profil pengguna |
| `/ubah-kata-sandi` | `UbahKataSandiView` | ✅ | Ganti password |
| `/ubah-email` | `UbahEmailView` | ✅ | Ganti email |

---

## 🧩 Komponen

### `AppLayout.vue`
Layout utama yang digunakan di semua halaman yang memerlukan autentikasi.

**Props:**
| Prop | Tipe | Deskripsi |
|---|---|---|
| `page-title` | `String` | Judul halaman yang ditampilkan di header |

**Fitur:**
- Sidebar navigasi dengan toggle collapse (state tersimpan di `localStorage`)
- Header dengan notifikasi badge & avatar pengguna
- Slot default untuk konten halaman

### `Sidebar.vue`
Komponen navigasi sidebar yang menampilkan menu berdasarkan role pengguna.

---

## 🔌 Services (API Layer)

Semua komunikasi dengan backend dilakukan melalui `src/services/api.js`.

### Konfigurasi Dasar

```javascript
const BASE_URL = 'https://iotbridge.click'
```

Token JWT diambil otomatis dari `localStorage` dan disertakan pada setiap request sebagai header:
```
Authorization: Bearer <token>
```

### Helper Utilities (Internal)

| Fungsi | Deskripsi |
|---|---|
| `request(path, options)` | Generic fetch wrapper; melempar `Error` jika response tidak 2xx. Mendukung `AbortSignal` untuk cancel request |
| `toQuery(params)` | Konversi objek ke query string URL |
| `unwrapList(data)` | Ekstrak array dari berbagai bentuk respons API (`data`, `items`, `results`) |
| `pickId(item, keys)` | Ambil field ID pertama yang tersedia dari suatu objek |

### Session Helpers

| Fungsi | Deskripsi |
|---|---|
| `saveSession({ token, user })` | Simpan token & user ke `localStorage` |
| `clearSession()` | Hapus semua data sesi dari `localStorage` |
| `getToken()` | Ambil token dari `localStorage` |
| `getActiveOrganizationId()` | Ambil ID organisasi aktif |
| `setActiveOrganizationId(id)` | Simpan ID organisasi aktif |
| `ensureOrganizationId()` | Ambil & validasi orgId; pilih organisasi terverifikasi pertama jika belum ada |
| `unwrapApiList(data)` | Alias publik untuk `unwrapList()` |

### Auth Functions

| Fungsi | Method | Endpoint |
|---|---|---|
| `register(body)` | POST | `/auth/register` |
| `login(body)` | POST | `/auth/login` |
| `forgotPassword(body)` | POST | `/auth/forgot-password` |
| `getProfile()` | GET | `/auth/profile` |
| `updateProfile(formData)` | PATCH | `/auth/profile` |
| `updateEmail(body)` | PATCH | `/auth/email` |
| `updatePassword(body)` | PATCH | `/auth/password` |

### Organization Functions

| Fungsi | Method | Endpoint |
|---|---|---|
| `getOrganizationsList()` | GET | `/organizations/list` |
| `proposeOrganization(body)` | POST | `/organizations/propose` |
| `verifyOrganization(body)` | PATCH | `/organizations/verify` |
| `unverifyOrganization(body)` | PATCH | `/organizations/unverify` |
| `getOrganizationProfile(orgId)` | GET | `/organizations/{id}/profile` |
| `updateOrganizationProfile(orgId, body)` | PATCH | `/organizations/{id}/profile` |
| `searchOrganizationMembers(orgId, params)` | GET | `/organizations/{id}/search-members` |
| `memberInvitation(orgId, body)` | POST | `/organizations/{id}/member-invitation` |
| `memberInvitationResponse(orgId, body)` | PATCH | `/organizations/{id}/member-invitation-response` |
| `getOrganizationMembers(orgId)` | GET | `/organizations/{id}/member-list` |
| `createLocalMember(orgId, body)` | POST | `/organizations/{id}/local-member` |
| `deleteMember(orgId, userId)` | DELETE | `/organizations/{id}/member/{userId}` |
| `changeMemberRoles(orgId, body)` | PATCH | `/organizations/{id}/member-roles` |
| `leaveOrganization(orgId)` | DELETE | `/organizations/{id}/leave` |
| `searchOrganizations(params)` | GET | `/organizations/search` |
| `getOrganizationById(orgId)` | GET | `/organizations/{id}` |

### Device & Widget Box Functions

| Fungsi | Method | Endpoint |
|---|---|---|
| `searchDevices(orgId, params)` | GET | `/organizations/{id}/devices/search` |
| `getDevices(orgId)` | GET | `/organizations/{id}/devices` |
| `getDeviceById(orgId, deviceId)` | GET | `/organizations/{id}/devices/{deviceId}` |
| `createDevice(orgId, body)` | POST | `/organizations/{id}/devices` |
| `updateDevice(orgId, deviceId, body)` | PATCH | `/organizations/{id}/devices/{deviceId}` |
| `deleteDevice(orgId, deviceId)` | DELETE | `/organizations/{id}/devices/{deviceId}` |
| `getPinList(orgId, deviceId)` | GET | `/organizations/{id}/devices/{deviceId}/pin-list` |
| `getWidgetBoxList(orgId, deviceId)` | GET | `/organizations/{id}/devices/{deviceId}/widget-boxes/list` |
| `getWidgetBoxById(orgId, deviceId, wbId)` | GET | `/organizations/{id}/devices/{deviceId}/widget-boxes/{wbId}` |
| `upsertWidgetBoxes(orgId, deviceId, body)` | PUT | `/organizations/{id}/devices/{deviceId}/widget-boxes` |
| `createWidgetBox(orgId, deviceId, body)` | POST | `/organizations/{id}/devices/{deviceId}/widget-boxes` |
| `deleteWidgetBox(orgId, deviceId, wbId)` | DELETE | `/organizations/{id}/devices/{deviceId}/widget-boxes/{wbId}` |
| `getDeviceReport(orgId, deviceId, params, signal?)` | GET | `/organizations/{id}/devices/{deviceId}/report` |

> **`getDeviceReport` Query Params:**  
> `start` (datetime), `end` (datetime), `pin` (string)

### Notification Event Functions

| Fungsi | Method | Endpoint |
|---|---|---|
| `createNotificationEvent(orgId, deviceId, body)` | POST | `.../notification-events` |
| `getNotificationEvents(orgId, deviceId)` | GET | `.../notification-events/list` |
| `getNotificationEventById(orgId, deviceId, id)` | GET | `.../notification-events/{id}` |
| `updateNotificationEvent(orgId, deviceId, id, body)` | PATCH | `.../notification-events/{id}` |
| `deleteNotificationEvent(orgId, deviceId, id)` | DELETE | `.../notification-events/{id}` |

### Global Notification Functions

| Fungsi | Method | Endpoint |
|---|---|---|
| `getNotifications()` | GET | `/notifications` |
| `deleteAllNotifications()` | DELETE | `/notifications` |
| `deleteNotificationById(id)` | DELETE | `/notifications/{id}` |

### User Functions

| Fungsi | Method | Endpoint |
|---|---|---|
| `searchUsers(params)` | GET | `/users/search` |
| `getUserById(userId)` | GET | `/users/{userId}` |

---

## 🔧 Utilities

### `src/utils/notifications.js`

Helper untuk mengelola browser push notification.

| Fungsi | Deskripsi |
|---|---|
| `getNotificationMode()` | Ambil mode notifikasi dari `localStorage` (`'Aktif'` / `'Nonaktif'`) |
| `setNotificationMode(mode)` | Simpan mode notifikasi |
| `isLocalNotificationEnabled()` | Cek apakah notifikasi lokal diaktifkan |
| `ensureLocalNotificationPermission()` | Minta izin browser notification jika belum diberikan |
| `showBrowserNotification(title, body)` | Tampilkan notifikasi browser jika izin granted & mode aktif |

**localStorage key:** `iot_bridge_notification_mode`

---

## 🎨 Design System

Semua token desain didefinisikan sebagai CSS Custom Properties di `src/style.css`.

### Color Palette

| Variable | Nilai | Kegunaan |
|---|---|---|
| `--color-primary` | `#1e3a5f` | Warna utama (navy tua) |
| `--color-primary-dark` | `#152d4a` | Variasi gelap primary |
| `--color-primary-light` | `#2a4f7c` | Variasi terang primary |
| `--color-sidebar` | `#0f2138` | Background sidebar |
| `--color-accent` | `#e86b1a` | Aksen oranye |
| `--color-accent-hover` | `#d45e0f` | Hover state aksen |
| `--color-bg` | `#f5f7fa` | Background halaman |
| `--color-border` | `#e2e8f0` | Warna border |
| `--color-text` | `#1e3a5f` | Teks utama |
| `--color-text-muted` | `#64748b` | Teks sekunder |
| `--color-text-light` | `#94a3b8` | Teks tersier |
| `--color-danger` | `#ef4444` | Error / hapus |
| `--color-success` | `#22c55e` | Sukses |
| `--color-warning` | `#f59e0b` | Peringatan |
| `--color-info` | `#3b82f6` | Informasi |

### Spacing & Layout

| Variable | Nilai |
|---|---|
| `--sidebar-width` | `240px` |
| `--header-height` | `70px` |

### Border Radius

| Variable | Nilai |
|---|---|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |

### Shadows & Transition

| Variable | Nilai |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.1)` |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` |
| `--transition` | `all 0.2s ease` |

### Tipografi

Font utama: **Inter** (Google Fonts) — weight 300, 400, 500, 600, 700, 800, 900.

---

## 📊 Halaman Statistika (`/statistika`)

Halaman paling kompleks dengan alur:

```
onMounted
  → ensureOrganizationId()       # Ambil/validasi orgId
  → searchDevices(orgId)          # Ambil device (prioritas dari query ?device=)
  → getPinList(orgId, deviceId)   # Ambil daftar pin device
  → Tampilkan dropdown pin

User klik "Tampilkan Report"
  → getDeviceReport(orgId, deviceId, { start, end, pin }, signal)
  → Render grafik SVG interaktif
  → Tampilkan summary (Min, Max, Rata-rata, Total Data)

Export:
  → exportCsv()    → download file .csv
  → exportExcel()  → download file .xlsx (SheetJS)
```

**Loading Modal:**
- Muncul saat fetch berlangsung dengan timer detik
- Setelah 10 detik: tampilkan peringatan server lambat
- Tombol **✕** dan **Batalkan Request**: membatalkan fetch via `AbortController`

---

## 🔌 API Reference

Dokumentasi lengkap semua endpoint tersedia di file [`api.md`](./api.md).

### Ringkasan Endpoint

| Kategori | Jumlah Endpoint |
|---|---|
| Auth | 9 |
| Organizations | 13 |
| Devices | 7 |
| Widget Boxes | 5 |
| Device Report | 1 |
| Notification Events | 5 |
| Global Notifications | 3 |
| Users | 2 |
| **Total** | **45** |

---

## 🧪 Testing E2E

Proyek dilengkapi skrip **End-to-End (E2E)** menggunakan **Selenium WebDriver**.

### Prasyarat Testing

```bash
# Pastikan dev server berjalan dulu
npm run dev
```

### Menjalankan Test

```bash
npm run test:e2e
```

Skenario yang diuji:
- Alur autentikasi (login)
- Penutupan modal popup
- Navigasi antar halaman (Dashboard → Perangkat → Statistika)

Hasil lengkap dapat dilihat di [`test.md`](./test.md).

---

## 💾 Session & Storage

Data yang disimpan di `localStorage`:

| Key | Isi | Dikelola oleh |
|---|---|---|
| `iot_bridge_token` | JWT Bearer token | `api.js` → `saveSession()` |
| `iot_bridge_user` | Objek user (JSON) | `api.js` → `saveSession()` |
| `iot_bridge_org_id` | ID organisasi aktif | `api.js` → `setActiveOrganizationId()` |
| `iot_bridge_notification_mode` | `'Aktif'` / `'Nonaktif'` | `notifications.js` |

---

## 📝 Lisensi

Proprietary / Internal Use. All rights reserved.

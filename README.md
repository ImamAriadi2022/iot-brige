# IoT Bridge Platform - Web Frontend

A modern, responsive, and high-fidelity dashboard built with Vue 3 and Vite for managing IoT devices, monitoring analytics, and administrating organizational roles.

## 🚀 Features

- **Authentication & Security:** Secure JWT-based login, registration, forgot password flow, and change password features.
- **Organization Management:** Handle multiple organizations, manage organizational profiles, and control member access (role-based access control).
- **Device Management:** Full CRUD capabilities for IoT devices. Automatically generates and displays Auth Codes/Tokens, configuration for Widget Boxes, and pin mapping.
- **Analytics & Statistics:** Detailed and dynamic statistics view for devices with interactive filtering and monitoring features.
- **Responsive Design System:** Fully custom UI/UX design with a cohesive "Dark Navy/Neon" theme, smooth micro-animations, glassmorphism elements, and fully responsive layouts for desktop and mobile.
- **User Management & Settings:** User profile updates, avatar handling, and application settings.

## 🛠️ Technology Stack

- **Framework:** [Vue 3](https://v3.vuejs.org/) (using the modern `<script setup>` Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/) (for lightning-fast HMR and optimized builds)
- **Routing:** [Vue Router 4](https://router.vuejs.org/) (for client-side SPA routing)
- **Styling:** Custom Vanilla CSS with scoped components (No external bulky frameworks, maximizing performance and flexibility)

## 📂 Project Structure

```text
src/
├── components/       # Reusable Vue components (e.g., AppLayout, Navigation, Modals)
├── services/         # API integration and centralized HTTP handlers
│   └── api.js        # Main Axios/Fetch wrapper pointing to the backend
├── views/            # Page-level components
│   ├── DashboardView.vue
│   ├── PerangkatView.vue    # Device management
│   ├── OrganisasiView.vue   # Organization management
│   ├── PenggunaView.vue     # Member/user administration
│   ├── StatistikaView.vue   # Data visualizations
│   └── ... (Auth and Settings pages)
├── App.vue           # Main application root
└── main.js           # Vue application entry point
```

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or newer recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd iot-brige
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173/` (or the port Vite assigns).

### Building for Production

To build the application for a production environment, run:

```bash
npm run build
```

This will output the optimized, minified static files into the `dist` directory. You can preview the build using:

```bash
npm run preview
```

## 🧪 Testing

Aplikasi ini dilengkapi dengan skrip otomatisasi **End-to-End (E2E)** menggunakan Selenium WebDriver. Skrip pengujian ini akan membuka *browser* Google Chrome, menguji alur autentikasi (login), menutup *modal popup*, dan memeriksa perutean antar halaman (Dashboard, Perangkat, Statistika).

### Persyaratan Testing
Pastikan *development server* sudah berjalan di terminal terpisah sebelum memulai tes:
```bash
npm run dev
```

### Menjalankan Testing
Buka terminal baru dan jalankan skrip berikut:
```bash
npm run test:e2e
```

Log hasil tes dapat dilihat langsung di konsol terminal, dan referensi *output* lengkap dapat dibaca di file [`test.md`](./test.md).

## 🔌 API Configuration

The frontend is configured to communicate with the IoT Bridge Backend. 
By default, the `BASE_URL` is configured in `src/services/api.js`:
```javascript
const BASE_URL = 'https://iotbridge.click'
```
Authentication tokens are stored locally and automatically injected into the `Authorization: Bearer <token>` header for protected routes.

## 🎨 Design Principles

- **Rich Aesthetics:** Avoiding generic templates; using curated, harmonious color palettes to give a premium feel.
- **Dynamic Interactions:** High use of hover effects, transitional states, and micro-animations to encourage user engagement.
- **Component-Based Styling:** Styles are highly scoped within each `.vue` file to prevent global CSS conflicts, ensuring long-term maintainability.

## 📝 License

Proprietary/Internal Use. All rights reserved.

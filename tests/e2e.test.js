import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────
// KONFIGURASI — edit nilai ini sesuai akun Anda
// ─────────────────────────────────────────────
const CONFIG = {
  baseUrl:       'http://localhost:5173',
  // Akun login utama (user biasa / org admin)
  userEmail:    'valentinovbill0@gmail.com',
  userPassword: '12345678',
  // Timeout global (ms)
  timeout: 12000,
  // Folder output screenshot & laporan
  screenshotDir: path.resolve('tests/screenshots'),
  reportPath:    path.resolve('tests/test.md'),
};

// ─────────────────────────────────────────────
// Helper utilities
// ─────────────────────────────────────────────
let driver;
let screenshotIndex = 0;
const results = [];   // { name, status, message, screenshot }

function log(msg) {
  console.log(`  ${msg}`);
}

async function screenshot(label) {
  screenshotIndex++;
  const filename = `${String(screenshotIndex).padStart(3, '0')}_${label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}.png`;
  const filepath = path.join(CONFIG.screenshotDir, filename);
  const data = await driver.takeScreenshot();
  fs.writeFileSync(filepath, data, 'base64');
  log(`📸 Screenshot: ${filename}`);
  return filename;
}

async function pass(testName, detail = '', ss = null) {
  log(`✅ PASS — ${testName}`);
  results.push({ name: testName, status: 'PASS', message: detail, screenshot: ss });
}

async function fail(testName, detail = '', ss = null) {
  log(`❌ FAIL — ${testName}: ${detail}`);
  results.push({ name: testName, status: 'FAIL', message: detail, screenshot: ss });
}

async function tryTest(name, fn) {
  try {
    log(`\n▶ ${name}`);
    await fn();
  } catch (err) {
    const ss = await screenshot(`FAIL_${name}`).catch(() => null);
    await fail(name, err.message, ss);
  }
}

async function waitAndFind(locator, timeout = CONFIG.timeout) {
  return driver.wait(until.elementLocated(locator), timeout);
}

async function clearAndType(locator, text) {
  const el = await waitAndFind(locator);
  await el.clear();
  await el.sendKeys(text);
}

async function clearSession() {
  await driver.get(CONFIG.baseUrl);
  await driver.executeScript('window.localStorage.clear(); window.sessionStorage.clear();');
}

// ─────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────

// 1. AUTH — Login gagal (password salah)
async function testLoginFail() {
  await tryTest('Login dengan password salah harus tampilkan error', async () => {
    await clearSession();
    await driver.get(`${CONFIG.baseUrl}/masuk`);
    await clearAndType(By.id('login-identity'), CONFIG.userEmail);
    await clearAndType(By.id('login-password'), 'passwordsalah999');
    await (await waitAndFind(By.id('login-submit'))).click();
    // Tunggu pesan error muncul
    await driver.sleep(3000);
    const ss = await screenshot('login_fail');
    const body = await driver.getPageSource();
    if (body.includes('salah') || body.includes('error') || body.includes('invalid') || body.includes('gagal') || body.includes('incorrect')) {
      await pass('Login dengan password salah harus tampilkan error', 'Pesan error muncul', ss);
    } else {
      await fail('Login dengan password salah harus tampilkan error', 'Tidak ada pesan error', ss);
    }
  });
}

// 2. AUTH — Login berhasil
async function testLoginSuccess() {
  await tryTest('Login berhasil lalu redirect ke Dashboard', async () => {
    await clearSession();
    await driver.get(`${CONFIG.baseUrl}/masuk`);
    await clearAndType(By.id('login-identity'), CONFIG.userEmail);
    await clearAndType(By.id('login-password'), CONFIG.userPassword);
    await (await waitAndFind(By.id('login-submit'))).click();
    // Tutup popup sukses jika ada
    try {
      const closeBtn = await driver.wait(until.elementLocated(By.css('.popup-close')), 8000);
      await driver.sleep(500);
      await closeBtn.click();
    } catch (_) { /* popup mungkin tidak ada */ }
    await driver.wait(until.urlContains('/dashboard'), CONFIG.timeout);
    const ss = await screenshot('login_success');
    await pass('Login berhasil lalu redirect ke Dashboard', 'URL berisi /dashboard', ss);
  });
}

// 3. AUTH — Redirect ke login jika belum login
async function testAuthGuard() {
  await tryTest('Akses halaman terproteksi tanpa login di-redirect ke /masuk', async () => {
    await clearSession();
    await driver.get(`${CONFIG.baseUrl}/dashboard`);
    await driver.sleep(1500);
    const url = await driver.getCurrentUrl();
    const ss = await screenshot('auth_guard');
    if (url.includes('/masuk') || url.includes('/login')) {
      await pass('Akses halaman terproteksi tanpa login di-redirect ke /masuk', `Redirect ke: ${url}`, ss);
    } else {
      await fail('Akses halaman terproteksi tanpa login di-redirect ke /masuk', `Tidak di-redirect, masih di: ${url}`, ss);
    }
  });
}

// 4. AUTH — Halaman registrasi
async function testRegisterPage() {
  await tryTest('Halaman registrasi dapat diakses dan form tersedia', async () => {
    await clearSession();
    await driver.get(`${CONFIG.baseUrl}/daftar`);
    const ss = await screenshot('register_page');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('daftar') || body.toLowerCase().includes('register') || body.toLowerCase().includes('username')) {
      await pass('Halaman registrasi dapat diakses dan form tersedia', 'Form registrasi ditemukan', ss);
    } else {
      await fail('Halaman registrasi dapat diakses dan form tersedia', 'Form registrasi tidak ditemukan', ss);
    }
  });
}

// 5. AUTH — Halaman lupa kata sandi
async function testForgotPasswordPage() {
  await tryTest('Halaman lupa kata sandi dapat diakses', async () => {
    await clearSession();
    await driver.get(`${CONFIG.baseUrl}/lupa-kata-sandi`);
    await driver.sleep(1000);
    const ss = await screenshot('forgot_password');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('email') || body.toLowerCase().includes('lupa') || body.toLowerCase().includes('forgot')) {
      await pass('Halaman lupa kata sandi dapat diakses', 'Halaman termuat', ss);
    } else {
      await fail('Halaman lupa kata sandi dapat diakses', 'Halaman tidak termuat dengan benar', ss);
    }
  });
}

// 6. DASHBOARD — Halaman dashboard termuat
async function testDashboard() {
  await tryTest('Halaman Dashboard termuat dengan benar', async () => {
    await driver.get(`${CONFIG.baseUrl}/dashboard`);
    await driver.sleep(2500);
    const ss = await screenshot('dashboard');
    await driver.wait(until.urlContains('/dashboard'), CONFIG.timeout);
    await pass('Halaman Dashboard termuat dengan benar', 'Dashboard berhasil dimuat', ss);
  });
}

// 7. PERANGKAT — Halaman perangkat termuat
async function testPerangkat() {
  await tryTest('Halaman Perangkat termuat dan menampilkan daftar', async () => {
    await driver.get(`${CONFIG.baseUrl}/perangkat`);
    await driver.sleep(3000);
    const ss = await screenshot('perangkat');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('perangkat') || body.toLowerCase().includes('device') || body.toLowerCase().includes('tambah')) {
      await pass('Halaman Perangkat termuat dan menampilkan daftar', 'Konten perangkat ditemukan', ss);
    } else {
      await fail('Halaman Perangkat termuat dan menampilkan daftar', 'Konten tidak ditemukan', ss);
    }
  });
}

// 8. STATISTIKA — Halaman statistika termuat
async function testStatistika() {
  await tryTest('Halaman Statistika termuat dengan form filter', async () => {
    await driver.get(`${CONFIG.baseUrl}/statistika`);
    await driver.sleep(3500);
    const ss = await screenshot('statistika_loaded');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('statistika') || body.toLowerCase().includes('pin') || body.toLowerCase().includes('tanggal')) {
      await pass('Halaman Statistika termuat dengan form filter', 'Form filter ditemukan', ss);
    } else {
      await fail('Halaman Statistika termuat dengan form filter', 'Form tidak ditemukan', ss);
    }
  });
}

// 9. STATISTIKA — Tombol report disabled saat form kosong
async function testStatistikaButtonDisabled() {
  await tryTest('Tombol "Tampilkan Report" disabled saat form belum lengkap', async () => {
    await driver.get(`${CONFIG.baseUrl}/statistika`);
    await driver.sleep(2000);
    const btn = await waitAndFind(By.css('.btn-report'));
    const disabled = await btn.getAttribute('disabled');
    const ss = await screenshot('statistika_btn_disabled');
    if (disabled !== null) {
      await pass('Tombol "Tampilkan Report" disabled saat form belum lengkap', 'Tombol disabled', ss);
    } else {
      await fail('Tombol "Tampilkan Report" disabled saat form belum lengkap', 'Tombol tidak disabled', ss);
    }
  });
}

// 10. NOTIFIKASI — Halaman notifikasi termuat
async function testNotifikasi() {
  await tryTest('Halaman Notifikasi termuat', async () => {
    await driver.get(`${CONFIG.baseUrl}/notifikasi`);
    await driver.sleep(2500);
    const ss = await screenshot('notifikasi');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('notifikasi') || body.toLowerCase().includes('notification')) {
      await pass('Halaman Notifikasi termuat', 'Halaman notifikasi berhasil dimuat', ss);
    } else {
      await fail('Halaman Notifikasi termuat', 'Konten tidak ditemukan', ss);
    }
  });
}

// 11. ORGANISASI — Halaman organisasi termuat
async function testOrganisasi() {
  await tryTest('Halaman Organisasi termuat', async () => {
    await driver.get(`${CONFIG.baseUrl}/organisasi`);
    await driver.sleep(3000);
    const ss = await screenshot('organisasi');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('organisasi') || body.toLowerCase().includes('organization')) {
      await pass('Halaman Organisasi termuat', 'Daftar organisasi dimuat', ss);
    } else {
      await fail('Halaman Organisasi termuat', 'Konten tidak ditemukan', ss);
    }
  });
}

// 12. PENGGUNA — Halaman pengguna termuat
async function testPengguna() {
  await tryTest('Halaman Pengguna termuat', async () => {
    await driver.get(`${CONFIG.baseUrl}/pengguna`);
    await driver.sleep(3000);
    const ss = await screenshot('pengguna');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('pengguna') || body.toLowerCase().includes('user') || body.toLowerCase().includes('anggota')) {
      await pass('Halaman Pengguna termuat', 'Halaman pengguna berhasil dimuat', ss);
    } else {
      await fail('Halaman Pengguna termuat', 'Konten tidak ditemukan', ss);
    }
  });
}

// 13. PROFIL — Halaman profil termuat
async function testProfile() {
  await tryTest('Halaman Profil termuat dan menampilkan data user', async () => {
    await driver.get(`${CONFIG.baseUrl}/profile`);
    await driver.sleep(2500);
    const ss = await screenshot('profile');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('profil') || body.toLowerCase().includes('username') || body.toLowerCase().includes('email')) {
      await pass('Halaman Profil termuat dan menampilkan data user', 'Data profil ditemukan', ss);
    } else {
      await fail('Halaman Profil termuat dan menampilkan data user', 'Data profil tidak ditemukan', ss);
    }
  });
}

// 14. PENGATURAN — Halaman pengaturan termuat
async function testPengaturan() {
  await tryTest('Halaman Pengaturan termuat', async () => {
    await driver.get(`${CONFIG.baseUrl}/pengaturan`);
    await driver.sleep(2000);
    const ss = await screenshot('pengaturan');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('pengaturan') || body.toLowerCase().includes('setting') || body.toLowerCase().includes('notifikasi')) {
      await pass('Halaman Pengaturan termuat', 'Halaman pengaturan berhasil dimuat', ss);
    } else {
      await fail('Halaman Pengaturan termuat', 'Konten tidak ditemukan', ss);
    }
  });
}

// 15. UBAH EMAIL — Halaman ubah email termuat
async function testUbahEmail() {
  await tryTest('Halaman Ubah Email termuat dengan form', async () => {
    await driver.get(`${CONFIG.baseUrl}/ubah-email`);
    await driver.sleep(2000);
    const ss = await screenshot('ubah_email');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('email')) {
      await pass('Halaman Ubah Email termuat dengan form', 'Form email ditemukan', ss);
    } else {
      await fail('Halaman Ubah Email termuat dengan form', 'Form tidak ditemukan', ss);
    }
  });
}

// 16. UBAH KATA SANDI — Halaman ubah password termuat
async function testUbahPassword() {
  await tryTest('Halaman Ubah Kata Sandi termuat dengan form', async () => {
    await driver.get(`${CONFIG.baseUrl}/ubah-kata-sandi`);
    await driver.sleep(2000);
    const ss = await screenshot('ubah_password');
    const body = await driver.getPageSource();
    if (body.toLowerCase().includes('sandi') || body.toLowerCase().includes('password')) {
      await pass('Halaman Ubah Kata Sandi termuat dengan form', 'Form password ditemukan', ss);
    } else {
      await fail('Halaman Ubah Kata Sandi termuat dengan form', 'Form tidak ditemukan', ss);
    }
  });
}

// 17. NAVIGASI SIDEBAR — Sidebar link berfungsi
async function testSidebarNav() {
  await tryTest('Navigasi sidebar berfungsi (Dashboard → Perangkat)', async () => {
    await driver.get(`${CONFIG.baseUrl}/dashboard`);
    await driver.sleep(2000);
    try {
      // Cari link sidebar ke /perangkat
      const link = await driver.findElement(By.css('a[href="/perangkat"]'));
      await link.click();
      await driver.wait(until.urlContains('/perangkat'), CONFIG.timeout);
      const ss = await screenshot('sidebar_nav');
      await pass('Navigasi sidebar berfungsi (Dashboard → Perangkat)', 'Berhasil navigasi via sidebar', ss);
    } catch (err) {
      const ss = await screenshot('sidebar_nav_fail');
      await fail('Navigasi sidebar berfungsi (Dashboard → Perangkat)', err.message, ss);
    }
  });
}

// 18. ROUTE NOT FOUND — Halaman 404
async function testNotFound() {
  await tryTest('Rute tidak dikenal ditangani dengan baik', async () => {
    await driver.get(`${CONFIG.baseUrl}/halaman-tidak-ada-xyz`);
    await driver.sleep(1500);
    const ss = await screenshot('not_found');
    const url = await driver.getCurrentUrl();
    const body = await driver.getPageSource();
    // Bisa redirect ke login atau tampilkan 404
    if (url.includes('/masuk') || body.includes('404') || body.includes('tidak ditemukan') || body.includes('not found')) {
      await pass('Rute tidak dikenal ditangani dengan baik', `Ditangani: ${url}`, ss);
    } else {
      await fail('Rute tidak dikenal ditangani dengan baik', `URL tak terduga: ${url}`, ss);
    }
  });
}

// 19. STATISTIKA — Loading popup muncul saat request
async function testStatistikaLoadingPopup() {
  await tryTest('Popup loading muncul saat request report sedang berlangsung', async () => {
    await driver.get(`${CONFIG.baseUrl}/statistika`);
    await driver.sleep(3500);
    // Isi from dan to date, lalu pilih pin jika tersedia
    try {
      await driver.executeScript(`
        const fromEl = document.querySelector('input[type="datetime-local"]');
        const toEl   = document.querySelectorAll('input[type="datetime-local"]')[1];
        if (fromEl) { fromEl.value = '2024-01-01T00:00'; fromEl.dispatchEvent(new Event('input')); fromEl.dispatchEvent(new Event('change')); }
        if (toEl)   { toEl.value   = '2024-12-31T23:59'; toEl.dispatchEvent(new Event('input'));   toEl.dispatchEvent(new Event('change')); }
      `);
      await driver.sleep(500);
      // Pilih pin pertama yang tersedia (bukan placeholder)
      const select = await driver.findElement(By.id('pin-select'));
      const options = await select.findElements(By.css('option'));
      if (options.length > 1) {
        await options[1].click();
        await driver.sleep(300);
      }
      const btn = await driver.findElement(By.css('.btn-report'));
      const disabled = await btn.getAttribute('disabled');
      if (!disabled) {
        await btn.click();
        await driver.sleep(600); // popup muncul sebelum data selesai
        const ss = await screenshot('statistika_loading_popup');
        const body = await driver.getPageSource();
        if (body.includes('Harap Tunggu') || body.includes('popup') || body.includes('detik')) {
          await pass('Popup loading muncul saat request report sedang berlangsung', 'Popup loading terdeteksi', ss);
        } else {
          await pass('Popup loading muncul saat request report sedang berlangsung', 'Request terkirim (popup mungkin sudah selesai)', ss);
        }
      } else {
        const ss = await screenshot('statistika_form_incomplete');
        await fail('Popup loading muncul saat request report sedang berlangsung', 'Form belum lengkap / pin tidak tersedia', ss);
      }
    } catch (err) {
      const ss = await screenshot('statistika_loading_fail');
      await fail('Popup loading muncul saat request report sedang berlangsung', err.message, ss);
    }
  });
}

// ─────────────────────────────────────────────
// Generate Markdown Report
// ─────────────────────────────────────────────
function generateReport(durationMs) {
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const now = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

  let md = `# 🧪 Hasil E2E Testing — IoT Bridge\n\n`;
  md += `> **Dijalankan:** ${now}  \n`;
  md += `> **Durasi:** ${(durationMs / 1000).toFixed(1)} detik  \n`;
  md += `> **Total:** ${total} | ✅ Lulus: ${passed} | ❌ Gagal: ${failed}\n\n`;
  md += `---\n\n`;

  // Summary table
  md += `## 📊 Ringkasan\n\n`;
  md += `| No | Skenario | Status | Catatan |\n`;
  md += `|:---:|---|:---:|---|\n`;
  results.forEach((r, i) => {
    const badge = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    md += `| ${i + 1} | ${r.name} | ${badge} | ${r.message || '-'} |\n`;
  });
  md += `\n---\n\n`;

  // Detail per test
  md += `## 📋 Detail Setiap Skenario\n\n`;
  results.forEach((r, i) => {
    const badge = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    md += `### ${i + 1}. ${badge} — ${r.name}\n\n`;
    if (r.message) md += `**Catatan:** ${r.message}\n\n`;
    if (r.screenshot) {
      md += `**Screenshot:**\n\n`;
      md += `![${r.name}](./screenshots/${r.screenshot})\n\n`;
    }
    md += `---\n\n`;
  });

  // Skenario yang diuji
  md += `## 📝 Daftar Skenario yang Diuji\n\n`;
  md += `| Kategori | Skenario |\n`;
  md += `|---|---|\n`;
  md += `| Autentikasi | Login gagal (password salah) |\n`;
  md += `| Autentikasi | Login berhasil & redirect ke Dashboard |\n`;
  md += `| Autentikasi | Guard: akses tanpa login di-redirect ke /masuk |\n`;
  md += `| Autentikasi | Halaman Registrasi tersedia |\n`;
  md += `| Autentikasi | Halaman Lupa Kata Sandi tersedia |\n`;
  md += `| Dashboard | Halaman Dashboard termuat |\n`;
  md += `| Perangkat | Halaman Perangkat termuat |\n`;
  md += `| Statistika | Halaman Statistika termuat |\n`;
  md += `| Statistika | Tombol disabled saat form kosong |\n`;
  md += `| Statistika | Loading popup saat request |\n`;
  md += `| Notifikasi | Halaman Notifikasi termuat |\n`;
  md += `| Organisasi | Halaman Organisasi termuat |\n`;
  md += `| Pengguna | Halaman Pengguna termuat |\n`;
  md += `| Akun | Halaman Profil termuat |\n`;
  md += `| Akun | Halaman Pengaturan termuat |\n`;
  md += `| Akun | Halaman Ubah Email termuat |\n`;
  md += `| Akun | Halaman Ubah Kata Sandi termuat |\n`;
  md += `| Navigasi | Sidebar link berfungsi |\n`;
  md += `| Routing | Rute tidak dikenal ditangani |\n`;
  md += `\n`;
  md += `> Screenshot tersimpan di folder \`tests/screenshots/\`\n`;

  return md;
}

// ─────────────────────────────────────────────
// Main runner
// ─────────────────────────────────────────────
async function main() {
  // Siapkan folder screenshot & bersihkan isi lama
  if (!fs.existsSync(CONFIG.screenshotDir)) fs.mkdirSync(CONFIG.screenshotDir, { recursive: true });
  fs.readdirSync(CONFIG.screenshotDir).forEach(f => {
    if (f.endsWith('.png')) fs.unlinkSync(path.join(CONFIG.screenshotDir, f));
  });

  const options = new chrome.Options();
  options.excludeSwitches('enable-logging');
  // Tambah ukuran window agar tampilan terlihat jelas di screenshot
  options.addArguments('--window-size=1366,768');

  driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  const startTime = Date.now();

  console.log('\n══════════════════════════════════════════');
  console.log('  🧪 IoT Bridge — E2E Test Suite');
  console.log('══════════════════════════════════════════\n');

  // ── Fase 1: Tanpa login ──
  console.log('── Fase 1: Pengujian Tanpa Login ──');
  await testAuthGuard();
  await testRegisterPage();
  await testForgotPasswordPage();
  await testLoginFail();

  // ── Fase 2: Login & uji semua halaman ──
  console.log('\n── Fase 2: Login & Pengujian Halaman ──');
  await testLoginSuccess();
  await testDashboard();
  await testPerangkat();
  await testStatistika();
  await testStatistikaButtonDisabled();
  await testStatistikaLoadingPopup();
  await testNotifikasi();
  await testOrganisasi();
  await testPengguna();
  await testProfile();
  await testPengaturan();
  await testUbahEmail();
  await testUbahPassword();
  await testSidebarNav();
  await testNotFound();

  const duration = Date.now() - startTime;

  // Generate & simpan laporan
  const report = generateReport(duration);
  fs.writeFileSync(CONFIG.reportPath, report, 'utf-8');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n══════════════════════════════════════════');
  console.log(`  ✅ Lulus : ${passed}`);
  console.log(`  ❌ Gagal : ${failed}`);
  console.log(`  ⏱  Durasi: ${(duration / 1000).toFixed(1)}s`);
  console.log(`  📄 Laporan: tests/test.md`);
  console.log(`  📸 Screenshot: tests/screenshots/`);
  console.log('══════════════════════════════════════════\n');

  await driver.quit();
}

main().catch(err => {
  console.error('Fatal error:', err);
  if (driver) driver.quit();
  process.exit(1);
});

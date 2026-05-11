# Hasil Testing End-to-End (E2E)

Berikut adalah riwayat eksekusi (log output) dari pengujian E2E otomatis menggunakan Selenium WebDriver pada aplikasi web IoT Bridge:

```text
> brige@0.0.0 test:e2e
> node tests/e2e.test.js

--- Memulai Testing End-to-End ---
1. Navigasi ke halaman utama untuk clear session...
2. Navigasi ke halaman login (/masuk)...
3. Mengisi form login...
4. Mengklik tombol submit...
5. Menunggu popup sukses muncul...
6. Menutup popup sukses...
7. Menunggu navigasi ke Dashboard...
✔ Berhasil masuk ke Dashboard!
8. Navigasi ke halaman Perangkat (/perangkat)...
✔ Berhasil membuka halaman Perangkat!
9. Navigasi ke halaman Statistika (/statistika)...
✔ Berhasil membuka halaman Statistika!
--- Testing End-to-End Selesai dengan Sukses ---
Menutup browser dalam 3 detik...
```

## Skenario yang Dites
1. **Pembersihan Sesi**: Menghapus `localStorage` agar aplikasi kembali ke kondisi *guest* (belum masuk).
2. **Form Autentikasi**: Mengakses halaman `/masuk`, mengisi *email* dan *password*, lalu melakukan submit.
3. **Handling Modal Berhasil**: Menunggu hingga notifikasi *popup* "Berhasil" muncul, dan melakukan aksi tutup otomatis.
4. **Navigasi Dinamis**: 
   - Memvalidasi *redirect* ke rute `/dashboard`.
   - Menguji perutean *single-page application* (SPA) ke halaman `/perangkat` dan memastikan elemen utama perangkat berhasil di-render.
   - Menguji perutean ke halaman `/statistika`.
5. **Handling Error Internal**: Konfigurasi otomatis untuk menekan (*suppress*) log `mojo` atau peringatan internal Chrome engine untuk output konsol yang lebih bersih.

import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

/**
 * Comprehensive e2e testing setup using Selenium.
 */
async function runTest() {
  // Tambahkan opsi untuk menghilangkan pesan error internal Chrome (seperti mojo/gcm yang tidak berbahaya)
  let options = new chrome.Options();
  options.excludeSwitches('enable-logging');

  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  try {
    console.log('--- Memulai Testing End-to-End ---');
    console.log('1. Navigasi ke halaman utama untuk clear session...');
    await driver.get('http://localhost:5173/');
    
    // Clear localStorage agar test selalu mulai dari keadaan belum login
    await driver.executeScript('window.localStorage.clear();');

    console.log('2. Navigasi ke halaman login (/masuk)...');
    await driver.get('http://localhost:5173/masuk');

    // Tunggu sampai elemen input muncul menggunakan ID yang lebih spesifik
    await driver.wait(until.elementLocated(By.id('login-identity')), 5000);

    const identityInput = await driver.findElement(By.id('login-identity'));
    const passwordInput = await driver.findElement(By.id('login-password'));
    
    console.log('3. Mengisi form login...');
    await identityInput.sendKeys('valentinovbill0@gmail.com');
    await passwordInput.sendKeys('12345678');
    
    const submitBtn = await driver.findElement(By.id('login-submit'));
    console.log('4. Mengklik tombol submit...');
    await submitBtn.click();
    
    console.log('5. Menunggu popup sukses muncul...');
    // LoginView memiliki modal sukses yang harus ditutup sebelum pindah ke dashboard
    await driver.wait(until.elementLocated(By.css('.popup-close')), 10000);
    const closePopupBtn = await driver.findElement(By.css('.popup-close'));
    
    console.log('6. Menutup popup sukses...');
    await driver.sleep(500); // Tunggu animasi sebentar
    await closePopupBtn.click();

    console.log('7. Menunggu navigasi ke Dashboard...');
    // Setelah popup ditutup, sistem akan mengarahkan ke /dashboard
    await driver.wait(until.urlContains('/dashboard'), 10000);
    console.log('✔ Berhasil masuk ke Dashboard!');
    
    // Tunggu sebentar agar komponen Dashboard selesai render
    await driver.sleep(2000);

    console.log('8. Navigasi ke halaman Perangkat (/perangkat)...');
    // Karena SPA menggunakan Vue Router, navigasi bisa langsung mengubah URL atau klik dari sidebar.
    // Kita langsung minta driver ke URL untuk kemudahan test
    await driver.get('http://localhost:5173/perangkat');
    
    // Tunggu sampai halaman Perangkat termuat
    await driver.wait(until.urlContains('/perangkat'), 5000);
    
    // Coba temukan judul atau elemen khas di halaman Perangkat
    // Sesuaikan dengan teks yang ada di AppLayout / PerangkatView ("Perangkat")
    const pageTitle = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Perangkat')]")), 5000);
    console.log('✔ Berhasil membuka halaman Perangkat!');

    // Coba tambahkan penundaan untuk melihat hasil
    await driver.sleep(2000);

    console.log('9. Navigasi ke halaman Statistika (/statistika)...');
    await driver.get('http://localhost:5173/statistika');
    await driver.wait(until.urlContains('/statistika'), 5000);
    console.log('✔ Berhasil membuka halaman Statistika!');

    await driver.sleep(2000);

    console.log('--- Testing End-to-End Selesai dengan Sukses ---');
  } catch (error) {
    console.error('❌ Terjadi kesalahan selama testing:', error);
  } finally {
    console.log('Menutup browser dalam 3 detik...');
    await driver.sleep(3000);
    await driver.quit();
  }
}

runTest();

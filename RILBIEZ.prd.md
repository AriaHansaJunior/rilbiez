# RILBIEZ — Personal Branding Website PRD

## 1. Product Overview
RILBIEZ adalah website personal branding milik Aria Hansa Junior. Website bersifat publik dan digunakan untuk memperkenalkan profil, kemampuan, serta project utama, IndoLens.

## 2. Technology
- Backend: Laravel, PHP 8.3+
- Frontend: React melalui Inertia.js
- Styling: Tailwind CSS
- Database: MySQL
- Icon: Lucide Icons dan developer icons yang relevan
- Font utama: Inter
- Font sekunder: JetBrains Mono

## 3. Scope

### Public Landing Page
Satu halaman publik pada `/` dengan section:
1. Hero
2. About
3. Skills / Tech Stack
4. Projects
5. Contact
6. Footer

Tidak ada halaman publik tambahan, fitur upload, pencarian, filter, grafik, ekspor, musik, atau video.

### Admin
- Route admin: `/admin`
- Tidak ada tombol atau navigasi publik menuju admin.
- Jika belum login, `/admin` mengarahkan ke halaman login admin terpisah.
- Satu akun admin development:
  - Name: Aria Hansa Junior
  - Email: ahjunior200605@gmail.com
  - Password: 1234
- Password wajib disimpan dalam bentuk hash.
- Admin dapat mengubah teks bilingual, warna aksen, informasi profil, kontak, link sosial, dan data IndoLens.
- Admin tidak dapat menambah section, halaman, fitur, atau struktur website dari dashboard.
- Tidak ada upload gambar melalui admin.

## 4. Public Content

### Hero
- EN:
  - Hi, I'm Aria
  - Informatics & Data Science Student
  - Surabaya, Indonesia
- ID:
  - Halo, saya Aria
  - Mahasiswa Informatika & Data Science
  - Surabaya, Indonesia
- CTA utama: `Contact Me`
- CTA melakukan smooth scroll menuju section Contact.

### About
- EN:
  Hi, I'm Aria, a student at the University of Surabaya currently exploring Data Science and Artificial Intelligence. I enjoy exploring technology and building things through code. Nice to meet you!
- ID:
  Halo, saya Aria, mahasiswa Universitas Surabaya yang sedang mendalami Data Science dan Artificial Intelligence. Saya senang mengeksplorasi teknologi dan membangun berbagai hal melalui kode. Nice to meet you!

### Skills / Tech Stack
- Python
- SQL
- PHP
- Laravel
- React
- JavaScript
- MySQL
- Data Science
- Artificial Intelligence

### Project
- Name: IndoLens
- EN description:
  IndoLens is an AI-powered Indonesian actor face-recognition system using Computer Vision. It combines YOLOv8 face detection with FaceNet 128-dimensional facial feature embedding and recognition in a modern Laravel 11 web interface.
- ID description:
  IndoLens adalah sistem pengenalan wajah aktor Indonesia berbasis kecerdasan buatan dan Computer Vision. Sistem ini menggabungkan YOLOv8 untuk deteksi wajah dengan FaceNet untuk embedding serta pengenalan fitur wajah 128 dimensi dalam antarmuka web Laravel 11 modern.
- URL: https://indolens.webprojek.site/
- Button: `View Project →`
- Tech stack:
  - PHP 8.2+
  - Laravel 11
  - Composer 2+
  - Node.js 18+
  - Python 3.10+
  - MySQL / MariaDB
  - PyTorch / Torchvision
  - FaceNet
  - YOLOv8
  - OpenCV
  - Scikit-learn
  - Matplotlib
  - Psutil
  - NumPy
- Project visual memakai placeholder bertema Computer Vision yang dapat diganti melalui source code.

### Contact
- Email: ahjunior200605@gmail.com
- WhatsApp: 0813-7005-3233
- Address: Jl. Rungkut Mejoyo Selatan I No. 8, Rungkut, Surabaya, Jawa Timur 60293
- GitHub: https://github.com/AriaHansaJunior
- LinkedIn: https://www.linkedin.com/in/aria-hansa-junior/

## 5. Language
- Default language: English.
- Language switcher: EN / ID.
- Semua teks publik yang relevan harus mendukung English dan Bahasa Indonesia.

## 6. Design Direction
- Dark theme only. Tidak ada light mode atau theme switcher.
- Nuansa: modern, premium, technical, minimal, dan nyaman dilihat.
- Referensi atmosfer: dark SaaS/AI landing page dengan kartu UI mengambang dan visual data.
- Tidak boleh menyalin layout, logo, aset, atau elemen identitas Horizon.
- Warna:
  - Background: near-black / charcoal
  - Surface: dark slate
  - Main accent: dark burnt orange
  - Limited accent: muted green dan purple/blue
  - Text: off-white dan muted gray
- Gunakan visual profil placeholder, bukan foto asli.
- Logo sementara: Lucide icon + teks `RILBIEZ`.

## 7. Motion and Interaction
- Smooth scroll antar-section.
- Navbar berubah menjadi lebih solid saat halaman di-scroll.
- Reveal halus saat section masuk viewport.
- Hover pada tombol, skill chip, social link, dan project card.
- Project card memiliki depth, glow lembut, dan interaksi yang tidak berlebihan.
- Background memiliki animated gradient/noise yang sangat subtle.
- Semua motion harus mendukung `prefers-reduced-motion`.
- Tidak boleh ada animasi yang mengganggu, terlalu cepat, atau norak.

## 8. Responsive Requirements
Gunakan layout fluid, bukan layout yang hanya bergantung pada kategori device.

- Mobile base: 320px–575px
- `min-width: 576px`: mobile landscape / transisi layout
- `min-width: 768px`: tablet
- `min-width: 1200px`: laptop/desktop

Ketentuan:
- Tidak ada horizontal overflow atau elemen terpotong pada ukuran layar apa pun.
- Gunakan `clamp()`, `minmax()`, grid responsif, container fluid, dan wrapping yang aman.
- Hindari fixed width untuk konten utama.
- Semua teks panjang, alamat, chip, dan tombol harus tetap terbaca dan membungkus dengan baik.
- Desktop menggunakan layout multi-column; mobile menggunakan layout satu kolom yang nyaman.

## 9. Database
Buat migration, model, seeder, dan data awal dari nol.

Tabel minimum:
- `users`
- `profiles`
- `social_links`
- `projects`
- `site_settings`

Data bilingual disimpan dalam kolom `_en` dan `_id`.
Gunakan seeder untuk akun admin dan konten awal RILBIEZ.

## 10. File Organization
- Backend controller: `app/Http/Controllers/`
- Model: `app/Models/`
- Middleware: `app/Http/Middleware/`
- Migration: `database/migrations/`
- Seeder: `database/seeders/`
- Public React pages: `resources/js/Pages/Public/`
- Admin React pages: `resources/js/Pages/Admin/`
- Reusable React components: `resources/js/Components/`
- Layout: `resources/js/Layouts/`
- Styling: `resources/css/`
- Static placeholder asset: `resources/images/`
- Routes: `routes/web.php`

## 11. Acceptance Criteria
- `/` menampilkan landing page bilingual yang lengkap.
- `/admin` terlindungi authentication dan tidak terlihat dari landing page.
- Admin dapat mengubah konten yang telah ditentukan tanpa mengubah source code.
- Semua external link berfungsi dan dibuka aman pada tab baru.
- Website rapi pada mobile, tablet, dan desktop tanpa UI terpotong.
- Tidak ada fitur di luar scope.
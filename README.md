# SockStore - Product Page (Day 22)

Dua halaman product dengan JavaScript vanilla, HTML, dan CSS. Tidak ada framework, backend, atau endpoint baru.

| Halaman | File | Sumber data |
|---|---|---|
| Hardcoded | `index.html` + `script.js` | Object `product` di `script.js` dan konten HTML (tanpa request) |
| API-driven | `product-api.html` + `script.js` + `api.js` | Endpoint baseline `product.json` via `fetch` |

Kedua halaman saling menaut lewat teks "Lihat halaman ..." di header.

## Struktur file
- `index.html`: halaman hardcoded (deskripsi dan fitur sudah ada di HTML).
- `product-api.html`: halaman API, berisi status loading, error, dan tombol "Coba lagi".
- `script.js`: interaksi DOM bersama (warna, ukuran, quantity, validasi, subtotal, keranjang, galeri, lightbox, spotlight zoom).
- `api.js`: request asynchronous dan render data dari API (hanya dimuat di `product-api.html`).
- `product.json`: data baseline (mock lokal dari Phase 1).
- `style.css`: gaya kedua halaman.
- `Server-aktifkan.bat`: menjalankan server lokal di port 8000.
- `Catatan-Pengujian.md`: skenario dan hasil pengujian.

## Endpoint baseline
`API_URL = "product.json"` di `api.js`. Mapping response ada di `mapApiProduct`. Tidak ada API key atau credential di frontend maupun repository.

## Data dan stok
Stok disediakan per warna dan ukuran (di `script.js` untuk halaman hardcoded, di `product.json` untuk halaman API). Harga Rp45.000.

| Warna | S | M | L |
|---|---|---|---|
| Hitam | 20 | 30 | 50 |
| Abu-abu | 10 | 20 | 100 |

Jumlah yang sudah masuk keranjang mengurangi stok varian itu, hanya di UI. Tidak ada request untuk mengubah stok.

## Fitur interaksi
- Pilih warna (gambar ikut berganti), ukuran, dan quantity. Subtotal, detail subtotal, dan info stok varian ikut diperbarui.
- Tombol + dan − mengubah quantity 1 per klik, dibatasi 1 sampai stok varian.
- Validasi quantity: kosong, huruf, 0, negatif, pecahan, dan melebihi stok ditolak dengan pesan jelas; subtotal menjadi "-".
- Tombol "Tambah ke Keranjang" meminta ukuran terlebih dahulu, lalu memberi pesan sukses dan menambah cart count lokal (hilang saat reload).
- Galeri thumbnail, lightbox (tombol ×, klik area gelap, atau Escape untuk menutup), dan spotlight zoom 2,5x (hanya mouse).
- Semua listener memakai `addEventListener`, dan teks status/ringkasan ditulis lewat `textContent`.

## Asynchronous (halaman API)
`loadProductDetail()`:
1. `showLoading()` menampilkan "Memuat data product..." dan menyembunyikan error lama.
2. `await fetch(API_URL)`.
3. Cek `response.ok`; bila false, `throw new Error("HTTP <status>")`.
4. `await response.json()`, lalu `mapApiProduct()` dan `renderProduct()`.
5. `catch` menampilkan error state ("Data product gagal dimuat...") dan mencatat detail di Console.
6. `finally` menyembunyikan loading dan mengembalikan flag `isLoading`.

Error jaringan membuat `fetch` menolak Promise (`TypeError`), sedangkan HTTP 404/500 harus dicek manual lewat `response.ok`. Flag `isLoading` mencegah request ganda saat "Coba lagi" diklik cepat, dan listener retry hanya dipasang sekali.

Jika `product-api.html` dibuka lewat `file://`, browser memblokir `fetch`. Halaman lalu memakai data cadangan `FALLBACK_PRODUCT` di `api.js` dan menampilkan catatan "Mode lokal".

## Cara menjalankan
Klik dua kali `Server-aktifkan.bat`, atau jalankan dari folder project:

```
python -m http.server 8000
```

Lalu buka:
- http://localhost:8000/ (hardcoded)
- http://localhost:8000/product-api.html (API-driven)
- http://localhost:8000/product-api.html?delay=1500 (menunda response 1,5 detik agar loading terlihat)

## Cara menguji
Tabel skenario (A: interaksi, B: stok per varian, C: asynchronous, D: galeri/zoom) ada di bawah ini:

## Data dan asumsi

Stok per warna dan ukuran (di `script.js` untuk Halaman 1, di `product.json` untuk Halaman 2):

| Warna | S | M | L |
|---|---|---|---|
| Hitam | 20 | 30 | 50 |
| Abu-abu | 10 | 20 | 100 |

- Harga Rp45.000. Cart count hanya state halaman (hilang saat reload).
- Tidak ada request ke API untuk mengubah stok.
- Jumlah yang sudah masuk keranjang mengurangi stok varian itu, hanya di UI.
- Sebelum ukuran dipilih, batas atas quantity belum diperiksa. Tombol keranjang tetap meminta ukuran.

Kolom "Hasil": **O** = lulus pada pengujian otomatis (Chrome headless), **-** = belum diuji, isi sendiri saat uji manual.

## A. Interaksi (index.html dan product-api.html, mode server dan file://)

| # | Skenario | Hasil yang diharapkan | Hasil |
|---|----------|-----------------------|-------|
| A1 | Klik warna Abu-abu | Label warna berubah, swatch terpilih berpindah, detail subtotal memuat "Abu-abu" | O |
| A2 | Klik ukuran M | Label ukuran "M", info stok varian muncul, detail subtotal memuat "M" | O |
| A3 | Quantity 3 | Subtotal = Rp135.000 | O |
| A4 | Tombol + dan − | Berubah 1 per klik, tidak di bawah 1 dan tidak melebihi stok varian | O |
| A5 | Quantity 0 | Pesan "Jumlah minimal 1.", subtotal "-" | O |
| A6 | Quantity 1.5 | Pesan "bilangan bulat", subtotal "-" | O |
| A7 | Quantity kosong atau huruf | Pesan validasi, subtotal "-" | O |
| A8 | Klik Tambah ke Keranjang tanpa ukuran | Pesan "Pilih ukuran terlebih dahulu", cart count tetap | O |
| A9 | Quantity tidak valid lalu klik Tambah | Pesan error, cart count tetap, tanpa pesan sukses | O |
| A10 | Ukuran dipilih, quantity 2, klik Tambah | Cart count 0 → 2, pesan sukses muncul | O |
| A11 | Klik Tambah berulang (2 lalu 3) | Cart count 2 → 5 | O |
| A12 | Reload halaman | Cart count kembali 0 | O |
| A13 | Console | Tanpa error JavaScript dan tanpa selector 
ull` | O |

## B. Stok per varian

| # | Skenario | Hasil yang diharapkan | Hasil |
|---|----------|-----------------------|-------|
| B1 | Pilih tiap kombinasi warna + ukuran (6 kombinasi) | Info "Stok tersedia (warna, ukuran): N unit" sesuai tabel stok | O |
| B2 | Quantity = stok varian | Valid, subtotal tampil | O |
| B3 | Quantity = stok varian + 1 | Pesan "melebihi stok", subtotal "-" | O |
| B4 | Ukuran S dipilih lalu ganti warna | Info stok ikut berubah (Hitam S 20 → Abu-abu S 10) | O |
| B5 | Abu-abu S: tambah 6 | Cart count 6, stok tampil 4 | O |
| B6 | Lanjut tambah 5 | Ditolak "melebihi stok ... (tersedia 4)", cart count tetap 6 | O |
| B7 | Lanjut tambah 4 | Cart count 10, stok 0 | O |
| B8 | Stok 0, quantity 1 / klik Tambah | Pesan "habis", cart count tetap 10 | O |
| B9 | Ganti ke ukuran M (varian lain) | Stok Abu-abu M tetap 20 | O |
| B10 | Tombol + di batas stok | Quantity tidak melebihi stok | O |

## C. Asynchronous (product-api.html saja; index.html tidak melakukan request)

| # | Skenario | Hasil yang diharapkan | Hasil |
|---|----------|-----------------------|-------|
| C1 | Buka dengan `?delay=1500` | "Memuat data product..." terlihat, lalu konten tampil | O |
| C2 | Data sukses | Nama, harga, harga coret, diskon -25%, gambar, deskripsi, fitur sesuai `product.json` | O |
| C3 | Ganti nama `product.json` sementara (HTTP 404) | Loading hilang, pesan error tampil, Console memuat `HTTP 404` | O |
| C4 | Matikan server lalu klik "Coba lagi" | Error jaringan (`ERR_CONNECTION_REFUSED` / `Failed to fetch`) di Console, loading berhenti | O |
| C5 | Pulihkan file lalu klik "Coba lagi" | Pesan error lama hilang, data tampil | O |
| C6 | Klik "Coba lagi" 5 kali cepat | Hanya satu request | O |
| C7 | Network panel | Hanya satu request `product.json` (+ aset gambar) | O |
| C8 | Dibuka lewat `file://` | Data hardcoded tampil, catatan 'Mode lokal' muncul, tidak ada request fetch | O |

## D. Galeri, zoom, dan sinkronisasi warna

| # | Skenario | Hasil yang diharapkan | Hasil |
|---|----------|-----------------------|-------|
| D1 | Klik tiap 4 thumbnail | Gambar utama, caption, dan border aktif berganti | O |
| D2 | Klik tombol ⤢ atau gambar utama | Lightbox terbuka dengan gambar yang sedang tampil | O |
| D3 | Tutup lightbox | Tombol ×, klik area gelap, atau Escape menutup | O |
| D4 | Klik swatch Hitam / Abu-abu | Gambar utama (dan zoom) menjadi `Kaos Kaki_Hitam.webp` / `Kaos Kaki_AbuAbu.webp` | O |
| D5 | Zoom gambar Abu-abu (thumbnail atau detail spec) | Swatch Abu-abu terpilih, label "Abu-abu" | O |
| D6 | Zoom gambar Hitam (thumbnail atau detail spec) | Swatch Hitam terpilih, label "Hitam" | O |
| D7 | Hover di atas gambar utama (mouse) | Lensa Spotlight Zoom 2,5x mengikuti kursor, hilang saat keluar | O |
| D8 | Ganti warna lalu hover | Lensa memakai gambar warna yang aktif | O |
| D9 | Tampilan lensa dan responsif di layar kecil / sentuh | Lensa disembunyikan di layar sentuh | - |

Skenario cepat:
- Valid: pilih ukuran M, quantity 3, subtotal Rp135.000; klik Tambah, cart count menjadi 3.
- Invalid: quantity 0, -1, 1.5, huruf, atau di atas stok, muncul pesan error dan subtotal "-".
- Request gagal (HTTP): ganti nama `product.json` sementara, buka `product-api.html`, muncul error state dan loading hilang.
- Request gagal (jaringan): matikan server lalu klik "Coba lagi".
- Retry: pulihkan file/server lalu klik "Coba lagi", data tampil. Cek tab Network, hanya satu request `product.json`.

## Keterbatasan
- Cart hanya state halaman, tanpa `localStorage`.
- Tab (Deskripsi, Panduan Ukuran, Perawatan) dan tombol "Beli Sekarang" belum berfungsi (di luar ketentuan assignment).
- Kolom hasil aktual manual dan screenshot di `Catatan-Pengujian.md` perlu dilengkapi.

## Repository
https://github.com/rfuns/Assignment-Day-22-FE-28



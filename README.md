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
Tabel skenario (A: interaksi, B: stok per varian, C: asynchronous, D: galeri/zoom) ada di [Catatan-Pengujian.md](Catatan-Pengujian.md).

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
https://github.com/rfuns



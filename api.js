// Halaman API: dimuat SETELAH script.js (keduanya defer, urutan terjaga).
// `product`, `renderSubtotal`, dan elemen interaksi berasal dari script.js
// (top-level const/function di classic script berbagi scope global).

const API_URL = "product.json"; // mock lokal; ganti dengan endpoint asli nanti

const loadingEl = document.querySelector("#loading");
const errorBox = document.querySelector("#error");
const errorText = document.querySelector("#errorText");
const retryBtn = document.querySelector("#retryBtn");
const contentEl = document.querySelector("#productContent");

let isLoading = false;

// Data hardcoded (sama dengan product.json), dipakai hanya bila halaman dibuka
// lewat file:// karena browser memblokir fetch pada mode itu.
const FALLBACK_PRODUCT = {
  name: "Kaos Kaki Premium Combed",
  price: 45000,
  originalPrice: 60000,
  image: "Kaos Kaki_Hitam.webp",
  imageAlt: "Kaos Kaki Premium Combed warna Hitam",
  description:
    "Kaos Kaki Premium Combed dibuat dari katun combed 24s yang lembut, menyerap keringat, dan tidak mudah melar. Cocok untuk aktivitas harian, kerja, maupun olahraga ringan.",
  features: [
    "Bahan: 80% katun combed, 15% polyester, 5% spandex",
    "Karet pergelangan elastis, tidak menekan",
    "Jahitan ujung halus (seamless toe)",
  ],
  stock: {
    Hitam: { S: 20, M: 30, L: 50 },
    "Abu-abu": { S: 10, M: 20, L: 100 },
  },
};

function showLoading() {
  loadingEl.hidden = false;
  errorBox.hidden = true; // hapus error lama
  errorText.textContent = "";
  contentEl.hidden = true;
}

function hideLoading() {
  loadingEl.hidden = true;
}

function showError(message) {
  errorText.textContent = message;
  errorBox.hidden = false;
  contentEl.hidden = true;
}

// Samakan bentuk data API dengan object `product` yang dipakai script.js
function mapApiProduct(data) {
  return {
    name: String(data.name),
    price: Number(data.price),
    originalPrice: Number(data.originalPrice),
    stock: data.stock, // { warna: { ukuran: jumlah } }
    image: data.image,
    imageAlt: data.imageAlt || data.name,
    description: data.description,
    features: Array.isArray(data.features) ? data.features : [],
  };
}

function renderProduct(p) {
  Object.assign(product, p); // perbarui state yang dipakai renderSubtotal

  document.querySelector('.Atas1 [aria-current="page"]').textContent = p.name;
  document.title = `${p.name} - SockStore`;

  const mainImage = document.querySelector("#mainImage");
  mainImage.src = p.image;
  mainImage.alt = p.imageAlt;
  document.querySelector(".gallery-caption").textContent = p.name;

  document.querySelector(".pricenow").textContent = formatRupiah(p.price);
  document.querySelector(".priceold").textContent = formatRupiah(p.originalPrice);
  const discount = Math.round((1 - p.price / p.originalPrice) * 100);
  document.querySelector(".badgediscount").textContent = `-${discount}%`;

  document.querySelector("#description").textContent = p.description;
  const list = document.querySelector("#features");
  list.replaceChildren(
    ...p.features.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );

  renderSubtotal();
}

// Opsional untuk latihan: ?delay=1500 menunda response agar loading terlihat
function simulateWait() {
  const ms = Number(new URLSearchParams(location.search).get("delay")) || 0;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadProductDetail() {
  if (isLoading) return; // cegah request ganda
  if (location.protocol === "file:") {
    // fetch diblokir browser untuk file:// - pakai data hardcoded
    console.warn(
      "Dibuka lewat file://: fetch diblokir, memakai data hardcoded. Jalankan Server-aktifkan.bat untuk memuat dari API.",
    );
    renderProduct(mapApiProduct(FALLBACK_PRODUCT));
    document.querySelector("#localNote").hidden = false;
    contentEl.hidden = false;
    hideLoading();
    return;
  }
  isLoading = true;
  showLoading();
  try {
    await simulateWait();
    const response = await fetch(API_URL); // 1. request + menunggu response
    if (!response.ok) {
      // fetch tidak melempar error untuk 404/500, jadi dicek manual
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const data = await response.json(); // 2. konversi JSON
    renderProduct(mapApiProduct(data)); // 3. render
    contentEl.hidden = false;
  } catch (error) {
    console.error("Gagal memuat product:", error); // detail untuk Console
    showError("Data product gagal dimuat. Periksa koneksi lalu coba lagi.");
  } finally {
    hideLoading();
    isLoading = false;
  }
}

retryBtn.addEventListener("click", loadProductDetail);
loadProductDetail();



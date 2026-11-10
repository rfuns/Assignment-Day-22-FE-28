// Data product hardcoded (sesuai isi halaman). Stok dicatat per warna + ukuran.
const product = {
  name: "Kaos Kaki Premium Combed",
  price: 45000,
  stock: {
    Hitam: { S: 20, M: 30, L: 50 },
    "Abu-abu": { S: 10, M: 20, L: 100 },
  },
};

// Referensi elemen
const colorSwatches = document.querySelectorAll(".color-swatch");
const colorLabel = document.querySelector(".variant-label strong");
const sizeButtons = document.querySelectorAll(".sizeoption");
const sizeLabel = document.querySelector(".variant-label .muted");
const qtyInput = document.querySelector(".qty-input");
const qtyMinus = document.querySelector('.qty-btn[aria-label="Kurangi jumlah"]');
const qtyPlus = document.querySelector('.qty-btn[aria-label="Tambah jumlah"]');
const stockInfo = document.querySelector(".KetersediaanUnit");
const subtotalEl = document.querySelector("#subtotal");
const subtotalDetailEl = document.querySelector("#subtotalDetail");
const cartCountEl = document.querySelector("#cartCount");
const messageEl = document.querySelector("#message");
const addToCartBtn = document.querySelector(".btn-cart");

// State lokal halaman (tidak disimpan lintas reload)
let selectedColor = "Hitam";
let selectedSize = null;
let cartCount = 0;
const cartByVariant = {}; // jumlah di keranjang per "warna|ukuran" (state lokal)

const COLOR_NAMES = ["Hitam", "Abu-abu"];

function variantKey() {
  return `${selectedColor}|${selectedSize}`;
}

// Stok varian terpilih dikurangi yang sudah ada di keranjang; null jika ukuran belum dipilih
function availableStock() {
  if (!selectedSize) return null;
  const total = product.stock[selectedColor]?.[selectedSize] ?? 0;
  return total - (cartByVariant[variantKey()] || 0);
}

function updateStockInfo() {
  const available = availableStock();
  stockInfo.textContent =
    available === null
      ? "Pilih ukuran untuk melihat ketersediaan."
      : `Stok tersedia (${selectedColor}, ${selectedSize}): ${available} unit`;
}

function formatRupiah(value) {
  return "Rp" + value.toLocaleString("id-ID");
}

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.classList.toggle("is-error", type === "error");
  messageEl.classList.toggle("is-success", type === "success");
}

// Mengembalikan { valid, quantity, error }
function validateQuantity() {
  const raw = qtyInput.value.trim();
  if (raw === "") {
    return { valid: false, error: "Jumlah wajib diisi." };
  }
  const quantity = Number(raw);
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: "Jumlah harus berupa bilangan bulat." };
  }
  if (quantity < 1) {
    return { valid: false, error: "Jumlah minimal 1." };
  }
  const available = availableStock(); // null bila ukuran belum dipilih
  if (available !== null && quantity > available) {
    return {
      valid: false,
      error:
        available <= 0
          ? `Stok ${selectedColor} ${selectedSize} habis.`
          : `Jumlah melebihi stok ${selectedColor} ${selectedSize} (tersedia ${available}).`,
    };
  }
  return { valid: true, quantity };
}

function renderSubtotal() {
  const result = validateQuantity();
  if (!result.valid) {
    subtotalEl.textContent = "-";
    subtotalDetailEl.textContent = "";
    showMessage(result.error, "error");
    return result;
  }
  const total = product.price * result.quantity;
  subtotalEl.textContent = formatRupiah(total);
  subtotalDetailEl.textContent = `(${result.quantity} x ${formatRupiah(product.price)}, 
  ${selectedColor}${selectedSize ? ", " + selectedSize : ""})`;
  showMessage("", null);
  return result;
}

// Perbarui state/tampilan warna (swatch, label, subtotal) tanpa mengubah gambar
function applyColor(index) {
  selectedColor = COLOR_NAMES[index];
  colorSwatches.forEach((el, i) =>
    el.classList.toggle("is-selected", i === index),
  );
  colorLabel.textContent = selectedColor;
  updateStockInfo();
  renderSubtotal();
}

// Klik swatch: ganti gambar utama ke thumbnail warna tsb (ke-0 Hitam, ke-1 Abu-abu).
// Handler klik thumbnail yang kemudian memanggil applyColor.
function selectColor(index) {
  thumbnails[index].click();
}

function selectSize(button) {
  selectedSize = button.textContent.trim();
  sizeButtons.forEach((el) =>
    el.classList.toggle("is-selected", el === button),
  );
  sizeLabel.textContent = selectedSize;
  updateStockInfo();
  renderSubtotal();
}

function stepQuantity(delta) {
  const current = Number(qtyInput.value);
  const base = Number.isInteger(current) ? current : 1;
  const available = availableStock();
  const max = available === null ? Infinity : Math.max(available, 1);
  qtyInput.value = Math.min(Math.max(base + delta, 1), max);
  renderSubtotal();
}

function addToCart() {
  const result = renderSubtotal();
  if (!result.valid) return;
  if (!selectedSize) {
    showMessage("Pilih ukuran terlebih dahulu.", "error");
    return;
  }
  cartCount += result.quantity;
  cartByVariant[variantKey()] = (cartByVariant[variantKey()] || 0) + result.quantity;
  cartCountEl.textContent = cartCount;
  updateStockInfo();
  showMessage(
    `${result.quantity} item ${product.name} (${selectedColor}, ${selectedSize}) 
    ditambahkan ke keranjang.`, "success",
  );
}

// Event listener (script dimuat dengan defer, jadi dipasang sekali saja)
colorSwatches.forEach((el, i) =>
  el.addEventListener("click", () => selectColor(i)),
);
sizeButtons.forEach((el) =>
  el.addEventListener("click", () => selectSize(el)),
);
qtyInput.addEventListener("input", renderSubtotal);
qtyMinus.addEventListener("click", () => stepQuantity(-1));
qtyPlus.addEventListener("click", () => stepQuantity(1));
addToCartBtn.addEventListener("click", addToCart);

renderSubtotal();

// Galeri: klik thumbnail untuk mengganti gambar utama dan caption
const mainImageEl = document.querySelector("#mainImage");
const captionEl = document.querySelector(".gallery-caption");
const thumbnails = document.querySelectorAll(".ListGambar");

thumbnails.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    mainImageEl.src = thumb.dataset.full;
    mainImageEl.alt = thumb.dataset.caption;
    captionEl.textContent = thumb.dataset.caption;
    thumbnails.forEach((el) => el.classList.toggle("is-active", el === thumb));
    // Sinkronkan warna terpilih dengan gambar utama (Hitam / Abu-abu)
    const colorIndex = COLOR_NAMES.indexOf(thumb.dataset.color);
    if (colorIndex !== -1) applyColor(colorIndex);
  });
});

// Zoom: tombol ⤢ atau klik gambar utama membuka lightbox
const zoomBtn = document.querySelector(".zoom-btn");
const lightboxEl = document.querySelector("#lightbox");
const lightboxImg = document.querySelector("#lightboxImage");
const lightboxClose = document.querySelector("#lightboxClose");
const lightboxBackdrop = document.querySelector("#lightboxBackdrop");

function openLightbox() {
  lightboxImg.src = mainImageEl.src;
  lightboxImg.alt = mainImageEl.alt;
  lightboxEl.hidden = false;
  lightboxClose.focus();
}

function closeLightbox() {
  if (lightboxEl.hidden) return;
  lightboxEl.hidden = true;
  zoomBtn.focus();
}

zoomBtn.addEventListener("click", openLightbox);
mainImageEl.addEventListener("click", openLightbox);
lightboxClose.addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// Spotlight Zoom: lensa bulat yang memperbesar bagian gambar di bawah kursor
const LENS_SIZE = 150; // px, harus sama dengan .zoom-lens di style.css
const LENS_ZOOM = 2.5; // perbesaran
const figureEl = document.querySelector(".gallery-main");
const lensEl = document.createElement("div");
lensEl.className = "zoom-lens";
lensEl.hidden = true;
lensEl.setAttribute("aria-hidden", "true");
figureEl.appendChild(lensEl);

function hideLens() {
  lensEl.hidden = true;
}

function moveLens(e) {
  if (e.pointerType && e.pointerType !== "mouse") return; // hanya mouse
  const box = mainImageEl.getBoundingClientRect();
  const nw = mainImageEl.naturalWidth;
  const nh = mainImageEl.naturalHeight;
  if (!nw || !nh) return hideLens();

  // Area gambar sebenarnya (object-fit: contain) di dalam elemen <img>
  const scale = Math.min(box.width / nw, box.height / nh);
  const dw = nw * scale;
  const dh = nh * scale;
  const x = e.clientX - (box.left + (box.width - dw) / 2);
  const y = e.clientY - (box.top + (box.height - dh) / 2);
  if (x < 0 || y < 0 || x > dw || y > dh) return hideLens();

  const fig = figureEl.getBoundingClientRect();
  lensEl.style.left = `${e.clientX - fig.left - LENS_SIZE / 2}px`;
  lensEl.style.top = `${e.clientY - fig.top - LENS_SIZE / 2}px`;
  lensEl.style.backgroundImage = `url("${mainImageEl.currentSrc || mainImageEl.src}")`;
  lensEl.style.backgroundSize = `${dw * LENS_ZOOM}px ${dh * LENS_ZOOM}px`;
  lensEl.style.backgroundPosition = `${LENS_SIZE / 2 - x * LENS_ZOOM}px ${LENS_SIZE / 2 - y * LENS_ZOOM}px`;
  lensEl.hidden = false;
}

mainImageEl.addEventListener("pointermove", moveLens);
mainImageEl.addEventListener("pointerleave", hideLens);

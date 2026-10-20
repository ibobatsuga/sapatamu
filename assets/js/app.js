/**
 * Wedding Management & Smart Reception OS
 * Core Application Controller
 */

// Storage Keys
const STORAGE_EVENT = "vow_event_data_v1";
const STORAGE_GUESTS = "vow_guests_data_v1";
const STORAGE_TABLES = "vow_tables_data_v1";

// Default Seed Data
const defaultEvent = {
  title: "The Wedding Celebration",
  couple: "Kevin & Nadya",
  date: "24 Oktober 2026",
  venue: "Grand Ballroom Pullman",
  hasDoorprize: true,
  souvenirTotal: 300,
  souvenirClaimed: 0
};

const defaultTables = [
  { id: "T1", name: "Meja 01 (VIP Pria)", capacity: 10, zone: "Depan Panggung Kanan" },
  { id: "T2", name: "Meja 02 (VIP Wanita)", capacity: 10, zone: "Depan Panggung Kiri" },
  { id: "T3", name: "Meja 03 (Keluarga Pria)", capacity: 10, zone: "Tengah Kanan" },
  { id: "T4", name: "Meja 04 (Keluarga Wanita)", capacity: 10, zone: "Tengah Kiri" },
  { id: "T5", name: "Meja 05 (Rekan Bisnis)", capacity: 10, zone: "Belakang Kanan" },
  { id: "T6", name: "Meja 06 (Sahabat Kampus)", capacity: 10, zone: "Belakang Kiri" }
];

// Seed sample guests with unique codes compatible with undanganku.id
const defaultGuests = [
  {
    id: "g1",
    name: "Bpk. Bambang Soemantri & Istri",
    code: "KN-8821",
    category: "VIP",
    side: "Keluarga Pria",
    pax: 2,
    table: "01",
    seatZone: "Depan Kanan",
    isCheckedIn: true,
    checkedInAt: "17:35",
    doorprize: "DP-1001",
    souvenirClaimed: true,
    notes: "Dekat aisle utama"
  },
  {
    id: "g2",
    name: "Ibu Sri Rahayu",
    code: "KN-8822",
    category: "VIP",
    side: "Keluarga Wanita",
    pax: 1,
    table: "02",
    seatZone: "Depan Kiri",
    isCheckedIn: true,
    checkedInAt: "17:42",
    doorprize: "DP-1002",
    souvenirClaimed: true,
    notes: ""
  },
  {
    id: "g3",
    name: "Dr. Hendra Gunawan",
    code: "KN-8823",
    category: "Rekan",
    side: "Keluarga Pria",
    pax: 2,
    table: "05",
    seatZone: "Belakang Kanan",
    isCheckedIn: true,
    checkedInAt: "18:05",
    doorprize: "DP-1003",
    souvenirClaimed: false,
    notes: "Alergi seafood"
  },
  {
    id: "g4",
    name: "Jessica Tanudjaja",
    code: "KN-8824",
    category: "Sahabat",
    side: "Keluarga Wanita",
    pax: 1,
    table: "06",
    seatZone: "Belakang Kiri",
    isCheckedIn: false,
    checkedInAt: null,
    doorprize: "DP-1004",
    souvenirClaimed: false,
    notes: "Bridesmaid"
  },
  {
    id: "g5",
    name: "Bpk. Johanes Wijaya",
    code: "KN-8825",
    category: "VIP",
    side: "Keluarga Pria",
    pax: 2,
    table: "01",
    seatZone: "Depan Kanan",
    isCheckedIn: false,
    checkedInAt: null,
    doorprize: "DP-1005",
    souvenirClaimed: false,
    notes: ""
  },
  {
    id: "g6",
    name: "Rian Maulana & Partner",
    code: "KN-8826",
    category: "Sahabat",
    side: "Keluarga Pria",
    pax: 2,
    table: "06",
    seatZone: "Belakang Kiri",
    isCheckedIn: false,
    checkedInAt: null,
    doorprize: "DP-1006",
    souvenirClaimed: false,
    notes: ""
  },
  {
    id: "g7",
    name: "Tante Mariana Kusuma",
    code: "KN-8827",
    category: "Keluarga",
    side: "Keluarga Wanita",
    pax: 3,
    table: "04",
    seatZone: "Tengah Kiri",
    isCheckedIn: false,
    checkedInAt: null,
    doorprize: "DP-1007",
    souvenirClaimed: false,
    notes: "Perlu kursi roda"
  }
];

// Application State
let appEvent = JSON.parse(localStorage.getItem(STORAGE_EVENT)) || defaultEvent;
let appGuests = JSON.parse(localStorage.getItem(STORAGE_GUESTS)) || defaultGuests;
let appTables = JSON.parse(localStorage.getItem(STORAGE_TABLES)) || defaultTables;

let activeTab = "dashboard";
let html5QrScanner = null;
let lastScannedGuest = null;
let barcodeBuffer = "";
let barcodeLastKeyTime = 0;

// Save state to LocalStorage
function persistState() {
  localStorage.setItem(STORAGE_EVENT, JSON.stringify(appEvent));
  localStorage.setItem(STORAGE_GUESTS, JSON.stringify(appGuests));
  localStorage.setItem(STORAGE_TABLES, JSON.stringify(appTables));
}

// Generate unique 4-character random code for undanganku.id integration
function generateGuestCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "KN-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// UI Notification Toast
function showToast(title, msg, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast-pill ${type}`;
  toast.innerHTML = `<strong>${title}</strong>: ${msg}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupBarcodeGunListener();
  setupPrinterEvents();
  renderAll();
});

// Setup Tab Navigation
function setupNavigation() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.dataset.tab === tabId);
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `tab-${tabId}`);
  });

  if (tabId === "scanner") {
    startCameraScanner();
  } else {
    stopCameraScanner();
  }

  if (tabId === "doorprize") {
    renderDoorprizePool();
  }

  renderAll();
}

// Global Hardware Barcode Gun Listener
function setupBarcodeGunListener() {
  window.addEventListener("keydown", (e) => {
    // Ignore input if user is typing inside text fields
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
      return;
    }

    const now = Date.now();
    // Fast keystrokes (< 60ms between chars) indicate barcode scanner gun
    if (now - barcodeLastKeyTime > 80) {
      barcodeBuffer = "";
    }
    barcodeLastKeyTime = now;

    if (e.key === "Enter") {
      if (barcodeBuffer.trim().length >= 3) {
        processGuestCheckInByCode(barcodeBuffer.trim());
      }
      barcodeBuffer = "";
    } else if (e.key.length === 1) {
      barcodeBuffer += e.key;
    }
  });
}

// Setup Printer Connection Callbacks
function setupPrinterEvents() {
  window.onPrinterStatusChange = (isConnected, name) => {
    const pill = document.getElementById("printerStatusPill");
    const nameLabel = document.getElementById("printerDeviceLabel");
    if (isConnected) {
      pill.className = "printer-pill connected";
      nameLabel.textContent = `BT: ${name || '58mm Connected'}`;
      showToast("Printer Siap", `Terhubung ke ${name}`, "success");
    } else {
      pill.className = "printer-pill disconnected";
      nameLabel.textContent = "BT Disconnected (Klik Connect)";
    }
  };
}

// Connect Bluetooth Printer
async function togglePrinterConnect() {
  if (Thermal58.connected) {
    Thermal58.disconnect();
    showToast("Printer", "Koneksi Bluetooth diputus.", "info");
  } else {
    try {
      showToast("Bluetooth", "Mencari printer thermal 58mm...", "info");
      await Thermal58.connect();
    } catch (err) {
      alert("Gagal menghubungkan printer: " + err.message);
    }
  }
}

// Camera Scanner using Html5Qrcode
function startCameraScanner() {
  if (html5QrScanner) return;
  const qrRegion = document.getElementById("reader");
  if (!qrRegion) return;

  try {
    html5QrScanner = new Html5Qrcode("reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    html5QrScanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        // Successful QR scan
        processGuestCheckInByCode(decodedText);
      },
      () => {}
    ).catch(err => {
      console.warn("Camera start warning:", err);
      document.getElementById("cameraNotice").textContent = "Kamera tidak aktif atau izin ditolak. Anda dapat menggunakan Scanner Barcode Gun atau input manual.";
    });
  } catch (e) {
    console.warn("Scanner error:", e);
  }
}

function stopCameraScanner() {
  if (html5QrScanner) {
    html5QrScanner.stop().then(() => {
      html5QrScanner.clear();
      html5QrScanner = null;
    }).catch(() => {
      html5QrScanner = null;
    });
  }
}

// Core Check-In Logic
function processGuestCheckInByCode(rawCode) {
  const code = rawCode.trim();
  // Match by code or invitation URL parameter
  let cleanCode = code;
  if (code.includes("code=")) {
    cleanCode = code.split("code=")[1].split("&")[0];
  } else if (code.includes("/")) {
    cleanCode = code.split("/").pop();
  }

  const guest = appGuests.find(g => g.code.toLowerCase() === cleanCode.toLowerCase() || g.id === cleanCode);

  if (!guest) {
    SoundFX.playWarning();
    alert(`Kode QR [${cleanCode}] tidak ditemukan dalam database undangan!`);
    return;
  }

  if (guest.isCheckedIn) {
    SoundFX.playWarning();
    showCheckInModal(guest, true); // Modal with warning duplicate flag
    return;
  }

  // First time check in
  guest.isCheckedIn = true;
  guest.checkedInAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  guest.souvenirClaimed = true;
  appEvent.souvenirClaimed += 1;
  persistState();

  SoundFX.playSuccess();
  lastScannedGuest = guest;

  // Auto print if enabled
  if (Thermal58.autoPrintEnabled && Thermal58.connected) {
    Thermal58.printToBluetooth(appEvent, guest).catch(err => {
      console.warn("Auto-print error:", err);
    });
  }

  showCheckInModal(guest, false);
  renderAll();
}

// Show Check-In Success / Re-print Modal
function showCheckInModal(guest, isDuplicate = false) {
  lastScannedGuest = guest;
  const modal = document.getElementById("checkInModal");
  const body = document.getElementById("checkInModalBody");

  body.innerHTML = `
    ${isDuplicate ? `
      <div style="background:#FEE2E2; border:1px solid #FCA5A5; color:#991B1B; padding:12px; border-radius:10px; margin-bottom:16px; font-size:0.85rem;">
        ⚠️ <strong>Perhatian: Double Check-in!</strong><br>
        Tamu ini sudah tercatat check-in sebelumnya pada pukul <strong>${guest.checkedInAt} WIB</strong>.
      </div>
    ` : `
      <div style="background:#DCFCE7; border:1px solid #86EFAC; color:#166534; padding:12px; border-radius:10px; margin-bottom:16px; font-size:0.85rem;">
        ✅ <strong>Check-In Berhasil!</strong> Data kehadiran & nomor undian telah dicatat.
      </div>
    `}

    <div style="text-align:center; margin-bottom:18px;">
      <h2 style="font-size:1.4rem; font-weight:700; color:#0F172A;">${guest.name}</h2>
      <div style="font-size:0.85rem; color:#64748B; margin-top:4px;">
        ${guest.category} • ${guest.side} • <strong>${guest.pax} Pax</strong>
      </div>
    </div>

    <div style="background:#F1F5F9; border-radius:14px; padding:18px; text-align:center; margin-bottom:18px;">
      <div style="font-size:0.8rem; font-weight:600; color:#64748B; text-transform:uppercase;">Tempat Duduk / Meja</div>
      <div style="font-size:2.2rem; font-weight:800; color:#0F172A; margin:4px 0;">MEJA ${guest.table || '-'}</div>
      <div style="font-size:0.85rem; color:#2563EB; font-weight:600;">${guest.seatZone || 'Area Tamu Reguler'}</div>
    </div>

    ${guest.doorprize ? `
      <div style="display:flex; justify-content:space-between; align-items:center; background:#FEF3C7; border:1px dashed #D97706; padding:12px 18px; border-radius:10px; margin-bottom:18px;">
        <span style="font-weight:600; font-size:0.85rem; color:#92400E;">Tiket Doorprize:</span>
        <span style="font-family:var(--font-mono); font-size:1.3rem; font-weight:800; color:#B45309;">#${guest.doorprize}</span>
      </div>
    ` : ''}

    <div style="font-size:0.82rem; color:#64748B; line-height:1.5;">
      • Kupon Souvenir: <strong>[ SV-${guest.code} ]</strong><br>
      ${guest.notes ? `• Catatan Khusus: <span style="color:#DC2626; font-weight:600;">${guest.notes}</span>` : ''}
    </div>
  `;

  modal.classList.add("active");
}

function closeCheckInModal() {
  document.getElementById("checkInModal").classList.remove("active");
}

// Print Receipt Action from Modal or Table
function printCurrentGuestReceipt() {
  if (!lastScannedGuest) return;

  if (Thermal58.connected) {
    Thermal58.printToBluetooth(appEvent, lastScannedGuest)
      .then(() => showToast("Cetak Struk", "Berhasil dikirim ke printer 58mm!", "success"))
      .catch(err => alert("Gagal cetak Bluetooth: " + err.message));
  } else {
    // Show Virtual Simulator & trigger browser print
    openVirtualReceiptModal(lastScannedGuest);
  }
}

// Open Virtual 58mm Receipt Modal
function openVirtualReceiptModal(guest) {
  lastScannedGuest = guest;
  const modal = document.getElementById("receiptModal");
  const container = document.getElementById("virtualReceiptContainer");
  container.innerHTML = Thermal58.renderVirtualReceipt(appEvent, guest);
  modal.classList.add("active");
}

function closeReceiptModal() {
  document.getElementById("receiptModal").classList.remove("active");
}

function triggerBrowserPrint() {
  window.print();
}

// Render All Components
function renderAll() {
  renderKPIs();
  renderChart();
  renderGauge();
  renderGuestTable();
  renderTableOccupancy();
}

// 1. Render Top KPI Cards (Pastel Tone)
function renderKPIs() {
  const total = appGuests.reduce((acc, g) => acc + g.pax, 0);
  const checkedIn = appGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
  const awaiting = total - checkedIn;
  const souvenirClaimed = appGuests.filter(g => g.souvenirClaimed).reduce((acc, g) => acc + g.pax, 0);
  const doorprizePool = appGuests.filter(g => g.isCheckedIn && g.doorprize).length;

  document.getElementById("kpiCheckedIn").textContent = checkedIn;
  document.getElementById("kpiCheckedInSub").textContent = `${Math.round((checkedIn / (total || 1)) * 100)}% dari target pax`;

  document.getElementById("kpiAwaiting").textContent = awaiting;
  document.getElementById("kpiAwaitingSub").textContent = `${appGuests.filter(g => !g.isCheckedIn).length} undangan`;

  document.getElementById("kpiTotalGuests").textContent = total;
  document.getElementById("kpiTotalGuestsSub").textContent = `${appGuests.length} kontak undangan`;

  document.getElementById("kpiSouvenir").textContent = souvenirClaimed;
  document.getElementById("kpiSouvenirSub").textContent = `Stok: ${appEvent.souvenirTotal} pcs`;

  document.getElementById("kpiDoorprize").textContent = doorprizePool;
  document.getElementById("kpiDoorprizeSub").textContent = "Kupon terdaftar hadir";
}

// 2. Render Check-in Arrival Chart
function renderChart() {
  const hours = [
    { label: "17:00", checked: 15, total: 30 },
    { label: "17:30", checked: 45, total: 60 },
    { label: "18:00", checked: 75, total: 80 },
    { label: "18:30", checked: 110, total: 70 },
    { label: "19:00", checked: 65, total: 40 },
    { label: "19:30", checked: 20, total: 20 }
  ];

  const maxVal = 120;
  const container = document.getElementById("barChartContainer");
  if (!container) return;

  container.innerHTML = hours.map(h => {
    const checkedH = (h.checked / maxVal) * 140;
    const awaitingH = (h.total / maxVal) * 140;
    return `
      <div class="bar-group">
        <div class="bar-track">
          <div class="bar-fill-awaiting" style="height: ${awaitingH}px;">
            <div class="bar-fill-checkedin" style="height: ${checkedH}px;"></div>
          </div>
        </div>
        <span class="bar-label">${h.label}</span>
      </div>
    `;
  }).join("");
}

// 3. Render Radial Gauge
function renderGauge() {
  const total = appGuests.reduce((acc, g) => acc + g.pax, 0);
  const checkedIn = appGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
  const pct = Math.round((checkedIn / (total || 1)) * 100);

  const numEl = document.getElementById("gaugePercentNum");
  if (numEl) numEl.textContent = `${pct}%`;
}

// 4. Render Guest Table
function renderGuestTable() {
  const tbodies = [
    document.getElementById("guestTableBody"),
    document.getElementById("guestTableBodyTab")
  ].filter(Boolean);

  if (tbodies.length === 0) return;

  const searchQuery = (document.getElementById("globalSearchInput")?.value || "").toLowerCase();
  const filterCat = document.getElementById("filterCategorySelect")?.value || "ALL";

  const filtered = appGuests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery) || g.code.toLowerCase().includes(searchQuery) || (g.table && g.table.includes(searchQuery));
    const matchCat = filterCat === "ALL" || g.category === filterCat;
    return matchSearch && matchCat;
  });

  const html = filtered.map((g, idx) => {
    const avatarClass = g.category === "VIP" ? "vip" : g.category === "Keluarga" ? "family" : "";
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${idx + 1}</td>
        <td>
          <div class="guest-profile-cell">
            <div class="guest-avatar ${avatarClass}">${g.name.charAt(0)}</div>
            <div>
              <div class="guest-name-text">${g.name}</div>
              <div class="guest-code-sub">${g.code} • ${g.side}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="table-tag">Meja ${g.table || '-'}</span>
          ${g.seatZone ? `<div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">${g.seatZone}</div>` : ''}
        </td>
        <td><strong>${g.pax}</strong> Pax</td>
        <td>
          <span class="badge badge-${g.category.toLowerCase()}">${g.category}</span>
        </td>
        <td>
          ${g.isCheckedIn 
            ? `<span class="badge badge-status-in">● Hadir (${g.checkedInAt})</span>` 
            : `<span class="badge badge-status-out">○ Belum Hadir</span>`
          }
        </td>
        <td>
          <span style="font-family:var(--font-mono); font-size:0.8rem; font-weight:600; color:#D97706;">
            ${g.doorprize ? '#' + g.doorprize : '-'}
          </span>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-outline btn-sm" onclick="openQRCodeModal('${g.id}')" title="Lihat QR Code">
              QR
            </button>
            <button class="btn btn-outline btn-sm" onclick="openVirtualReceiptModal(appGuests.find(x => x.id === '${g.id}'))" title="Cetak Struk 58mm">
              Struk
            </button>
            ${!g.isCheckedIn ? `
              <button class="btn btn-primary btn-sm" onclick="processGuestCheckInByCode('${g.code}')">
                Check-in
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbodies.forEach(tb => tb.innerHTML = html);
}

// 5. Render Seating & Table Occupancy
function renderTableOccupancy() {
  const container = document.getElementById("tableCardsGrid");
  if (!container) return;

  container.innerHTML = appTables.map(t => {
    const tableGuests = appGuests.filter(g => g.table === t.id.replace("T", "0") || g.table === t.id.replace("T", ""));
    const seatedCount = tableGuests.reduce((acc, g) => acc + g.pax, 0);
    const checkedInCount = tableGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
    const isFull = seatedCount >= t.capacity;

    return `
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:14px; padding:18px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <h4 style="font-size:0.95rem; font-weight:700;">${t.name}</h4>
            <span style="font-size:0.75rem; color:var(--text-muted);">${t.zone}</span>
          </div>
          <span class="badge ${isFull ? 'badge-vip' : 'badge-family'}">
            ${seatedCount}/${t.capacity} Kursi
          </span>
        </div>
        <div style="background:#F1F5F9; border-radius:6px; height:8px; overflow:hidden; margin-bottom:12px;">
          <div style="background:#2563EB; width:${Math.min(100, (checkedInCount / t.capacity) * 100)}%; height:100%;"></div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between;">
          <span>Hadir di lokasi: <strong>${checkedInCount}</strong></span>
          <span>Sisa: <strong>${t.capacity - seatedCount}</strong></span>
        </div>
      </div>
    `;
  }).join("");
}

// 6. View QR Code Modal
function openQRCodeModal(guestId) {
  const guest = appGuests.find(g => g.id === guestId);
  if (!guest) return;

  const modal = document.getElementById("qrModal");
  const container = document.getElementById("qrCanvasWrapper");
  container.innerHTML = "";

  new QRCode(container, {
    text: guest.code,
    width: 200,
    height: 200,
    colorDark: "#0F172A",
    colorLight: "#FFFFFF",
    correctLevel: QRCode.CorrectLevel.H
  });

  document.getElementById("qrModalGuestName").textContent = guest.name;
  document.getElementById("qrModalGuestCode").textContent = `Kode Unik: ${guest.code} | Meja ${guest.table || '-'}`;
  modal.classList.add("active");
}

function closeQRModal() {
  document.getElementById("qrModal").classList.remove("active");
}

// 7. Doorprize Lucky Draw Machine
function renderDoorprizePool() {
  const pool = appGuests.filter(g => g.isCheckedIn && g.doorprize);
  const poolCount = document.getElementById("doorprizeEligibleCount");
  if (poolCount) poolCount.textContent = `${pool.length} Tamu Hadir Berhak Mengikuti Undian`;
}

let isSpinning = false;
function spinDoorprize() {
  if (isSpinning) return;
  const pool = appGuests.filter(g => g.isCheckedIn && g.doorprize);

  if (pool.length === 0) {
    alert("Belum ada tamu yang check-in untuk diundi!");
    return;
  }

  isSpinning = true;
  const roller = document.getElementById("doorprizeDisplay");
  const winnerInfo = document.getElementById("doorprizeWinnerInfo");
  winnerInfo.textContent = "Sedang mengundi...";

  let counter = 0;
  const interval = setInterval(() => {
    const randomGuest = pool[Math.floor(Math.random() * pool.length)];
    roller.textContent = `#${randomGuest.doorprize}`;
    counter++;

    if (counter > 35) {
      clearInterval(interval);
      // Pick final winner
      const winner = pool[Math.floor(Math.random() * pool.length)];
      roller.textContent = `#${winner.doorprize}`;
      winnerInfo.innerHTML = `
        🎉 Selamat kepada <strong>${winner.name}</strong><br>
        <span style="font-size:0.9rem; color:#94A3B8;">${winner.category} • Meja ${winner.table || '-'}</span>
      `;
      isSpinning = false;

      // Confetti & Fanfare
      SoundFX.playFanfare();
      if (window.confetti) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, 70);
}

// 8. Export to CSV for undanganku.id
function exportToUndangankuCSV() {
  let csv = "Nama Tamu,Kode Unik,Kategori,Sisi,Jumlah Pax,Nomor Meja,Zona Meja,Nomor Doorprize,Catatan\n";
  appGuests.forEach(g => {
    csv += `"${g.name}","${g.code}","${g.category}","${g.side}",${g.pax},"${g.table || ''}","${g.seatZone || ''}","${g.doorprize || ''}","${g.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daftar_tamu_undanganku_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 9. Add Guest Form Action
function addNewGuestFromModal() {
  const name = document.getElementById("newGuestName").value.trim();
  const category = document.getElementById("newGuestCategory").value;
  const side = document.getElementById("newGuestSide").value;
  const pax = parseInt(document.getElementById("newGuestPax").value, 10) || 1;
  const table = document.getElementById("newGuestTable").value.trim();
  const notes = document.getElementById("newGuestNotes").value.trim();

  if (!name) {
    alert("Nama tamu wajib diisi!");
    return;
  }

  const code = generateGuestCode();
  const doorprizeNum = `DP-${1000 + appGuests.length + 1}`;

  const newG = {
    id: "g_" + Date.now(),
    name,
    code,
    category,
    side,
    pax,
    table,
    seatZone: `Area Meja ${table}`,
    isCheckedIn: false,
    checkedInAt: null,
    doorprize: doorprizeNum,
    souvenirClaimed: false,
    notes
  };

  appGuests.unshift(newG);
  persistState();
  closeAddGuestModal();
  renderAll();
  showToast("Tamu Ditambahkan", `${name} berhasil didaftarkan dengan kode ${code}`, "success");
}

function openAddGuestModal() {
  document.getElementById("addGuestModal").classList.add("active");
}

function closeAddGuestModal() {
  document.getElementById("addGuestModal").classList.remove("active");
}

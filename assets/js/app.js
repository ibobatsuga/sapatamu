/**
 * SapaTamu — Wedding Management & Smart Reception OS
 * Core Application Controller (Dual-Mode: Reception & Planner Studio)
 */

// Storage Keys
const STORAGE_EVENT = "vow_event_data_v1";
const STORAGE_GUESTS = "vow_guests_data_v1";
const STORAGE_TABLES = "vow_tables_data_v1";
const STORAGE_TIMELINE = "vow_timeline_v1";
const STORAGE_VENDORS = "vow_vendors_v1";
const STORAGE_CHECKLIST = "vow_checklist_v1";
const STORAGE_ANGPAO = "vow_angpao_v1";
const STORAGE_MODE = "vow_workspace_mode_v1";

// 1. Default Event Metadata
const defaultEvent = {
  title: "The Wedding Celebration",
  couple: "Kevin & Nadya",
  date: "24 Oktober 2026",
  venue: "Grand Ballroom Pullman",
  hasDoorprize: true,
  souvenirTotal: 300,
  souvenirClaimed: 0
};

// 2. Default Tables & Zones
const defaultTables = [
  { id: "T1", name: "Meja 01 (VIP Pria)", capacity: 10, zone: "Depan Panggung Kanan" },
  { id: "T2", name: "Meja 02 (VIP Wanita)", capacity: 10, zone: "Depan Panggung Kiri" },
  { id: "T3", name: "Meja 03 (Keluarga Pria)", capacity: 10, zone: "Tengah Kanan" },
  { id: "T4", name: "Meja 04 (Keluarga Wanita)", capacity: 10, zone: "Tengah Kiri" },
  { id: "T5", name: "Meja 05 (Rekan Bisnis)", capacity: 10, zone: "Belakang Kanan" },
  { id: "T6", name: "Meja 06 (Sahabat Kampus)", capacity: 10, zone: "Belakang Kiri" }
];

// 3. Default Guests Seed (Compatible with undanganku.id unique codes)
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

// 4. Default Run-Sheet / Master Timeline
const defaultTimeline = [
  { id: "tm1", time: "15:30", title: "Loading Vendor & Cek Meja Resepsi", pic: "Ira (WO Lead)", location: "Foyer Ballroom", status: "done", notes: "Pastikan meja registrasi dan aliran antrean rapi." },
  { id: "tm2", time: "16:30", title: "Briefing Kru Resepsi & Tes Printer 58mm", pic: "Doni (Reception Captain)", location: "Meja Resepsi", status: "done", notes: "Tes print 1 roll kertas thermal dan cek koneksi Bluetooth." },
  { id: "tm3", time: "17:00", title: "Pintu Foyer Dibuka & Registrasi Tamu", pic: "Tim Resepsionis", location: "Foyer Ballroom", status: "current", notes: "Scan QR tamu undanganku.id, serahkan struk meja & kupon doorprize." },
  { id: "tm4", time: "18:30", title: "Grand Entrance / Kirab Pengantin", pic: "Floor Captain", location: "Grand Ballroom", status: "upcoming", notes: "Cue musik kirab, lampu spotlight panggung siap." },
  { id: "tm5", time: "19:15", title: "Sambutan Perwakilan & Toast Bersama", pic: "MC Ferry Salim", location: "Panggung Utama", status: "upcoming", notes: "Keluarga inti berdiri di pelaminan." },
  { id: "tm6", time: "20:00", title: "Sesi Foto VIP & Makan Malam", pic: "Stage Lead", location: "Pelaminan", status: "upcoming", notes: "Panggil tamu VIP sesuai urutan Meja 01 & 02." },
  { id: "tm7", time: "20:30", title: "Pengundian Doorprize Utama", pic: "MC & Doorprize Team", location: "Panggung Utama", status: "upcoming", notes: "Buka menu Stage Doorprize SapaTamu di layar panggung." },
  { id: "tm8", time: "21:30", title: "Penutupan & Rekapitulasi Resepsi", pic: "WO Lead & Resepsi", location: "Meja Resepsi", status: "upcoming", notes: "Kunci kotak angpao, serahkan buku tamu dan sisa souvenir ke keluarga." }
];

// 5. Default Vendor Emergency Directory
const defaultVendors = [
  { id: "v1", category: "Venue Coordinator", vendorName: "Pullman Grand Ballroom", picName: "Ibu Maya", phone: "081298765432", status: "Standby di Venue", notes: "Akses loading dock & ruang transit" },
  { id: "v2", category: "Katering", vendorName: "Puspa Catering Nusantara", picName: "Pak Dedi", phone: "081311223344", status: "On-site Ready", notes: "Stok gubukan & VIP dinner table" },
  { id: "v3", category: "Fotografer & Video", vendorName: "Lumina Visuals", picName: "Mas Kevin", phone: "085699887766", status: "On-site Ready", notes: "Lead photographer panggung & candid" },
  { id: "v4", category: "Sound & Lighting", vendorName: "ProMax Production", picName: "Mas Bima", phone: "087812345678", status: "On-site Ready", notes: "Audio mic MC & musik latar" },
  { id: "v5", category: "Master of Ceremony (MC)", vendorName: "Ferry Salim Entertainment", picName: "Ferry Salim", phone: "081198761234", status: "Standby di Venue", notes: "Pemandu rundown & pengundian doorprize" },
  { id: "v6", category: "Dekorasi Pelaminan", vendorName: "Flora & Vow Decor", picName: "Mbak Nadia", phone: "081512344321", status: "Handover Selesai", notes: "Bunga segar & backdrop photo gallery" },
  { id: "v7", category: "Make Up Artist (MUA)", vendorName: "Glam by Sarah", picName: "Sarah MUA", phone: "081233445566", status: "Ruang Rias", notes: "Retouch busana nasional & resepsi" }
];

// 6. Default Reception Checklist & Production Equipment
const defaultChecklist = [
  { id: "c1", zone: "Meja Resepsi", item: "Printer Thermal Bluetooth 58mm", qty: "2 Unit", status: "ready", pic: "Reception Captain" },
  { id: "c2", zone: "Meja Resepsi", item: "Kertas Roll Thermal 58mm Cadangan", qty: "10 Roll", status: "ready", pic: "Reception Captain" },
  { id: "c3", zone: "Meja Resepsi", item: "Barcode Scanner Gun USB/Bluetooth", qty: "2 Unit", status: "ready", pic: "Reception Captain" },
  { id: "c4", zone: "Meja Resepsi", item: "Tablet / Laptop Front Desk + Charger", qty: "2 Unit", status: "ready", pic: "IT Support" },
  { id: "c5", zone: "Meja Resepsi", item: "Kotak Angpao Gembok & Kunci", qty: "2 Kotak", status: "ready", pic: "Tim Keluarga" },
  { id: "c6", zone: "Meja Resepsi", item: "Spidol Emas & Buku Tamu Cadangan", qty: "4 Set", status: "ready", pic: "Resepsionis" },
  { id: "c7", zone: "Souvenir Station", item: "Stok Souvenir Box Reguler", qty: "250 Pcs", status: "ready", pic: "Souvenir Lead" },
  { id: "c8", zone: "Souvenir Station", item: "Souvenir Khusus Tamu VIP", qty: "50 Pcs", status: "ready", pic: "Souvenir Lead" },
  { id: "c9", zone: "Panggung Utama", item: "Koneksi Laptop ke LED Screen Doorprize", qty: "1 Setup", status: "ready", pic: "Stage Lead" }
];

// 7. Default Angpao & Gift Records
const defaultAngpao = [
  { id: "a1", guestName: "Bpk. Bambang Soemantri & Istri", type: "Amplop Fisik", boxCode: "Kotak A (Keluarga Pria)", time: "17:36", receiver: "Siti (Meja 1)", notes: "Dimasukkan ke Kotak A" },
  { id: "a2", guestName: "Ibu Sri Rahayu", type: "QRIS / Digital Transfer", boxCode: "BCA Pengantin", time: "17:43", receiver: "Siti (Meja 1)", notes: "Bukti transfer diverifikasi" },
  { id: "a3", guestName: "Dr. Hendra Gunawan", type: "Kado Fisik", boxCode: "Nomor Titipan #01", time: "18:06", receiver: "Rini (Meja 2)", notes: "Kado diletakkan di rak titipan" }
];

// State Initialization
let appEvent = JSON.parse(localStorage.getItem(STORAGE_EVENT)) || defaultEvent;
let appGuests = JSON.parse(localStorage.getItem(STORAGE_GUESTS)) || defaultGuests;
let appTables = JSON.parse(localStorage.getItem(STORAGE_TABLES)) || defaultTables;
let appTimeline = JSON.parse(localStorage.getItem(STORAGE_TIMELINE)) || defaultTimeline;
let appVendors = JSON.parse(localStorage.getItem(STORAGE_VENDORS)) || defaultVendors;
let appChecklist = JSON.parse(localStorage.getItem(STORAGE_CHECKLIST)) || defaultChecklist;
let appAngpao = JSON.parse(localStorage.getItem(STORAGE_ANGPAO)) || defaultAngpao;
let currentMode = localStorage.getItem(STORAGE_MODE) || "reception"; // 'reception' or 'planner'

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
  localStorage.setItem(STORAGE_TIMELINE, JSON.stringify(appTimeline));
  localStorage.setItem(STORAGE_VENDORS, JSON.stringify(appVendors));
  localStorage.setItem(STORAGE_CHECKLIST, JSON.stringify(appChecklist));
  localStorage.setItem(STORAGE_ANGPAO, JSON.stringify(appAngpao));
  localStorage.setItem(STORAGE_MODE, currentMode);
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

// Mode Switcher: Reception (Hari-H) vs Planner (Persiapan)
function switchWorkspaceMode(mode) {
  currentMode = mode;
  persistState();
  applyWorkspaceModeUI();
  showToast("Mode Berubah", mode === "reception" ? "Mode Resepsionis (Hari-H) aktif — Fokus Check-in & Struk" : "Mode Planner Studio aktif — Akses Lengkap Manajemen WO", "info");
}

function applyWorkspaceModeUI() {
  const modeBtn = document.getElementById("modeSwitchBtn");
  const plannerNavItems = document.querySelectorAll(".nav-planner-only");
  const remotePill = document.getElementById("remotePill");

  if (currentMode === "reception") {
    if (modeBtn) {
      modeBtn.innerHTML = "🎯 Mode: <strong>Resepsionis (Hari-H)</strong>";
      modeBtn.className = "mode-switch-pill reception";
    }
    if (remotePill) remotePill.style.display = "flex";
    plannerNavItems.forEach(el => el.style.display = "none");
    if (["timeline", "vendors", "checklist"].includes(activeTab)) {
      switchTab("dashboard");
    }
  } else {
    if (modeBtn) {
      modeBtn.innerHTML = "📋 Mode: <strong>Planner Studio (WO)</strong>";
      modeBtn.className = "mode-switch-pill planner";
    }
    // Remote is restricted to Reception mode only!
    if (remotePill) remotePill.style.display = "none";
    closeRemoteModal();
    plannerNavItems.forEach(el => el.style.display = "block");
  }

  // Notify any connected remote devices about mode status
  if (window.SapaRemote && SapaRemote.isHost) {
    SapaRemote.broadcastHostState();
  }
}

// Remote Modal Handlers (Restricted to Reception Mode)
function openRemoteModal() {
  if (currentMode !== "reception") {
    alert("Fitur Remote Smartphone dibatasi dan hanya dapat digunakan pada Mode Resepsionis (Hari-H). Silakan alihkan mode terlebih dahulu.");
    return;
  }
  if (window.SapaRemote) {
    SapaRemote.updateHostPairingQR();
  }
  const modal = document.getElementById("remoteModal");
  if (modal) modal.classList.add("active");
}

function closeRemoteModal() {
  const modal = document.getElementById("remoteModal");
  if (modal) modal.classList.remove("active");
}

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupBarcodeGunListener();
  setupPrinterEvents();
  applyWorkspaceModeUI();
  if (window.SapaRemote) {
    SapaRemote.init();
  }
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

  const titleEl = document.getElementById("topbarTitle");
  const titles = {
    dashboard: "Wedding Reception Dashboard",
    scanner: "Front Desk & QR Check-in",
    guests: "Manajemen Tamu Undangan",
    seating: "Visual Seating & Status Meja",
    doorprize: "Stage Doorprize Lucky Draw",
    printer: "Pengaturan Bluetooth Thermal 58mm",
    timeline: "Run-Sheet / Master Timeline Hari H",
    vendors: "Direktori Kontak Vendor Darurat Hari H",
    checklist: "Checklist Meja Resepsi & Produksi",
    angpao: "Catatan Titipan Angpao & Kado"
  };
  if (titleEl && titles[tabId]) titleEl.textContent = titles[tabId];

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
    if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
      return;
    }

    const now = Date.now();
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
        processGuestCheckInByCode(decodedText);
      },
      () => {}
    ).catch(err => {
      console.warn("Camera start warning:", err);
      const notice = document.getElementById("cameraNotice");
      if (notice) notice.textContent = "Kamera tidak aktif atau izin ditolak. Anda dapat menggunakan Scanner Barcode Gun atau input manual.";
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
    showCheckInModal(guest, true);
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

function quickLogAngpaoForGuest(guestName) {
  closeCheckInModal();
  openAddAngpaoModal();
  const nameInput = document.getElementById("angpaoGuestName");
  if (nameInput) nameInput.value = guestName || "";
}

// Print Receipt Action from Modal or Table
function printCurrentGuestReceipt() {
  if (!lastScannedGuest) return;

  if (Thermal58.connected) {
    Thermal58.printToBluetooth(appEvent, lastScannedGuest)
      .then(() => showToast("Cetak Struk", "Berhasil dikirim ke printer 58mm!", "success"))
      .catch(err => alert("Gagal cetak Bluetooth: " + err.message));
  } else {
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
  renderTimeline();
  renderVendors();
  renderChecklist();
  renderAngpao();
}

// 1. Render Top KPI Cards (Pastel Tone)
function renderKPIs() {
  const total = appGuests.reduce((acc, g) => acc + g.pax, 0);
  const checkedIn = appGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
  const awaiting = total - checkedIn;
  const souvenirClaimed = appGuests.filter(g => g.souvenirClaimed).reduce((acc, g) => acc + g.pax, 0);
  const doorprizePool = appGuests.filter(g => g.isCheckedIn && g.doorprize).length;

  const elCheckIn = document.getElementById("kpiCheckedIn");
  const elCheckInSub = document.getElementById("kpiCheckedInSub");
  if (elCheckIn) elCheckIn.textContent = checkedIn;
  if (elCheckInSub) elCheckInSub.textContent = `${Math.round((checkedIn / (total || 1)) * 100)}% dari target pax`;

  const elAwaiting = document.getElementById("kpiAwaiting");
  const elAwaitingSub = document.getElementById("kpiAwaitingSub");
  if (elAwaiting) elAwaiting.textContent = awaiting;
  if (elAwaitingSub) elAwaitingSub.textContent = `${appGuests.filter(g => !g.isCheckedIn).length} undangan`;

  const elTotal = document.getElementById("kpiTotalGuests");
  const elTotalSub = document.getElementById("kpiTotalGuestsSub");
  if (elTotal) elTotal.textContent = total;
  if (elTotalSub) elTotalSub.textContent = `${appGuests.length} kontak undangan`;

  const elSouvenir = document.getElementById("kpiSouvenir");
  const elSouvenirSub = document.getElementById("kpiSouvenirSub");
  if (elSouvenir) elSouvenir.textContent = souvenirClaimed;
  if (elSouvenirSub) elSouvenirSub.textContent = `Stok: ${appEvent.souvenirTotal} pcs`;

  const elDoorprize = document.getElementById("kpiDoorprize");
  const elDoorprizeSub = document.getElementById("kpiDoorprizeSub");
  if (elDoorprize) elDoorprize.textContent = doorprizePool;
  if (elDoorprizeSub) elDoorprizeSub.textContent = "Kupon terdaftar hadir";
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

// 5. Render Seating & Table Occupancy (Visual Table Allocation)
function renderTableOccupancy() {
  const container = document.getElementById("tableCardsGrid");
  if (!container) return;

  container.innerHTML = appTables.map(t => {
    const tableGuests = appGuests.filter(g => g.table === t.id.replace("T", "0") || g.table === t.id.replace("T", ""));
    const seatedCount = tableGuests.reduce((acc, g) => acc + g.pax, 0);
    const checkedInCount = tableGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
    const isFull = seatedCount >= t.capacity;

    return `
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:14px; padding:20px; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h4 style="font-size:1rem; font-weight:700;">${t.name}</h4>
            <span style="font-size:0.75rem; color:var(--text-muted);">${t.zone}</span>
          </div>
          <span class="badge ${isFull ? 'badge-vip' : 'badge-family'}">
            ${seatedCount}/${t.capacity} Kursi
          </span>
        </div>
        <div style="background:#F1F5F9; border-radius:6px; height:8px; overflow:hidden; margin-bottom:12px;">
          <div style="background:#2563EB; width:${Math.min(100, (checkedInCount / t.capacity) * 100)}%; height:100%;"></div>
        </div>
        <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:12px;">
          <span>Hadir di lokasi: <strong>${checkedInCount} pax</strong></span>
          <span>Tersisa: <strong>${Math.max(0, t.capacity - seatedCount)} kursi</strong></span>
        </div>
        <div style="border-top:1px dashed var(--border-light); padding-top:10px;">
          <div style="font-size:0.72rem; font-weight:600; color:var(--text-muted); margin-bottom:6px;">Daftar Tamu di Meja Ini:</div>
          <div style="max-height:80px; overflow-y:auto; font-size:0.75rem;">
            ${tableGuests.length ? tableGuests.map(tg => `
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span>${tg.name} (${tg.pax}p)</span>
                <span style="color:${tg.isCheckedIn ? '#16A34A' : '#94A3B8'}; font-weight:600;">${tg.isCheckedIn ? 'Hadir' : 'Menunggu'}</span>
              </div>
            `).join('') : '<span style="color:#94A3B8; font-style:italic;">Belum ada tamu dialokasikan</span>'}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// 6. Render Run-Sheet / Master Timeline
function renderTimeline() {
  const container = document.getElementById("timelineListContainer");
  if (!container) return;

  container.innerHTML = appTimeline.map(item => {
    const statusBadge = item.status === "done" 
      ? '<span class="badge badge-status-in">✓ Selesai</span>' 
      : item.status === "current" 
      ? '<span class="badge badge-vip">● Berlangsung</span>' 
      : '<span class="badge badge-status-out">○ Mendatang</span>';

    return `
      <div style="display:flex; gap:18px; margin-bottom:20px; align-items:flex-start;">
        <div style="min-width:70px; font-family:var(--font-mono); font-weight:700; font-size:1rem; color:var(--primary); padding-top:2px;">
          ${item.time}
        </div>
        <div style="flex:1; background:#fff; border:1px solid var(--border-light); border-radius:14px; padding:16px 20px; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <h4 style="font-size:1rem; font-weight:700;">${item.title}</h4>
            <div style="display:flex; gap:8px; align-items:center;">
              ${statusBadge}
              <button class="btn btn-outline btn-sm" onclick="toggleTimelineStatus('${item.id}')">Ubah Status</button>
            </div>
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted); display:flex; gap:16px; margin-bottom:6px;">
            <span>📍 ${item.location}</span>
            <span>👤 PIC: <strong>${item.pic}</strong></span>
          </div>
          <div style="font-size:0.82rem; color:#475569; background:#F8FAFC; padding:8px 12px; border-radius:8px;">
            ${item.notes}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function toggleTimelineStatus(id) {
  const item = appTimeline.find(t => t.id === id);
  if (!item) return;
  const next = { done: "upcoming", upcoming: "current", current: "done" };
  item.status = next[item.status] || "upcoming";
  persistState();
  renderTimeline();
}

// 7. Render Vendor Emergency Directory
function renderVendors() {
  const tbody = document.getElementById("vendorTableBody");
  if (!tbody) return;

  tbody.innerHTML = appVendors.map((v, i) => {
    const cleanPhone = v.phone.replace(/[^0-9]/g, "");
    const waPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${i + 1}</td>
        <td>
          <div style="font-weight:700; color:var(--text-main); font-size:0.92rem;">${v.vendorName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${v.category}</div>
        </td>
        <td><strong>${v.picName}</strong></td>
        <td>
          <div style="font-family:var(--font-mono); font-size:0.85rem;">${v.phone}</div>
        </td>
        <td>
          <span class="badge badge-status-in">${v.status}</span>
        </td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${v.notes}</td>
        <td>
          <a href="https://wa.me/${waPhone}?text=Halo%20${encodeURIComponent(v.picName)},%20update%20acara%20pernikahan%20Kevin%20Nadya" target="_blank" class="btn btn-primary btn-sm" style="background:#16A34A; text-decoration:none;">
            💬 WhatsApp
          </a>
        </td>
      </tr>
    `;
  }).join("");
}

// 8. Render Reception Checklist
function renderChecklist() {
  const tbody = document.getElementById("checklistTableBody");
  if (!tbody) return;

  tbody.innerHTML = appChecklist.map((c, i) => {
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${i + 1}</td>
        <td><span class="badge badge-family">${c.zone}</span></td>
        <td><strong>${c.item}</strong></td>
        <td>${c.qty}</td>
        <td>${c.pic}</td>
        <td>
          <button class="btn btn-sm ${c.status === 'ready' ? 'btn-primary' : 'btn-outline'}" onclick="toggleChecklistStatus('${c.id}')">
            ${c.status === 'ready' ? '✓ Siap di Venue' : '○ Belum Siap'}
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function toggleChecklistStatus(id) {
  const item = appChecklist.find(c => c.id === id);
  if (!item) return;
  item.status = item.status === "ready" ? "pending" : "ready";
  persistState();
  renderChecklist();
}

// 9. Render Angpao & Gift Tracker
function renderAngpao() {
  const tbody = document.getElementById("angpaoTableBody");
  if (!tbody) return;

  tbody.innerHTML = appAngpao.map((a, i) => {
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${i + 1}</td>
        <td><strong>${a.guestName}</strong></td>
        <td><span class="badge ${a.type.includes('Fisik') ? 'badge-vip' : 'badge-family'}">${a.type}</span></td>
        <td>${a.boxCode}</td>
        <td>${a.time} WIB</td>
        <td>${a.receiver}</td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${a.notes}</td>
      </tr>
    `;
  }).join("");
}

function addNewAngpaoRecord() {
  const guestName = document.getElementById("angpaoGuestName").value.trim();
  const type = document.getElementById("angpaoType").value;
  const boxCode = document.getElementById("angpaoBoxCode").value.trim();
  const receiver = document.getElementById("angpaoReceiver").value.trim();
  const notes = document.getElementById("angpaoNotes").value.trim();

  if (!guestName) {
    alert("Nama tamu atau pemberi titipan wajib diisi!");
    return;
  }

  const newRecord = {
    id: "a_" + Date.now(),
    guestName,
    type,
    boxCode: boxCode || "Kotak Registrasi",
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    receiver: receiver || "Resepsionis",
    notes
  };

  appAngpao.unshift(newRecord);
  persistState();
  closeAddAngpaoModal();
  renderAngpao();
  showToast("Titipan Dicatat", `Titipan dari ${guestName} berhasil dicatat di sistem`, "success");
}

function openAddAngpaoModal() {
  document.getElementById("addAngpaoModal").classList.add("active");
}

function closeAddAngpaoModal() {
  document.getElementById("addAngpaoModal").classList.remove("active");
}

// 10. View QR Code Modal
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

// 11. Doorprize Lucky Draw Machine
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
      const winner = pool[Math.floor(Math.random() * pool.length)];
      roller.textContent = `#${winner.doorprize}`;
      winnerInfo.innerHTML = `
        🎉 Selamat kepada <strong>${winner.name}</strong><br>
        <span style="font-size:0.9rem; color:#94A3B8;">${winner.category} • Meja ${winner.table || '-'}</span>
      `;
      isSpinning = false;

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

// 12. Export to CSV for undanganku.id
function exportToUndangankuCSV() {
  let csv = "Nama Tamu,Kode Unik,Kategori,Sisi,Jumlah Pax,Nomor Meja,Zona Meja,Nomor Doorprize,Status Hadir,Waktu Hadir,Catatan\n";
  appGuests.forEach(g => {
    csv += `"${g.name}","${g.code}","${g.category}","${g.side}",${g.pax},"${g.table || ''}","${g.seatZone || ''}","${g.doorprize || ''}","${g.isCheckedIn ? 'Hadir' : 'Belum Hadir'}","${g.checkedInAt || ''}","${g.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daftar_tamu_sapatamu_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Export Berhasil", "Daftar tamu berhasil diunduh sebagai file CSV", "success");
}

// 12b. Download Blank CSV Template
function downloadCSVTemplate() {
  const sample = "Nama Tamu,Kategori,Sisi,Jumlah Pax,Nomor Meja,Catatan\n" +
    '"Bpk. Ahmad Subagyo & Istri","VIP","Keluarga Pria",2,"01","Meja baris depan"\n' +
    '"Ibu Ratna Juwita","Keluarga","Keluarga Wanita",1,"02",""\n' +
    '"Sdr. Kevin Pratama","Sahabat","Keluarga Pria",2,"06","Groomsman"\n' +
    '"Dr. Maya Kusuma","Rekan","Bersama",1,"05","Alergi seafood"';

  const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template_daftar_tamu_sapatamu.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// 12c. Robust CSV Parser
function parseCSVText(text) {
  const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV line taking quotes into account
  const parseLine = (line) => {
    const row = [];
    let insideQuote = false;
    let entry = "";
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (insideQuote && line[i + 1] === '"') {
          entry += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        row.push(entry.trim());
        entry = "";
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    return row;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const rowObj = {};
    headers.forEach((header, idx) => {
      rowObj[header] = values[idx] || "";
    });
    results.push(rowObj);
  }
  return results;
}

// 12d. Handle CSV File Import
function triggerCSVImport() {
  const fileInput = document.getElementById("csvFileInput");
  if (fileInput) {
    fileInput.value = "";
    fileInput.click();
  }
}

function handleCSVFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const content = e.target.result;
      const rows = parseCSVText(content);

      if (rows.length === 0) {
        alert("File CSV kosong atau format baris tidak valid!");
        return;
      }

      let importedCount = 0;
      let startDoorprizeNum = 1000 + appGuests.length + 1;

      rows.forEach(r => {
        // Resolve field mappings flexibly
        const name = r.namatamu || r.nama || r.name || r.guestname || "";
        if (!name) return; // Skip rows without name

        const category = r.kategori || r.category || "Rekan";
        const side = r.sisi || r.side || "Bersama";
        const pax = parseInt(r.jumlahpax || r.pax || r.qty || "1", 10) || 1;
        const table = r.nomormeja || r.meja || r.table || "";
        const seatZone = r.zonameja || r.zona || (table ? `Area Meja ${table}` : "Area Reguler");
        const notes = r.catatan || r.notes || r.keterangan || "";
        const code = r.kodeunik || r.kode || r.code || generateGuestCode();
        const doorprize = r.nomordoorprize || r.doorprize || `DP-${startDoorprizeNum++}`;

        // Check if guest with same code or name already exists
        const existingIdx = appGuests.findIndex(g => g.code.toLowerCase() === code.toLowerCase() || g.name.toLowerCase() === name.toLowerCase());

        const guestData = {
          id: "g_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
          name,
          code,
          category: ["VIP", "Keluarga", "Rekan", "Sahabat"].includes(category) ? category : "Rekan",
          side: ["Keluarga Pria", "Keluarga Wanita", "Bersama"].includes(side) ? side : "Bersama",
          pax,
          table,
          seatZone,
          isCheckedIn: false,
          checkedInAt: null,
          doorprize,
          souvenirClaimed: false,
          notes
        };

        if (existingIdx >= 0) {
          // Update existing
          appGuests[existingIdx] = { ...appGuests[existingIdx], ...guestData, id: appGuests[existingIdx].id };
        } else {
          // Append new
          appGuests.push(guestData);
        }
        importedCount++;
      });

      persistState();
      renderAll();
      showToast("Import CSV Selesai", `Berhasil memproses ${importedCount} data tamu ke dalam sistem!`, "success");
    } catch (err) {
      alert("Gagal membaca file CSV: " + err.message);
    }
  };
  reader.readAsText(file, "UTF-8");
}

// 13. Add Guest Form Action
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

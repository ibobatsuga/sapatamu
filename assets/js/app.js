/**
 * SapaTamu — Wedding Management & Smart Reception OS
 * Core Application Controller (Multi-Project Hub + Dual-Mode)
 */

// Storage Keys
const STORAGE_PROJECTS = "vow_projects_data_v1";
const STORAGE_ACTIVE_PROJECT_ID = "vow_active_project_id_v1";
const STORAGE_MODE = "vow_workspace_mode_v1";
const STORAGE_PLANNER_AUTH = "vow_planner_auth_v1";
const STORAGE_PLANNER_SESSION = "vow_planner_session_v1";
const STORAGE_PLANNER_REMEMBER = "vow_planner_remember_v1";

// Planner Authentication Credentials (Configurable in Settings)
let plannerCredentials = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_PLANNER_AUTH);
    return saved ? JSON.parse(saved) : { username: "admin", password: "admin" };
  } catch (e) {
    return { username: "admin", password: "admin" };
  }
})();

let isPlannerAuthenticated = sessionStorage.getItem(STORAGE_PLANNER_SESSION) === "true" ||
                             localStorage.getItem(STORAGE_PLANNER_REMEMBER) === "true";

// Default Seed Templates for Projects
const defaultSeedProjects = [
  {
    id: "prj_kevin_nadya",
    title: "The Wedding Celebration",
    couple: "Kevin & Nadya",
    date: "24 Oktober 2026",
    venue: "Grand Ballroom Pullman",
    status: "Hari-H",
    targetPax: 250,
    souvenirTotal: 300,
    souvenirClaimed: 0,
    event: {
      title: "The Wedding Celebration",
      couple: "Kevin & Nadya",
      date: "24 Oktober 2026",
      venue: "Grand Ballroom Pullman",
      souvenirTotal: 300,
      souvenirClaimed: 0
    },
    tables: [
      { id: "T1", name: "Meja 01 (VIP Pria)", capacity: 10, zone: "Depan Panggung Kanan" },
      { id: "T2", name: "Meja 02 (VIP Wanita)", capacity: 10, zone: "Depan Panggung Kiri" },
      { id: "T3", name: "Meja 03 (Keluarga Pria)", capacity: 10, zone: "Tengah Kanan" },
      { id: "T4", name: "Meja 04 (Keluarga Wanita)", capacity: 10, zone: "Tengah Kiri" },
      { id: "T5", name: "Meja 05 (Rekan Bisnis)", capacity: 10, zone: "Belakang Kanan" },
      { id: "T6", name: "Meja 06 (Sahabat Kampus)", capacity: 10, zone: "Belakang Kiri" }
    ],
    guests: [
      { id: "g1", name: "Bpk. Bambang Soemantri & Istri", code: "KN-8821", category: "VIP", side: "Keluarga Pria", pax: 2, table: "01", seatZone: "Depan Kanan", isCheckedIn: true, checkedInAt: "17:35", souvenirClaimed: true, notes: "Dekat aisle utama" },
      { id: "g2", name: "Ibu Sri Rahayu", code: "KN-8822", category: "VIP", side: "Keluarga Wanita", pax: 1, table: "02", seatZone: "Depan Kiri", isCheckedIn: true, checkedInAt: "17:42", souvenirClaimed: true, notes: "" },
      { id: "g3", name: "Dr. Hendra Gunawan", code: "KN-8823", category: "Rekan", side: "Keluarga Pria", pax: 2, table: "05", seatZone: "Belakang Kanan", isCheckedIn: true, checkedInAt: "18:05", souvenirClaimed: false, notes: "Alergi seafood" },
      { id: "g4", name: "Jessica Tanudjaja", code: "KN-8824", category: "Sahabat", side: "Keluarga Wanita", pax: 1, table: "06", seatZone: "Belakang Kiri", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "Bridesmaid" },
      { id: "g5", name: "Bpk. Johanes Wijaya", code: "KN-8825", category: "VIP", side: "Keluarga Pria", pax: 2, table: "01", seatZone: "Depan Kanan", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "" },
      { id: "g6", name: "Rian Maulana & Partner", code: "KN-8826", category: "Sahabat", side: "Keluarga Pria", pax: 2, table: "06", seatZone: "Belakang Kiri", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "" },
      { id: "g7", name: "Tante Mariana Kusuma", code: "KN-8827", category: "Keluarga", side: "Keluarga Wanita", pax: 3, table: "04", seatZone: "Tengah Kiri", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "Perlu kursi roda" }
    ],
    timeline: [
      { id: "tm1", time: "15:30", title: "Loading Vendor & Cek Meja Resepsi", pic: "Ira (WO Lead)", location: "Foyer Ballroom", status: "done", notes: "Pastikan meja registrasi dan aliran antrean rapi." },
      { id: "tm2", time: "16:30", title: "Briefing Kru Resepsi & Tes Printer 58mm", pic: "Doni (Reception Captain)", location: "Meja Resepsi", status: "done", notes: "Tes print 1 roll kertas thermal dan cek koneksi Bluetooth." },
      { id: "tm3", time: "17:00", title: "Pintu Foyer Dibuka & Registrasi Tamu", pic: "Tim Resepsionis", location: "Foyer Ballroom", status: "current", notes: "Scan QR tamu undanganku.id, serahkan struk meja & kupon souvenir." },
      { id: "tm4", time: "18:30", title: "Grand Entrance / Kirab Pengantin", pic: "Floor Captain", location: "Grand Ballroom", status: "upcoming", notes: "Cue musik kirab, lampu spotlight panggung siap." },
      { id: "tm5", time: "19:15", title: "Sambutan Perwakilan & Toast Bersama", pic: "MC Ferry Salim", location: "Panggung Utama", status: "upcoming", notes: "Keluarga inti berdiri di pelaminan." },
      { id: "tm6", time: "20:00", title: "Sesi Foto VIP & Makan Malam", pic: "Stage Lead", location: "Pelaminan", status: "upcoming", notes: "Panggil tamu VIP sesuai urutan Meja 01 & 02." },
      { id: "tm7", time: "21:30", title: "Penutupan & Rekapitulasi Resepsi", pic: "WO Lead & Resepsi", location: "Meja Resepsi", status: "upcoming", notes: "Kunci kotak angpao, serahkan buku tamu dan sisa souvenir ke keluarga." }
    ],
    vendors: [
      { id: "v1", category: "Venue Coordinator", vendorName: "Pullman Grand Ballroom", picName: "Ibu Maya", phone: "081298765432", status: "Standby di Venue", notes: "Akses loading dock & ruang transit" },
      { id: "v2", category: "Katering", vendorName: "Puspa Catering Nusantara", picName: "Pak Dedi", phone: "081311223344", status: "On-site Ready", notes: "Stok gubukan & VIP dinner table" },
      { id: "v3", category: "Fotografer & Video", vendorName: "Lumina Visuals", picName: "Mas Kevin", phone: "085699887766", status: "On-site Ready", notes: "Lead photographer panggung & candid" },
      { id: "v4", category: "Sound & Lighting", vendorName: "ProMax Production", picName: "Mas Bima", phone: "087812345678", status: "On-site Ready", notes: "Audio mic MC & musik latar" },
      { id: "v5", category: "Master of Ceremony (MC)", vendorName: "Ferry Salim Entertainment", picName: "Ferry Salim", phone: "081198761234", status: "Standby di Venue", notes: "Pemandu susunan acara & kirab" },
      { id: "v6", category: "Dekorasi Pelaminan", vendorName: "Flora & Vow Decor", picName: "Mbak Nadia", phone: "081512344321", status: "Handover Selesai", notes: "Bunga segar & backdrop photo gallery" },
      { id: "v7", category: "Make Up Artist (MUA)", vendorName: "Glam by Sarah", picName: "Sarah MUA", phone: "081233445566", status: "Ruang Rias", notes: "Retouch busana nasional & resepsi" }
    ],
    checklist: [
      { id: "c1", zone: "Meja Resepsi", item: "Printer Thermal Bluetooth 58mm", qty: "2 Unit", status: "ready", pic: "Reception Captain" },
      { id: "c2", zone: "Meja Resepsi", item: "Kertas Roll Thermal 58mm Cadangan", qty: "10 Roll", status: "ready", pic: "Reception Captain" },
      { id: "c3", zone: "Meja Resepsi", item: "Barcode Scanner Gun USB/Bluetooth", qty: "2 Unit", status: "ready", pic: "Reception Captain" },
      { id: "c4", zone: "Meja Resepsi", item: "Tablet / Laptop Front Desk + Charger", qty: "2 Unit", status: "ready", pic: "IT Support" },
      { id: "c5", zone: "Meja Resepsi", item: "Kotak Angpao Gembok & Kunci", qty: "2 Kotak", status: "ready", pic: "Tim Keluarga" },
      { id: "c6", zone: "Meja Resepsi", item: "Spidol Emas & Buku Tamu Cadangan", qty: "4 Set", status: "ready", pic: "Resepsionis" },
      { id: "c7", zone: "Souvenir Station", item: "Stok Souvenir Box Reguler", qty: "250 Pcs", status: "ready", pic: "Souvenir Lead" },
      { id: "c8", zone: "Souvenir Station", item: "Souvenir Khusus Tamu VIP", qty: "50 Pcs", status: "ready", pic: "Souvenir Lead" }
    ],
    angpao: [
      { id: "a1", guestName: "Bpk. Bambang Soemantri & Istri", type: "Amplop Fisik", boxCode: "Kotak A (Keluarga Pria)", time: "17:36", receiver: "Siti (Meja 1)", notes: "Dimasukkan ke Kotak A" },
      { id: "a2", guestName: "Ibu Sri Rahayu", type: "QRIS / Digital Transfer", boxCode: "BCA Pengantin", time: "17:43", receiver: "Siti (Meja 1)", notes: "Bukti transfer diverifikasi" },
      { id: "a3", guestName: "Dr. Hendra Gunawan", type: "Kado Fisik", boxCode: "Nomor Titipan #01", time: "18:06", receiver: "Rini (Meja 2)", notes: "Kado diletakkan di rak titipan" }
    ]
  },
  {
    id: "prj_romeo_juliet",
    title: "Sacred Holy Matrimony & Reception",
    couple: "Romeo & Juliet",
    date: "15 November 2026",
    venue: "The Glasshouse Conservatory",
    status: "Mendatang",
    targetPax: 180,
    souvenirTotal: 200,
    souvenirClaimed: 0,
    event: {
      title: "Sacred Holy Matrimony & Reception",
      couple: "Romeo & Juliet",
      date: "15 November 2026",
      venue: "The Glasshouse Conservatory",
      souvenirTotal: 200,
      souvenirClaimed: 0
    },
    tables: [
      { id: "T1", name: "Meja 01 (VIP Family)", capacity: 10, zone: "Depan Panggung" },
      { id: "T2", name: "Meja 02 (Wedding Party)", capacity: 10, zone: "Dekat Dance Floor" },
      { id: "T3", name: "Meja 03 (Colleagues)", capacity: 10, zone: "Area Tengah" }
    ],
    guests: [
      { id: "rj_g1", name: "Montague Family", code: "RJ-1001", category: "VIP", side: "Keluarga Pria", pax: 4, table: "01", seatZone: "Depan Panggung", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "" },
      { id: "rj_g2", name: "Capulet Family", code: "RJ-1002", category: "VIP", side: "Keluarga Wanita", pax: 4, table: "01", seatZone: "Depan Panggung", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "" }
    ],
    timeline: [
      { id: "rj_tm1", time: "10:00", title: "Pemberkatan Nikah / Holy Matrimony", pic: "Pendeta & WO", location: "Chapel Glasshouse", status: "upcoming", notes: "Ibadah sakral pemberkatan." },
      { id: "rj_tm2", time: "12:00", title: "Intimate Lunch Reception", pic: "Reception Team", location: "Main Hall", status: "upcoming", notes: "Santap siang prasmanan." }
    ],
    vendors: [
      { id: "rj_v1", category: "Venue & Catering", vendorName: "Glasshouse Events", picName: "Nora", phone: "081234567890", status: "Confirmed", notes: "Paket all-in venue" }
    ],
    checklist: [
      { id: "rj_c1", zone: "Meja Resepsi", item: "Printer Thermal 58mm", qty: "1 Unit", status: "ready", pic: "WO Lead" }
    ],
    angpao: []
  },
  {
    id: "prj_dimas_sarah",
    title: "Traditional Javanese & Modern Wedding",
    couple: "Dimas & Sarah",
    date: "12 Desember 2026",
    venue: "Plataran Dharmawangsa",
    status: "Persiapan",
    targetPax: 300,
    souvenirTotal: 350,
    souvenirClaimed: 0,
    event: {
      title: "Traditional Javanese & Modern Wedding",
      couple: "Dimas & Sarah",
      date: "12 Desember 2026",
      venue: "Plataran Dharmawangsa",
      souvenirTotal: 350,
      souvenirClaimed: 0
    },
    tables: [
      { id: "T1", name: "Meja 01 (VIP Sesepuh)", capacity: 10, zone: "Pendopo Utama" },
      { id: "T2", name: "Meja 02 (Keluarga Besar)", capacity: 10, zone: "Area Sayap Kanan" }
    ],
    guests: [
      { id: "ds_g1", name: "Prof. Dr. Soedharmono", code: "DS-9001", category: "VIP", side: "Keluarga Pria", pax: 2, table: "01", seatZone: "Pendopo Utama", isCheckedIn: false, checkedInAt: null, souvenirClaimed: false, notes: "" }
    ],
    timeline: [
      { id: "ds_tm1", time: "08:00", title: "Akad Nikah Adat Jawa", pic: "Keluarga & Penghulu", location: "Pendopo", status: "upcoming", notes: "Prosesi Ijab Kabul & Panggih." }
    ],
    vendors: [
      { id: "ds_v1", category: "Dekorasi Tradisional", vendorName: "Kirono Adat", picName: "Pak Joko", phone: "081987654321", status: "Confirmed", notes: "Gebyok Jawa ukiran asli" }
    ],
    checklist: [
      { id: "ds_c1", zone: "Meja Resepsi", item: "Kotak Angpao Tradisional", qty: "2 Unit", status: "ready", pic: "Tim Resepsi" }
    ],
    angpao: []
  }
];

// Load Projects from LocalStorage or seed defaults
let appProjects = JSON.parse(localStorage.getItem(STORAGE_PROJECTS)) || defaultSeedProjects;
let activeProjectId = localStorage.getItem(STORAGE_ACTIVE_PROJECT_ID) || "prj_kevin_nadya";

// Active Project Pointers
let activeProject = appProjects.find(p => p.id === activeProjectId) || appProjects[0];
let appEvent = activeProject.event;
let appGuests = activeProject.guests;
let appTables = activeProject.tables;
let appTimeline = activeProject.timeline;
let appVendors = activeProject.vendors;
let appChecklist = activeProject.checklist;
let appAngpao = activeProject.angpao;
let currentMode = localStorage.getItem(STORAGE_MODE) || "reception"; // 'reception' or 'planner'
if (currentMode === "planner" && !isPlannerAuthenticated) {
  currentMode = "reception";
  localStorage.setItem(STORAGE_MODE, "reception");
}

let activeTab = "dashboard";
let html5QrScanner = null;
let lastScannedGuest = null;
let barcodeBuffer = "";
let barcodeLastKeyTime = 0;

// Save state to LocalStorage
function persistState() {
  activeProject.event = appEvent;
  activeProject.guests = appGuests;
  activeProject.tables = appTables;
  activeProject.timeline = appTimeline;
  activeProject.vendors = appVendors;
  activeProject.checklist = appChecklist;
  activeProject.angpao = appAngpao;
  activeProject.couple = appEvent.couple;
  activeProject.date = appEvent.date;
  activeProject.venue = appEvent.venue;
  activeProject.souvenirTotal = appEvent.souvenirTotal;
  activeProject.souvenirClaimed = appEvent.souvenirClaimed;

  localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(appProjects));
  localStorage.setItem(STORAGE_ACTIVE_PROJECT_ID, activeProject.id);
  localStorage.setItem(STORAGE_MODE, currentMode);
}

// Generate unique 4-character random code for undanganku.id integration
function generateGuestCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let prefix = activeProject.couple.split("&")[0].trim().substring(0, 1).toUpperCase() + 
               (activeProject.couple.split("&")[1] ? activeProject.couple.split("&")[1].trim().substring(0, 1).toUpperCase() : "W");
  let result = `${prefix}-`;
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// UI Notification Toast (Floating bottom-right, non-blocking)
function showToast(title, msg, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast-pill ${type}`;
  toast.innerHTML = `<div class="toast-content"><strong>${title}</strong>: <span>${msg}</span></div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      if (toast.parentNode) toast.remove();
    }, 250);
  }, 2500);
}

// Open Selected Project Event
function openProject(projectId) {
  const prj = appProjects.find(p => p.id === projectId);
  if (!prj) return;

  activeProject = prj;
  activeProjectId = prj.id;
  appEvent = activeProject.event;
  appGuests = activeProject.guests;
  appTables = activeProject.tables;
  appTimeline = activeProject.timeline;
  appVendors = activeProject.vendors;
  appChecklist = activeProject.checklist;
  appAngpao = activeProject.angpao;

  persistState();
  updateEventMetaUI();
  switchTab("dashboard");
  showToast("Proyek Aktif", `Beralih ke acara: ${activeProject.couple}`, "success");
}

function updateEventMetaUI() {
  const titleEl = document.getElementById("topbarTitle");
  const subEl = document.getElementById("topbarSubtitle");
  const sideTitle = document.getElementById("sideEventTitle");
  const sideDate = document.getElementById("sideEventDate");

  if (titleEl) titleEl.textContent = activeProject.couple;
  if (subEl) subEl.textContent = `${activeProject.date} • ${activeProject.venue}`;
  if (sideTitle) sideTitle.textContent = activeProject.couple;
  if (sideDate) sideDate.textContent = `${activeProject.date} • ${activeProject.venue}`;

  // Update settings inputs if present
  const setCouple = document.getElementById("settingsEventCouple");
  const setDate = document.getElementById("settingsEventDate");
  const setVenue = document.getElementById("settingsEventVenue");
  const setSouvenir = document.getElementById("settingsSouvenirTotal");

  if (setCouple) setCouple.value = activeProject.couple;
  if (setDate) setDate.value = activeProject.date;
  if (setVenue) setVenue.value = activeProject.venue;
  if (setSouvenir) setSouvenir.value = activeProject.souvenirTotal;
}

// Render Projects Hub Grid
function renderProjects() {
  const container = document.getElementById("projectsGridContainer");
  if (!container) return;

  container.innerHTML = appProjects.map(p => {
    const isActive = p.id === activeProject.id;
    const totalPax = p.guests.reduce((acc, g) => acc + g.pax, 0);
    const checkedInPax = p.guests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
    const badgeClass = p.status === "Hari-H" ? "badge-vip" : p.status === "Mendatang" ? "badge-status-in" : "badge-family";

    return `
      <div class="project-card ${isActive ? 'active-project' : ''}">
        <div>
          <div class="project-card-top">
            <div>
              <div class="project-title">${p.couple}</div>
              <div class="project-date-venue">📅 ${p.date} • 📍 ${p.venue}</div>
            </div>
            <span class="badge ${badgeClass}">${p.status}</span>
          </div>

          <div class="project-metrics-row">
            <div class="project-metric-item">
              <span class="project-metric-val">${checkedInPax}/${totalPax}</span>
              <span class="project-metric-lbl">Pax Hadir</span>
            </div>
            <div class="project-metric-item">
              <span class="project-metric-val">${p.tables.length}</span>
              <span class="project-metric-lbl">Meja Kursi</span>
            </div>
            <div class="project-metric-item">
              <span class="project-metric-val">${p.angpao.length}</span>
              <span class="project-metric-lbl">Titipan Angpao</span>
            </div>
          </div>
        </div>

        <div class="project-card-footer">
          ${isActive ? `
            <span style="font-size:0.8rem; font-weight:700; color:#16A34A; display:flex; align-items:center; gap:6px;">
              ● Sedang Dibuka
            </span>
            <button class="btn btn-outline btn-sm" onclick="switchTab('dashboard')">
              Masuk Dashboard ➔
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="openProject('${p.id}')">
              Buka Proyek Ini ➔
            </button>
            ${appProjects.length > 1 ? `
              <button class="btn btn-outline btn-sm" style="color:#DC2626; border-color:#FCA5A5;" onclick="deleteProject('${p.id}')" title="Hapus Proyek">
                Hapus
              </button>
            ` : ''}
          `}
        </div>
      </div>
    `;
  }).join("");
}

// Create New Project Event
function openCreateProjectModal() {
  document.getElementById("createProjectModal").classList.add("active");
}

function closeCreateProjectModal() {
  document.getElementById("createProjectModal").classList.remove("active");
}

function createNewProject() {
  const couple = document.getElementById("newProjectCouple").value.trim();
  const date = document.getElementById("newProjectDate").value.trim() || "Tanggal Belum Ditentukan";
  const venue = document.getElementById("newProjectVenue").value.trim() || "Venue Belum Ditentukan";
  const targetPax = parseInt(document.getElementById("newProjectPax").value, 10) || 200;
  const souvenirTotal = parseInt(document.getElementById("newProjectSouvenir").value, 10) || 250;

  if (!couple) {
    alert("Nama pasangan pengantin wajib diisi!");
    return;
  }

  const newPrj = {
    id: "prj_" + Date.now(),
    title: `The Wedding of ${couple}`,
    couple,
    date,
    venue,
    status: "Persiapan",
    targetPax,
    souvenirTotal,
    souvenirClaimed: 0,
    event: {
      title: `The Wedding of ${couple}`,
      couple,
      date,
      venue,
      souvenirTotal,
      souvenirClaimed: 0
    },
    tables: [
      { id: "T1", name: "Meja 01 (VIP)", capacity: 10, zone: "Depan Panggung" },
      { id: "T2", name: "Meja 02 (Keluarga)", capacity: 10, zone: "Area Tengah" }
    ],
    guests: [],
    timeline: [
      { id: "tm_" + Date.now(), time: "17:00", title: "Registrasi Meja Tamu", pic: "Kru Resepsi", location: "Foyer", status: "upcoming", notes: "Scan QR undangan digital undanganku.id" }
    ],
    vendors: [],
    checklist: [
      { id: "c_" + Date.now(), zone: "Meja Resepsi", item: "Printer Thermal 58mm & Kertas Roll", qty: "1 Unit", status: "ready", pic: "Reception Captain" }
    ],
    angpao: []
  };

  appProjects.unshift(newPrj);
  closeCreateProjectModal();
  openProject(newPrj.id);
  showToast("Proyek Baru Dibuat", `${couple} berhasil ditambahkan ke daftar proyek`, "success");
}

function deleteProject(projectId) {
  if (appProjects.length <= 1) {
    alert("Minimal harus ada satu proyek acara di sistem!");
    return;
  }
  const prj = appProjects.find(p => p.id === projectId);
  if (!prj) return;

  if (confirm(`Apakah Anda yakin ingin menghapus proyek "${prj.couple}" beserta seluruh data tamunya?`)) {
    appProjects = appProjects.filter(p => p.id !== projectId);
    if (activeProject.id === projectId) {
      openProject(appProjects[0].id);
    } else {
      persistState();
      renderProjects();
    }
    showToast("Proyek Dihapus", `Proyek ${prj.couple} telah dihapus.`, "info");
  }
}

// Update Active Event Metadata from Settings
function updateEventMetaFromSettings() {
  const couple = document.getElementById("settingsEventCouple").value.trim();
  const date = document.getElementById("settingsEventDate").value.trim();
  const venue = document.getElementById("settingsEventVenue").value.trim();
  const souvenir = parseInt(document.getElementById("settingsSouvenirTotal").value, 10) || 300;

  if (couple) activeProject.couple = couple;
  if (date) activeProject.date = date;
  if (venue) activeProject.venue = venue;
  activeProject.souvenirTotal = souvenir;

  appEvent.couple = activeProject.couple;
  appEvent.date = activeProject.date;
  appEvent.venue = activeProject.venue;
  appEvent.souvenirTotal = souvenir;

  persistState();
  updateEventMetaUI();
  renderKPIs();
  showToast("Pengaturan Disimpan", "Informasi acara berhasil diperbarui.", "success");
}

// Mode Switcher: Reception (Hari-H) vs Planner (Persiapan)
// Role-based authorization: Only Admin & Superadmin can access Planner Studio
function switchWorkspaceMode(mode) {
  const user = window.SapaAuth ? window.SapaAuth.currentUser : null;
  
  if (mode === "planner") {
    if (!user) {
      initAuthUI();
      return;
    }
    if (user.role === "user") {
      openAccessRestrictedModal(user);
      return;
    }
  }

  currentMode = mode;
  persistState();
  applyWorkspaceModeUI();
}

function openAccessRestrictedModal(user) {
  const modal = document.getElementById("accessRestrictedModal");
  const usernameDisplay = document.getElementById("restrictedUsernameDisplay");
  if (usernameDisplay) {
    usernameDisplay.textContent = user ? (user.username || user.fullName) : "user";
  }
  if (modal) modal.classList.add("active");
}

function closeAccessRestrictedModal() {
  const modal = document.getElementById("accessRestrictedModal");
  if (modal) modal.classList.remove("active");
}

function switchAccountToAdmin() {
  closeAccessRestrictedModal();
  if (window.SapaAuth) {
    window.SapaAuth.signOut();
  }
  initAuthUI();
}

function showSystemAlertModal(title, message, icon = "ℹ️", btnText = "Mengerti") {
  const modal = document.getElementById("generalAlertModal");
  const titleEl = document.getElementById("generalAlertTitle");
  const msgEl = document.getElementById("generalAlertMessage");
  const iconEl = document.getElementById("generalAlertIcon");
  const btnEl = document.getElementById("generalAlertBtn");

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  if (iconEl) iconEl.textContent = icon;
  if (btnEl) btnEl.textContent = btnText;

  if (modal) modal.classList.add("active");
}

function closeGeneralAlertModal() {
  const modal = document.getElementById("generalAlertModal");
  if (modal) modal.classList.remove("active");
}

function applyWorkspaceModeUI() {
  const modeBtn = document.getElementById("modeSwitchBtn");
  const plannerNavItems = document.querySelectorAll(".nav-planner-only");
  const receptionNavItems = document.querySelectorAll(".nav-reception-only");
  const remotePill = document.getElementById("remotePill");
  const segReception = document.getElementById("segModeReception");
  const segPlanner = document.getElementById("segModePlanner");
  const btnLockPlanner = document.getElementById("btnLockPlanner");
  const user = window.SapaAuth ? window.SapaAuth.currentUser : null;

  // Enforce role restrictions
  if (user && user.role === "user") {
    currentMode = "reception";
    if (segPlanner) {
      segPlanner.title = "Akses Dibatasi: Akun Resepsionis (User) hanya dapat mengakses Meja Resepsi.";
      segPlanner.style.opacity = "0.5";
      segPlanner.style.cursor = "not-allowed";
    }
  } else {
    if (segPlanner) {
      segPlanner.title = "Beralih ke Planner Studio";
      segPlanner.style.opacity = "1";
      segPlanner.style.cursor = "pointer";
    }
  }

  if (currentMode === "reception") {
    if (modeBtn) {
      modeBtn.innerHTML = "🎯 Mode: <strong>Resepsionis (Hari-H)</strong>";
      modeBtn.className = "mode-switch-pill reception";
    }
    if (segReception) segReception.classList.add("active");
    if (segPlanner) segPlanner.classList.remove("active");

    if (remotePill) remotePill.style.display = "inline-flex";
    if (btnLockPlanner) btnLockPlanner.style.display = "none";
    plannerNavItems.forEach(el => el.style.display = "none");
    receptionNavItems.forEach(el => el.style.display = "block");

    if (["timeline", "vendors", "checklist"].includes(activeTab)) {
      switchTab("dashboard");
    }
  } else {
    if (modeBtn) {
      modeBtn.innerHTML = "📋 Mode: <strong>Planner Studio (WO)</strong>";
      modeBtn.className = "mode-switch-pill planner";
    }
    if (segReception) segReception.classList.remove("active");
    if (segPlanner) segPlanner.classList.add("active");

    if (remotePill) remotePill.style.display = "none";
    if (btnLockPlanner) btnLockPlanner.style.display = (user && user.role !== "user") ? "inline-flex" : "none";
    closeRemoteModal();
    plannerNavItems.forEach(el => el.style.display = "block");
    receptionNavItems.forEach(el => el.style.display = "none");
  }

  // Toggle CSV & Planner-only action buttons
  const plannerActions = document.querySelectorAll(".planner-only-action");
  plannerActions.forEach(el => {
    el.style.display = (currentMode === "planner") ? "inline-flex" : "none";
  });

  if (window.SapaRemote && SapaRemote.isHost) {
    SapaRemote.broadcastHostState();
  }

  renderTableOccupancy();
}

// ========================================================
// AUTH GATEWAY & SUPABASE USER SESSION CONTROLLERS
// ========================================================

function initAuthUI() {
  const authGateway = document.getElementById("authGatewayScreen");
  const appRoot = document.getElementById("appRoot");
  const user = window.SapaAuth ? window.SapaAuth.currentUser : null;

  if (!user) {
    if (authGateway) authGateway.style.display = "flex";
    if (appRoot) appRoot.style.display = "none";
  } else {
    if (authGateway) authGateway.style.display = "none";
    if (appRoot) appRoot.style.display = "block";
    updateUserSessionTopBar(user);
    applyUserRolePermissions(user);
  }

  updateSupabaseSettingsUI();
}

function updateUserSessionTopBar(user) {
  const badgeEl = document.getElementById("topbarUserRoleBadge");
  const nameEl = document.getElementById("topbarUserName");

  if (nameEl) nameEl.textContent = user.username || user.fullName;
  if (badgeEl) {
    badgeEl.className = `user-role-badge ${user.role}`;
    if (user.role === "superadmin") badgeEl.textContent = "Superadmin";
    else if (user.role === "admin") badgeEl.textContent = "Admin WO";
    else badgeEl.textContent = "Resepsionis";
  }
}

function applyUserRolePermissions(user) {
  if (!user) return;
  const segPlanner = document.getElementById("segModePlanner");

  if (user.role === "user") {
    currentMode = "reception";
    persistState();
    applyWorkspaceModeUI();
    if (segPlanner) {
      segPlanner.title = "Akses Dibatasi: Akun Resepsionis (User) hanya dapat mengakses Meja Resepsi.";
      segPlanner.style.opacity = "0.5";
      segPlanner.style.cursor = "not-allowed";
    }
  } else {
    if (segPlanner) {
      segPlanner.title = "Beralih ke Planner Studio";
      segPlanner.style.opacity = "1";
      segPlanner.style.cursor = "pointer";
    }
  }
}

function switchAuthTab(tab) {
  const btnIn = document.getElementById("btnTabSignIn");
  const btnUp = document.getElementById("btnTabSignUp");
  const formIn = document.getElementById("signInForm");
  const formUp = document.getElementById("signUpForm");
  const alertBox = document.getElementById("authAlertBox");

  if (alertBox) alertBox.style.display = "none";

  if (tab === "signin") {
    if (btnIn) btnIn.classList.add("active");
    if (btnUp) btnUp.classList.remove("active");
    if (formIn) formIn.style.display = "block";
    if (formUp) formUp.style.display = "none";
  } else {
    if (btnIn) btnIn.classList.remove("active");
    if (btnUp) btnUp.classList.add("active");
    if (formIn) formIn.style.display = "none";
    if (formUp) formUp.style.display = "block";
  }
}

async function handleFormSignIn(e) {
  e.preventDefault();
  const username = document.getElementById("signInUsername")?.value;
  const password = document.getElementById("signInPassword")?.value;
  const remember = document.getElementById("signInRemember")?.checked;
  const alertBox = document.getElementById("authAlertBox");
  const btnSubmit = document.getElementById("btnSubmitSignIn");

  if (alertBox) alertBox.style.display = "none";
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Memverifikasi...";
  }

  try {
    const user = await window.SapaAuth.signIn(username, password, remember);
    initAuthUI();
    showToast("Login Berhasil", `Selamat datang kembali, ${user.fullName} (${user.badge})`, "success");
  } catch (err) {
    if (alertBox) {
      alertBox.className = "auth-alert auth-alert-error";
      alertBox.textContent = err.message || "Gagal masuk. Periksa kembali kredensial Anda.";
      alertBox.style.display = "block";
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Masuk ke Sistem ➔";
    }
  }
}

async function handleFormSignUp(e) {
  e.preventDefault();
  const fullName = document.getElementById("signUpFullName")?.value;
  const username = document.getElementById("signUpUsername")?.value;
  const email = document.getElementById("signUpEmail")?.value;
  const password = document.getElementById("signUpPassword")?.value;
  const role = document.getElementById("signUpRole")?.value || "user";
  const alertBox = document.getElementById("authAlertBox");
  const btnSubmit = document.getElementById("btnSubmitSignUp");

  if (alertBox) alertBox.style.display = "none";
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Mendaftarkan...";
  }

  try {
    const user = await window.SapaAuth.signUp(fullName, username, email, password, role);
    switchAuthTab("signin");
    const uInp = document.getElementById("signInUsername");
    const pInp = document.getElementById("signInPassword");
    if (uInp) uInp.value = user.username;
    if (pInp) pInp.value = password;

    if (alertBox) {
      alertBox.className = "auth-alert auth-alert-success";
      alertBox.textContent = `Pendaftaran berhasil untuk @${user.username}! Silakan klik "Masuk ke Sistem".`;
      alertBox.style.display = "block";
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = "auth-alert auth-alert-error";
      alertBox.textContent = err.message || "Gagal mendaftarkan akun.";
      alertBox.style.display = "block";
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Daftar Akun Baru ➔";
    }
  }
}

async function handleGoogleSignIn() {
  const alertBox = document.getElementById("authAlertBox");
  try {
    const user = await window.SapaAuth.signInWithGoogle();
    if (user && user.username) {
      initAuthUI();
      showToast("Google Sign-In", `Masuk sebagai ${user.fullName}`, "success");
    }
  } catch (err) {
    if (alertBox) {
      alertBox.className = "auth-alert auth-alert-error";
      alertBox.textContent = err.message || "Gagal login dengan Google.";
      alertBox.style.display = "block";
    }
  }
}

function quickFillAccount(username, password) {
  switchAuthTab("signin");
  const uInp = document.getElementById("signInUsername");
  const pInp = document.getElementById("signInPassword");
  if (uInp) uInp.value = username;
  if (pInp) pInp.value = password;
  const btn = document.getElementById("btnSubmitSignIn");
  if (btn) btn.focus();
}

function toggleDemoCredentialsDrawer() {
  const body = document.getElementById("demoCredentialsBody");
  const arrow = document.getElementById("demoDrawerArrow");
  if (!body) return;
  const isOpen = body.style.display === "block";
  body.style.display = isOpen ? "none" : "block";
  if (arrow) arrow.textContent = isOpen ? "▾" : "▴";
}

function toggleSignInPasswordVisibility() {
  const passInp = document.getElementById("signInPassword");
  if (!passInp) return;
  passInp.type = passInp.type === "password" ? "text" : "password";
}

function logoutCurrentUser() {
  if (!confirm("Yakin ingin keluar dari akun saat ini?")) return;
  if (window.SapaAuth) {
    window.SapaAuth.signOut();
  }
  initAuthUI();
  showToast("Sesi Berakhir", "Anda telah keluar dari sistem.", "info");
}

function lockPlannerMode() {
  // Silent background switch to reception mode without intrusive popup
  switchWorkspaceMode("reception");
}

function updateSupabaseSettingsUI() {
  if (!window.SapaAuth) return;
  const config = window.SapaAuth.getSupabaseConfig();
  const urlInp = document.getElementById("settingsSupabaseUrl");
  const keyInp = document.getElementById("settingsSupabaseKey");
  const badge = document.getElementById("settingsSupabaseBadge");

  if (urlInp && !urlInp.matches(":focus")) urlInp.value = config.url || "";
  if (keyInp && !keyInp.matches(":focus")) keyInp.value = config.anonKey || "";

  if (badge) {
    if (window.SapaAuth.isSupabaseConnected()) {
      badge.textContent = "🟢 Terhubung Cloud Supabase";
      badge.className = "badge badge-status-in";
    } else {
      badge.textContent = "🟡 Mode Lokal / Trial";
      badge.className = "badge badge-family";
    }
  }
}

function saveSupabaseSettings() {
  const url = document.getElementById("settingsSupabaseUrl")?.value.trim();
  const key = document.getElementById("settingsSupabaseKey")?.value.trim();

  if (window.SapaAuth) {
    window.SapaAuth.saveSupabaseConfig(url, key);
  }
  updateSupabaseSettingsUI();
  showToast("Supabase Disimpan", url ? "Koneksi Supabase diperbarui." : "Kembali ke mode autentikasi lokal / trial.", "success");
}

async function testSupabaseConnection() {
  if (!window.SapaAuth || !window.SapaAuth.isSupabaseConnected()) {
    alert("Supabase belum terhubung. Harap isi URL dan Anon Key proyek Supabase Anda terlebih dahulu.");
    return;
  }
  try {
    const { data, error } = await window.SapaAuth.client.auth.getSession();
    if (error) throw error;
    alert("Koneksi Supabase Cloud Berhasil! Proyek Anda aktif dan siap menerima request autentikasi.");
  } catch (err) {
    alert("Gagal menghubungi Supabase: " + (err.message || err));
  }
}

// Sidebar Toggle & Collapse Handlers (Tablet-First Responsive)
function toggleSidebar() {
  const isTabletPortraitOrMobile = window.innerWidth <= 880;
  if (isTabletPortraitOrMobile) {
    document.body.classList.toggle("sidebar-open-mobile");
  } else {
    document.body.classList.toggle("sidebar-collapsed");
    localStorage.setItem("vow_sidebar_collapsed", document.body.classList.contains("sidebar-collapsed") ? "true" : "false");
  }
}

function initSidebarState() {
  if (window.innerWidth > 880) {
    if (localStorage.getItem("vow_sidebar_collapsed") === "true") {
      document.body.classList.add("sidebar-collapsed");
    }
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
  initAuthUI();
  initSidebarState();
  setupNavigation();
  setupBarcodeGunListener();
  setupPrinterEvents();
  updateEventMetaUI();
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
      if (window.innerWidth <= 880) {
        document.body.classList.remove("sidebar-open-mobile");
      }
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

  if (tabId === "projects") {
    renderProjects();
  }

  if (tabId === "scanner") {
    startCameraScanner();
  } else {
    stopCameraScanner();
  }

  if (tabId === "settings" && window.SapaRemote) {
    SapaRemote.updateHostPairingQR();
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
    const settingsBadge = document.getElementById("settingsPrinterBadge");
    const settingsDevice = document.getElementById("settingsPrinterDevice");
    const btnConnect = document.getElementById("btnConnectPrinter");

    if (isConnected) {
      if (pill) {
        pill.className = "device-btn connected";
        if (nameLabel) nameLabel.textContent = `BT: ${name || '58mm'}`;
      }
      if (settingsBadge) {
        settingsBadge.className = "badge badge-status-in";
        settingsBadge.textContent = "Terhubung";
      }
      if (settingsDevice) settingsDevice.textContent = name || "Bluetooth Thermal 58mm";
      if (btnConnect) btnConnect.textContent = "Putuskan Bluetooth";
      showToast("Printer Siap", `Terhubung ke ${name}`, "success");
    } else {
      if (pill) {
        pill.className = "device-btn";
        if (nameLabel) nameLabel.textContent = "Thermal 58mm";
      }
      if (settingsBadge) {
        settingsBadge.className = "badge badge-status-out";
        settingsBadge.textContent = "Terputus";
      }
      if (settingsDevice) settingsDevice.textContent = "Belum Terhubung";
      if (btnConnect) btnConnect.textContent = "Pairing Bluetooth";
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
        ✅ <strong>Check-In Berhasil!</strong> Data kehadiran tamu telah dicatat.
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
  updateSortHeadersUI();
  renderKPIs();
  renderChart();
  renderGauge();
  renderGuestTable();
  renderTableOccupancy();
  renderTimeline();
  renderVendors();
  renderChecklist();
  renderAngpao();
  renderProjects();
}

// 1. Render Top Stats Strip (Quiet Luxury)
function renderKPIs() {
  const total = appGuests.reduce((acc, g) => acc + g.pax, 0);
  const checkedIn = appGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);
  const awaiting = total - checkedIn;
  const souvenirClaimed = appGuests.filter(g => g.souvenirClaimed).reduce((acc, g) => acc + g.pax, 0);

  const elCheckIn = document.getElementById("kpiCheckedIn");
  const elCheckInSub = document.getElementById("kpiCheckedInSub");
  const pctHadir = Math.round((checkedIn / (total || 1)) * 100);
  if (elCheckIn) elCheckIn.textContent = checkedIn;
  if (elCheckInSub) elCheckInSub.textContent = `${pctHadir}% Hadir`;

  const elAwaiting = document.getElementById("kpiAwaiting");
  const elAwaitingSub = document.getElementById("kpiAwaitingSub");
  if (elAwaiting) elAwaiting.textContent = awaiting;
  if (elAwaitingSub) elAwaitingSub.textContent = `${appGuests.filter(g => !g.isCheckedIn).length} Undangan`;

  const elTotal = document.getElementById("kpiTotalGuests");
  const elTotalSub = document.getElementById("kpiTotalGuestsSub");
  if (elTotal) elTotal.textContent = total;
  if (elTotalSub) elTotalSub.textContent = `${appGuests.length} Undangan Aktif`;

  const elOcc = document.getElementById("kpiOccupancyPercent");
  if (elOcc) {
    const totalCapacity = appTables.reduce((acc, t) => acc + t.capacity, 0);
    const occPct = Math.round((checkedIn / (totalCapacity || 1)) * 100);
    elOcc.textContent = `${occPct}%`;
  }

  const elSouvenir = document.getElementById("kpiSouvenir");
  const elSouvenirSub = document.getElementById("kpiSouvenirSub");
  if (elSouvenir) elSouvenir.textContent = souvenirClaimed;
  if (elSouvenirSub) elSouvenirSub.textContent = `Stok: ${appEvent.souvenirTotal} Pcs`;
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

// Guest Table Sorting State
let guestSort = {
  column: null,    // 'name' | 'table' | 'pax' | 'category' | 'status'
  direction: 'asc' // 'asc' | 'desc'
};

function sortGuestsBy(column) {
  if (guestSort.column === column) {
    guestSort.direction = guestSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    guestSort.column = column;
    guestSort.direction = 'asc';
  }
  updateSortHeadersUI();
  renderGuestTable();
}

function updateSortHeadersUI() {
  document.querySelectorAll(".sortable-header").forEach(th => {
    const col = th.getAttribute("data-sort");
    th.classList.remove("sorted-asc", "sorted-desc");

    if (col === guestSort.column) {
      if (guestSort.direction === 'asc') {
        th.classList.add("sorted-asc");
        th.setAttribute("title", `Diurutkan ${col} (A-Z / Terkecil). Klik untuk urutan sebaliknya.`);
      } else {
        th.classList.add("sorted-desc");
        th.setAttribute("title", `Diurutkan ${col} (Z-A / Terbesar). Klik untuk urutan sebaliknya.`);
      }
    } else {
      th.setAttribute("title", `Klik untuk mengurutkan daftar berdasar kolom ini`);
    }
  });
}

// ========================================================
// PAGINATION CONTROLLERS (10 / 25 / 50 / ALL PER PAGE)
// ========================================================
const paginationState = {
  guests: { page: 1, perPage: 10 },
  guestsTab: { page: 1, perPage: 10 },
  vendors: { page: 1, perPage: 10 },
  checklist: { page: 1, perPage: 10 },
  angpao: { page: 1, perPage: 10 }
};

function paginateArray(items, page, perPage) {
  if (perPage === "ALL") {
    return {
      paged: items,
      total: items.length,
      totalPages: 1,
      page: 1,
      startIndex: 0,
      endIndex: items.length
    };
  }
  const perPageNum = parseInt(perPage, 10) || 10;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPageNum));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPageNum;
  const endIndex = Math.min(startIndex + perPageNum, total);
  const paged = items.slice(startIndex, endIndex);

  return {
    paged,
    total,
    totalPages,
    page: currentPage,
    startIndex,
    endIndex
  };
}

function updatePaginationUI(prefix, pageInfo, perPageVal) {
  const rangeEl = document.getElementById(`${prefix}InfoRange`);
  const totalEl = document.getElementById(`${prefix}InfoTotal`);
  const selectEl = document.getElementById(`${prefix}PerPage`);
  const prevBtn = document.getElementById(`${prefix}PrevBtn`);
  const nextBtn = document.getElementById(`${prefix}NextBtn`);
  const pageIndicator = document.getElementById(`${prefix}PageIndicator`);

  if (rangeEl) {
    rangeEl.textContent = pageInfo.total === 0 ? "0 - 0" : `${pageInfo.startIndex + 1} - ${pageInfo.endIndex}`;
  }
  if (totalEl) totalEl.textContent = pageInfo.total;
  if (selectEl && selectEl.value !== String(perPageVal)) {
    selectEl.value = String(perPageVal);
  }
  if (prevBtn) prevBtn.disabled = pageInfo.page <= 1;
  if (nextBtn) nextBtn.disabled = pageInfo.page >= pageInfo.totalPages;
  if (pageIndicator) {
    pageIndicator.textContent = `Hal ${pageInfo.page} dari ${pageInfo.totalPages}`;
  }
}

// 4. Render Guest Table
function renderGuestTable() {
  const tbodyDashboard = document.getElementById("guestTableBody");
  const tbodyTab = document.getElementById("guestTableBodyTab");

  if (!tbodyDashboard && !tbodyTab) return;

  const searchQuery = (document.getElementById("globalSearchInput")?.value || "").toLowerCase();
  const filterCat = document.getElementById("filterCategorySelect")?.value || "ALL";

  let filtered = appGuests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(searchQuery) || g.code.toLowerCase().includes(searchQuery) || (g.table && g.table.toLowerCase().includes(searchQuery));
    const matchCat = filterCat === "ALL" || g.category === filterCat;
    return matchSearch && matchCat;
  });

  // Apply sorting if active
  if (guestSort.column) {
    const dir = guestSort.direction === 'asc' ? 1 : -1;
    filtered.sort((a, b) => {
      let res = 0;
      switch (guestSort.column) {
        case 'name':
          res = (a.name || '').localeCompare(b.name || '', 'id', { sensitivity: 'base' });
          break;
        case 'table':
          const tA = (a.table || '').toString();
          const tB = (b.table || '').toString();
          res = tA.localeCompare(tB, undefined, { numeric: true, sensitivity: 'base' });
          break;
        case 'pax':
          res = (a.pax || 0) - (b.pax || 0);
          break;
        case 'category':
          res = (a.category || '').localeCompare(b.category || '', 'id', { sensitivity: 'base' });
          break;
        case 'status':
          const statA = a.isCheckedIn ? 1 : 0;
          const statB = b.isCheckedIn ? 1 : 0;
          res = statA - statB;
          if (res === 0 && a.isCheckedIn) {
            res = (a.checkedInAt || '').localeCompare(b.checkedInAt || '');
          }
          break;
      }
      return res * dir;
    });
  }

  const renderGuestRow = (g, displayIndex) => {
    const avatarClass = g.category === "VIP" ? "vip" : g.category === "Keluarga" ? "family" : "";
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${displayIndex}</td>
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
  };

  if (tbodyDashboard) {
    const pInfo = paginateArray(filtered, paginationState.guests.page, paginationState.guests.perPage);
    paginationState.guests.page = pInfo.page;
    tbodyDashboard.innerHTML = pInfo.paged.map((g, idx) => renderGuestRow(g, pInfo.startIndex + idx + 1)).join("");
    const rangeEl = document.getElementById("guestInfoRangeDashboard");
    const totalEl = document.getElementById("guestInfoTotalDashboard");
    const selectEl = document.getElementById("guestPerPageDashboard");
    const prevBtn = document.getElementById("guestPrevBtnDashboard");
    const nextBtn = document.getElementById("guestNextBtnDashboard");
    const pageIndicator = document.getElementById("guestPageIndicatorDashboard");
    if (rangeEl) rangeEl.textContent = pInfo.total === 0 ? "0 - 0" : `${pInfo.startIndex + 1} - ${pInfo.endIndex}`;
    if (totalEl) totalEl.textContent = pInfo.total;
    if (selectEl) selectEl.value = String(paginationState.guests.perPage);
    if (prevBtn) prevBtn.disabled = pInfo.page <= 1;
    if (nextBtn) nextBtn.disabled = pInfo.page >= pInfo.totalPages;
    if (pageIndicator) pageIndicator.textContent = `Hal ${pInfo.page} dari ${pInfo.totalPages}`;
  }

  if (tbodyTab) {
    const pInfo = paginateArray(filtered, paginationState.guestsTab.page, paginationState.guestsTab.perPage);
    paginationState.guestsTab.page = pInfo.page;
    tbodyTab.innerHTML = pInfo.paged.map((g, idx) => renderGuestRow(g, pInfo.startIndex + idx + 1)).join("");
    const rangeEl = document.getElementById("guestInfoRangeTab");
    const totalEl = document.getElementById("guestInfoTotalTab");
    const selectEl = document.getElementById("guestPerPageTab");
    const prevBtn = document.getElementById("guestPrevBtnTab");
    const nextBtn = document.getElementById("guestNextBtnTab");
    const pageIndicator = document.getElementById("guestPageIndicatorTab");
    if (rangeEl) rangeEl.textContent = pInfo.total === 0 ? "0 - 0" : `${pInfo.startIndex + 1} - ${pInfo.endIndex}`;
    if (totalEl) totalEl.textContent = pInfo.total;
    if (selectEl) selectEl.value = String(paginationState.guestsTab.perPage);
    if (prevBtn) prevBtn.disabled = pInfo.page <= 1;
    if (nextBtn) nextBtn.disabled = pInfo.page >= pInfo.totalPages;
    if (pageIndicator) pageIndicator.textContent = `Hal ${pInfo.page} dari ${pInfo.totalPages}`;
  }
}

function changeGuestPerPage(val, source = 'dashboard') {
  const perPageVal = val === 'ALL' ? 'ALL' : parseInt(val, 10);
  if (source === 'dashboard') {
    paginationState.guests.perPage = perPageVal;
    paginationState.guests.page = 1;
  } else {
    paginationState.guestsTab.perPage = perPageVal;
    paginationState.guestsTab.page = 1;
  }
  renderGuestTable();
}

function changeGuestPage(delta, source = 'dashboard') {
  if (source === 'dashboard') {
    paginationState.guests.page += delta;
  } else {
    paginationState.guestsTab.page += delta;
  }
  renderGuestTable();
}

// 5. Render Seating & Table Occupancy
function renderTableOccupancy() {
  const container = document.getElementById("tableCardsGrid");
  if (!container) return;

  const isPlanner = currentMode === "planner";

  // Dynamic header & action visibility
  const titleEl = document.getElementById("seatingTabTitle");
  const subEl = document.getElementById("seatingTabSubtitle");
  const actionsEl = document.getElementById("plannerSeatingActions");
  const statsEl = document.getElementById("plannerSeatingStats");

  if (titleEl) {
    titleEl.textContent = isPlanner ? "🪑 Setup & Tata Letak Meja Kursi (Planner Studio)" : "Status Meja & Kapasitas Kursi";
  }
  if (subEl) {
    subEl.textContent = isPlanner 
      ? "Atur tata letak meja, kapasitas kursi, zonasi VIP/Keluarga, serta alokasi tamu undangan."
      : "Monitoring kursi terisi secara realtime saat tamu tiba di venue.";
  }
  if (actionsEl) {
    actionsEl.style.display = isPlanner ? "flex" : "none";
  }
  if (statsEl) {
    statsEl.style.display = isPlanner ? "grid" : "none";
    if (isPlanner) {
      const totalTables = appTables.length;
      const totalSeats = appTables.reduce((acc, t) => acc + (t.capacity || 0), 0);
      const allocatedSeats = appGuests.reduce((acc, g) => {
        if (g.table) return acc + (g.pax || 1);
        return acc;
      }, 0);
      const availableSeats = Math.max(0, totalSeats - allocatedSeats);
      const pct = totalSeats > 0 ? Math.round((allocatedSeats / totalSeats) * 100) : 0;

      const tEl = document.getElementById("statsTotalTables");
      const sEl = document.getElementById("statsTotalSeats");
      const aEl = document.getElementById("statsAllocatedSeats");
      const apEl = document.getElementById("statsAllocatedPct");
      const avEl = document.getElementById("statsAvailableSeats");

      if (tEl) tEl.textContent = totalTables;
      if (sEl) sEl.textContent = totalSeats;
      if (aEl) aEl.textContent = allocatedSeats;
      if (apEl) apEl.textContent = `${pct}% Kursi Terisi`;
      if (avEl) avEl.textContent = availableSeats;
    }
  }

  container.innerHTML = appTables.map(t => {
    const tableIdClean = t.id.replace("T", "");
    const tableGuests = appGuests.filter(g => {
      if (!g.table) return false;
      const gTable = g.table.toString().trim().replace(/^0+/, "");
      const tNum = tableIdClean.replace(/^0+/, "");
      return gTable === tNum || g.table === t.id || g.table === t.name;
    });

    const seatedCount = tableGuests.reduce((acc, g) => acc + (g.pax || 1), 0);
    const checkedInCount = tableGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + (g.pax || 1), 0);
    const isFull = seatedCount >= t.capacity;

    return `
      <div style="background:#fff; border:1px solid var(--border-light); border-radius:14px; padding:20px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <h4 style="font-size:1.02rem; font-weight:700; color:var(--text-dark);">${t.name}</h4>
              <span style="font-size:0.75rem; color:var(--text-muted); display:inline-block; margin-top:2px;">📍 ${t.zone}</span>
            </div>
            <span class="badge ${isFull ? 'badge-vip' : 'badge-family'}">
              ${isPlanner ? `${seatedCount}/${t.capacity} Kursi` : `${checkedInCount}/${t.capacity} Hadir`}
            </span>
          </div>

          <div style="background:#F1F5F9; border-radius:6px; height:8px; overflow:hidden; margin-bottom:10px;">
            <div style="background:${isFull ? '#DC2626' : '#2563EB'}; width:${Math.min(100, ((isPlanner ? seatedCount : checkedInCount) / (t.capacity || 1)) * 100)}%; height:100%; transition:width 0.3s ease;"></div>
          </div>

          <div style="font-size:0.75rem; color:var(--text-muted); display:flex; justify-content:space-between; margin-bottom:12px;">
            ${isPlanner ? `
              <span>Teralokasi: <strong>${seatedCount} pax</strong></span>
              <span>Sisa: <strong>${Math.max(0, t.capacity - seatedCount)} kursi</strong></span>
            ` : `
              <span>Hadir di lokasi: <strong>${checkedInCount} pax</strong></span>
              <span>Belum tiba: <strong>${Math.max(0, seatedCount - checkedInCount)} pax</strong></span>
            `}
          </div>

          <div style="border-top:1px dashed var(--border-light); padding-top:10px; margin-bottom:12px;">
            <div style="font-size:0.72rem; font-weight:600; color:var(--text-muted); margin-bottom:6px;">
              Tamu di Meja Ini (${tableGuests.length} Undangan):
            </div>
            <div style="max-height:100px; overflow-y:auto; font-size:0.75rem;">
              ${tableGuests.length ? tableGuests.map(tg => `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; padding:3px 6px; border-radius:4px; background:#F8FAFC;">
                  <span style="font-weight:500;">${tg.name} <small style="color:#64748B;">(${tg.pax}p)</small></span>
                  ${isPlanner ? `
                    <button class="btn btn-outline btn-sm" style="padding:1px 6px; font-size:0.68rem; color:#DC2626; border-color:#FECACA;" onclick="removeGuestFromTable('${tg.id}')" title="Keluarkan dari meja">✕</button>
                  ` : `
                    <span style="color:${tg.isCheckedIn ? '#16A34A' : '#94A3B8'}; font-weight:600; font-size:0.72rem;">${tg.isCheckedIn ? '✓ Hadir' : '○ Menunggu'}</span>
                  `}
                </div>
              `).join('') : '<span style="color:#94A3B8; font-style:italic;">Belum ada tamu dialokasikan.</span>'}
            </div>
          </div>
        </div>

        ${isPlanner ? `
          <div style="border-top:1px solid var(--border-light); padding-top:12px; margin-top:8px; display:flex; justify-content:space-between; gap:6px;">
            <button class="btn btn-outline btn-sm" style="flex:1;" onclick="openAssignGuestModal('${t.id}')">
              + Alokasi Tamu
            </button>
            <button class="btn btn-outline btn-sm" onclick="openEditTableModal('${t.id}')" title="Ubah Pengaturan Meja">
              ✏️
            </button>
            <button class="btn btn-outline btn-sm" style="color:#DC2626; border-color:#FECACA;" onclick="deleteTable('${t.id}')" title="Hapus Meja Ini">
              🗑️
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join("");
}

// Table CRUD
function openAddTableModal() {
  document.getElementById("tableModalEditingId").value = "";
  document.getElementById("tableModalTitle").textContent = "Tambah Meja Baru";
  const nextNum = appTables.length + 1;
  const pad = nextNum < 10 ? `0${nextNum}` : nextNum;
  document.getElementById("tableModalName").value = `Meja ${pad}`;
  document.getElementById("tableModalCapacity").value = "10";
  document.getElementById("tableModalZone").value = "Area Reguler";
  document.getElementById("tableModal").classList.add("active");
}

function openEditTableModal(tableId) {
  const t = appTables.find(x => x.id === tableId);
  if (!t) return;
  document.getElementById("tableModalEditingId").value = t.id;
  document.getElementById("tableModalTitle").textContent = `Ubah Pengaturan ${t.name}`;
  document.getElementById("tableModalName").value = t.name;
  document.getElementById("tableModalCapacity").value = t.capacity || 10;
  document.getElementById("tableModalZone").value = t.zone || "";
  document.getElementById("tableModal").classList.add("active");
}

function closeTableModal() {
  document.getElementById("tableModal").classList.remove("active");
}

function saveTableModal() {
  const editingId = document.getElementById("tableModalEditingId").value;
  const name = document.getElementById("tableModalName").value.trim();
  const capacity = parseInt(document.getElementById("tableModalCapacity").value, 10) || 10;
  const zone = document.getElementById("tableModalZone").value.trim() || "Area Utama";

  if (!name) {
    alert("Nama meja wajib diisi!");
    return;
  }

  if (editingId) {
    const t = appTables.find(x => x.id === editingId);
    if (t) {
      t.name = name;
      t.capacity = capacity;
      t.zone = zone;
    }
    showToast("Meja Diperbarui", `${name} berhasil diubah.`, "success");
  } else {
    const newId = "T" + (Date.now() % 10000);
    appTables.push({
      id: newId,
      name,
      capacity,
      zone
    });
    showToast("Meja Ditambahkan", `${name} berhasil dibuat.`, "success");
  }

  persistState();
  closeTableModal();
  renderTableOccupancy();
}

function deleteTable(tableId) {
  const t = appTables.find(x => x.id === tableId);
  if (!t) return;
  if (!confirm(`Hapus ${t.name}? Tamu yang dialokasikan ke meja ini akan diubah menjadi belum memiliki meja.`)) {
    return;
  }

  const tableIdClean = t.id.replace("T", "");
  appGuests.forEach(g => {
    if (g.table && (g.table === tableIdClean || g.table === t.id || g.table === t.name)) {
      g.table = "";
      g.seatZone = "";
    }
  });

  appTables = appTables.filter(x => x.id !== tableId);
  activeProject.tables = appTables;
  persistState();
  renderTableOccupancy();
  renderGuestTable();
  showToast("Meja Dihapus", `${t.name} berhasil dihapus.`, "info");
}

function openAssignGuestModal(tableId) {
  const t = appTables.find(x => x.id === tableId);
  if (!t) return;

  document.getElementById("assignTargetTableId").value = t.id;
  document.getElementById("assignGuestModalTitle").textContent = `Alokasikan Tamu ke ${t.name}`;
  document.getElementById("assignTargetTableInfo").textContent = `Zona: ${t.zone} • Kapasitas: ${t.capacity} Kursi`;

  const select = document.getElementById("assignGuestSelect");
  if (!select) return;

  // List all guests, prioritizing unassigned ones
  const unassigned = appGuests.filter(g => !g.table);
  const assignedOther = appGuests.filter(g => g.table && g.table !== t.id.replace("T", "0") && g.table !== t.id.replace("T", ""));

  let optionsHtml = '';
  if (unassigned.length > 0) {
    optionsHtml += `<optgroup label="Tamu Belum Memiliki Meja (${unassigned.length})">`;
    unassigned.forEach(g => {
      optionsHtml += `<option value="${g.id}">${g.name} (${g.pax} pax) - [${g.category}]</option>`;
    });
    optionsHtml += `</optgroup>`;
  }

  if (assignedOther.length > 0) {
    optionsHtml += `<optgroup label="Pindahkan dari Meja Lain (${assignedOther.length})">`;
    assignedOther.forEach(g => {
      optionsHtml += `<option value="${g.id}">${g.name} (${g.pax} pax) - Saat ini Meja ${g.table}</option>`;
    });
    optionsHtml += `</optgroup>`;
  }

  if (!optionsHtml) {
    optionsHtml = `<option value="">Semua tamu sudah dialokasikan ke meja ini!</option>`;
  }

  select.innerHTML = optionsHtml;
  document.getElementById("assignGuestModal").classList.add("active");
}

function closeAssignGuestModal() {
  document.getElementById("assignGuestModal").classList.remove("active");
}

function confirmAssignGuest() {
  const tableId = document.getElementById("assignTargetTableId").value;
  const guestId = document.getElementById("assignGuestSelect").value;
  const t = appTables.find(x => x.id === tableId);
  const g = appGuests.find(x => x.id === guestId);

  if (!t || !g) {
    closeAssignGuestModal();
    return;
  }

  const tableNum = t.id.replace("T", "");
  g.table = tableNum.length === 1 ? `0${tableNum}` : tableNum;
  g.seatZone = t.zone;

  persistState();
  closeAssignGuestModal();
  renderTableOccupancy();
  renderGuestTable();
  showToast("Tamu Dialokasikan", `${g.name} berhasil ditempatkan di ${t.name}.`, "success");
}

function removeGuestFromTable(guestId) {
  const g = appGuests.find(x => x.id === guestId);
  if (!g) return;
  const oldTable = g.table;
  g.table = "";
  g.seatZone = "";
  persistState();
  renderTableOccupancy();
  renderGuestTable();
  showToast("Alokasi Dibatalkan", `${g.name} dikeluarkan dari Meja ${oldTable}.`, "info");
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
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:8px;">
            <h4 style="font-size:1rem; font-weight:700;">${item.title}</h4>
            <div style="display:flex; gap:6px; align-items:center;">
              ${statusBadge}
              <button class="btn btn-outline btn-sm" onclick="toggleTimelineStatus('${item.id}')" title="Ganti status acara">Status</button>
              <button class="btn btn-outline btn-sm" onclick="openEditTimelineModal('${item.id}')" title="Ubah agenda">✏️</button>
              <button class="btn btn-outline btn-sm" style="color:#DC2626; border-color:#FECACA;" onclick="deleteTimeline('${item.id}')" title="Hapus agenda">🗑️</button>
            </div>
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted); display:flex; gap:16px; margin-bottom:6px;">
            <span>📍 ${item.location}</span>
            <span>👤 PIC: <strong>${item.pic}</strong></span>
          </div>
          <div style="font-size:0.82rem; color:#475569; background:#F8FAFC; padding:8px 12px; border-radius:8px;">
            ${item.notes || '-'}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function openAddTimelineModal() {
  document.getElementById("timelineModalEditingId").value = "";
  document.getElementById("timelineModalTitle").textContent = "Tambah Agenda Rundown Baru";
  document.getElementById("timelineModalTime").value = "19:00";
  document.getElementById("timelineModalTitleInput").value = "";
  document.getElementById("timelineModalPic").value = "WO & MC";
  document.getElementById("timelineModalLocation").value = "Main Ballroom";
  document.getElementById("timelineModalStatus").value = "upcoming";
  document.getElementById("timelineModalNotes").value = "";
  document.getElementById("timelineModal").classList.add("active");
}

function openEditTimelineModal(id) {
  const item = appTimeline.find(t => t.id === id);
  if (!item) return;
  document.getElementById("timelineModalEditingId").value = item.id;
  document.getElementById("timelineModalTitle").textContent = `Ubah Agenda: ${item.title}`;
  document.getElementById("timelineModalTime").value = item.time;
  document.getElementById("timelineModalTitleInput").value = item.title;
  document.getElementById("timelineModalPic").value = item.pic;
  document.getElementById("timelineModalLocation").value = item.location;
  document.getElementById("timelineModalStatus").value = item.status;
  document.getElementById("timelineModalNotes").value = item.notes || "";
  document.getElementById("timelineModal").classList.add("active");
}

function closeTimelineModal() {
  document.getElementById("timelineModal").classList.remove("active");
}

function saveTimelineModal() {
  const editingId = document.getElementById("timelineModalEditingId").value;
  const time = document.getElementById("timelineModalTime").value.trim() || "00:00";
  const title = document.getElementById("timelineModalTitleInput").value.trim();
  const pic = document.getElementById("timelineModalPic").value.trim() || "WO";
  const location = document.getElementById("timelineModalLocation").value.trim() || "Venue";
  const status = document.getElementById("timelineModalStatus").value;
  const notes = document.getElementById("timelineModalNotes").value.trim();

  if (!title) {
    alert("Judul agenda rundown wajib diisi!");
    return;
  }

  if (editingId) {
    const item = appTimeline.find(t => t.id === editingId);
    if (item) {
      item.time = time;
      item.title = title;
      item.pic = pic;
      item.location = location;
      item.status = status;
      item.notes = notes;
    }
    showToast("Agenda Diperbarui", `${title} berhasil diupdate.`, "success");
  } else {
    appTimeline.push({
      id: "tm_" + Date.now(),
      time,
      title,
      pic,
      location,
      status,
      notes
    });
    appTimeline.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    showToast("Agenda Ditambahkan", `${title} berhasil dicatat di rundown.`, "success");
  }

  persistState();
  closeTimelineModal();
  renderTimeline();
}

function deleteTimeline(id) {
  const item = appTimeline.find(t => t.id === id);
  if (!item) return;
  if (!confirm(`Hapus agenda "${item.title}" dari rundown?`)) return;

  appTimeline = appTimeline.filter(t => t.id !== id);
  activeProject.timeline = appTimeline;
  persistState();
  renderTimeline();
  showToast("Agenda Dihapus", `Agenda telah dihapus dari rundown.`, "info");
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

  const pInfo = paginateArray(appVendors, paginationState.vendors.page, paginationState.vendors.perPage);
  paginationState.vendors.page = pInfo.page;

  tbody.innerHTML = pInfo.paged.map((v, i) => {
    const cleanPhone = (v.phone || "").replace(/[^0-9]/g, "");
    const waPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
    const displayIndex = pInfo.startIndex + i + 1;
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${displayIndex}</td>
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
        <td style="font-size:0.8rem; color:var(--text-muted);">${v.notes || '-'}</td>
        <td>
          <a href="https://wa.me/${waPhone}?text=Halo%20${encodeURIComponent(v.picName)},%20update%20acara%20pernikahan%20${encodeURIComponent(activeProject.couple)}" target="_blank" class="btn btn-primary btn-sm" style="background:#16A34A; text-decoration:none;">
            💬 WA
          </a>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-outline btn-sm" onclick="openEditVendorModal('${v.id}')" title="Ubah data vendor">✏️</button>
            <button class="btn btn-outline btn-sm" style="color:#DC2626; border-color:#FECACA;" onclick="deleteVendor('${v.id}')" title="Hapus vendor">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updatePaginationUI("vendor", pInfo, paginationState.vendors.perPage);
}

function changeVendorPerPage(val) {
  paginationState.vendors.perPage = val === 'ALL' ? 'ALL' : parseInt(val, 10);
  paginationState.vendors.page = 1;
  renderVendors();
}

function changeVendorPage(delta) {
  paginationState.vendors.page += delta;
  renderVendors();
}

function openAddVendorModal() {
  document.getElementById("vendorModalEditingId").value = "";
  document.getElementById("vendorModalTitle").textContent = "Tambah Kontak Vendor Baru";
  document.getElementById("vendorModalCategory").value = "";
  document.getElementById("vendorModalName").value = "";
  document.getElementById("vendorModalPic").value = "";
  document.getElementById("vendorModalPhone").value = "";
  document.getElementById("vendorModalStatus").value = "Confirmed";
  document.getElementById("vendorModalNotes").value = "";
  document.getElementById("vendorModal").classList.add("active");
}

function openEditVendorModal(id) {
  const v = appVendors.find(x => x.id === id);
  if (!v) return;
  document.getElementById("vendorModalEditingId").value = v.id;
  document.getElementById("vendorModalTitle").textContent = `Ubah Vendor: ${v.vendorName}`;
  document.getElementById("vendorModalCategory").value = v.category;
  document.getElementById("vendorModalName").value = v.vendorName;
  document.getElementById("vendorModalPic").value = v.picName;
  document.getElementById("vendorModalPhone").value = v.phone;
  document.getElementById("vendorModalStatus").value = v.status;
  document.getElementById("vendorModalNotes").value = v.notes || "";
  document.getElementById("vendorModal").classList.add("active");
}

function closeVendorModal() {
  document.getElementById("vendorModal").classList.remove("active");
}

function saveVendorModal() {
  const editingId = document.getElementById("vendorModalEditingId").value;
  const category = document.getElementById("vendorModalCategory").value.trim() || "Vendor";
  const vendorName = document.getElementById("vendorModalName").value.trim();
  const picName = document.getElementById("vendorModalPic").value.trim() || "-";
  const phone = document.getElementById("vendorModalPhone").value.trim();
  const status = document.getElementById("vendorModalStatus").value;
  const notes = document.getElementById("vendorModalNotes").value.trim();

  if (!vendorName || !phone) {
    alert("Nama vendor dan nomor telepon/WhatsApp wajib diisi!");
    return;
  }

  if (editingId) {
    const v = appVendors.find(x => x.id === editingId);
    if (v) {
      v.category = category;
      v.vendorName = vendorName;
      v.picName = picName;
      v.phone = phone;
      v.status = status;
      v.notes = notes;
    }
    showToast("Vendor Diperbarui", `${vendorName} berhasil diperbarui.`, "success");
  } else {
    appVendors.push({
      id: "v_" + Date.now(),
      category,
      vendorName,
      picName,
      phone,
      status,
      notes
    });
    showToast("Vendor Ditambahkan", `${vendorName} berhasil disimpan.`, "success");
  }

  persistState();
  closeVendorModal();
  renderVendors();
}

function deleteVendor(id) {
  const v = appVendors.find(x => x.id === id);
  if (!v) return;
  if (!confirm(`Hapus vendor "${v.vendorName}" dari direktori?`)) return;

  appVendors = appVendors.filter(x => x.id !== id);
  activeProject.vendors = appVendors;
  persistState();
  renderVendors();
  showToast("Vendor Dihapus", `${v.vendorName} dihapus.`, "info");
}

// 8. Render Reception Checklist
function renderChecklist() {
  const tbody = document.getElementById("checklistTableBody");
  if (!tbody) return;

  const pInfo = paginateArray(appChecklist, paginationState.checklist.page, paginationState.checklist.perPage);
  paginationState.checklist.page = pInfo.page;

  tbody.innerHTML = pInfo.paged.map((c, i) => {
    const displayIndex = pInfo.startIndex + i + 1;
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${displayIndex}</td>
        <td><span class="badge badge-family">${c.zone}</span></td>
        <td><strong>${c.item}</strong></td>
        <td>${c.qty}</td>
        <td>${c.pic}</td>
        <td>
          <button class="btn btn-sm ${c.status === 'ready' ? 'btn-primary' : 'btn-outline'}" onclick="toggleChecklistStatus('${c.id}')">
            ${c.status === 'ready' ? '✓ Siap di Venue' : '○ Belum Siap'}
          </button>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-outline btn-sm" onclick="openEditChecklistModal('${c.id}')" title="Ubah checklist">✏️</button>
            <button class="btn btn-outline btn-sm" style="color:#DC2626; border-color:#FECACA;" onclick="deleteChecklist('${c.id}')" title="Hapus checklist">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  updatePaginationUI("checklist", pInfo, paginationState.checklist.perPage);
}

function changeChecklistPerPage(val) {
  paginationState.checklist.perPage = val === 'ALL' ? 'ALL' : parseInt(val, 10);
  paginationState.checklist.page = 1;
  renderChecklist();
}

function changeChecklistPage(delta) {
  paginationState.checklist.page += delta;
  renderChecklist();
}

function openAddChecklistModal() {
  document.getElementById("checklistModalEditingId").value = "";
  document.getElementById("checklistModalTitle").textContent = "Tambah Item Checklist Baru";
  document.getElementById("checklistModalZone").value = "Meja Resepsi";
  document.getElementById("checklistModalItem").value = "";
  document.getElementById("checklistModalQty").value = "1 Unit";
  document.getElementById("checklistModalPic").value = "Kru Resepsi";
  document.getElementById("checklistModalStatus").value = "ready";
  document.getElementById("checklistModal").classList.add("active");
}

function openEditChecklistModal(id) {
  const c = appChecklist.find(x => x.id === id);
  if (!c) return;
  document.getElementById("checklistModalEditingId").value = c.id;
  document.getElementById("checklistModalTitle").textContent = `Ubah Item: ${c.item}`;
  document.getElementById("checklistModalZone").value = c.zone;
  document.getElementById("checklistModalItem").value = c.item;
  document.getElementById("checklistModalQty").value = c.qty;
  document.getElementById("checklistModalPic").value = c.pic;
  document.getElementById("checklistModalStatus").value = c.status;
  document.getElementById("checklistModal").classList.add("active");
}

function closeChecklistModal() {
  document.getElementById("checklistModal").classList.remove("active");
}

function saveChecklistModal() {
  const editingId = document.getElementById("checklistModalEditingId").value;
  const zone = document.getElementById("checklistModalZone").value.trim() || "Venue";
  const item = document.getElementById("checklistModalItem").value.trim();
  const qty = document.getElementById("checklistModalQty").value.trim() || "1";
  const pic = document.getElementById("checklistModalPic").value.trim() || "Kru";
  const status = document.getElementById("checklistModalStatus").value;

  if (!item) {
    alert("Nama item perlengkapan wajib diisi!");
    return;
  }

  if (editingId) {
    const c = appChecklist.find(x => x.id === editingId);
    if (c) {
      c.zone = zone;
      c.item = item;
      c.qty = qty;
      c.pic = pic;
      c.status = status;
    }
    showToast("Checklist Diperbarui", `${item} berhasil diupdate.`, "success");
  } else {
    appChecklist.push({
      id: "c_" + Date.now(),
      zone,
      item,
      qty,
      pic,
      status
    });
    showToast("Checklist Ditambahkan", `${item} berhasil dicatat.`, "success");
  }

  persistState();
  closeChecklistModal();
  renderChecklist();
}

function deleteChecklist(id) {
  const c = appChecklist.find(x => x.id === id);
  if (!c) return;
  if (!confirm(`Hapus item "${c.item}" dari checklist?`)) return;

  appChecklist = appChecklist.filter(x => x.id !== id);
  activeProject.checklist = appChecklist;
  persistState();
  renderChecklist();
  showToast("Checklist Dihapus", `Item berhasil dihapus.`, "info");
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

  const pInfo = paginateArray(appAngpao, paginationState.angpao.page, paginationState.angpao.perPage);
  paginationState.angpao.page = pInfo.page;

  tbody.innerHTML = pInfo.paged.map((a, i) => {
    const displayIndex = pInfo.startIndex + i + 1;
    return `
      <tr>
        <td style="color:var(--text-muted); font-weight:600;">#${displayIndex}</td>
        <td><strong>${a.guestName}</strong></td>
        <td><span class="badge ${a.type.includes('Fisik') ? 'badge-vip' : 'badge-family'}">${a.type}</span></td>
        <td>${a.boxCode}</td>
        <td>${a.time} WIB</td>
        <td>${a.receiver}</td>
        <td style="font-size:0.8rem; color:var(--text-muted);">${a.notes}</td>
      </tr>
    `;
  }).join("");

  updatePaginationUI("angpao", pInfo, paginationState.angpao.perPage);
}

function changeAngpaoPerPage(val) {
  paginationState.angpao.perPage = val === 'ALL' ? 'ALL' : parseInt(val, 10);
  paginationState.angpao.page = 1;
  renderAngpao();
}

function changeAngpaoPage(delta) {
  paginationState.angpao.page += delta;
  renderAngpao();
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

// 11. Export to CSV for undanganku.id
function exportToUndangankuCSV() {
  let csv = "Nama Tamu,Kode Unik,Kategori,Sisi,Jumlah Pax,Nomor Meja,Zona Meja,Status Hadir,Waktu Hadir,Catatan\n";
  appGuests.forEach(g => {
    csv += `"${g.name}","${g.code}","${g.category}","${g.side}",${g.pax},"${g.table || ''}","${g.seatZone || ''}","${g.isCheckedIn ? 'Hadir' : 'Belum Hadir'}","${g.checkedInAt || ''}","${g.notes || ''}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `daftar_tamu_${activeProject.couple.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Export Berhasil", "Daftar tamu berhasil diunduh sebagai file CSV", "success");
}

// 12. Download Blank CSV Template
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

// 13. Robust CSV Parser
function parseCSVText(text) {
  const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) return [];

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

// 14. Handle CSV File Import
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

      rows.forEach(r => {
        const name = r.namatamu || r.nama || r.name || r.guestname || "";
        if (!name) return;

        const category = r.kategori || r.category || "Rekan";
        const side = r.sisi || r.side || "Bersama";
        const pax = parseInt(r.jumlahpax || r.pax || r.qty || "1", 10) || 1;
        const table = r.nomormeja || r.meja || r.table || "";
        const seatZone = r.zonameja || r.zona || (table ? `Area Meja ${table}` : "Area Reguler");
        const notes = r.catatan || r.notes || r.keterangan || "";
        const code = r.kodeunik || r.kode || r.code || generateGuestCode();

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
          souvenirClaimed: false,
          notes
        };

        if (existingIdx >= 0) {
          appGuests[existingIdx] = { ...appGuests[existingIdx], ...guestData, id: appGuests[existingIdx].id };
        } else {
          appGuests.push(guestData);
        }
        importedCount++;
      });

      persistState();
      renderAll();
      showToast("Import CSV Selesai", `Berhasil memproses ${importedCount} data tamu ke dalam proyek ${activeProject.couple}!`, "success");
    } catch (err) {
      alert("Gagal membaca file CSV: " + err.message);
    }
  };
  reader.readAsText(file, "UTF-8");
}

// 15. Add Guest Form Action
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

// 16. JSON Backup & Reset
function downloadJSONBackup() {
  const data = JSON.stringify(appProjects, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sapatamu_backup_all_events_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Backup Selesai", "Seluruh data proyek berhasil diunduh.", "success");
}

function resetDemoData() {
  if (confirm("Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi demo awal? Perubahan yang belum di-backup akan hilang.")) {
    localStorage.removeItem(STORAGE_PROJECTS);
    localStorage.removeItem(STORAGE_ACTIVE_PROJECT_ID);
    appProjects = defaultSeedProjects;
    activeProject = appProjects[0];
    activeProjectId = activeProject.id;
    appEvent = activeProject.event;
    appGuests = activeProject.guests;
    appTables = activeProject.tables;
    appTimeline = activeProject.timeline;
    appVendors = activeProject.vendors;
    appChecklist = activeProject.checklist;
    appAngpao = activeProject.angpao;
    persistState();
    updateEventMetaUI();
    renderAll();
    showToast("Reset Berhasil", "Sistem dikembalikan ke data demo awal.", "info");
  }
}

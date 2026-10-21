/**
 * SapaTamu Remote Control Engine (WebRTC Peer-to-Peer)
 * Allows smartphones to pair with the desktop app via QR Code scan.
 * Features:
 * 1. Wireless Handheld QR Scanner Gun (smartphone camera scans -> laptop prints & records)
 * 2. Stage MC Remote (trigger doorprize spin on stage screen from phone)
 * 3. Realtime Attendance Monitor on mobile
 */

const SapaRemote = {
  peer: null,
  activeConn: null,
  isHost: true,
  roomId: null,
  connectedDevices: 0,

  init() {
    const params = new URLSearchParams(window.location.search);
    const remoteTarget = params.get("remote");

    if (remoteTarget) {
      // Running as Smartphone Remote Client
      this.isHost = false;
      this.roomId = remoteTarget;
      this.initClient(remoteTarget);
    } else {
      // Running as Desktop Host Screen
      this.isHost = true;
      this.initHost();
    }
  },

  // 1. Initialize Host (Desktop/Laptop)
  initHost() {
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const hostId = `spt-${Date.now().toString(36)}-${randomSuffix}`;

    try {
      this.peer = new Peer(hostId, {
        debug: 1
      });

      this.peer.on("open", (id) => {
        this.roomId = id;
        this.updateHostPairingQR();
      });

      this.peer.on("connection", (conn) => {
        this.activeConn = conn;
        this.connectedDevices++;
        this.updateHostUIStatus(true);
        showToast("Smartphone Terhubung", "Perangkat mobile kini dapat mengontrol scanner & doorprize secara wireless!", "success");
        SoundFX.playSuccess();

        // Send initial state to phone
        conn.on("open", () => {
          this.broadcastHostState();
        });

        conn.on("data", (data) => {
          this.handleIncomingClientMessage(data, conn);
        });

        conn.on("close", () => {
          this.connectedDevices = Math.max(0, this.connectedDevices - 1);
          this.updateHostUIStatus(this.connectedDevices > 0);
          showToast("Koneksi Remote Terputus", "Smartphone terputus dari sistem.", "info");
        });
      });

      this.peer.on("error", (err) => {
        console.warn("PeerJS Host Error:", err);
      });
    } catch (e) {
      console.warn("PeerJS not initialized:", e);
    }
  },

  // Update pairing QR code in modal and settings tab
  updateHostPairingQR() {
    const containers = [
      document.getElementById("remotePairingQR"),
      document.getElementById("settingsRemotePairingQR")
    ].filter(Boolean);

    if (containers.length === 0 || !this.roomId) return;

    const joinUrl = `${window.location.origin}${window.location.pathname}?remote=${this.roomId}`;
    const urlDisplays = [
      document.getElementById("remotePairingUrl"),
      document.getElementById("settingsRemotePairingUrl")
    ].filter(Boolean);

    urlDisplays.forEach(el => el.textContent = joinUrl);

    containers.forEach(container => {
      container.innerHTML = "";
      if (window.QRCode) {
        new QRCode(container, {
          text: joinUrl,
          width: 200,
          height: 200,
          colorDark: "#0F172A",
          colorLight: "#FFFFFF",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    });
  },

  updateHostUIStatus(hasActive) {
    const statusLabels = [
      document.getElementById("settingsRemoteStatus"),
      document.getElementById("remotePillLabel")
    ].filter(Boolean);

    statusLabels.forEach(el => {
      if (hasActive) {
        el.textContent = `🟢 ${this.connectedDevices} HP Terhubung`;
      } else {
        el.textContent = "Belum Terhubung";
      }
    });
  },

  broadcastHostState() {
    if (!this.activeConn || !this.activeConn.open) return;
    const total = appGuests.reduce((acc, g) => acc + g.pax, 0);
    const checkedIn = appGuests.filter(g => g.isCheckedIn).reduce((acc, g) => acc + g.pax, 0);

    this.activeConn.send({
      type: "SYNC_STATE",
      mode: typeof currentMode !== "undefined" ? currentMode : "reception",
      event: appEvent,
      stats: { total, checkedIn, awaiting: total - checkedIn }
    });
  },

  handleIncomingClientMessage(data, conn) {
    if (!data) return;

    // Strict Operational Restriction: Remote control is only permitted in Reception (Hari-H) Mode!
    if (typeof currentMode !== "undefined" && currentMode !== "reception") {
      conn.send({
        type: "SCAN_REPLY",
        success: false,
        message: "Akses Ditolak: Remote hanya aktif saat sistem berada di Mode Resepsionis (Hari-H)."
      });
      return;
    }

    if (data.type === "SCAN_CODE") {
      const code = data.code;
      // Process check in on host
      const guest = appGuests.find(g => g.code.toLowerCase() === code.toLowerCase() || g.id === code);
      if (!guest) {
        conn.send({ type: "SCAN_REPLY", success: false, message: `Kode [${code}] tidak ditemukan!` });
        return;
      }

      const isDuplicate = guest.isCheckedIn;
      processGuestCheckInByCode(code);

      conn.send({
        type: "SCAN_REPLY",
        success: true,
        isDuplicate,
        guest: {
          name: guest.name,
          table: guest.table,
          seatZone: guest.seatZone,
          pax: guest.pax,
          category: guest.category,
          checkedInAt: guest.checkedInAt
        }
      });
      this.broadcastHostState();
    }
  },

  // 2. Initialize Client (Smartphone Remote UI)
  initClient(hostId) {
    document.body.classList.add("mobile-remote-active");
    this.renderMobileRemoteShell();

    try {
      this.peer = new Peer({ debug: 1 });

      this.peer.on("open", () => {
        const conn = this.peer.connect(hostId, { reliable: true });

        conn.on("open", () => {
          this.activeConn = conn;
          document.getElementById("remoteStatusIndicator").className = "mobile-status-connected";
          document.getElementById("remoteStatusText").textContent = "Terhubung ke Layar Utama 🟢";
          showToast("Terhubung!", "Smartphone siap menjadi wireless scanner & remote.", "success");
        });

        conn.on("data", (data) => {
          this.handleIncomingHostMessage(data);
        });

        conn.on("close", () => {
          document.getElementById("remoteStatusIndicator").className = "mobile-status-disconnected";
          document.getElementById("remoteStatusText").textContent = "Koneksi Terputus 🔴";
        });
      });

      this.peer.on("error", (err) => {
        document.getElementById("remoteStatusText").textContent = "Gagal terhubung: " + err.message;
      });
    } catch (e) {
      console.warn("Peer client error:", e);
    }
  },

  handleIncomingHostMessage(data) {
    if (!data) return;

    if (data.type === "SYNC_STATE") {
      if (document.getElementById("mobStatsCheckIn")) {
        document.getElementById("mobStatsCheckIn").textContent = data.stats.checkedIn;
        document.getElementById("mobStatsAwaiting").textContent = data.stats.awaiting;
      }
      const banner = document.getElementById("mobileModeAlertBanner");
      if (banner) {
        if (data.mode && data.mode !== "reception") {
          banner.style.display = "block";
          banner.textContent = "⚠️ Layar utama sedang berada di Mode Planner. Remote dijeda hingga admin kembali ke Mode Resepsionis.";
        } else {
          banner.style.display = "none";
        }
      }
    } else if (data.type === "SCAN_REPLY") {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const resultBox = document.getElementById("mobileScanResult");
      if (!resultBox) return;

      if (!data.success) {
        resultBox.style.display = "block";
        resultBox.className = "mobile-result-box error";
        resultBox.innerHTML = `❌ ${data.message}`;
      } else {
        resultBox.style.display = "block";
        resultBox.className = `mobile-result-box ${data.isDuplicate ? 'warning' : 'success'}`;
        resultBox.innerHTML = `
          <div style="font-size:0.8rem; text-transform:uppercase; font-weight:700;">
            ${data.isDuplicate ? '⚠️ Tamu Sudah Hadir' : '✅ Check-In Berhasil!'}
          </div>
          <div style="font-size:1.15rem; font-weight:800; margin:4px 0;">${data.guest.name}</div>
          <div style="font-size:0.9rem; background:rgba(0,0,0,0.06); padding:6px; border-radius:8px; margin:6px 0;">
            📍 <strong>MEJA ${data.guest.table || '-'}</strong> (${data.guest.seatZone || 'Reguler'}) • ${data.guest.pax} Pax
          </div>
          ${data.guest.doorprize ? `<div>Tiket Doorprize: <strong>#${data.guest.doorprize}</strong></div>` : ''}
        `;
      }
    }
  },

  // Send Scan from Smartphone to Host
  sendScanToHost(code) {
    if (this.activeConn && this.activeConn.open) {
      this.activeConn.send({ type: "SCAN_CODE", code });
    } else {
      alert("Belum terhubung ke layar utama!");
    }
  },

  // Send Spin Trigger from Smartphone to Host
  sendSpinToHost() {
    if (this.activeConn && this.activeConn.open) {
      this.activeConn.send({ type: "TRIGGER_SPIN" });
      if (navigator.vibrate) navigator.vibrate([200]);
    } else {
      alert("Belum terhubung ke layar utama!");
    }
  },

  // Render Full Mobile Remote Shell (Dedicated Fast Wireless QR Scanner Gun)
  renderMobileRemoteShell() {
    document.body.innerHTML = `
      <div class="mobile-remote-container">
        <!-- Top Mobile Header -->
        <header class="mobile-remote-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="brand-icon" style="width:28px; height:28px; font-size:0.85rem;">❖</div>
            <strong style="font-size:0.95rem;">SapaTamu Scanner Gun</strong>
          </div>
          <div id="remoteStatusIndicator" class="mobile-status-connecting">
            <span id="remoteStatusText">Menghubungkan...</span>
          </div>
        </header>

        <div id="mobileModeAlertBanner" style="display:none; background:#7F1D1D; color:#FEE2E2; padding:10px; border-radius:8px; font-size:0.75rem; margin-bottom:12px; line-height:1.4;"></div>

        <!-- Stats Bar -->
        <div class="mobile-stats-row">
          <div class="mobile-stat-col">
            <span class="m-val" id="mobStatsCheckIn">0</span>
            <span class="m-lbl">Sudah Hadir</span>
          </div>
          <div class="mobile-stat-col">
            <span class="m-val" id="mobStatsAwaiting">0</span>
            <span class="m-lbl">Belum Hadir</span>
          </div>
        </div>

        <!-- Mobile Scanner View -->
        <div id="mobileTabScanner" class="mobile-tab-view active">
          <div class="mobile-camera-box">
            <div id="mobileReader"></div>
          </div>

          <div id="mobileScanResult" class="mobile-result-box" style="display:none;"></div>

          <div class="scanner-manual-input" style="max-width:100%; margin-top:14px;">
            <input type="text" id="mobileCodeInput" placeholder="Ketik kode (KN-XXXX)..." style="font-size:0.9rem;">
            <button class="btn btn-primary" onclick="const v=document.getElementById('mobileCodeInput').value; if(v){ SapaRemote.sendScanToHost(v); document.getElementById('mobileCodeInput').value=''; }">
              Kirim
            </button>
          </div>
        </div>

        <div style="text-align:center; padding:18px; font-size:0.75rem; color:#94A3B8;">
          Arahkan kamera ke QR undangan tamu. Data otomatis dikirim ke laptop meja registrasi.
        </div>
      </div>
    `;

    this.startMobileCamera();
  },

  switchMobileTab(tab) {
    document.querySelectorAll(".m-nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".mobile-tab-view").forEach(v => v.style.display = "none");

    if (tab === "scanner") {
      document.getElementById("btnMobScanner").classList.add("active");
      document.getElementById("mobileTabScanner").style.display = "block";
      this.startMobileCamera();
    } else {
      document.getElementById("btnMobMC").classList.add("active");
      document.getElementById("mobileTabMC").style.display = "block";
      this.stopMobileCamera();
    }
  },

  startMobileCamera() {
    if (!window.Html5Qrcode) return;
    try {
      if (this.mobileScanner) return;
      this.mobileScanner = new Html5Qrcode("mobileReader");
      this.mobileScanner.start(
        { facingMode: "environment" },
        { fps: 12, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          this.sendScanToHost(decodedText);
        },
        () => {}
      ).catch(err => {
        console.warn("Mobile camera warning:", err);
      });
    } catch (e) {
      console.warn("Mobile camera error:", e);
    }
  },

  stopMobileCamera() {
    if (this.mobileScanner) {
      this.mobileScanner.stop().then(() => {
        this.mobileScanner.clear();
        this.mobileScanner = null;
      }).catch(() => {
        this.mobileScanner = null;
      });
    }
  }
};

window.SapaRemote = SapaRemote;

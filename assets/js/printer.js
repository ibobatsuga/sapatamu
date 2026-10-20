/**
 * Bluetooth Thermal Receipt Printer Engine (58mm ESC/POS)
 * Supports:
 * 1. Web Bluetooth API (Direct hardware wireless connection from Chrome)
 * 2. Virtual On-Screen Receipt Simulator (58mm realistic preview)
 * 3. Browser Print Fallback (@media print 58mm paper roll)
 */

const Thermal58 = {
  device: null,
  characteristic: null,
  connected: false,
  deviceName: "Belum Terhubung",
  autoPrintEnabled: true,

  // Common UUIDs for 58mm / 80mm POS Bluetooth Thermal Printers
  PRINTER_SERVICES: [
    '000018f0-0000-1000-8000-00805f9b34fb', // Standard POS Service
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Posiflex / Xprinter
    '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent UART
    '0000ffe0-0000-1000-8000-00805f9b34fb'  // HM-10 / CC2541 BLE module
  ],

  // Check if Web Bluetooth is supported in this browser
  isSupported() {
    return !!(navigator.bluetooth && navigator.bluetooth.requestDevice);
  },

  // Connect to Bluetooth Thermal Printer
  async connect() {
    if (!this.isSupported()) {
      throw new Error("Browser ini tidak mendukung Web Bluetooth. Gunakan Google Chrome pada Android, Windows, Mac, atau Chromebook.");
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: this.PRINTER_SERVICES
      });

      this.deviceName = this.device.name || "Bluetooth Printer 58mm";

      this.device.addEventListener('gattserverdisconnected', () => {
        this.connected = false;
        this.characteristic = null;
        this.deviceName = "Terputus";
        if (window.onPrinterStatusChange) window.onPrinterStatusChange(false);
      });

      const server = await this.device.gatt.connect();

      // Find usable writable characteristic across services
      for (const serviceUuid of this.PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(serviceUuid);
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              this.characteristic = char;
              break;
            }
          }
          if (this.characteristic) break;
        } catch (e) {
          // Continue searching next service
        }
      }

      if (!this.characteristic) {
        throw new Error("Berhasil terhubung ke Bluetooth, namun tidak menemukan kanal tulis (characteristic) ESC/POS yang kompatibel.");
      }

      this.connected = true;
      if (window.onPrinterStatusChange) window.onPrinterStatusChange(true, this.deviceName);
      return { success: true, name: this.deviceName };
    } catch (err) {
      this.connected = false;
      this.characteristic = null;
      throw err;
    }
  },

  // Disconnect printer
  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.connected = false;
    this.characteristic = null;
    this.deviceName = "Belum Terhubung";
    if (window.onPrinterStatusChange) window.onPrinterStatusChange(false);
  },

  // Build ESC/POS bytes for 58mm (32 characters per row in standard font)
  generateEscPos(eventData, guest) {
    const encoder = new TextEncoder();
    const bytes = [];

    const append = (arr) => {
      for (let i = 0; i < arr.length; i++) bytes.push(arr[i]);
    };

    const text = (str) => {
      append(encoder.encode(str));
    };

    const ESC = 0x1B;
    const GS = 0x1D;

    // Reset & Init
    append([ESC, 0x40]);

    // Align Center
    append([ESC, 0x61, 0x01]);

    // Header Title (Double Height + Bold)
    append([ESC, 0x45, 0x01]); // Bold ON
    append([GS, 0x21, 0x01]);  // Double Height
    text(`${eventData.title.toUpperCase()}\n`);
    append([GS, 0x21, 0x00]);  // Normal
    text(`${eventData.couple}\n`);
    append([ESC, 0x45, 0x00]); // Bold OFF
    text(`${eventData.date} • ${eventData.venue}\n`);
    text("--------------------------------\n"); // 32 chars divider

    // Guest Info (Left Align)
    append([ESC, 0x61, 0x00]);
    append([ESC, 0x45, 0x01]);
    text(`TAMU: ${guest.name}\n`);
    append([ESC, 0x45, 0x00]);
    text(`Kategori : ${guest.category} (${guest.side})\n`);
    text(`Pax      : ${guest.pax} Orang\n`);
    text(`Waktu    : ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB\n`);
    text("--------------------------------\n");

    // Table Placement (Center + Double Size Box)
    append([ESC, 0x61, 0x01]);
    text("NOMOR TEMPAT DUDUK:\n");
    append([ESC, 0x45, 0x01]);
    append([GS, 0x21, 0x11]); // Double Width & Height
    text(`MEJA ${guest.table || '-'}\n`);
    append([GS, 0x21, 0x00]);
    append([ESC, 0x45, 0x00]);
    if (guest.seatZone) {
      text(`Zona: ${guest.seatZone}\n`);
    }
    text("--------------------------------\n");

    // Souvenir Voucher Section
    text("KUPON SOUVENIR WEDDING\n");
    append([ESC, 0x45, 0x01]);
    text(`[ KODE: SV-${guest.code} ]\n`);
    append([ESC, 0x45, 0x00]);
    text("*Tukarkan di Meja Pengambilan*\n");
    text("--------------------------------\n");

    // Doorprize Ticket Section (if enabled)
    if (eventData.hasDoorprize && guest.doorprize) {
      text("★ KUPON UNDIAN DOORPRIZE ★\n");
      append([ESC, 0x45, 0x01]);
      append([GS, 0x21, 0x11]); // Double Size
      text(`#${guest.doorprize}\n`);
      append([GS, 0x21, 0x00]);
      append([ESC, 0x45, 0x00]);
      text("Simpan struk ini saat pengundian\n");
      text("================================\n");
    }

    // Footer
    append([ESC, 0x61, 0x01]);
    text("Terima Kasih Atas Kehadiran\n");
    text("& Doa Restu Anda\n");
    text(`undanganku.id • #${guest.code}\n\n\n\n`);

    // Cut paper (Partial cut if supported)
    append([GS, 0x56, 0x41, 0x10]);

    return new Uint8Array(bytes);
  },

  // Print to Bluetooth physical hardware
  async printToBluetooth(eventData, guest) {
    if (!this.connected || !this.characteristic) {
      throw new Error("Printer Bluetooth belum terhubung.");
    }
    const data = this.generateEscPos(eventData, guest);

    // Write in chunks of 512 bytes for reliable BLE transfer
    const CHUNK_SIZE = 512;
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      await this.characteristic.writeValue(chunk);
      await new Promise(r => setTimeout(r, 40));
    }
    return true;
  },

  // Render Virtual HTML 58mm Receipt Preview
  renderVirtualReceipt(eventData, guest) {
    return `
      <div class="receipt-58mm" id="printableReceipt">
        <div class="receipt-cut-top"></div>
        <div class="receipt-body">
          <div class="r-center r-bold r-title">${eventData.title.toUpperCase()}</div>
          <div class="r-center r-sub">${eventData.couple}</div>
          <div class="r-center r-muted">${eventData.date} • ${eventData.venue}</div>
          <div class="r-divider">--------------------------------</div>
          
          <div class="r-row">
            <span class="r-bold">TAMU:</span>
            <span class="r-bold">${guest.name}</span>
          </div>
          <div class="r-row">
            <span>Kategori:</span>
            <span>${guest.category} (${guest.side})</span>
          </div>
          <div class="r-row">
            <span>Jumlah:</span>
            <span>${guest.pax} Pax</span>
          </div>
          <div class="r-row">
            <span>Waktu:</span>
            <span>${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
          </div>
          <div class="r-divider">--------------------------------</div>

          <div class="r-center r-muted">TEMPAT DUDUK:</div>
          <div class="r-center r-large r-bold r-highlight">MEJA ${guest.table || '-'}</div>
          ${guest.seatZone ? `<div class="r-center r-small">Zona: ${guest.seatZone}</div>` : ''}
          <div class="r-divider">--------------------------------</div>

          <div class="r-center r-bold">KUPON SOUVENIR</div>
          <div class="r-center r-code">[ SV-${guest.code} ]</div>
          <div class="r-center r-small r-muted">*Tukarkan di Meja Souvenir*</div>
          <div class="r-divider">--------------------------------</div>

          ${eventData.hasDoorprize && guest.doorprize ? `
            <div class="r-center r-bold">★ UNDIAN DOORPRIZE ★</div>
            <div class="r-center r-large r-bold r-doorprize">#${guest.doorprize}</div>
            <div class="r-center r-small r-muted">*Simpan struk saat undian*</div>
            <div class="r-divider">================================</div>
          ` : ''}

          <div class="r-center r-footer">Terima Kasih Atas Kehadiran<br>& Doa Restu Anda</div>
          <div class="r-center r-small r-muted">undanganku.id • Code: ${guest.code}</div>
        </div>
        <div class="receipt-cut-bottom"></div>
      </div>
    `;
  }
};

window.Thermal58 = Thermal58;

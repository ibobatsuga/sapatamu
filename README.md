# VowReception OS — Smart Wedding Management & Check-in System

Sistem manajemen resepsi pernikahan modern dengan antarmuka terinspirasi dari Clean Dashboard (Homel UI), pemindai QR Code undangan digital (**undanganku.id**), dan integrasi langsung ke **Bluetooth Thermal Receipt Printer 58mm (ESC/POS)** untuk mencetak struk meja, kupon doorprize, dan souvenir.

---

## Fitur Utama

| Fitur | Deskripsi |
| :--- | :--- |
| **Homel-Style Dashboard** | Metrik kehadiran realtime dengan kartu pastel (*Today's Check-in*, *Belum Hadir*, *Total Tamu*, *Souvenir Diserahkan*, *Doorprize Pool*), chart arrival velocity, dan occupancy gauge. |
| **Instant QR Scanner (Front Desk)** | Mendukung pemindaian via kamera perangkat (WebRTC) serta **Barcode Scanner Gun (USB / Bluetooth HID)** dengan kecepatan respons < 0.3 detik. |
| **Anti Double Check-in** | Validasi cerdas mendeteksi QR yang sudah pernah di-scan dengan peringatan audio buzzer dan keterangan waktu hadir sebelumnya. |
| **58mm Thermal Receipt Printer** | Koneksi langsung via **Web Bluetooth API** (ESC/POS) tanpa driver perantara. Auto-print struk tempat duduk, kupon souvenir, dan tiket doorprize. |
| **Virtual Receipt Simulator** | Pratinjau struk 58mm monospace realistis di layar bagi perangkat yang tidak terhubung dengan printer fisik. |
| **Integrasi undanganku.id** | Generator string kode unik (`KN-XXXX`) per tamu yang dapat diekspor ke CSV untuk ditempelkan pada undangan digital `undanganku.id`. |
| **Stage Doorprize Lucky Draw** | Layar pengundian acak beranimasi untuk MC / LED screen panggung, otomatis memfilter hanya tamu yang benar-benar sudah hadir di lokasi. |
| **Monitoring Kapasitas Meja** | Visualisasi kapasitas tiap meja (*VIP*, *Keluarga*, *Rekan*, dll.) yang otomatis terupdate saat tamu check-in. |

---

## Struktur Folder Proyek

```text
wedding-smart-reception/
├── index.html              # Antarmuka utama aplikasi (Dashboard, Scanner, Tamu, Meja, Stage)
├── README.md               # Dokumentasi dan panduan penggunaan
└── assets/
    ├── css/
    │   └── style.css       # Desain sistem Homel pastel & styling cetak struk 58mm
    └── js/
        ├── app.js          # Controller utama, state management, dan alur check-in
        ├── printer.js      # Driver ESC/POS 58mm Web Bluetooth & Virtual Simulator
        ├── sound.js        # Sintesis audio procedural Web Audio API (chime, alarm, fanfare)
        ├── html5-qrcode.min.js # Library pemindai QR kamera (offline bundle)
        ├── qrcode.min.js   # Generator QR code visual (offline bundle)
        └── confetti.min.js # Animasi perayaan pemenang doorprize (offline bundle)
```

---

## Cara Menjalankan Aplikasi

Aplikasi bersifat **local-first** dan dapat dijalankan langsung di browser Google Chrome / Chromium (disarankan untuk dukungan Web Bluetooth):

### Opsi 1: Menggunakan Local Web Server (Direkomendasikan)
```bash
cd /Users/ibobatsuga/.gemini/antigravity/scratch/wedding-smart-reception
python3 -m http.server 8080
```
Buka browser di:
```text
http://localhost:8080
```

### Opsi 2: Buka Langsung File HTML
Klik dua kali file [`index.html`](file:///Users/ibobatsuga/.gemini/antigravity/scratch/wedding-smart-reception/index.html) di browser Anda.

---

## Panduan Penggunaan Hardware & Fitur

### 1. Menghubungkan Printer Bluetooth 58mm
1. Nyalakan printer thermal Bluetooth Anda (misal merk Panda, Iware, Zjiang, Xprinter, Sunmi).
2. Di aplikasi, klik tombol pill status printer **"BT Disconnected (Klik Connect)"** di topbar kanan atas atau di tab **Thermal 58mm**.
3. Pilih printer dari daftar perangkat Bluetooth yang muncul di dialog Chrome.
4. Setelah terhubung, status akan berubah menjadi hijau **"BT: [Nama Printer]"**.
5. Centang opsi **Auto-Print** agar struk otomatis tercetak setiap kali QR tamu di-scan.

### 2. Format Struk Thermal 58mm yang Dihasilkan
```text
================================
    THE WEDDING CELEBRATION     
         KEVIN & NADYA          
 24 Oktober 2026 • Grand Ballroom
--------------------------------
TAMU: Bpk. Bambang Soemantri & Istri
Kategori : VIP (Keluarga Pria)
Jumlah   : 2 Pax
Waktu    : 17:35 WIB
--------------------------------
NOMOR TEMPAT DUDUK:
>> MEJA 01 <<
Zona: Depan Kanan
--------------------------------
KUPON SOUVENIR WEDDING
[ KODE: SV-KN-8821 ]
*Tukarkan di Meja Pengambilan*
--------------------------------
★ KUPON UNDIAN DOORPRIZE ★
#DP-1001
Simpan struk ini saat pengundian
================================
  Terima Kasih Atas Kehadiran   
       & Doa Restu Anda         
 undanganku.id • #KN-8821       
```

### 3. Alur Integrasi dengan `undanganku.id`
1. Buka tab **Daftar Tamu**.
2. Masukkan list tamu atau gunakan data yang ada. Sistem otomatis men-generate **Kode Unik** (contoh: `KN-8821`) dan nomor undian doorprize (`#DP-1001`).
3. Klik tombol **"📥 Export ke undanganku.id"** untuk mengunduh file CSV.
4. Upload file CSV tersebut ke platform `undanganku.id` agar QR code pada undangan digital tamu otomatis memuat kode unik tersebut.
5. Saat hari H, penerima tamu cukup men-scan QR tersebut di meja resepsi!

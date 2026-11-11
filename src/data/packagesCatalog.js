/**
 * GuruKu SaaS - Katalog Paket Layanan & Lisensi Sekolah
 * Modul terpusat untuk menyimpan, mengambil, dan memperbarui paket langganan.
 * Terhubung otomatis dengan:
 * 1. Etalase Produk (Admin Customization)
 * 2. Expired View (Halaman perpanjangan sekolah ketika masa aktif habis)
 * 3. Checkout View (Gerbang pembayaran & aktivasi lisensi)
 * 4. Super Admin Dashboard (Pembuatan invoice & pendaftaran klien baru)
 */

export const STORAGE_KEY_PACKAGES = 'guruKu_packages_catalog'

export const DEFAULT_PACKAGES = [
  {
    id: 'pkg-standar',
    name: 'Lisensi Semester Ganjil',
    badge: 'Standar',
    tier: 'standar',
    price: 254205,
    durationMonths: 6,
    durationLabel: '6 Bulan (1 Semester)',
    description: 'Manajemen jadwal 1 semester lengkap untuk dewan guru dan rombel kelas.',
    features: [
      'Akses Generator Jadwal KBM Otomatis',
      'Validasi Jam Mengajar Bentrok Guru & Ruang',
      'Maksimal 40 Guru & 20 Rombel Kelas',
      'Ekspor Cetak PDF Format F4 / B4 & Excel Master',
      'Dukungan Teknis Jam Kerja Operasional'
    ],
    isActive: true,
    isPopular: false,
    isPremium: false
  },
  {
    id: 'pkg-populer',
    name: 'Lisensi Lengkap 1 Tahun',
    badge: 'Populer',
    tier: 'populer',
    price: 480000,
    durationMonths: 12,
    durationLabel: '12 Bulan (2 Semester Penuh)',
    description: 'Dua semester penuh, modul cetak kartu ujian, dan garansi bebas bentrok.',
    features: [
      'Semua fitur Paket Standar',
      'Jumlah Guru & Rombel Kelas Tanpa Batas (Unlimited)',
      'Algoritma Penjadwalan Cerdas Zero-Conflict Guarantee',
      'Modul Kios Guru & Scan QR Absensi Digital',
      'Ekspor Cetak Kartu Jadwal Ujian & Guru Piket',
      'Garansi Pembaruan Sistem Berkala 1 Tahun Penuh',
      'Prioritas Pendampingan WhatsApp 24/7'
    ],
    isActive: true,
    isPopular: true,
    isPremium: false
  },
  {
    id: 'pkg-premium',
    name: 'Multi-Kampus & Yayasan',
    badge: 'Premium',
    tier: 'premium',
    price: 1250000,
    durationMonths: 12,
    durationLabel: '12 Bulan (Multi-Unit Terpadu)',
    description: 'Solusi terpusat untuk yayasan dengan multi unit sekolah (SD, SMP, SMA/SMK).',
    features: [
      'Semua fitur Paket Populer',
      'Dukungan Multi-Unit Sekolah dalam 1 Dashboard Terpadu',
      'Manajemen Guru Lintas Unit (Guru Terbang / Pengampu)',
      'Custom Domain Sekolah & Branding Logo Institusi',
      'Pelatihan Onboarding Khusus untuk Operator & Waka Kurikulum',
      'Infrastruktur Server Terisolasi & Automated Daily Backup',
      'Dedicated Account Manager & VIP Priority Hotline'
    ],
    isActive: true,
    isPopular: false,
    isPremium: true
  }
]

/**
 * Mengambil seluruh paket dari localStorage atau menginisialisasi default jika kosong
 */
export function getStoredPackages() {
  if (typeof window === 'undefined') return DEFAULT_PACKAGES
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PACKAGES)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(DEFAULT_PACKAGES))
      return DEFAULT_PACKAGES
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return DEFAULT_PACKAGES
  } catch (err) {
    console.error('Gagal membaca paket lisensi dari localStorage:', err)
    return DEFAULT_PACKAGES
  }
}

/**
 * Menyimpan daftar paket ke localStorage dan memancarkan event agar reaktif di semua tab/komponen
 */
export function saveStoredPackages(packages) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PACKAGES, JSON.stringify(packages))
    window.dispatchEvent(new CustomEvent('guruKu_packages_updated', { detail: packages }))
  } catch (err) {
    console.error('Gagal menyimpan paket lisensi ke localStorage:', err)
  }
}

/**
 * Mengembalikan paket berdasarkan ID atau nama paket
 */
export function findPackage(query) {
  const pkgs = getStoredPackages()
  if (!query) return pkgs[0]
  return pkgs.find(p => p.id === query || p.name.toLowerCase() === query.toString().toLowerCase()) || pkgs[0]
}

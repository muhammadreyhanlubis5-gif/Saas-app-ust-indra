import { createRouter, createWebHistory } from 'vue-router'

// Views - Dynamic Route-Level Code-Splitting (Pillar 2: Zero-Lag Chunking)
import Login from '../views/LoginView.vue'
const SuperAdminDashboard = () => import('../views/SuperAdminDashboard.vue')
const SchoolAdminDashboard = () => import('../views/SchoolAdminDashboard.vue')
const TeacherDashboard = () => import('../views/TeacherDashboard.vue')
const ExpiredView = () => import('../views/ExpiredView.vue')
const ValidasiLembaga = () => import('../views/ValidasiLembaga.vue')
const DaftarKelas = () => import('../views/DaftarKelas.vue')
const DaftarGuru = () => import('../views/DaftarGuru.vue')
const SesiWaktu = () => import('../views/SesiWaktu.vue')
const PengampuMapel = () => import('../views/PengampuMapel.vue')
const JamKosong = () => import('../views/JamKosong.vue')
const TugasTambahan = () => import('../views/TugasTambahan.vue')
const JadwalGuru = () => import('../views/JadwalGuru.vue')
const JadwalKelas = () => import('../views/JadwalKelas.vue')
const MataPelajaran = () => import('../views/MataPelajaran.vue')
const AnalisisGuru = () => import('../views/AnalisisGuru.vue')
const TunjanganSertifikasi = () => import('../views/TunjanganSertifikasi.vue')
const KeuanganAset = () => import('../views/KeuanganAset.vue')
const KalkulatorHPP = () => import('../views/KalkulatorHPP.vue')
const PesananView = () => import('../views/PesananView.vue')
const CustomRequestView = () => import('../views/CustomRequestView.vue')
const EtalaseProdukView = () => import('../views/EtalaseProdukView.vue')
const LaporanInvestorView = () => import('../views/LaporanInvestorView.vue')
const PengaturanView = () => import('../views/PengaturanView.vue')
const PusatBantuan = () => import('../views/PusatBantuan.vue')
const ComingSoon = () => import('../views/ComingSoon.vue')

import { ROUTES, SCHOOL_ADMIN_SUB } from '../config/routePaths.js'

const routes = [
  { path: '/', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: ROUTES.EXPIRED, name: 'Expired', component: ExpiredView, meta: { requiresAuth: false } },
  { path: ROUTES.CHECKOUT, name: 'Checkout', component: () => import('../views/CheckoutView.vue'), meta: { requiresAuth: false } },
  
  // SUPER ADMIN (SECRET OBFUSCATED URL)
  {
    path: ROUTES.SUPER_ADMIN,
    component: SuperAdminDashboard,
    meta: { requiresAuth: true, role: 'SUPER_ADMIN' },
    children: [
      { path: '', name: 'SuperAdminHome', component: SuperAdminDashboard },
    ]
  },
  
  // SCHOOL ADMIN (SECRET OBFUSCATED URL)
  {
    path: ROUTES.SCHOOL_ADMIN,
    component: SchoolAdminDashboard,
    meta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
    children: [
      { path: SCHOOL_ADMIN_SUB.VALIDASI_LEMBAGA, name: 'ValidasiLembaga', component: ValidasiLembaga },
      { path: SCHOOL_ADMIN_SUB.DAFTAR_KELAS, name: 'DaftarKelas', component: DaftarKelas },
      { path: SCHOOL_ADMIN_SUB.DAFTAR_GURU, name: 'DaftarGuru', component: DaftarGuru },
      { path: SCHOOL_ADMIN_SUB.SESI_KBM, name: 'SesiWaktu', component: SesiWaktu },
      { path: SCHOOL_ADMIN_SUB.PENGAMPU, name: 'PengampuMapel', component: PengampuMapel },
      { path: SCHOOL_ADMIN_SUB.JAM_KOSONG, name: 'JamKosong', component: JamKosong },
      { path: SCHOOL_ADMIN_SUB.TUGAS_TAMBAHAN, name: 'TugasTambahan', component: TugasTambahan },
      { path: SCHOOL_ADMIN_SUB.JADWAL_GURU, name: 'JadwalGuru', component: JadwalGuru },
      { path: SCHOOL_ADMIN_SUB.JADWAL_KELAS, name: 'JadwalKelas', component: JadwalKelas },
      { path: SCHOOL_ADMIN_SUB.MATA_PELAJARAN, name: 'MataPelajaran', component: MataPelajaran },
      { path: SCHOOL_ADMIN_SUB.ANALISIS_GURU, name: 'AnalisisGuru', component: AnalisisGuru },
      { path: SCHOOL_ADMIN_SUB.TUNJANGAN_SERTIFIKASI, name: 'TunjanganSertifikasi', component: TunjanganSertifikasi },
      { path: SCHOOL_ADMIN_SUB.KEUANGAN_ASET, name: 'KeuanganAset', component: KeuanganAset },
      { path: SCHOOL_ADMIN_SUB.KALKULATOR_HPP, name: 'KalkulatorHPP', component: KalkulatorHPP },
      { path: SCHOOL_ADMIN_SUB.PESANAN, name: 'Pesanan', component: PesananView },
      { path: SCHOOL_ADMIN_SUB.CUSTOM_REQUEST, name: 'CustomRequest', component: CustomRequestView },
      { path: SCHOOL_ADMIN_SUB.ETALASE_PRODUK, name: 'EtalaseProduk', component: EtalaseProdukView },
      { path: SCHOOL_ADMIN_SUB.LAPORAN_INVESTOR, name: 'LaporanInvestor', component: LaporanInvestorView },
      { path: SCHOOL_ADMIN_SUB.PENGATURAN, name: 'Pengaturan', component: PengaturanView },
      { path: SCHOOL_ADMIN_SUB.PUSAT_BANTUAN, name: 'PusatBantuan', component: PusatBantuan },
      { path: ':pathMatch(.*)*', name: 'AdminNotFound', component: ComingSoon }
    ]
  },
  
  // GURU / TEACHER (SECRET OBFUSCATED URL)
  {
    path: ROUTES.TEACHER,
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'TEACHER' },
    children: [
      { path: '', name: 'TeacherHome', component: TeacherDashboard },
    ]
  },

  // OTOMATIS ALIHKAN (REDIRECT) SEMUA JALUR LAMA KE URL BERSIMBOL AGAR TIDAK TEBAKAN
  { path: '/super-admin', redirect: '/' },
  { path: '/expired', redirect: ROUTES.EXPIRED },
  { path: '/checkout', redirect: ROUTES.CHECKOUT },
  { path: '/guru', redirect: ROUTES.TEACHER },
  { path: '/admin-sekolah', redirect: ROUTES.SCHOOL_ADMIN },
  { path: '/admin-sekolah/validasi-lembaga', redirect: ROUTES.VALIDASI_LEMBAGA },
  { path: '/admin-sekolah/daftar-kelas', redirect: ROUTES.DAFTAR_KELAS },
  { path: '/admin-sekolah/daftar-guru', redirect: ROUTES.DAFTAR_GURU },
  { path: '/admin-sekolah/sesi-kbm', redirect: ROUTES.SESI_WAKTU },
  { path: '/admin-sekolah/pengampu', redirect: ROUTES.PENGAMPU },
  { path: '/admin-sekolah/jam-kosong', redirect: ROUTES.JAM_KOSONG },
  { path: '/admin-sekolah/tugas-tambahan', redirect: ROUTES.TUGAS_TAMBAHAN },
  { path: '/admin-sekolah/jadwal-guru', redirect: ROUTES.JADWAL_GURU },
  { path: '/admin-sekolah/jadwal-kelas', redirect: ROUTES.JADWAL_KELAS },
  { path: '/admin-sekolah/mata-pelajaran', redirect: ROUTES.MATA_PELAJARAN },
  { path: '/admin-sekolah/analisis-guru', redirect: ROUTES.ANALISIS_GURU },
  { path: '/admin-sekolah/sertifikasi', redirect: ROUTES.TUNJANGAN_SERTIFIKASI },
  { path: '/admin-sekolah/bantuan', redirect: ROUTES.PUSAT_BANTUAN }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation Guard Enterprise (Robust & Resilient)
function getNormalizedRole() {
  const raw = localStorage.getItem('role') || localStorage.getItem('user_role') || ''
  const upper = String(raw).toUpperCase().trim()
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (upper === 'SCHOOL_ADMIN' || upper === 'ADMIN_SEKOLAH') return 'SCHOOL_ADMIN'
  if (upper === 'TEACHER' || upper === 'GURU') return 'TEACHER'
  return upper
}

function hasValidToken() {
  const token = localStorage.getItem('token') || localStorage.getItem('guruku_session')
  if (!token) return false
  try {
    const parts = token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false
      }
    }
    return true
  } catch (_) {
    return false
  }
}

router.beforeEach((to, from, next) => {
  const isAuth = hasValidToken()
  const role = getNormalizedRole()

  // Jika sudah terautentikasi dan membuka halaman Login (/), arahkan langsung ke dashboard yang sesuai
  if (to.name === 'Login' && isAuth) {
    if (role === 'SUPER_ADMIN') return next({ path: ROUTES.SUPER_ADMIN })
    if (role === 'SCHOOL_ADMIN') return next({ path: ROUTES.SCHOOL_ADMIN })
    if (role === 'TEACHER') return next({ path: ROUTES.TEACHER })
  }

  // Jika rute membutuhkan otorisasi
  if (to.meta.requiresAuth) {
    if (!isAuth) {
      // Bersihkan sesi usang
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user_role')
      return next({ name: 'Login' })
    }

    if (to.meta.role) {
      const requiredRole = String(to.meta.role).toUpperCase().trim()
      if (role !== requiredRole) {
        if (role === 'SUPER_ADMIN') return next({ path: ROUTES.SUPER_ADMIN })
        if (role === 'SCHOOL_ADMIN') return next({ path: ROUTES.SCHOOL_ADMIN })
        if (role === 'TEACHER') return next({ path: ROUTES.TEACHER })
        return next({ name: 'Login' })
      }
    }
  }

  next()
})

export default router

import { createRouter, createWebHistory } from 'vue-router'

// Views - Static Imports for Faster UX
import Login from '../views/LoginView.vue'
import SuperAdminDashboard from '../views/SuperAdminDashboard.vue'
import SchoolAdminDashboard from '../views/SchoolAdminDashboard.vue'
import TeacherDashboard from '../views/TeacherDashboard.vue'
import ExpiredView from '../views/ExpiredView.vue'
import ValidasiLembaga from '../views/ValidasiLembaga.vue'
import DaftarKelas from '../views/DaftarKelas.vue'
import DaftarGuru from '../views/DaftarGuru.vue'
import SesiWaktu from '../views/SesiWaktu.vue'
import PengampuMapel from '../views/PengampuMapel.vue'
import JamKosong from '../views/JamKosong.vue'
import TugasTambahan from '../views/TugasTambahan.vue'
import JadwalGuru from '../views/JadwalGuru.vue'
import JadwalKelas from '../views/JadwalKelas.vue'
import MataPelajaran from '../views/MataPelajaran.vue'
import AnalisisGuru from '../views/AnalisisGuru.vue'
import TunjanganSertifikasi from '../views/TunjanganSertifikasi.vue'
import PusatBantuan from '../views/PusatBantuan.vue'
import ComingSoon from '../views/ComingSoon.vue'
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
  routes
})

// GLOBAL BEFORE GUARD
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // 1. Ambil data dari localStorage
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('user_role')
    const validUntil = localStorage.getItem('valid_until') // Disimpan saat login

    // 2. Cek apakah sudah login
    if (!token) {
      return next({ name: 'Login' })
    }

    // 3. Cek apakah Role sesuai (RBAC)
    if (to.meta.role && to.meta.role !== userRole) {
      console.warn("Akses Ditolak: Role tidak sesuai.")
      return next({ name: 'Login' })
    }

    // 4. Validasi Masa Kontrak (Khusus Klien: School Admin & Teacher)
    if (userRole === 'SCHOOL_ADMIN' || userRole === 'TEACHER') {
      if (validUntil) {
        const expiryDate = new Date(validUntil)
        const today = new Date()
        
        // Jika tanggal hari ini sudah melewati batas valid_until
        if (today > expiryDate) {
          console.error("Masa kontrak habis. Redirecting to /expired")
          return next({ name: 'Expired' })
        }
      }
    }

    // Lolos semua pengecekan
    next()
  } else {
    next()
  }
})

export default router





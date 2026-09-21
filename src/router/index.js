import { createRouter, createWebHistory } from 'vue-router'

// Views - Static Imports for Faster UX
import Login from '../views/LoginView.vue'
import SuperAdminDashboard from '../views/SuperAdminDashboard.vue'
import SchoolAdminDashboard from '../views/SchoolAdminDashboard.vue'
import TeacherDashboard from '../views/TeacherDashboard.vue'
import ExpiredView from '../views/ExpiredView.vue'
import ValidasiLembaga from '../views/ValidasiLembaga.vue'
import SesiWaktu from '../views/SesiWaktu.vue'
import PengampuMapel from '../views/PengampuMapel.vue'
import JamKosong from '../views/JamKosong.vue'
import TugasTambahan from '../views/TugasTambahan.vue'
import InputJadwal from '../views/InputJadwal.vue'
import JadwalGuru from '../views/JadwalGuru.vue'
import JadwalKelas from '../views/JadwalKelas.vue'
import ComingSoon from '../views/ComingSoon.vue'

const routes = [
  { path: '/', name: 'Login', component: Login, meta: { requiresAuth: false } },
  { path: '/expired', name: 'Expired', component: ExpiredView, meta: { requiresAuth: false } },
  
  // SUPER ADMIN
  {
    path: '/super-admin',
    component: SuperAdminDashboard,
    meta: { requiresAuth: true, role: 'SUPER_ADMIN' },
    children: [
      { path: '', name: 'SuperAdminHome', component: SuperAdminDashboard },
    ]
  },
  
  // SCHOOL ADMIN (TENANT)
  {
    path: '/admin-sekolah',
    component: SchoolAdminDashboard,
    meta: { requiresAuth: true, role: 'SCHOOL_ADMIN' },
    children: [
      { path: 'validasi-lembaga', name: 'ValidasiLembaga', component: ValidasiLembaga },
      { path: 'sesi-kbm', name: 'SesiWaktu', component: SesiWaktu },
      { path: 'pengampu', name: 'PengampuMapel', component: PengampuMapel },
      { path: 'jam-kosong', name: 'JamKosong', component: JamKosong },
      { path: 'tugas-tambahan', name: 'TugasTambahan', component: TugasTambahan },
      { path: 'input-jadwal', name: 'InputJadwal', component: InputJadwal },
      { path: 'jadwal-guru', name: 'JadwalGuru', component: JadwalGuru },
      { path: 'jadwal-kelas', name: 'JadwalKelas', component: JadwalKelas },
      { path: 'alokasi-jam', name: 'AlokasiJam', component: ComingSoon },
      { path: ':pathMatch(.*)*', name: 'AdminNotFound', component: ComingSoon }
    ]
  },
  
  // GURU (TEACHER)
  {
    path: '/guru',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'TEACHER' },
    children: [
      { path: '', name: 'TeacherHome', component: TeacherDashboard },
    ]
  }
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

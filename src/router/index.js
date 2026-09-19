import { createRouter, createWebHistory } from 'vue-router'

// Views
const Login = () => import('../views/LoginView.vue') 
const SuperAdminDashboard = () => import('../views/SuperAdminDashboard.vue') 
const SchoolAdminDashboard = () => import('../views/SchoolAdminDashboard.vue') 
const TeacherDashboard = () => import('../views/TeacherDashboard.vue')
const DashboardValidation = () => import('../views/DashboardValidation.vue')
const ExpiredView = () => import('../views/ExpiredView.vue') // Halaman Kontrak Habis

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
      { path: '', name: 'SchoolAdminHome', component: SchoolAdminDashboard },
      { path: 'validasi', name: 'DashboardValidation', component: DashboardValidation },
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

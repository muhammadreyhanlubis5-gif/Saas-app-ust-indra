import { createRouter, createWebHistory } from 'vue-router'

// Simulasi halaman Login (Bisa dibuat komponen aslinya nanti)
const Login = () => import('../components/HelloWorld.vue') 

// Dashboard sesuai Role
const SuperAdminDashboard = () => import('../App.vue') // Ganti dengan view aslinya
const SchoolAdminDashboard = () => import('../App.vue') 
const TeacherDashboard = () => import('../App.vue')

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  // ==========================================
  // 1. ROUTER SUPER ADMIN
  // ==========================================
  {
    path: '/super-admin',
    component: SuperAdminDashboard,
    meta: { requiresAuth: true, role: 'super_admin' },
    children: [
      { path: '', name: 'SuperAdminHome', component: SuperAdminDashboard },
      { path: 'tenants', name: 'ManageTenants', component: SuperAdminDashboard }, // CRUD Sekolah
    ]
  },
  // ==========================================
  // 2. ROUTER SCHOOL ADMIN (TENANT)
  // ==========================================
  {
    path: '/admin-sekolah',
    component: SchoolAdminDashboard,
    meta: { requiresAuth: true, role: 'school_admin' },
    children: [
      { path: '', name: 'SchoolAdminHome', component: SchoolAdminDashboard },
      { path: 'guru', name: 'ManageTeachers', component: SchoolAdminDashboard }, // CRUD Guru
      { path: 'jadwal', name: 'ManageSchedules', component: SchoolAdminDashboard }, // Input Jadwal
      { path: 'validasi', name: 'DashboardValidation', component: SchoolAdminDashboard }, // Halaman Balance
    ]
  },
  // ==========================================
  // 3. ROUTER GURU (TEACHER)
  // ==========================================
  {
    path: '/guru',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' },
    children: [
      { path: '', name: 'TeacherHome', component: TeacherDashboard },
      { path: 'jadwal-saya', name: 'MySchedule', component: TeacherDashboard }, // View only
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guard (RBAC Logic di Frontend)
router.beforeEach((to, from, next) => {
  // Ambil token dan role dari localStorage (Simulasi)
  const isAuthenticated = localStorage.getItem('token') !== null
  const userRole = localStorage.getItem('user_role') // 'super_admin', 'school_admin', 'teacher'

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Belum login, tendang ke halaman login
      next({ name: 'Login' })
    } else if (to.meta.role && to.meta.role !== userRole) {
      // Role tidak sesuai, jangan beri akses
      console.warn("Akses ditolak: Anda tidak memiliki permission ke halaman ini.")
      // Redirect ke dashboard masing-masing sesuai role
      if (userRole === 'super_admin') next({ name: 'SuperAdminHome' })
      else if (userRole === 'school_admin') next({ name: 'SchoolAdminHome' })
      else if (userRole === 'teacher') next({ name: 'TeacherHome' })
      else next({ name: 'Login' })
    } else {
      // Diizinkan lewat
      next()
    }
  } else {
    // Halaman publik (seperti Login)
    if (isAuthenticated && to.name === 'Login') {
      // Jika sudah login tapi buka '/' arahkan ke dashboardnya
      if (userRole === 'super_admin') next({ name: 'SuperAdminHome' })
      else if (userRole === 'school_admin') next({ name: 'SchoolAdminHome' })
      else if (userRole === 'teacher') next({ name: 'TeacherHome' })
    } else {
      next()
    }
  }
})

export default router

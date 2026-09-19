import { createRouter, createWebHistory } from 'vue-router'

// Simulasi halaman Login (Bisa dibuat komponen aslinya nanti)
const Login = () => import('../components/HelloWorld.vue') 

// Dashboard sesuai Role
const SuperAdminDashboard = () => import('../views/SuperAdminDashboard.vue') 
const SchoolAdminDashboard = () => import('../views/SchoolAdminDashboard.vue') 
const TeacherDashboard = () => import('../views/TeacherDashboard.vue')
const DashboardValidation = () => import('../views/DashboardValidation.vue')

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
      { path: 'validasi', name: 'DashboardValidation', component: DashboardValidation }, // Halaman Balance
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
  // UNTUK PREVIEW UI: Kita izinkan semua akses secara default tanpa login
  // const isAuthenticated = localStorage.getItem('token') !== null
  const isAuthenticated = true 
  const userRole = localStorage.getItem('user_role') || 'super_admin'

  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // Belum login, tendang ke halaman login
      next({ name: 'Login' })
    } else {
      // PREVIEW MODE: Bebaskan role checking agar bisa melihat semua halaman
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

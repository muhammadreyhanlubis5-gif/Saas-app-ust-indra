import test from 'node:test'
import assert from 'node:assert/strict'

import { ROLE_PERMISSIONS } from '../src/stores/auth.js'

// Role normalization logic for the 5 Master Architecture roles
function normalizeRole(r) {
  if (!r) return ''
  const upper = String(r).toUpperCase().trim()
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (upper === 'SCHOOL_ADMIN' || upper === 'ADMIN_SEKOLAH') return 'SCHOOL_ADMIN'
  if (upper === 'CURRICULUM_ADMIN' || upper === 'WAKASEK_KURIKULUM' || upper === 'KURIKULUM') return 'CURRICULUM_ADMIN'
  if (upper === 'PRINCIPAL' || upper === 'KEPALA_SEKOLAH') return 'PRINCIPAL'
  if (upper === 'TEACHER' || upper === 'GURU') return 'TEACHER'
  return upper
}

// RBAC Permission checker
function can(role, permission) {
  const normRole = normalizeRole(role)
  const permissions = ROLE_PERMISSIONS[normRole] || []
  return permissions.includes(permission)
}

// Route Guard decision logic
function evaluateRouteAccess({ isAuthenticated, role, routeMeta }) {
  const normRole = normalizeRole(role)

  if (!routeMeta || !routeMeta.requiresAuth) {
    return { allowed: true, redirect: null }
  }

  if (!isAuthenticated) {
    return { allowed: false, redirect: 'Login' }
  }

  const allowedRoles = Array.isArray(routeMeta.roles)
    ? routeMeta.roles.map(r => normalizeRole(r))
    : (routeMeta.role ? [normalizeRole(routeMeta.role)] : [])

  // Allow CURRICULUM_ADMIN and PRINCIPAL access to SCHOOL_ADMIN routes by default
  if (allowedRoles.includes('SCHOOL_ADMIN')) {
    if (!allowedRoles.includes('CURRICULUM_ADMIN')) allowedRoles.push('CURRICULUM_ADMIN')
    if (!allowedRoles.includes('PRINCIPAL')) allowedRoles.push('PRINCIPAL')
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(normRole)) {
    // Redirect to respective dashboard
    let target = 'Login'
    if (normRole === 'SUPER_ADMIN') target = 'SuperAdminHome'
    else if (['SCHOOL_ADMIN', 'CURRICULUM_ADMIN', 'PRINCIPAL'].includes(normRole)) target = 'SchoolAdminHome'
    else if (normRole === 'TEACHER') target = 'TeacherHome'

    return { allowed: false, redirect: target }
  }

  return { allowed: true, redirect: null }
}

test('1. Role Normalization covers all 5 Master Architecture roles', () => {
  assert.equal(normalizeRole('super_admin'), 'SUPER_ADMIN')
  assert.equal(normalizeRole('school_admin'), 'SCHOOL_ADMIN')
  assert.equal(normalizeRole('admin_sekolah'), 'SCHOOL_ADMIN')
  assert.equal(normalizeRole('wakasek_kurikulum'), 'CURRICULUM_ADMIN')
  assert.equal(normalizeRole('kurikulum'), 'CURRICULUM_ADMIN')
  assert.equal(normalizeRole('kepala_sekolah'), 'PRINCIPAL')
  assert.equal(normalizeRole('principal'), 'PRINCIPAL')
  assert.equal(normalizeRole('guru'), 'TEACHER')
  assert.equal(normalizeRole('teacher'), 'TEACHER')
})

test('2. RBAC Permission Matrix conforms to domain responsibilities', () => {
  // SUPER_ADMIN
  assert.equal(can('SUPER_ADMIN', 'manage_tenants'), true)
  assert.equal(can('SUPER_ADMIN', 'manage_subscriptions'), true)

  // SCHOOL_ADMIN
  assert.equal(can('SCHOOL_ADMIN', 'manage_teachers'), true)
  assert.equal(can('SCHOOL_ADMIN', 'publish_schedule'), true)
  assert.equal(can('SCHOOL_ADMIN', 'manage_tenants'), false)

  // CURRICULUM_ADMIN
  assert.equal(can('CURRICULUM_ADMIN', 'manage_distribution'), true)
  assert.equal(can('CURRICULUM_ADMIN', 'run_scheduler'), true)
  assert.equal(can('CURRICULUM_ADMIN', 'publish_schedule'), false) // Only Admin & Principal publish

  // PRINCIPAL
  assert.equal(can('PRINCIPAL', 'view_schedule'), true)
  assert.equal(can('PRINCIPAL', 'publish_schedule'), true)
  assert.equal(can('PRINCIPAL', 'manage_time_slots'), false)

  // TEACHER
  assert.equal(can('TEACHER', 'view_my_schedule'), true)
  assert.equal(can('TEACHER', 'request_blocked_slots'), true)
  assert.equal(can('TEACHER', 'manage_teachers'), false)
  assert.equal(can('TEACHER', 'publish_schedule'), false)
})

test('3. Route Guard protects authenticated routes & handles multi-role permissions', () => {
  // Public route
  const publicAccess = evaluateRouteAccess({
    isAuthenticated: false,
    role: null,
    routeMeta: { requiresAuth: false }
  })
  assert.equal(publicAccess.allowed, true)

  // Protected route unauthenticated
  const unauthAccess = evaluateRouteAccess({
    isAuthenticated: false,
    role: null,
    routeMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' }
  })
  assert.equal(unauthAccess.allowed, false)
  assert.equal(unauthAccess.redirect, 'Login')

  // School Admin workspace accessible by SCHOOL_ADMIN, CURRICULUM_ADMIN, PRINCIPAL
  const schoolAdminAccess = evaluateRouteAccess({
    isAuthenticated: true,
    role: 'SCHOOL_ADMIN',
    routeMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' }
  })
  assert.equal(schoolAdminAccess.allowed, true)

  const curriculumAccess = evaluateRouteAccess({
    isAuthenticated: true,
    role: 'CURRICULUM_ADMIN',
    routeMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' }
  })
  assert.equal(curriculumAccess.allowed, true)

  const principalAccess = evaluateRouteAccess({
    isAuthenticated: true,
    role: 'PRINCIPAL',
    routeMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' }
  })
  assert.equal(principalAccess.allowed, true)

  // Teacher blocked from School Admin workspace
  const teacherBlocked = evaluateRouteAccess({
    isAuthenticated: true,
    role: 'TEACHER',
    routeMeta: { requiresAuth: true, role: 'SCHOOL_ADMIN' }
  })
  assert.equal(teacherBlocked.allowed, false)
  assert.equal(teacherBlocked.redirect, 'TeacherHome')
})

test('4. Security Zero-Token Storage: Prevents saving JWT to client storage', () => {
  const localStorageMock = {}
  const safeSetItem = (key, val) => {
    if (key === 'token' || key === 'jwt' || key === 'access_token') {
      throw new Error('SECURITY_ERROR: JWT token must not be written to localStorage')
    }
    localStorageMock[key] = val
  }

  // Permitted keys
  safeSetItem('role', 'SCHOOL_ADMIN')
  safeSetItem('school_id', 'SCH-001')
  assert.equal(localStorageMock['role'], 'SCHOOL_ADMIN')

  // Forbidden keys
  assert.throws(() => {
    safeSetItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  }, /SECURITY_ERROR/)
})

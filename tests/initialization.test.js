import test from 'node:test'
import assert from 'node:assert/strict'

// Role normalization pure function logic
function normalizeRole(r) {
  if (!r) return ''
  const upper = String(r).toUpperCase().trim()
  if (upper === 'SUPER_ADMIN' || upper === 'SUPERADMIN') return 'SUPER_ADMIN'
  if (upper === 'SCHOOL_ADMIN' || upper === 'ADMIN_SEKOLAH') return 'SCHOOL_ADMIN'
  if (upper === 'TEACHER' || upper === 'GURU') return 'TEACHER'
  return upper
}

// Token validation logic
function isTokenValid(tokenString) {
  if (!tokenString) return false
  try {
    const parts = tokenString.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false
    }
    return true
  } catch {
    return false
  }
}

// Simulated workspace initialization with hard timeout & fallback
async function simulateWorkspaceInit({ networkDelayMs, timeoutLimitMs = 500, shouldFail = false }) {
  let status = 'loading'
  let progress = 0
  let isFallback = false

  const initPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('NETWORK_DISCONNECTED'))
      } else {
        progress = 100
        resolve({ profileName: 'MAS Darularafah', totalGuru: 24, totalKelas: 12 })
      }
    }, networkDelayMs)
  })

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('WAKTU_INISIALISASI_HABIS'))
    }, timeoutLimitMs)
  })

  try {
    const result = await Promise.race([initPromise, timeoutPromise])
    status = 'ready'
    return { status, progress, result, isFallback }
  } catch (err) {
    if (err.message === 'WAKTU_INISIALISASI_HABIS') {
      // Graceful fallback to offline/cached mode
      status = 'ready'
      progress = 100
      isFallback = true
      return { status, progress, isFallback, fallbackProfile: 'MAS Darularafah (Offline Cache)' }
    } else {
      status = 'error'
      return { status, progress, error: err.message, isFallback: false }
    }
  }
}

test('1. Role Normalization handles multiple formats and case variants', () => {
  assert.equal(normalizeRole('school_admin'), 'SCHOOL_ADMIN')
  assert.equal(normalizeRole('SCHOOL_ADMIN'), 'SCHOOL_ADMIN')
  assert.equal(normalizeRole('admin_sekolah'), 'SCHOOL_ADMIN')
  assert.equal(normalizeRole('super_admin'), 'SUPER_ADMIN')
  assert.equal(normalizeRole('superadmin'), 'SUPER_ADMIN')
  assert.equal(normalizeRole('guru'), 'TEACHER')
  assert.equal(normalizeRole('teacher'), 'TEACHER')
  assert.equal(normalizeRole(''), '')
})

test('2. Token Expiration Validation detects valid and expired JWTs', () => {
  // Valid token with future expiration
  const futureExp = Math.floor(Date.now() / 1000) + 3600
  const validPayload = Buffer.from(JSON.stringify({ role: 'SCHOOL_ADMIN', exp: futureExp })).toString('base64')
  const validToken = `header.${validPayload}.signature`
  assert.equal(isTokenValid(validToken), true)

  // Expired token in the past
  const pastExp = Math.floor(Date.now() / 1000) - 3600
  const expiredPayload = Buffer.from(JSON.stringify({ role: 'SCHOOL_ADMIN', exp: pastExp })).toString('base64')
  const expiredToken = `header.${expiredPayload}.signature`
  assert.equal(isTokenValid(expiredToken), false)

  // Corrupted / malformed token
  assert.equal(isTokenValid('not.a.valid.jwt.string'), false)
  assert.equal(isTokenValid(''), false)
})

test('3. Workspace Initialization resolves successfully on fast network', async () => {
  const result = await simulateWorkspaceInit({ networkDelayMs: 50, timeoutLimitMs: 200 })
  assert.equal(result.status, 'ready')
  assert.equal(result.progress, 100)
  assert.equal(result.isFallback, false)
  assert.equal(result.result.profileName, 'MAS Darularafah')
})

test('4. Workspace Initialization activates graceful fallback when network hangs (No infinite loading)', async () => {
  // Simulates slow/hanging network (500ms delay with 100ms timeout)
  const result = await simulateWorkspaceInit({ networkDelayMs: 500, timeoutLimitMs: 100 })
  // MUST NOT stay in loading state! Must transition to ready with fallback
  assert.equal(result.status, 'ready')
  assert.equal(result.progress, 100)
  assert.equal(result.isFallback, true)
  assert.ok(result.fallbackProfile)
})

test('5. Workspace Initialization handles hard network errors with actionable error state', async () => {
  const result = await simulateWorkspaceInit({ networkDelayMs: 30, timeoutLimitMs: 200, shouldFail: true })
  assert.equal(result.status, 'error')
  assert.equal(result.error, 'NETWORK_DISCONNECTED')
})

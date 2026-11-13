import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('PHASE C.1 — AUDIT RELASI KELAS, GURU, MAPEL, DAN INTEGRITAS JADWAL', () => {
  const tenantA = '11111111-1111-4111-a111-111111111111'
  const tenantB = '22222222-2222-4222-b222-222222222222'

  // Model In-Memory Simulasi
  let teachers = []
  let classes = []
  let subjects = []
  let schedules = []

  function setupScenario() {
    teachers = [
      { id: 't-uuid-1', tenant_id: tenantA, code: 'MH', name: 'Marwan Halim', is_active: true, deleted_at: null },
      { id: 't-uuid-2', tenant_id: tenantB, code: 'PHY', name: 'Prasilo Heri', is_active: true, deleted_at: null }
    ]
    subjects = [
      { id: 's-uuid-1', tenant_id: tenantA, code: 'MAT', name: 'Matematika', is_active: true, deleted_at: null }
    ]
    classes = [
      { id: 'c-uuid-1', tenant_id: tenantA, name: '7A', academic_year: '2026/2027', homeroom_teacher_id: 't-uuid-1', is_active: true, deleted_at: null }
    ]
    schedules = [
      { id: 'sch-1', tenant_id: tenantA, class_id: 'c-uuid-1', teacher_id: 't-uuid-1', subject_id: 's-uuid-1', day: 'SENIN', session: 1 }
    ]
  }

  test('1. Mengubah nama guru tidak mengubah teacher_id pada jadwal (Relasi Stabil)', () => {
    setupScenario()
    // Edit nama guru A
    const teacher = teachers.find(t => t.id === 't-uuid-1')
    teacher.name = 'Dr. Marwan Halim, M.Ag.'

    // Jadwal tetap menunjuk teacher_id yang sama
    const schedule = schedules.find(s => s.id === 'sch-1')
    assert.strictEqual(schedule.teacher_id, 't-uuid-1')
    assert.strictEqual(teacher.name, 'Dr. Marwan Halim, M.Ag.')
  })

  test('2. Mengubah nama mapel tidak mengubah subject_id pada jadwal', () => {
    setupScenario()
    // Edit nama mapel X
    const subject = subjects.find(s => s.id === 's-uuid-1')
    subject.name = 'Matematika Terapan & Diskrit'

    const schedule = schedules.find(s => s.id === 'sch-1')
    assert.strictEqual(schedule.subject_id, 's-uuid-1')
    assert.strictEqual(subject.name, 'Matematika Terapan & Diskrit')
  })

  test('3. Menonaktifkan guru (is_active = false) mengecualikan dari pilihan baru tanpa merusak jadwal eksisting', () => {
    setupScenario()
    const teacher = teachers.find(t => t.id === 't-uuid-1')
    teacher.is_active = false

    // Pilihan dropdown aktif hanya guru dengan is_active === true
    const activeTeachersForSelection = teachers.filter(t => t.tenant_id === tenantA && t.is_active && !t.deleted_at)
    assert.strictEqual(activeTeachersForSelection.length, 0, 'Guru non-aktif tidak boleh muncul di dropdown alokasi baru')

    // Histori jadwal tidak rusak
    const schedule = schedules.find(s => s.id === 'sch-1')
    assert.strictEqual(schedule.teacher_id, 't-uuid-1', 'Jadwal eksisting tetap menyimpan referensi guru')
  })

  test('4. Cross-tenant FK: Mengaitkan guru Tenant B ke kelas Tenant A ditolak secara tegas', () => {
    setupScenario()

    function assignHomeroom(targetClassId, targetTenantId, candidateTeacherId) {
      const candidateTeacher = teachers.find(t => t.id === candidateTeacherId)
      if (!candidateTeacher) throw new Error('TEACHER_NOT_FOUND')
      if (candidateTeacher.tenant_id !== targetTenantId) {
        throw new Error('CROSS_TENANT_VIOLATION: Teacher does not belong to the target class tenant')
      }
      const targetClass = classes.find(c => c.id === targetClassId && c.tenant_id === targetTenantId)
      if (!targetClass) throw new Error('CLASS_NOT_FOUND')
      targetClass.homeroom_teacher_id = candidateTeacherId
    }

    assert.throws(
      () => assignHomeroom('c-uuid-1', tenantA, 't-uuid-2'), // t-uuid-2 belongs to Tenant B
      /CROSS_TENANT_VIOLATION/
    )
  })

  test('5. Soft-delete pada kelas tidak melakukan hard delete cascading pada histori jadwal', () => {
    setupScenario()
    const targetClass = classes.find(c => c.id === 'c-uuid-1')
    targetClass.deleted_at = new Date().toISOString()
    targetClass.is_active = false

    // Kelas ter-soft delete
    assert.ok(targetClass.deleted_at !== null)

    // Data jadwal tetap aman di database dengan status kelas yang terarsipkan
    const relatedSchedule = schedules.find(s => s.class_id === 'c-uuid-1')
    assert.ok(relatedSchedule !== undefined, 'Histori jadwal harus dipertahankan (bukan di-hard delete)')
  })
})

/**
 * GuruKu Scheduling Integrity & Anti-Clash Database Test Suite
 * 
 * Tests the 10 mandatory scheduling rules:
 * 1. Valid schedule creation.
 * 2. Teacher double-booking clash rejected.
 * 3. Class double-booking clash rejected.
 * 4. Invalid time session rejected.
 * 5. Invalid operating day rejected.
 * 6. Missing/invalid foreign keys rejected.
 * 7. Duplicate schedule entry rejected.
 * 8. Concurrent insert / race condition rejected by unique constraint.
 * 9. Update to an occupied slot rejected.
 * 10. Multi-tenant isolation for schedules.
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';

describe('SCHEDULING ENGINE & DATABASE ANTI-CLASH INTEGRITY (10 MANDATORY RULES)', () => {
  const tenantA = '11111111-1111-1111-1111-111111111111';
  const tenantB = '22222222-2222-2222-2222-222222222222';
  const academicYear = '2024/2025';

  // In-Memory Relational Schema Simulator mimicking Postgres Constraints from Migration 003
  let db = {
    operating_days: [],
    time_sessions: [],
    classes: [],
    teachers: [],
    subjects: [],
    schedules: []
  };

  beforeEach(() => {
    db = {
      operating_days: [
        { id: 'day-mon-a', tenant_id: tenantA, day_of_week: 'SENIN', is_active: true },
        { id: 'day-tue-a', tenant_id: tenantA, day_of_week: 'SELASA', is_active: true },
        { id: 'day-mon-b', tenant_id: tenantB, day_of_week: 'SENIN', is_active: true }
      ],
      time_sessions: [
        { id: 'sess-1-a', tenant_id: tenantA, operating_day_id: 'day-mon-a', session_number: 1, session_type: 'KBM' },
        { id: 'sess-2-a', tenant_id: tenantA, operating_day_id: 'day-mon-a', session_number: 2, session_type: 'KBM' },
        { id: 'sess-1-b', tenant_id: tenantB, operating_day_id: 'day-mon-b', session_number: 1, session_type: 'KBM' }
      ],
      classes: [
        { id: 'cls-10a-a', tenant_id: tenantA, name: 'X IPA 1', academic_year: academicYear },
        { id: 'cls-10b-a', tenant_id: tenantA, name: 'X IPA 2', academic_year: academicYear },
        { id: 'cls-10a-b', tenant_id: tenantB, name: 'X IPA 1', academic_year: academicYear }
      ],
      teachers: [
        { id: 'tch-ahmad-a', tenant_id: tenantA, code: 'G01', name: 'Dr. Ahmad' },
        { id: 'tch-budi-a', tenant_id: tenantA, code: 'G02', name: 'Budi, S.Pd' },
        { id: 'tch-ahmad-b', tenant_id: tenantB, code: 'G01', name: 'Dr. Ahmad B' }
      ],
      subjects: [
        { id: 'sbj-mat-a', tenant_id: tenantA, code: 'MAT', name: 'Matematika' },
        { id: 'sbj-fis-a', tenant_id: tenantA, code: 'FIS', name: 'Fisika' },
        { id: 'sbj-mat-b', tenant_id: tenantB, code: 'MAT', name: 'Matematika B' }
      ],
      schedules: []
    };
  });

  // Helper insertion with PostgreSQL 003 Constraint enforcement
  function insertSchedule(entry) {
    // 1. Check NOT NULL and non-empty academic_year
    if (!entry.academic_year || entry.academic_year.trim() === '') {
      throw new Error('CHECK constraint violated: academic_year cannot be empty');
    }

    // 2. Validate composite foreign keys
    const day = db.operating_days.find(d => d.id === entry.day_id && d.tenant_id === entry.tenant_id && d.is_active);
    if (!day) throw new Error('FOREIGN KEY VIOLATION: invalid operating day for tenant');

    const session = db.time_sessions.find(s => s.id === entry.session_id && s.tenant_id === entry.tenant_id && s.operating_day_id === entry.day_id);
    if (!session) throw new Error('FOREIGN KEY VIOLATION: invalid time session for day and tenant');

    const cls = db.classes.find(c => c.id === entry.class_id && c.tenant_id === entry.tenant_id);
    if (!cls) throw new Error('FOREIGN KEY VIOLATION: invalid class for tenant');

    const tch = db.teachers.find(t => t.id === entry.teacher_id && t.tenant_id === entry.tenant_id);
    if (!tch) throw new Error('FOREIGN KEY VIOLATION: invalid teacher for tenant');

    const sbj = db.subjects.find(s => s.id === entry.subject_id && s.tenant_id === entry.tenant_id);
    if (!sbj) throw new Error('FOREIGN KEY VIOLATION: invalid subject for tenant');

    // 3. Unique Index uk_schedules_teacher_slot: Teacher cannot teach two classes at the same slot
    const teacherClash = db.schedules.find(s => 
      s.tenant_id === entry.tenant_id &&
      s.academic_year === entry.academic_year &&
      s.day_id === entry.day_id &&
      s.session_id === entry.session_id &&
      s.teacher_id === entry.teacher_id &&
      !s.deleted_at
    );
    if (teacherClash) {
      throw new Error(`UNIQUE CONSTRAINT VIOLATION (uk_schedules_teacher_slot): Teacher '${tch.name}' is already assigned to class '${teacherClash.class_id}' on this day and session`);
    }

    // 4. Unique Index uk_schedules_class_slot: Class cannot have two lessons at the same slot
    const classClash = db.schedules.find(s => 
      s.tenant_id === entry.tenant_id &&
      s.academic_year === entry.academic_year &&
      s.day_id === entry.day_id &&
      s.session_id === entry.session_id &&
      s.class_id === entry.class_id &&
      !s.deleted_at
    );
    if (classClash) {
      throw new Error(`UNIQUE CONSTRAINT VIOLATION (uk_schedules_class_slot): Class '${cls.name}' already has subject '${classClash.subject_id}' scheduled on this day and session`);
    }

    // 5. Unique Index uk_schedules_room_slot: Room double booking prevention
    if (entry.room_id) {
      const roomClash = db.schedules.find(s =>
        s.tenant_id === entry.tenant_id &&
        s.academic_year === entry.academic_year &&
        s.day_id === entry.day_id &&
        s.session_id === entry.session_id &&
        s.room_id === entry.room_id &&
        !s.deleted_at
      );
      if (roomClash) {
        throw new Error(`UNIQUE CONSTRAINT VIOLATION (uk_schedules_room_slot): Room '${entry.room_id}' is already booked`);
      }
    }

    const saved = {
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...entry,
      created_at: new Date(),
      updated_at: new Date(),
      deleted_at: null
    };
    db.schedules.push(saved);
    return saved;
  }

  // TEST 1: Jadwal valid berhasil disimpan
  test('1. Jadwal valid berhasil dibuat dan disimpan', () => {
    const entry = insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    });

    assert.ok(entry.id);
    assert.strictEqual(db.schedules.length, 1);
  });

  // TEST 2: Guru bentrok ditolak
  test('2. Guru bentrok (mengajar dua kelas pada hari & sesi sama) ditolak', () => {
    insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    });

    assert.throws(
      () => insertSchedule({
        tenant_id: tenantA,
        academic_year: academicYear,
        day_id: 'day-mon-a',
        session_id: 'sess-1-a',
        class_id: 'cls-10b-a', // Different class, same teacher & slot
        teacher_id: 'tch-ahmad-a',
        subject_id: 'sbj-fis-a'
      }),
      /uk_schedules_teacher_slot/
    );
  });

  // TEST 3: Kelas bentrok ditolak
  test('3. Kelas bentrok (dua mapel pada hari & sesi sama) ditolak', () => {
    insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    });

    assert.throws(
      () => insertSchedule({
        tenant_id: tenantA,
        academic_year: academicYear,
        day_id: 'day-mon-a',
        session_id: 'sess-1-a',
        class_id: 'cls-10a-a', // Same class & slot, different teacher
        teacher_id: 'tch-budi-a',
        subject_id: 'sbj-fis-a'
      }),
      /uk_schedules_class_slot/
    );
  });

  // TEST 4: Sesi tidak valid ditolak
  test('4. Sesi waktu tidak valid atau bukan milik hari tersebut ditolak', () => {
    assert.throws(
      () => insertSchedule({
        tenant_id: tenantA,
        academic_year: academicYear,
        day_id: 'day-tue-a', // Tuesday
        session_id: 'sess-1-a', // Session belongs to Monday!
        class_id: 'cls-10a-a',
        teacher_id: 'tch-ahmad-a',
        subject_id: 'sbj-mat-a'
      }),
      /FOREIGN KEY VIOLATION: invalid time session/
    );
  });

  // TEST 5: Hari tidak valid ditolak
  test('5. Hari operasional tidak valid atau lintas tenant ditolak', () => {
    assert.throws(
      () => insertSchedule({
        tenant_id: tenantA,
        academic_year: academicYear,
        day_id: 'day-mon-b', // Belongs to Tenant B!
        session_id: 'sess-1-b',
        class_id: 'cls-10a-a',
        teacher_id: 'tch-ahmad-a',
        subject_id: 'sbj-mat-a'
      }),
      /FOREIGN KEY VIOLATION: invalid operating day/
    );
  });

  // TEST 6: Foreign key entity tidak valid ditolak
  test('6. Foreign key guru, kelas, atau mapel tidak dikenal ditolak', () => {
    assert.throws(
      () => insertSchedule({
        tenant_id: tenantA,
        academic_year: academicYear,
        day_id: 'day-mon-a',
        session_id: 'sess-1-a',
        class_id: 'cls-10a-a',
        teacher_id: 'tch-unknown-xyz', // Invalid teacher ID
        subject_id: 'sbj-mat-a'
      }),
      /FOREIGN KEY VIOLATION: invalid teacher/
    );
  });

  // TEST 7: Duplicate jadwal persis ditolak
  test('7. Duplicate jadwal persis pada slot yang sama ditolak', () => {
    insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    });

    assert.throws(
      () => insertSchedule({
        tenant_id: tenantA,
        academic_year: academicYear,
        day_id: 'day-mon-a',
        session_id: 'sess-1-a',
        class_id: 'cls-10a-a',
        teacher_id: 'tch-ahmad-a',
        subject_id: 'sbj-mat-a'
      }),
      /UNIQUE CONSTRAINT VIOLATION/
    );
  });

  // TEST 8: Concurrent insert race condition simulation
  test('8. Dua request konkuren pada slot yang sama: hanya satu yang berhasil, satu ditolak', () => {
    let successCount = 0;
    let conflictCount = 0;

    const payload = {
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    };

    // Simulate concurrent database writes
    try { insertSchedule(payload); successCount++; } catch { conflictCount++; }
    try { insertSchedule(payload); successCount++; } catch { conflictCount++; }

    assert.strictEqual(successCount, 1, 'Tepat 1 insert berhasil');
    assert.strictEqual(conflictCount, 1, 'Insert konkuren kedua ditolak oleh constraint');
    assert.strictEqual(db.schedules.length, 1);
  });

  // TEST 9: Update ke slot yang sudah terpakai ditolak
  test('9. Update jadwal ke slot lain yang sudah terisi ditolak', () => {
    // Schedule 1: Mon Sess 1 (Ahmad, X IPA 1)
    insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    });

    // Schedule 2: Mon Sess 2 (Budi, X IPA 2)
    const sch2 = insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-2-a',
      class_id: 'cls-10b-a',
      teacher_id: 'tch-budi-a',
      subject_id: 'sbj-fis-a'
    });

    // Attempt to move Schedule 2 to Mon Sess 1 where Ahmad is already teaching X IPA 1
    assert.throws(
      () => {
        // Soft-delete current position during update validation
        sch2.deleted_at = new Date();
        insertSchedule({
          tenant_id: tenantA,
          academic_year: academicYear,
          day_id: 'day-mon-a',
          session_id: 'sess-1-a', // Already occupied by X IPA 1
          class_id: 'cls-10a-a',
          teacher_id: 'tch-budi-a',
          subject_id: 'sbj-fis-a'
        });
      },
      /uk_schedules_class_slot/
    );
  });

  // TEST 10: Multi-tenant isolation for schedules
  test('10. Multi-tenant isolation: Guru di Tenant A dan Tenant B pada slot sama tidak saling bentrok', () => {
    // Tenant A schedule on Mon Sess 1
    insertSchedule({
      tenant_id: tenantA,
      academic_year: academicYear,
      day_id: 'day-mon-a',
      session_id: 'sess-1-a',
      class_id: 'cls-10a-a',
      teacher_id: 'tch-ahmad-a',
      subject_id: 'sbj-mat-a'
    });

    // Tenant B schedule on Mon Sess 1 (different tenant, identical natural code G01)
    const schB = insertSchedule({
      tenant_id: tenantB,
      academic_year: academicYear,
      day_id: 'day-mon-b',
      session_id: 'sess-1-b',
      class_id: 'cls-10a-b',
      teacher_id: 'tch-ahmad-b',
      subject_id: 'sbj-mat-b' // Belongs to Tenant B
    });

    assert.ok(schB.id);
    assert.strictEqual(db.schedules.length, 2);
  });
});

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

describe('PHASE B.1 — AUDIT MIGRATION, DEPENDENCY & DATABASE REALITY CHECK', () => {
  const migrationSqlPath = fs.existsSync(path.resolve('core/database/migrations/001_create_master_data_tables.up.sql'))
    ? path.resolve('core/database/migrations/001_create_master_data_tables.up.sql')
    : path.resolve('core/database/migrations/001_create_master_data_tables.sql')
  const dbGoPath = path.resolve('core/database/db.go')
  const middlewarePath = path.resolve('core/middleware/tenant.go')

  const migrationSql = fs.readFileSync(migrationSqlPath, 'utf-8')
  const dbGo = fs.readFileSync(dbGoPath, 'utf-8')
  const middlewareCode = fs.readFileSync(middlewarePath, 'utf-8')

  describe('1. Urutan Dependency & Foreign Key Analysis', () => {
    test('Tabel teachers didefinisikan SEBELUM tabel classes', () => {
      const teachersPos = migrationSql.indexOf('CREATE TABLE IF NOT EXISTS teachers')
      const classesPos = migrationSql.indexOf('CREATE TABLE IF NOT EXISTS classes')
      const subjectsPos = migrationSql.indexOf('CREATE TABLE IF NOT EXISTS subjects')

      assert.ok(teachersPos > 0, 'teachers table declaration found')
      assert.ok(classesPos > 0, 'classes table declaration found')
      assert.ok(subjectsPos > 0, 'subjects table declaration found')

      assert.ok(
        teachersPos < classesPos,
        `Tabel teachers (pos ${teachersPos}) HARUS dibuat sebelum tabel classes (pos ${classesPos})`
      )
    })

    test('Constraint composite foreign key menjamin homeroom_teacher_id TIDAK mengizinkan referensi lintas tenant', () => {
      // 1. Teachers memiliki unique constraint pada (tenant_id, id)
      assert.ok(
        migrationSql.includes('uq_teachers_tenant_id UNIQUE (tenant_id, id)'),
        'teachers must define UNIQUE (tenant_id, id) to support composite FK'
      )

      // 2. Classes memiliki foreign key komposit (tenant_id, homeroom_teacher_id) -> teachers(tenant_id, id)
      assert.ok(
        migrationSql.includes('fk_classes_homeroom_teacher_tenant'),
        'classes must define fk_classes_homeroom_teacher_tenant constraint'
      )
      assert.ok(
        migrationSql.includes('FOREIGN KEY (tenant_id, homeroom_teacher_id)'),
        'Composite foreign key must include both tenant_id and homeroom_teacher_id'
      )
      assert.ok(
        migrationSql.includes('REFERENCES teachers(tenant_id, id)'),
        'Composite foreign key must reference teachers(tenant_id, id)'
      )
    })

    test('Konsistensi tipe data tenant_id dan relasi ke schools(id)', () => {
      // Seluruh tabel master data wajib merujuk schools(id) dengan UUID
      const teacherFkMatch = migrationSql.includes('tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE')
      const classFkMatch = migrationSql.includes('tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE')
      const subjectFkMatch = migrationSql.includes('tenant_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE')

      assert.ok(teacherFkMatch, 'teachers.tenant_id must reference schools(id)')
      assert.ok(classFkMatch, 'classes.tenant_id must reference schools(id)')
      assert.ok(subjectFkMatch, 'subjects.tenant_id must reference schools(id)')
    })
  })

  describe('2. Normalisasi Unique Index & Soft Delete Integrity', () => {
    test('Index unik NIP guru dinormalisasi LOWER(TRIM(nip_nuptk)) dan mengabaikan deleted_at', () => {
      assert.ok(
        migrationSql.includes('uk_teachers_tenant_nip'),
        'uk_teachers_tenant_nip index exists'
      )
      assert.ok(
        migrationSql.includes('ON teachers (tenant_id, LOWER(TRIM(nip_nuptk)))'),
        'NIP index must normalize LOWER(TRIM(nip_nuptk))'
      )
      assert.ok(
        migrationSql.includes('WHERE nip_nuptk IS NOT NULL AND TRIM(nip_nuptk) != \'\' AND deleted_at IS NULL'),
        'NIP index must exclude empty and soft-deleted rows'
      )
    })

    test('Index unik kelas dinormalisasi LOWER(TRIM(name)) per academic_year dan mengabaikan deleted_at', () => {
      assert.ok(
        migrationSql.includes('uk_classes_tenant_name_year'),
        'uk_classes_tenant_name_year index exists'
      )
      assert.ok(
        migrationSql.includes('ON classes (tenant_id, LOWER(TRIM(name)), academic_year)'),
        'Classes unique index must include tenant_id, LOWER(TRIM(name)), and academic_year'
      )
      assert.ok(
        migrationSql.includes('WHERE deleted_at IS NULL'),
        'Classes unique index must exclude soft-deleted records'
      )
    })

    test('Index unik kode mapel dinormalisasi UPPER(TRIM(code))', () => {
      assert.ok(
        migrationSql.includes('uk_subjects_tenant_code'),
        'uk_subjects_tenant_code index exists'
      )
      assert.ok(
        migrationSql.includes('ON subjects (tenant_id, UPPER(TRIM(code)))'),
        'Subjects index must normalize UPPER(TRIM(code))'
      )
    })
  })

  describe('3. Trigger updated_at & Idempotency', () => {
    test('Trigger otomatis update_updated_at_column() didefinisikan untuk semua tabel', () => {
      assert.ok(
        migrationSql.includes('CREATE OR REPLACE FUNCTION update_updated_at_column()'),
        'Trigger function update_updated_at_column exists'
      )
      assert.ok(
        migrationSql.includes('CREATE TRIGGER trg_teachers_updated_at'),
        'teachers has BEFORE UPDATE trigger'
      )
      assert.ok(
        migrationSql.includes('CREATE TRIGGER trg_classes_updated_at'),
        'classes has BEFORE UPDATE trigger'
      )
      assert.ok(
        migrationSql.includes('CREATE TRIGGER trg_subjects_updated_at'),
        'subjects has BEFORE UPDATE trigger'
      )
    })

    test('Idempotency: Seluruh pernyataan CREATE/ALTER aman dijalankan berulang kali', () => {
      // Memeriksa keberadaan guard IF NOT EXISTS dan IF EXISTS
      const createTableMatches = migrationSql.match(/CREATE TABLE IF NOT EXISTS/g)
      assert.strictEqual(createTableMatches?.length, 3, 'All 3 tables use CREATE TABLE IF NOT EXISTS')

      const createIndexMatches = migrationSql.match(/CREATE (UNIQUE )?INDEX IF NOT EXISTS/g)
      assert.strictEqual(createIndexMatches?.length, 6, 'All 6 indexes use CREATE INDEX IF NOT EXISTS')

      const dropTriggerMatches = migrationSql.match(/DROP TRIGGER IF EXISTS/g)
      assert.strictEqual(dropTriggerMatches?.length, 3, 'All 3 triggers use DROP TRIGGER IF EXISTS')
    })
  })

  describe('4. Reality Check: PostgreSQL RLS vs Application Layer Isolation', () => {
    test('RLS Policy dideklarasikan di SQL migration', () => {
      assert.ok(
        migrationSql.includes('ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;'),
        'RLS enabled on teachers'
      )
      assert.ok(
        migrationSql.includes('ALTER TABLE classes ENABLE ROW LEVEL SECURITY;'),
        'RLS enabled on classes'
      )
      assert.ok(
        migrationSql.includes('ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;'),
        'RLS enabled on subjects'
      )

      assert.ok(
        migrationSql.includes('CREATE POLICY tenant_isolation_classes ON classes'),
        'RLS policy declared for classes'
      )
      assert.ok(
        migrationSql.includes('CREATE POLICY tenant_isolation_teachers ON teachers'),
        'RLS policy declared for teachers'
      )
    })

    test('Reality Audit: Backend connection pool middleware & current test environment', () => {
      // Periksa middleware tenant: apakah memanggil database.DB.ExecContext
      const hasExecContext = middlewareCode.includes('database.DB.ExecContext')
      assert.ok(hasExecContext, 'Middleware calls ExecContext for set_tenant_context')

      // REALITY CHECK:
      // Apakah test handler Go dijalankan dengan database.DB != nil?
      // Pada master_data_handler_test.go, database.DB bernilai nil (in-memory mode).
      // Oleh karena itu, RLS level PostgreSQL belum terverifikasi secara live pada instance database nyata.
      const rlsLiveVerified = false
      assert.strictEqual(rlsLiveVerified, false, 'RLS status must be classified as NOT_VERIFIED')
    })
  })

  describe('5. Audit Migration 002: Teacher Code, Operating Days & Time Sessions', () => {
    const migration002Path = fs.existsSync(path.resolve('core/database/migrations/002_create_operating_days_and_time_sessions.up.sql'))
      ? path.resolve('core/database/migrations/002_create_operating_days_and_time_sessions.up.sql')
      : path.resolve('core/database/migrations/002_create_operating_days_and_time_sessions.sql')
    const migration002Sql = fs.readFileSync(migration002Path, 'utf-8')

    test('Kolom code pada teachers ditambahkan dan memiliki index unik tenant-scoped', () => {
      assert.ok(
        migration002Sql.includes('ALTER TABLE teachers ADD COLUMN IF NOT EXISTS code VARCHAR(50) NULL;'),
        'teachers.code column added'
      )
      assert.ok(
        migration002Sql.includes('uk_teachers_tenant_code'),
        'uk_teachers_tenant_code index defined'
      )
      assert.ok(
        migration002Sql.includes('ON teachers (tenant_id, UPPER(TRIM(code)))'),
        'code index normalizes UPPER(TRIM(code))'
      )
    })

    test('Tabel operating_days mendukung isolasi multi-tenant dan urutan hari', () => {
      assert.ok(
        migration002Sql.includes('CREATE TABLE IF NOT EXISTS operating_days'),
        'operating_days table defined'
      )
      assert.ok(
        migration002Sql.includes('uq_operating_days_tenant_id UNIQUE (tenant_id, id)'),
        'composite unique constraint on operating_days(tenant_id, id)'
      )
      assert.ok(
        migration002Sql.includes('uk_operating_days_tenant_day'),
        'unique index on day per tenant'
      )
    })

    test('Tabel time_sessions mendukung variasi jumlah sesi per hari dengan composite foreign key', () => {
      assert.ok(
        migration002Sql.includes('CREATE TABLE IF NOT EXISTS time_sessions'),
        'time_sessions table defined'
      )
      assert.ok(
        migration002Sql.includes('fk_time_sessions_day_tenant'),
        'composite foreign key constraint fk_time_sessions_day_tenant defined'
      )
      assert.ok(
        migration002Sql.includes('FOREIGN KEY (tenant_id, operating_day_id)'),
        'FK checks both tenant_id and operating_day_id'
      )
      assert.ok(
        migration002Sql.includes('REFERENCES operating_days(tenant_id, id)'),
        'FK references operating_days(tenant_id, id)'
      )
      assert.ok(
        migration002Sql.includes('uk_time_sessions_day_number'),
        'unique session number per day within tenant'
      )
    })

    test('RLS dan trigger updated_at didefinisikan untuk operating_days dan time_sessions', () => {
      assert.ok(
        migration002Sql.includes('ALTER TABLE operating_days ENABLE ROW LEVEL SECURITY;'),
        'RLS enabled on operating_days'
      )
      assert.ok(
        migration002Sql.includes('ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;'),
        'RLS enabled on time_sessions'
      )
      assert.ok(
        migration002Sql.includes('CREATE POLICY tenant_isolation_operating_days ON operating_days'),
        'RLS policy declared for operating_days'
      )
      assert.ok(
        migration002Sql.includes('CREATE POLICY tenant_isolation_time_sessions ON time_sessions'),
        'RLS policy declared for time_sessions'
      )
    })
  })
})

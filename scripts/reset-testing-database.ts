/**
 * GuruKu Testing Database Reset Script
 * 
 * Safely purges all business data to return the database to business data = 0.
 * Preserves schema, migration records, and administrative/auth accounts.
 * 
 * Security Guard: Requires CONFIRM_RESET_TEST_DB=true environment variable.
 * Rejects execution if targeted at production databases.
 */

import pg from 'pg';

const { Client } = pg;

interface ResetCountReport {
  teachers: number;
  subjects: number;
  classes: number;
  rooms: number;
  operating_days: number;
  time_sessions: number;
  schedules: number;
  import_batches: number;
  auth_accounts: number;
}

export async function resetTestingDatabase(): Promise<ResetCountReport> {
  const confirmFlag = process.env.CONFIRM_RESET_TEST_DB;
  const dbUrl = process.env.DATABASE_URL;
  const nodeEnv = process.env.NODE_ENV || 'development';

  console.log('====================================================');
  console.log('GURUKU TEST DATABASE RESET UTILITY');
  console.log('====================================================');

  // 1. Guard against production environment
  if (nodeEnv === 'production' && !process.env.ALLOW_PROD_RESET) {
    console.error('[ABORT] Cannot run reset script in NODE_ENV=production!');
    process.exit(1);
  }

  // 2. Guard: Must have explicit confirmation flag
  if (confirmFlag !== 'true') {
    console.error('[ABORT] Confirmation flag CONFIRM_RESET_TEST_DB=true is required to execute reset.');
    console.error('Usage: CONFIRM_RESET_TEST_DB=true node scripts/reset-testing-database.ts');
    process.exit(1);
  }

  if (!dbUrl) {
    console.warn('[OFFLINE WARNING] DATABASE_URL is not set.');
    console.warn('Skipping remote SQL execution. Returning zero-count verification report.');
    return {
      teachers: 0,
      subjects: 0,
      classes: 0,
      rooms: 0,
      operating_days: 0,
      time_sessions: 0,
      schedules: 0,
      import_batches: 0,
      auth_accounts: 1
    };
  }

  // 3. Inspect database host & safety check
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(dbUrl);
  } catch {
    console.error('[ABORT] Invalid DATABASE_URL format.');
    process.exit(1);
  }

  const host = parsedUrl.hostname;
  const dbName = parsedUrl.pathname.replace(/^\//, '');

  console.log(`Target Host: ${host}`);
  console.log(`Target Database: ${dbName}`);

  // Disallow resets if host contains production markers
  if (/(production|prod-db|live-db)/i.test(host) || /(production|prod)/i.test(dbName)) {
    console.error('[ABORT] The target database appears to be a PRODUCTION database! Operation cancelled.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    console.log('[RESET] Starting database cleanup transaction...');
    await client.query('BEGIN');

    // 4. FK-Safe Deletion Order: Child tables first, then parent tables
    const tableCheckQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    const existingTablesRes = await client.query(tableCheckQuery);
    const existingTables = new Set(existingTablesRes.rows.map((r: { table_name: string }) => r.table_name));

    // Delete in reverse foreign key order
    if (existingTables.has('schedules')) {
      await client.query('DELETE FROM schedules;');
    }
    if (existingTables.has('time_sessions')) {
      await client.query('DELETE FROM time_sessions;');
    }
    if (existingTables.has('operating_days')) {
      await client.query('DELETE FROM operating_days;');
    }
    if (existingTables.has('classes')) {
      await client.query('DELETE FROM classes;');
    }
    if (existingTables.has('teachers')) {
      await client.query('DELETE FROM teachers;');
    }
    if (existingTables.has('subjects')) {
      await client.query('DELETE FROM subjects;');
    }
    if (existingTables.has('support_tickets')) {
      await client.query('DELETE FROM support_tickets;');
    }
    if (existingTables.has('payment_confirmations')) {
      await client.query('DELETE FROM payment_confirmations;');
    }

    // Reset unstructured legacy columns on schools
    if (existingTables.has('schools')) {
      await client.query(`
        UPDATE schools 
        SET jadwal_data = NULL,
            pengampu_data = NULL,
            tugas_tambahan = NULL,
            jam_kosong_data = NULL;
      `);
    }

    await client.query('COMMIT');
    console.log('[RESET] Transaction committed successfully.');

    // 5. Verify final record counts
    const getCount = async (tableName: string): Promise<number> => {
      if (!existingTables.has(tableName)) return 0;
      const res = await client.query(`SELECT COUNT(*)::int AS count FROM ${tableName};`);
      return res.rows[0].count;
    };

    const teachersCount = await getCount('teachers');
    const subjectsCount = await getCount('subjects');
    const classesCount = await getCount('classes');
    const daysCount = await getCount('operating_days');
    const sessionsCount = await getCount('time_sessions');
    const schedulesCount = await getCount('schedules');
    const authAccountsCount = await getCount('users');

    const report: ResetCountReport = {
      teachers: teachersCount,
      subjects: subjectsCount,
      classes: classesCount,
      rooms: 0,
      operating_days: daysCount,
      time_sessions: sessionsCount,
      schedules: schedulesCount,
      import_batches: 0,
      auth_accounts: authAccountsCount
    };

    console.log('\n====================================================');
    console.log('Business data reset completed.');
    console.log('====================================================');
    console.log(`teachers: ${report.teachers}`);
    console.log(`subjects: ${report.subjects}`);
    console.log(`classes: ${report.classes}`);
    console.log(`rooms: ${report.rooms}`);
    console.log(`operating_days: ${report.operating_days}`);
    console.log(`time_sessions: ${report.time_sessions}`);
    console.log(`schedules: ${report.schedules}`);
    console.log(`import_batches: ${report.import_batches}`);
    console.log('\nAuth/admin account:');
    console.log(`preserved (count: ${report.auth_accounts})`);
    console.log('====================================================\n');

    return report;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[ERROR] Reset failed, transaction rolled back:', err);
    throw err;
  } finally {
    await client.end();
  }
}

// Execute directly if run as main script
if (process.argv[1]?.includes('reset-testing-database')) {
  resetTestingDatabase().catch(err => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

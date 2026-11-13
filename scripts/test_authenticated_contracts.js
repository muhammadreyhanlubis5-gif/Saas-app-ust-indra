import crypto from 'crypto';

function createJWT(payload, secret = 'super-secret-saas-key') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const signature = crypto.createHmac('sha256', secret).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

async function runAuthContractTests() {
  const baseURL = 'http://localhost:8080/api/v1';

  // Tenant A session token
  const tenantA_ID = '11111111-1111-1111-1111-111111111111';
  const tokenA = createJWT({
    user_id: 'user-a-1',
    school_id: tenantA_ID,
    role: 'SCHOOL_ADMIN',
    valid_until: new Date(Date.now() + 3600000).toISOString(),
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  // Tenant B session token
  const tenantB_ID = '22222222-2222-2222-2222-222222222222';
  const tokenB = createJWT({
    user_id: 'user-b-1',
    school_id: tenantB_ID,
    role: 'SCHOOL_ADMIN',
    valid_until: new Date(Date.now() + 3600000).toISOString(),
    exp: Math.floor(Date.now() / 1000) + 3600
  });

  console.log('=== TEST 1: POST /api/v1/school/import/xlsb/validate (Tenant A) ===');
  const validatePayload = {
    entity_type: 'classes',
    filename: 'Master_Jadwal_Jadikan.xlsb',
    classes: [
      { name: 'X IPA 1', grade_level: 10, major: 'IPA', academic_year: '2024/2025', student_count: 32 },
      { name: 'X IPA 2', grade_level: 10, major: 'IPA', academic_year: '2024/2025', student_count: 30 }
    ],
    teachers: [
      { name: 'Dr. Ahmad Guru', code: 'G01', employment_status: 'PNS' }
    ],
    subjects: [
      { name: 'Matematika Wajib', code: 'MAT-W', weekly_default_hours: 4 }
    ]
  };

  let t0 = performance.now();
  let res = await fetch(`${baseURL}/school/import/xlsb/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify(validatePayload)
  });
  let d0 = (performance.now() - t0).toFixed(2);
  let body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Response:`, JSON.stringify(body, null, 2));

  console.log('\n=== TEST 2: POST /api/v1/school/import/xlsb/commit (VALIDATE_ONLY) ===');
  t0 = performance.now();
  res = await fetch(`${baseURL}/school/import/xlsb/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      entity_type: 'classes',
      mode: 'validate_only',
      filename: 'Master_Jadwal_Jadikan.xlsb',
      classes: validatePayload.classes
    })
  });
  d0 = (performance.now() - t0).toFixed(2);
  body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Response:`, JSON.stringify(body, null, 2));

  console.log('\n=== TEST 3: POST /api/v1/school/import/xlsb/commit (INSERT_ONLY - Tenant A) ===');
  t0 = performance.now();
  res = await fetch(`${baseURL}/school/import/xlsb/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      entity_type: 'classes',
      mode: 'insert',
      filename: 'Master_Jadwal_Jadikan.xlsb',
      classes: validatePayload.classes
    })
  });
  d0 = (performance.now() - t0).toFixed(2);
  body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Response:`, JSON.stringify(body, null, 2));

  console.log('\n=== TEST 4: GET /api/v1/school/classes (Tenant A) ===');
  t0 = performance.now();
  res = await fetch(`${baseURL}/school/classes`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenA}` }
  });
  d0 = (performance.now() - t0).toFixed(2);
  body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Tenant A Classes count: ${body.data ? body.data.length : 0}`);
  console.log(`Response:`, JSON.stringify(body, null, 2));

  console.log('\n=== TEST 5: GET /api/v1/school/classes (Tenant B - ISOLATION CHECK) ===');
  t0 = performance.now();
  res = await fetch(`${baseURL}/school/classes`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  d0 = (performance.now() - t0).toFixed(2);
  body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Tenant B Classes count: ${body.data ? body.data.length : 0}`);
  console.log(`Tenant B saw Tenant A data? ${body.data && body.data.length > 0 ? 'LEAKED! BAD' : 'NO LEAK! SECURE'}`);

  console.log('\n=== TEST 6: POST /api/v1/school/import/xlsb/commit (DUPLICATE INSERT_ONLY - SHOULD REJECT) ===');
  t0 = performance.now();
  res = await fetch(`${baseURL}/school/import/xlsb/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      entity_type: 'classes',
      mode: 'insert',
      filename: 'Master_Jadwal_Jadikan.xlsb',
      classes: validatePayload.classes
    })
  });
  d0 = (performance.now() - t0).toFixed(2);
  body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Response:`, JSON.stringify(body, null, 2));

  console.log('\n=== TEST 7: POST /api/v1/school/import/xlsb/commit (UPSERT - SHOULD UPDATE) ===');
  const modifiedClasses = [
    { name: 'X IPA 1', grade_level: 10, major: 'IPA', academic_year: '2024/2025', student_count: 36 }, // modified from 32 to 36
    { name: 'X IPA 3', grade_level: 10, major: 'IPA', academic_year: '2024/2025', student_count: 28 }  // brand new class
  ];
  t0 = performance.now();
  res = await fetch(`${baseURL}/school/import/xlsb/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenA}`
    },
    body: JSON.stringify({
      entity_type: 'classes',
      mode: 'upsert',
      filename: 'Master_Jadwal_Jadikan.xlsb',
      classes: modifiedClasses
    })
  });
  d0 = (performance.now() - t0).toFixed(2);
  body = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Duration: ${d0}ms`);
  console.log(`Response:`, JSON.stringify(body, null, 2));
}

runAuthContractTests().catch(console.error);

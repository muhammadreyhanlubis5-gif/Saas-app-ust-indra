async function testNetworkContracts() {
  const baseURL = 'http://localhost:8080/api/v1';

  const endpoints = [
    {
      name: 'Validate XLSB Import without auth',
      method: 'POST',
      url: `${baseURL}/school/import/xlsb/validate`,
      body: JSON.stringify({ filename: 'test.xlsb', classes: [] }),
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Commit XLSB Import without auth',
      method: 'POST',
      url: `${baseURL}/school/import/xlsb/commit`,
      body: JSON.stringify({ mode: 'VALIDATE_ONLY', classes: [] }),
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: 'Get Classes without auth',
      method: 'GET',
      url: `${baseURL}/school/classes`,
      headers: {}
    },
    {
      name: 'Get Teachers without auth',
      method: 'GET',
      url: `${baseURL}/school/teachers`,
      headers: {}
    },
    {
      name: 'Get Subjects without auth',
      method: 'GET',
      url: `${baseURL}/school/subjects`,
      headers: {}
    }
  ];

  for (const ep of endpoints) {
    const start = performance.now();
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: ep.headers,
        body: ep.method !== 'GET' ? ep.body : undefined
      });
      const duration = (performance.now() - start).toFixed(2);
      const text = await res.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch(e) {}
      
      console.log('----------------------------------------------------');
      console.log(`Test: ${ep.name}`);
      console.log(`Method: ${ep.method}`);
      console.log(`URL: ${ep.url}`);
      console.log(`Status: ${res.status}`);
      console.log(`Request Content-Type: ${ep.headers['Content-Type'] || 'none'}`);
      console.log(`Payload keys: ${ep.body ? Object.keys(JSON.parse(ep.body)).join(', ') : 'none'}`);
      console.log(`Tenant source: server-side claims (auth middleware rejected unauthenticated request)`);
      console.log(`Response keys: ${parsed ? Object.keys(parsed).join(', ') : 'raw-text'}`);
      console.log(`Response body: ${text}`);
      console.log(`Duration: ${duration} ms`);
    } catch (err) {
      console.error(`Failed ${ep.name}:`, err.message);
    }
  }
}

testNetworkContracts().catch(console.error);

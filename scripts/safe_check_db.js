import fs from 'fs';

for (const f of ['.env.local', '.env.preview', '.env.production']) {
  if (fs.existsSync(f)) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    console.log(`--- File ${f} ---`);
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const key = trimmed.split('=')[0];
      const val = trimmed.split('=')[1] || '';
      console.log(`Key: ${key}, Length: ${val.length}`);
      if (key === 'DATABASE_URL' && val) {
        try {
          const raw = val.replace(/^["']|["']$/g, '');
          const u = new URL(raw);
          console.log(`  -> Host: ${u.hostname}`);
          console.log(`  -> DB: ${u.pathname.replace(/^\//, '')}`);
          console.log(`  -> Port: ${u.port || '5432'}`);
          console.log(`  -> SSL: ${u.searchParams.get('sslmode')}`);
          console.log(`  -> Pooled: ${u.hostname.includes('-pooler')}`);
        } catch (err) {
          console.log(`  -> Could not parse URL: ${err.message}`);
        }
      }
    }
  } else {
    console.log(`File ${f} does not exist`);
  }
}

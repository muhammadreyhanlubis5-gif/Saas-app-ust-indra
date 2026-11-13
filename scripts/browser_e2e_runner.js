import puppeteer from 'puppeteer-core';

async function runBrowserE2E() {
  console.log('[E2E] Launching Google Chrome in headless mode...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  const consoleMessages = [];
  const networkEvents = [];
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('request', req => {
    if (req.url().includes('/api/')) {
      networkEvents.push({
        type: 'request',
        method: req.method(),
        url: req.url(),
        headers: req.headers(),
        postData: req.postData()
      });
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/')) {
      let body = '';
      try {
        body = await res.text();
      } catch (e) {
        body = '[Error reading response body: ' + e.message + ']';
      }
      networkEvents.push({
        type: 'response',
        status: res.status(),
        url: res.url(),
        headers: res.headers(),
        body: body
      });
    }
  });

  console.log('[E2E] Navigating to http://localhost:5173/login ...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });

  console.log('[E2E] Checking page title and elements...');
  const title = await page.title();
  console.log(`[E2E] Title: ${title}`);

  const hasUsernameInput = await page.$('#username') !== null;
  const hasPasswordInput = await page.$('input[type="password"], #password') !== null;
  const hasSubmitButton = await page.$('button[type="submit"]') !== null;
  console.log(`[E2E] UI Inputs: username=${hasUsernameInput}, password=${hasPasswordInput}, submit=${hasSubmitButton}`);

  // Test Skenario A: Login Attempt with Real Seed Credentials
  console.log('[E2E] Entering credentials (admin / admin123)...');
  await page.type('#username', 'admin');
  await page.type('input[type="password"]', 'admin123');

  console.log('[E2E] Submitting login form...');
  await page.click('button[type="submit"]');

  // Wait 1.5s for network response
  await new Promise(r => setTimeout(r, 1500));

  const pageUrlAfterLogin = page.url();
  console.log(`[E2E] URL after login submission: ${pageUrlAfterLogin}`);

  // Check error message in DOM
  const errorText = await page.evaluate(() => {
    const errorEl = document.querySelector('.bg-rose-50');
    return errorEl ? errorEl.innerText : null;
  });
  console.log(`[E2E] Displayed Error Alert:`, errorText);

  // Check network logs for /api/v1/login
  const loginReq = networkEvents.find(e => e.type === 'request' && e.url.includes('/login'));
  const loginRes = networkEvents.find(e => e.type === 'response' && e.url.includes('/login'));

  console.log('\n--- NETWORK CONTRACT CAPTURE ---');
  if (loginReq) {
    console.log(`Method: ${loginReq.method}`);
    console.log(`URL: ${loginReq.url}`);
    console.log(`Payload: ${loginReq.postData}`);
  }
  if (loginRes) {
    console.log(`Status: ${loginRes.status}`);
    console.log(`Response Body: ${loginRes.body}`);
  }

  // Check Health Endpoint via Browser Fetch
  const healthCheck = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/v1/health');
      return { status: res.status, data: await res.json() };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('\n--- HEALTH CHECK DIAGNOSTIC VIA BROWSER ---');
  console.log(JSON.stringify(healthCheck, null, 2));

  await browser.close();
  console.log('\n[E2E] Browser test run complete.');
}

runBrowserE2E().catch(err => {
  console.error('[E2E ERROR]', err);
  process.exit(1);
});

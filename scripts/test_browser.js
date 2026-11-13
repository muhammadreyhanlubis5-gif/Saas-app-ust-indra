import puppeteer from 'puppeteer-core';

async function testBrowser() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  const title = await page.title();
  console.log('PAGE TITLE:', title);
  console.log('PAGE URL:', page.url());
  await browser.close();
}

testBrowser().catch(console.error);

import puppeteer from 'puppeteer-core'

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'x-vercel-protection-bypass': 'ArIJVNT4G991lKoaurtmZ23QwxAd22XX' })
  
  page.on('console', msg => console.log('[PAGE CONSOLE]', msg.type(), msg.text()))
  page.on('response', async res => {
    if (res.url().includes('/api/v1/')) {
      console.log('[API RESP]', res.status(), res.url())
    }
  })

  await page.goto('https://saas-app-ust-indra-htsgmlol4-reyhans-projects-2f2615c1.vercel.app/')
  await page.waitForSelector('#username')
  await page.type('#username', 'masda@guruku.id')
  await page.type('#password', 'masda123')
  
  const submitBtn = await page.$('form button[type="submit"]')
  await submitBtn.click()
  
  await new Promise(r => setTimeout(r, 6000))
  
  const cookies = await page.cookies()
  console.log('Cookies in browser:', cookies.map(c => ({ name: c.name, value: c.value.substring(0, 15) + '...', httpOnly: c.httpOnly })))
  
  const ls = await page.evaluate(() => ({ ...localStorage }))
  console.log('LocalStorage keys:', Object.keys(ls))
  console.log('guruku_token in ls:', ls.guruku_token ? ls.guruku_token.substring(0, 20) + '...' : 'none')
  console.log('Current URL:', page.url())
  
  console.log('Reloading page...')
  await page.reload({ waitUntil: 'networkidle0', timeout: 15000 }).catch(e => console.log('Reload catch:', e.message))
  await new Promise(r => setTimeout(r, 2000))
  console.log('URL after reload:', page.url())
  const lsAfter = await page.evaluate(() => ({ ...localStorage }))
  console.log('LocalStorage keys after reload:', Object.keys(lsAfter))
  
  await browser.close()
}

test().catch(console.error)

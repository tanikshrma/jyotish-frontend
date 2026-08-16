const puppeteer = require('puppeteer-core');

async function debug() {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`[HTTP ${resp.status()}]`, resp.url());
    }
  });

  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('[UNCAUGHT PAGE ERROR]', err.stack || err.message);
  });

  await page.goto('https://jyotish-now.vercel.app/free-kundli', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const nameInput = await page.$('input[placeholder="Enter your full name"]');
  const emailInput = await page.$('input[type="email"]');
  const phoneInput = await page.$('input[type="tel"]');
  const dateInput = await page.$('input[placeholder*="DD/MM/YYYY" i]');
  const pobInput = await page.$('input[placeholder*="birth" i], input[placeholder*="city" i], input[placeholder*="Place" i]');

  await nameInput.type('Siddharth Tiwari');
  await emailInput.type('siddharthgreat443@gmail.com');
  await phoneInput.type('6307862150');
  await dateInput.type('30062003');

  const genderTrigger = await page.$('button[role="combobox"]');
  if (genderTrigger) {
    await genderTrigger.click();
    await new Promise(r => setTimeout(r, 500));
    const maleOption = await page.$('[role="option"]');
    if (maleOption) await maleOption.click();
    await new Promise(r => setTimeout(r, 500));
  }

  if (pobInput) {
    await pobInput.click();
    await pobInput.type('New Delhi');
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('--- Clicking Calculate Now ---');
  const calculateButton = await page.$('button[type="submit"]');
  await calculateButton.click();

  await new Promise(r => setTimeout(r, 8000));
  await browser.close();
}

debug().catch(console.error);

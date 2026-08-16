const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('https://jyotish-now.vercel.app/free-kundli', { waitUntil: 'networkidle2' });

    // Fill form
    await page.type('input[placeholder*="Full Name"], input[name*="name"], #name', 'Siddharth Tiwari');
    await page.type('input[type="email"]', 'siddharth@example.com');
    await page.type('input[type="tel"]', '9876543210');

    // Date
    const dobInput = await page.$('input[placeholder="DD/MM/YYYY"]');
    if (dobInput) {
      await dobInput.click();
      await dobInput.type('30062003');
    }

    // Gender
    const genderTrigger = await page.$('button[role="combobox"]');
    if (genderTrigger) {
      await genderTrigger.click();
      await sleep(400);
      const maleOpt = await page.$('[role="option"]');
      if (maleOpt) await maleOpt.click();
    }

    // Place of birth
    const pobInput = await page.$('input[placeholder*="city" i], input[placeholder*="Place" i], input[placeholder*="Enter City" i]');
    if (pobInput) {
      await pobInput.click();
      await pobInput.type('Lucknow');
      await sleep(1500);
      const firstCity = await page.$('.cursor-pointer, [role="option"]');
      if (firstCity) await firstCity.click();
    }

    // Submit
    const calcBtn = await page.$('button[type="submit"]');
    await calcBtn.click();

    // Wait for 3D Book viewer
    await sleep(7000);

    const nextBtn = await page.$('button[title="Next Page"], button:has(svg.lucide-chevron-right)');
    if (nextBtn) {
      // Flip from cover to Page 1 & 2
      await nextBtn.click();
      await sleep(1200);

      // Flip to Page 3 & 4
      await nextBtn.click();
      await sleep(1200);

      // Flip to Page 5 & 6
      await nextBtn.click();
      await sleep(1200);

      // Flip to Page 7 & 8
      await nextBtn.click();
      await sleep(1200);

      // Flip to Page 9 & 10
      await nextBtn.click();
      await sleep(1200);

      // Flip to Page 11 (Conclusion)
      await nextBtn.click();
      await sleep(1500);
      await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_conclusion_spread.png' });
      console.log('✓ Conclusion spread captured');

      // Next flip closes to Back Cover
      await nextBtn.click();
      await sleep(1500);
      await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_back_cover.png' });
      console.log('✓ Back Cover captured directly without blank page');
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})();

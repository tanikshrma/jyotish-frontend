const puppeteer = require('puppeteer-core');
const path = require('path');

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

    console.log('Navigating to https://jyotish-now.vercel.app/free-kundli...');
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

    // Place of birth - search Lucknow
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
    console.log('Submitted calculation form for Lucknow...');

    // Wait for 3D Book viewer
    await sleep(7000);

    // Capture Cover
    await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_cover.png' });
    console.log('✓ Cover page saved');

    // Flip to Page 1 & 2 (Birth Details + Lagna Chart)
    const nextBtn = await page.$('button[title="Next Page"], button:has(svg.lucide-chevron-right)');
    if (nextBtn) {
      await nextBtn.click();
      await sleep(1500);
      await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_page_1_2.png' });
      console.log('✓ Page 1 & 2 saved (Birth Details & Lagna Chart)');

      // Flip to Page 3 & 4 (TOC & Dashboard)
      await nextBtn.click();
      await sleep(1500);

      // Flip to Page 5 & 6 (Navamsa & Planetary Positions)
      await nextBtn.click();
      await sleep(1500);
      await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_page_5_6.png' });
      console.log('✓ Page 5 & 6 saved (Navamsa & Planetary Positions)');

      // Flip to Page 7 & 8 (Predictions & Doshas)
      await nextBtn.click();
      await sleep(1500);

      // Flip to Page 9 & 10 (Yogas & Mahadasha)
      await nextBtn.click();
      await sleep(1500);
      await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_page_9_10.png' });
      console.log('✓ Page 9 & 10 saved (Yogas & Mahadasha)');
    }

    console.log('🚀 All page screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
})();

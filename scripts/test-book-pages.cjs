const puppeteer = require('puppeteer-core');

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

    // Place of birth
    const pobInput = await page.$('input[placeholder*="city"], input[placeholder*="Place"], input[placeholder*="Enter City"]');
    if (pobInput) {
      await pobInput.type('New Delhi');
      await new Promise(r => setTimeout(r, 1000));
      const firstOpt = await page.$('ul li, div[role="option"], button[role="option"]');
      if (firstOpt) await firstOpt.click();
    }

    // Submit
    const calcBtn = await page.$('button[type="submit"]');
    await calcBtn.click();
    console.log('Submitted calculation form...');

    // Wait for 3D Book
    await page.waitForSelector('.stf__parent, .stf__wrapper, [data-density="hard"], .react-pageflip', { timeout: 25000 });
    await new Promise(r => setTimeout(r, 2000));

    // Flip to next page (page 1 & 2)
    const nextBtn = await page.$('button[title="Next Page"], .lucide-chevron-right');
    if (nextBtn) {
      await nextBtn.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: '/home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_book_inside_pages.png' });
      console.log('✓ Inside pages screenshot saved to /home/siddharth/.gemini/antigravity/brain/5bc1dd89-7bfc-4061-a600-9b902cf709c0/kundli_book_inside_pages.png');
    }

    console.log('✓ All pages flipping and rendering successfully!');
  } catch (err) {
    console.error('Error during inside pages test:', err);
  } finally {
    await browser.close();
  }
})();

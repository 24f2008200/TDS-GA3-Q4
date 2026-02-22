const { chromium } = require('playwright');
const fs = require('fs');

const URLS = [
  'https://sanand0.github.io/tdsdata/js_table/?seed=14',
  'https://sanand0.github.io/tdsdata/js_table/?seed=15',
  'https://sanand0.github.io/tdsdata/js_table/?seed=16',
  'https://sanand0.github.io/tdsdata/js_table/?seed=17',
  'https://sanand0.github.io/tdsdata/js_table/?seed=18',
  'https://sanand0.github.io/tdsdata/js_table/?seed=19',
  'https://sanand0.github.io/tdsdata/js_table/?seed=20',
  'https://sanand0.github.io/tdsdata/js_table/?seed=21',
  'https://sanand0.github.io/tdsdata/js_table/?seed=22',
  'https://sanand0.github.io/tdsdata/js_table/?seed=23',
];

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  let grandTotal = 0;
  const breakdown = [];

  for (const url of URLS) {
    const page = await context.newPage();
    console.log(`\nScraping: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

    // Wait for the JS-rendered table to appear
    await page.waitForSelector('table', { timeout: 30000 });

    // Sum all numeric values in all table cells
    const pageSum = await page.evaluate(() => {
      let sum = 0;
      const cells = document.querySelectorAll('table td, table th');
      cells.forEach(cell => {
        const text = cell.textContent.trim();
        const num = parseFloat(text.replace(/,/g, ''));
        if (!isNaN(num)) {
          sum += num;
        }
      });
      return sum;
    });

    console.log(`  Sum for seed ${url.split('seed=')[1]}: ${pageSum}`);
    breakdown.push({ url, seed: url.split('seed=')[1], sum: pageSum });
    grandTotal += pageSum;

    await page.close();
  }

  await browser.close();

  console.log('\n=============================');
  console.log(`GRAND TOTAL: ${grandTotal}`);
  console.log('=============================\n');

  const results = { grandTotal, breakdown, timestamp: new Date().toISOString() };
  fs.writeFileSync('results.json', JSON.stringify(results, null, 2));
  console.log('Results saved to results.json');
})();

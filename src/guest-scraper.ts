// guest-scraper.ts
// run via npx tsx src/guest-scraper.ts to get the guest list

import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface ShowGuestEntry {
  date: string;
  guests: string[];
}

export interface ShowGuestSchedule {
  show: string;
  entries: ShowGuestEntry[];
}

const URL = 'https://www.interbridge.com/lineups.html';

export async function fetchGuestLineups(): Promise<ShowGuestSchedule[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  const html = await page.content();
  const $ = cheerio.load(html);

  const results: ShowGuestSchedule[] = [];

  // Find all <a name="XYZ"> anchors for each show block
  $('a[name]').each((_, anchor) => {
    const showAnchor = $(anchor);
    const showId = showAnchor.attr('name') || '';
    const showTitleBlock = showAnchor.closest('p').next();
    const showTitle = showAnchor.parent().text().trim().replace(/^[^A-Z]*([A-Z].*)$/, '$1');

    const entries: ShowGuestEntry[] = [];

    let node = showTitleBlock;
    while (node.length && node[0].tagName === 'p') {
      const rawHtml = node.html() || '';
      const lines = rawHtml.split(/<br\s*\/?>/i);

      for (const line of lines) {
        const text = cheerio.load(line).text().trim();
        const match = text.match(/^([A-Za-z]{2}) (\d{1,2}\/\d{1,2}):\s*(.+)$/);
        if (match) {
          const [, , date, guestsRaw] = match;
          const guests = guestsRaw
            .split(',')
            .map((g) => g.trim())
            .filter((g) => g.length > 0);
          entries.push({ date, guests });
        }
      }

      // Look ahead to next sibling
      node = node.next();
      if (!node.length || node.text().trim().startsWith('Get the day\'s lineups') || node.text().trim() === '') {
        break;
      }
    }

    if (entries.length > 0) {
      results.push({ show: showTitle, entries });
    }
  });

  await browser.close();
  return results;
}


// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchGuestLineups()
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => {
      console.error('❌ Error scraping guest list:', err);
      process.exit(1);
    });
}

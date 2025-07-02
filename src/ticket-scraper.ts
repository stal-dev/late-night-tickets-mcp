// ticket-scraper.ts
// run via npx tsx src/ticket-scraper.ts to get the ticket list

import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import { DEFAULT_SHOWS, Show } from './config.js'; // Assuming config.js exists and exports DEFAULT_SHOWS and Show

/**
 * @interface Ticket
 * Defines the structure for a single ticket entry.
 */
export interface Ticket {
  show: string;
  date: string;
  dateObj: Date | null;
  time: string;
  location: string;
  available: boolean;
  status: string;
}

/**
 * @interface TicketSummary
 * Provides a summary of fetched tickets.
 */
export interface TicketSummary {
  totalShows: number;
  availableShows: number;
  soldOutShows: number;
  shows: Ticket[];
}

/**
 * Maps abbreviated month names to their zero-based index.
 */
const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
};

/**
 * Parses a month, day, and optional time string into a Date object.
 * Adjusts the year if the parsed date is in the past, assuming it's for the next year.
 * @param month The abbreviated month name (e.g., "Jan").
 * @param day The day of the month as a string.
 * @param timeString An optional time string (e.g., "7:00 PM").
 * @returns A Date object or null if parsing fails.
 */
function parseMonthDayToDate(month: string, day: string, timeString?: string): Date | null {
  const monthIndex = MONTH_MAP[month];
  if (monthIndex === undefined || !day) {
    return null;
  }

  const dayInt = parseInt(day, 10);
  if (isNaN(dayInt)) {
    return null;
  }

  const now = new Date();
  // Normalize 'now' to start of day for accurate comparison
  now.setHours(0, 0, 0, 0);

  let year = now.getFullYear();
  let date = new Date(year, monthIndex, dayInt);
  // Normalize 'date' to start of day before applying time
  date.setHours(0, 0, 0, 0);

  // Apply time if timeString is provided
  if (timeString) {
    // Simple regex to parse 'HH:MM AM/PM'
    const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';

      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      } else if (ampm === 'AM' && hours === 12) { // Midnight (12 AM)
        hours = 0;
      }
      date.setHours(hours, minutes, 0, 0);
    }
  }

  // If the parsed date (now with potential time) is in the past, assume it's for the next year.
  // We compare with 'now' which has the current time, so the comparison is more accurate.
  if (date < new Date()) { // Compare with current date and time
    date = new Date(year + 1, monthIndex, dayInt);
    if (timeString) { // Reapply time if year was adjusted
      const timeMatch = timeString.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : '';

        if (ampm === 'PM' && hours < 12) {
          hours += 12;
        } else if (ampm === 'AM' && hours === 12) {
          hours = 0;
        }
        date.setHours(hours, minutes, 0, 0);
      }
    }
  }

  return date;
}

/**
 * Formats a Date object into a readable string.
 * @param date The Date object to format.
 * @returns A formatted date string or 'Date not available'.
 */
function formatDate(date: Date | null): string {
  if (!date) {
    return 'Date not available';
  }
  return date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

/**
 * Fetches ticket information for a single show using Puppeteer and Cheerio.
 * @param show The show object containing name and URL.
 * @param browser The Puppeteer browser instance.
 * @returns A Promise resolving to an array of Ticket objects or an empty array if an error occurs.
 */
async function fetchShowTicketsWithPuppeteer(show: Show, browser: Browser): Promise<{ tickets: Ticket[], error?: string }> {
  let page: Page | undefined;
  try {
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    page.setDefaultNavigationTimeout(5000); // Increased timeout for potentially slow pages

    // Navigate to the show URL and wait for network to be idle
    await page.goto(show.url, { timeout: 60000 });
    await page.waitForSelector('.eventList', { timeout: 30000 }); // Replace with an actual selector from the page

    const html = await page.content();
    const $ = cheerio.load(html);
    const tickets: Ticket[] = [];

    // Attempt to parse tickets from a list structure (e.g., .tabList li)
    $('.tabList li').each((_, el) => {
      const $el = $(el);
      // Skip elements that are likely headers or non-ticket items (e.g., containing a calendar icon)
      if ($el.find('.calendarIcon').length > 0 || $el.find('.month').length === 0 || $el.find('.dom').length === 0) {
        return;
      }

      const month = $el.find('.month').text().trim();
      const day = $el.find('.dom').text().trim();
      const statusText = $el.find('.status').text().trim();
      // Check for 'soldout' class or common sold out phrases in status text
      const isSoldOut = $el.hasClass('soldout') || /sold\s*out|unavailable/i.test(statusText);

      const dateObj = parseMonthDayToDate(month, day, show.defaultStartTime);
      const formattedDate = formatDate(dateObj);

      tickets.push({
        show: show.name,
        date: formattedDate,
        dateObj,
        time: show.defaultStartTime,
        location: show.location,
        available: !isSoldOut,
        status: isSoldOut ? 'Sold Out' : 'Available'
      });
    });
     
    return { tickets };
  } catch (err: any) {
    console.error(`❌ Error fetching ${show.name} (${show.url}): ${err.message || 'Unknown error'}`);
    return { tickets: [], error: err.message || 'Unknown error' };
  } finally {
    if (page) {
      await page.close(); // Ensure page is closed even if an error occurs
    }
  }
}

/**
 * Fetches tickets for all specified shows concurrently.
 * @param shows An array of Show objects. Defaults to DEFAULT_SHOWS.
 * @returns A Promise resolving to a deduplicated and sorted array of Ticket objects.
 */
async function getAllTickets(shows: Show[] = DEFAULT_SHOWS): Promise<Ticket[]> {
  const browser = await puppeteer.launch({ headless: true });
  let allTickets: Ticket[] = [];

  try {
    // Fetch all shows concurrently using Promise.allSettled
    const results = await Promise.allSettled(
      shows.map(show => fetchShowTicketsWithPuppeteer(show, browser))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allTickets = allTickets.concat(result.value.tickets);
      } else {
        // Log individual show fetching failures
        console.warn(`⚠️ A show fetch promise was rejected: ${result.reason}`);
      }
    }
  } finally {
    await browser.close(); // Ensure browser is closed
  }

  // Deduplicate tickets: ensure only 1 event per day for each show
  const uniqueTickets: Ticket[] = [];
  // Use a Map to store Sets of date strings for each show to track seen dates
  const seenDates = new Map<string, Set<string>>();

  for (const ticket of allTickets) {
    const showKey = ticket.show;
    // Use `toDateString()` for robust date comparison, ignores time
    const dateKey = ticket.dateObj ? ticket.dateObj.toDateString() : ticket.date;

    if (!seenDates.has(showKey)) {
      seenDates.set(showKey, new Set());
    }

    const showDates = seenDates.get(showKey)!;

    if (!showDates.has(dateKey)) {
      showDates.add(dateKey);
      uniqueTickets.push(ticket);
    }
  }

  // Sort tickets by date, placing null dates at the end
  uniqueTickets.sort((a, b) => {
    if (!a.dateObj && !b.dateObj) return 0; // Both are null or invalid
    if (!a.dateObj) return 1; // 'a' has no date, so 'b' comes first
    if (!b.dateObj) return -1; // 'b' has no date, so 'a' comes first
    return a.dateObj.getTime() - b.dateObj.getTime(); // Compare valid dates
  });

  return uniqueTickets;
}

/**
 * Retrieves a summary of all tickets, optionally filtered by availability.
 * @param availableOnly If true, only include available tickets in the summary.
 * @returns A Promise resolving to a TicketSummary object.
 */
export async function getTicketSummary(availableOnly?: boolean): Promise<TicketSummary> {
  const tickets = await getAllTickets();

  // Filter by availability if requested
  const filteredTickets = availableOnly
    ? tickets.filter(ticket => ticket.available)
    : tickets;

  // Calculate summary statistics
  const summary: TicketSummary = {
    totalShows: filteredTickets.length,
    availableShows: filteredTickets.filter(t => t.available).length,
    soldOutShows: filteredTickets.filter(t => !t.available).length,
    shows: filteredTickets
  };

  return summary;
}

// --- Self-execution block for direct script runs ---
// This block allows the script to be run directly for testing/demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    console.log('🚀 Starting ticket fetch...');
    try {
      const summary = await getTicketSummary(); // Get summary of all tickets by default
      console.log('✅ Ticket Fetch Complete!');
      console.log(`Total Shows Found: ${summary.totalShows}`);
      console.log(`Available Shows: ${summary.availableShows}`);
      console.log(`Sold Out Shows: ${summary.soldOutShows}`);
      console.log('\n--- Details ---');
      console.log(JSON.stringify(summary.shows, null, 2));
    } catch (err) {
      console.error(' fatal error during ticket fetching:', err);
      process.exit(1);
    }
  })();
}
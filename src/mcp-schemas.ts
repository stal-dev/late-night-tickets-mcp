import { z } from "zod";
import { Ticket } from "./ticket-scraper.js";
import { ShowGuestEntry, ShowGuestSchedule } from "./guest-scraper.js";

// Re-using the TicketType from ticketFetcher for Zod schema
export const ticketSchema: z.ZodType<Ticket> = z.object({
  show: z.string().describe("The name of the show."),
  date: z.string().describe("The formatted date of the show (e.g., 'Friday, July 5, 2024')."),
  dateObj: z.date().nullable().describe("The Date object representation of the show date."),
  time: z.string().describe("The time of the show (e.g., '4:15 PM ET')."),
  location: z.string().describe("The location of the show (e.g., 'New York, NY')."),
  available: z.boolean().describe("True if tickets are available, false if sold out."),
  status: z.string().describe("The availability status (e.g., 'Available', 'Sold Out')."),
});

// Schema for the full TicketSummary output of getAvailableShows
export const ticketSummaryOutputSchema = z.object({
  totalShows: z.number().int().describe("Total number of shows found after filtering."),
  availableShows: z.number().int().describe("Number of shows with available tickets."),
  soldOutShows: z.number().int().describe("Number of shows that are sold out."),
  shows: z.array(ticketSchema).describe("An array of individual show ticket details."),
});

// Schema for a single guest entry within a show's schedule
export const showGuestEntrySchema: z.ZodType<ShowGuestEntry> = z.object({
  date: z.string().describe("The date of the lineup entry (e.g., '07/01')."),
  guests: z.array(z.string()).describe("An array of guests for that specific date."),
});

// Schema for a complete show's guest schedule
export const showGuestScheduleSchema: z.ZodType<ShowGuestSchedule> = z.object({
    show: z.string().describe("The name of the late night show (e.g., 'The Tonight Show')."),
    entries: z.array(showGuestEntrySchema).describe("An array of dated guest entries for the show."),
});

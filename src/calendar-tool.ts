import { z } from "zod";
import { calendarEventSchema } from './mcp-schemas.js';

/**
 * Creates a calendar event for a late night show with iCal format data.
 * This tool allows AI assistants to suggest adding show times and locations 
 * directly to a user's calendar.
 */
export function registerCalendarTool(server: any) {
  server.registerTool(
    "addShowToCalendar",
    {
      title: "Add Show to Calendar",
      description: "Create a calendar event for a late night show with iCal format data that can be added to calendar applications.",
      inputSchema: {
        showName: z.string().describe("The name of the show (e.g., 'The Daily Show', 'The Tonight Show')."),
        date: z.string().describe("The date of the show in a parseable format (e.g., '2025-07-15', 'July 15, 2025')."),
        time: z.string().describe("The time of the show (e.g., '4:30 PM ET', '3:15 PM PT')."),
        location: z.string().describe("The location of the show (e.g., 'New York City, NY', 'Los Angeles, CA')."),
      },
      outputSchema: {
        event: calendarEventSchema,
      },
    },
    async (args: { showName: string; date: string; time: string; location: string }, extra: any) => {
      try {
        // Parse the date and time
        const dateStr = args.date;
        const timeStr = args.time;
        
        // Try to parse the date in various formats
        let parsedDate: Date;
        if (dateStr.includes('-')) {
          // ISO format like "2025-07-15"
          parsedDate = new Date(dateStr);
        } else {
          // Natural language format like "July 15, 2025"
          parsedDate = new Date(dateStr);
        }
        
        if (isNaN(parsedDate.getTime())) {
          throw new Error(`Invalid date format: ${dateStr}`);
        }
        
        // Parse time and timezone
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*(ET|PT|CT|MT)/i);
        if (!timeMatch) {
          throw new Error(`Invalid time format: ${timeStr}. Expected format like '4:30 PM ET'`);
        }
        
        const [, hours, minutes, ampm, timezone] = timeMatch;
        let hour = parseInt(hours);
        if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        // Set the time on the parsed date
        parsedDate.setHours(hour, parseInt(minutes), 0, 0);
        
        // Convert to UTC based on timezone
        const timezoneOffsets: { [key: string]: number } = {
          'ET': -5, // EST
          'PT': -8, // PST
          'CT': -6, // CST
          'MT': -7, // MST
        };
        
        const offset = timezoneOffsets[timezone.toUpperCase()] || 0;
        const utcDate = new Date(parsedDate.getTime() - (offset * 60 * 60 * 1000));
        
        // Create end time (typically 1 hour later for late night shows)
        const endDate = new Date(utcDate.getTime() + (60 * 60 * 1000)); // 1 hour later
        
        // Generate unique ID for the event
        const eventId = `show-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create iCal data
        const iCalData = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Late Night Tickets MCP//Calendar Event//EN',
          'BEGIN:VEVENT',
          `UID:${eventId}`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTSTART:${utcDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTEND:${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `SUMMARY:${args.showName}`,
          `DESCRIPTION:Attending ${args.showName} taping.\\n\\nLocation: ${args.location}\\nTime: ${timeStr}\\n\\nDon't forget to arrive early for check-in!`,
          `LOCATION:${args.location}`,
          'STATUS:CONFIRMED',
          'SEQUENCE:0',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');
        
        const event = {
          summary: args.showName,
          description: `Attending ${args.showName} taping.\n\nLocation: ${args.location}\nTime: ${timeStr}\n\nDon't forget to arrive early for check-in!`,
          location: args.location,
          startTime: utcDate.toISOString(),
          endTime: endDate.toISOString(),
          iCalData: iCalData,
        };

        return {
          content: [
            {
              type: "text",
              text: `Successfully created calendar event for ${args.showName} on ${args.date} at ${args.time}.`,
            },
          ],
          structuredContent: {
            event: event,
          },
        };
      } catch (error) {
        console.error("Error in addShowToCalendar:", error);
        return {
          content: [
            {
              type: "text",
              text: `Failed to create calendar event: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
} 
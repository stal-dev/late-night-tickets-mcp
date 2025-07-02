
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Import types and functions from your fetchers
import { getTicketSummary, Ticket, TicketSummary } from './ticket-scraper.js';
// Import the actual types from guestScraper.js
import { fetchGuestLineups, ShowGuestSchedule } from './guest-scraper.js';
// Import schemas from mcpSchemas
import { ticketSummaryOutputSchema, showGuestScheduleSchema } from './mcp-schemas.js';
// Import calendar tool
import { registerCalendarTool } from './calendar-tool.js';


// --- MCP Server Setup ---
// Create server instance
const server = new McpServer({
  name: "late-night-tickets-mcp",
  version: "1.0.0",
  description: "A server providing real-time information on show ticket availability and guest lineups for late night shows."
});

// --- Tool: getAvailableShows ---
server.registerTool(
  "getAvailableShows",
  {
    title: "Get Available Shows",
    description: "Retrieve all available ticket shows with their availability status. Can filter to show only available tickets.",
    inputSchema: {
      availableOnly: z.boolean().optional().describe("If true, only return shows with available tickets. Defaults to false (returns all shows).")
    },
    outputSchema: {
      result: ticketSummaryOutputSchema,
    },
  },
  async (args: { availableOnly?: boolean }, extra) => {  
    try {
      const summary: TicketSummary = await getTicketSummary(args?.availableOnly);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(summary),
          },
        ],
        structuredContent: {
          result: summary,
        },
      };
    } catch (error) {
      console.error("Error in getAvailableShows:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch ticket summary: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// --- Tool: getGuestLineups ---
server.registerTool(
  "getGuestLineups",
  {
    title: "Get Guest Lineups",
    description: "Scrape and return guest lineups for popular late night shows (e.g., The Tonight Show, Late Show).",
    inputSchema: {}, // No input arguments needed for this tool
    // The output is an array of ShowGuestSchedule objects
    outputSchema: {
      lineups: z.array(showGuestScheduleSchema),
    },
  },
  async (args: {}, extra) => {
    try {
      const lineups: ShowGuestSchedule[] = await fetchGuestLineups();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(lineups),
          },
        ],
        structuredContent: {
          lineups: lineups,
        },
      };
    } catch (error) {
      console.error("Error in getGuestLineups:", error);
      return {
        content: [
          {
            type: "text",
            text: `Failed to fetch guest lineups: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// --- Register Calendar Tool ---
registerCalendarTool(server);

// --- Main execution function ---
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Late Night Tickets MCP Server running on stdio. Waiting for commands...");
}

// Execute main function and handle any top-level errors
main().catch((error) => {
  console.error("Fatal error in MCP server main function:", error);
  process.exit(1);
});
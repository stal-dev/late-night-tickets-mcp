import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Import the actual types from guestScraper.js
import { fetchGuestLineups, ShowGuestSchedule } from './guest-scraper.js';
// Import schemas from mcpSchemas
import { showGuestScheduleSchema } from './mcp-schemas.js';

export function registerGuestLineupsTool(server: McpServer) {
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
} 
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Import types and functions from your fetchers
import { getTicketSummary, TicketSummary } from './ticket-scraper.js';
// Import schemas from mcpSchemas
import { ticketSummaryOutputSchema } from './mcp-schemas.js';

export function registerAvailableShowsTool(server: McpServer) {
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
} 
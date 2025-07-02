
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool registration functions
import { registerAvailableShowsTool } from './available-shows-tool.js';
import { registerGuestLineupsTool } from './guest-lineups-tool.js';
import { registerCalendarTool } from './calendar-tool.js';

// --- MCP Server Setup ---
// Create server instance
const server = new McpServer({
  name: "late-night-tickets-mcp",
  version: "1.0.0",
  description: "A server providing real-time information on show ticket availability and guest lineups for late night shows."
});

// --- Register Tools ---
registerAvailableShowsTool(server);
registerGuestLineupsTool(server);
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
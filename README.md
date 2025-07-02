# Late Night Tickets MCP Server

A Model Context Protocol (MCP) server that provides real-time information on show ticket availability and guest lineups for popular late night television shows.

## Overview

This server scrapes ticket availability from [1iota.com](https://www.1iota.com) and guest lineups from [interbridge.com](https://www.interbridge.com) to provide up-to-date information about:

- **Ticket Availability**: Real-time status of free tickets for popular TV shows
- **Guest Lineups**: Upcoming guests on late night talk shows

The server implements the Model Context Protocol (MCP) standard, making it compatible with MCP clients and AI assistants.

## Features

### 🎫 Ticket Availability
- Scrapes ticket availability from 1iota.com
- Supports multiple popular shows:
  - The View
  - The Late Show with Stephen Colbert
  - The Daily Show
  - The Tonight Show Starring Jimmy Fallon
  - Jimmy Kimmel Live
  - Late Night with Seth Meyers
- Provides availability status (Available/Sold Out)
- Includes show dates, times, and locations

### 🎭 Guest Lineups
- Scrapes guest lineups from interbridge.com
- Covers major late night talk shows
- Provides upcoming guest schedules with dates

### 🔧 MCP Integration
- Implements Model Context Protocol (MCP) standard
- Provides two main tools:
  - `getAvailableShows`: Retrieve ticket availability
  - `getGuestLineups`: Retrieve guest lineups
- Uses stdio transport for easy integration

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd late-night-tickets-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

### As an MCP Server

The server is designed to run as an MCP server using stdio transport:

```bash
node build/index.js
```

### Direct Script Execution

You can also run the individual scrapers directly:

#### Ticket Scraper
```bash
npx tsx src/ticket-scraper.ts
```

#### Guest Scraper
```bash
npx tsx src/guest-scraper.ts
```

## API Reference

### MCP Tools

#### `getAvailableShows`

Retrieves ticket availability for all configured shows.

**Parameters:**
- `availableOnly` (optional): Boolean - If true, only returns shows with available tickets

**Returns:**
```json
{
  "result": {
    "totalShows": 6,
    "availableShows": 3,
    "soldOutShows": 3,
    "shows": [
      {
        "show": "The Late Show with Stephen Colbert",
        "date": "Friday, December 20, 2024",
        "dateObj": "2024-12-20T21:15:00.000Z",
        "time": "4:15 PM ET",
        "location": "New York City, NY",
        "available": true,
        "status": "Available"
      }
    ]
  }
}
```

#### `getGuestLineups`

Retrieves guest lineups for late night shows.

**Parameters:** None

**Returns:**
```json
{
  "lineups": [
    {
      "show": "The Tonight Show",
      "entries": [
        {
          "date": "12/20",
          "guests": ["Tom Hanks", "Taylor Swift"]
        }
      ]
    }
  ]
}
```

## Configuration

### Adding New Shows

To add new shows, edit `src/config.ts`:

```typescript
export const DEFAULT_SHOWS: Show[] = [
  {
    name: 'Your Show Name',
    url: 'https://1iota.com/show/your-show-id',
    defaultStartTime: '3:00 PM ET',
    location: 'Your City, State'
  }
];
```

### Show Configuration

Each show requires:
- `name`: Display name of the show
- `url`: 1iota.com URL for the show
- `defaultStartTime`: Default show time
- `location`: Show location

## Technical Details

### Architecture
- **TypeScript**: Full TypeScript implementation
- **Puppeteer**: Web scraping for dynamic content
- **Cheerio**: HTML parsing
- **MCP SDK**: Model Context Protocol implementation
- **Zod**: Schema validation

### Dependencies
- `@modelcontextprotocol/sdk`: MCP server implementation
- `puppeteer`: Headless browser automation
- `cheerio`: HTML parsing and manipulation
- `axios`: HTTP client
- `zod`: Schema validation

### File Structure
```
src/
├── index.ts          # MCP server main entry point
├── ticket-scraper.ts # Ticket availability scraper
├── guest-scraper.ts  # Guest lineup scraper
├── config.ts         # Show configurations
└── mcp-schemas.ts    # MCP tool schemas
```

## Error Handling

The server includes comprehensive error handling:
- Network timeout handling
- Invalid HTML parsing recovery
- Graceful degradation when scraping fails
- Detailed error messages for debugging

## Rate Limiting & Ethics

- Uses reasonable timeouts (5-30 seconds)
- Respects website structure
- Implements proper user agents
- Designed for informational use only

## Development

### Building
```bash
npm run build
```

### TypeScript Compilation
The project uses TypeScript with ES2022 target and Node16 module resolution.

### Testing
Run individual scrapers to test functionality:
```bash
npx tsx src/ticket-scraper.ts
npx tsx src/guest-scraper.ts
```

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Disclaimer

This tool is for informational purposes only. Always check official sources for the most up-to-date information. The scrapers may break if the target websites change their structure. 
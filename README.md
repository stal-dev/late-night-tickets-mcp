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
- Provides three main tools:
  - `getAvailableShows`: Retrieve ticket availability
  - `getGuestLineups`: Retrieve guest lineups
  - `addShowToCalendar`: Create calendar events for shows
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

#### `addShowToCalendar`

Creates a calendar event for a late night show with iCal format data.

**Parameters:**
- `showName`: String - The name of the show (e.g., 'The Daily Show', 'The Tonight Show')
- `date`: String - The date of the show in a parseable format (e.g., '2025-07-15', 'July 15, 2025')
- `time`: String - The time of the show (e.g., '4:30 PM ET', '3:15 PM PT')
- `location`: String - The location of the show (e.g., 'New York City, NY', 'Los Angeles, CA')

**Returns:**
```json
{
  "event": {
    "summary": "The Daily Show",
    "description": "Attending The Daily Show taping.\n\nLocation: New York City, NY\nTime: 4:30 PM ET\n\nDon't forget to arrive early for check-in!",
    "location": "New York City, NY",
    "startTime": "2025-07-15T20:30:00.000Z",
    "endTime": "2025-07-15T21:30:00.000Z",
    "iCalData": "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Late Night Tickets MCP//Calendar Event//EN\nBEGIN:VEVENT\nUID:show-1734567890-abc123def\nDTSTAMP:20250101T120000Z\nDTSTART:20250715T203000Z\nDTEND:20250715T213000Z\nSUMMARY:The Daily Show\nDESCRIPTION:Attending The Daily Show taping.\\n\\nLocation: New York City, NY\\nTime: 4:30 PM ET\\n\\nDon't forget to arrive early for check-in!\nLOCATION:New York City, NY\nSTATUS:CONFIRMED\nSEQUENCE:0\nEND:VEVENT\nEND:VCALENDAR"
  }
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

## Usage Examples

### Example 1: Finding Daily Show Opportunities
**User Query:** "When is the next opportunity for me to attend the Daily show?"

**Response:**
```
Great news! I found several upcoming Daily Show tapings with available tickets. Here are your next opportunities to attend The Daily Show:

Upcoming Daily Show Tapings:
- Tuesday, July 15, 2025 at 4:30 PM ET in New York City
- Wednesday, July 16, 2025 at 4:30 PM ET in New York City
- Thursday, July 17, 2025 at 4:30 PM ET in New York City
- Tuesday, July 22, 2025 at 4:30 PM ET in New York City

The earliest opportunity is next Tuesday, July 15th - just two weeks away! All of these tapings are filmed at The Daily Show's studio in New York City, and tickets are currently showing as available.
```

### Example 2: Finding Guest Appearances
**User Query:** "When is the next time I can see Conan O'Brien?"

**Response:**
```
Based on the guest lineup, Conan O'Brien will be appearing on Late Night with Seth Meyers on Monday, July 7th. The show typically airs at 12:35 AM ET on NBC (so technically early Tuesday morning, July 8th).
This appears to be a repeat episode from June 11, 2025, but it's your next opportunity to see Conan on late night TV!
```

### Example 3: This Week's Available Shows
**User Query:** "Which show can I see this week?"

**Response:**
```
Looking at this week's schedule (July 1-6, 2025), I don't see any Daily Show tapings available. The earliest Daily Show taping with available tickets is next Tuesday, July 15th.

However, if you're interested in attending other late-night shows this week, I can see there are some available:

This Week's Available Shows:
- Monday, July 7th: Jimmy Kimmel Live at 3:15 PM PT (Los Angeles)
- Tuesday, July 8th: Jimmy Kimmel Live at 3:15 PM PT (Los Angeles)
- Wednesday, July 9th: The View at 9:30 AM ET (NYC) and Jimmy Kimmel Live at 3:15 PM PT (LA)
- Thursday, July 10th: The View at 9:30 AM ET (NYC) and Jimmy Kimmel Live at 3:15 PM PT (LA)

Since you're in New York City, The View would be your most convenient option this week if you want to attend a show taping.
```

### Example 4: Location-Specific Search
**User Query:** "Which late night shows are available next Monday in Los Angeles?"

**Response:**
```
Looking at next Monday, July 14, 2025 in Los Angeles, here are the available late-night shows:

Monday, July 14th in Los Angeles:
- Jimmy Kimmel Live at 3:15 PM PT

That's the only late-night show option available in Los Angeles for next Monday.

If you're willing to consider New York City shows for that same day, there are also:
- Late Night with Seth Meyers at 2:00 PM ET
- The Tonight Show Starring Jimmy Fallon at 3:45 PM ET

But if you specifically want to stay in Los Angeles, Jimmy Kimmel Live would be your only option for next Monday.
```

### Example 5: Calendar Integration
**User Query:** "Add The Daily Show on July 15th at 4:30 PM ET to my calendar"

**Response:**
```
Successfully created calendar event for The Daily Show on July 15, 2025 at 4:30 PM ET.

Calendar Event Details:
- Event: The Daily Show
- Date: Tuesday, July 15, 2025
- Time: 4:30 PM ET - 5:30 PM ET
- Location: New York City, NY
- Description: Attending The Daily Show taping with check-in reminder

The iCal data has been generated and can be imported into your calendar application. The event includes a reminder to arrive early for check-in.
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
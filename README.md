# southwest-mcp-agent-chatbot

A simple Node.js + Express chatbot agent for Southwest Airlines flight-related support questions.

The chatbot:
- Detects intent from user text (`flight_status`, `checkin_window`, `baggage_policy`)
- Calls a remote MCP server tool via HTTP
- Uses OpenAI ChatGPT only to polish/rephrase the raw tool output (no new facts)

## Project Structure

- `src/server.js` - Express server + API routes
- `src/agent.js` - Intent detection, argument extraction, tool orchestration
- `src/mcpClient.js` - Minimal MCP HTTP client
- `src/polisher.js` - OpenAI ChatGPT polish step
- `public/` - Minimal web UI
- `postman/southwest-mcp-tools.postman_collection.json` - Postman collection for MCP testing

## Requirements

- Node.js 18+
- An MCP server URL exposing:
  - `POST /tools/list`
  - `POST /tools/call`
- OpenAI API key

## Environment Variables

Create a `.env` file in project root:

```bash
MCP_SERVER_URL=http://localhost:8080
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

## Run Locally

```bash
npm install
npm start
```

App will run on:

- API + UI: `http://localhost:3000`
- Health check: `GET http://localhost:3000/health`
- Chat endpoint: `POST http://localhost:3000/api/chat`

## API Usage

### Chat

`POST /api/chat`

```json
{
  "message": "What is the status of WN123 on 2026-07-03?"
}
```

### MCP proxy routes (optional)

- `POST /api/mcp/tools/list`
- `POST /api/mcp/tools/call`

## Intent and Tool Mapping

- **Flight status intent** → `flight_status` with:
  - `flight_number`
  - `date` (`YYYY-MM-DD`)
- **Check-in timing intent** → `checkin_window` with:
  - `departure_time`
- **Baggage intent** → `baggage_policy` with:
  - `topic` = `checked` | `carryon` | `oversize`

## Postman Testing

Import collection:

- `postman/southwest-mcp-tools.postman_collection.json`

Set Postman variable:

- `mcp_server_url` (example: `http://localhost:8080`)

Collection includes:
- List tools
- Call `flight_status`
- Call `checkin_window`
- Call `baggage_policy`

## Example Questions

- "What is the status of WN123 on 2026-07-03?"
- "When can I check in for a flight departing 2026-07-03T14:30:00Z?"
- "What is Southwest carry-on baggage policy?"
- "How does Southwest handle oversize bags?"

## Notes

- The OpenAI step is constrained to polishing/rephrasing/summarizing only from MCP tool output.
- If required inputs are missing (e.g., no date for flight status), the agent asks for missing fields.

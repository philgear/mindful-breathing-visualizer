# Mindful Breathing MCP Server

This Node.js application is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. It enables AI assistants to access data about breathing techniques and use tools to retrieve specific exercise details.

## Capabilities

- **Resources**: `breathing://techniques` returns a list of available exercises.
- **Tools**: `get_technique_details` returns phase durations for a specific exercise.
- **Prompts**: `breathing_coach` sets the context for an AI to act as a breathing guide.

## Usage

1.  Build: `npm install && npm run build`
2.  Run: `npm start` (This will start the STDIO transport, meant for use by an MCP client).

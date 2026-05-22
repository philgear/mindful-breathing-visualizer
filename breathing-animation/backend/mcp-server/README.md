<!-- PREAMBLE_START -->

> 🌿 **Backend / Mcp-server Pillar**
> This is a component of the [Mindful Breathing Visualizer](https://github.com/philgear/mindful-breathing-visualizer) ecosystem (v3.0.0).
>
> **Core Features**:
>
> - **Serene Palette™**: Standardized Emerald/Blue/Rose colors.
> - **Smart Logic**: Supports 4-7-8, Box, and Diaphragmatic patterns.
> - **SWEBOK v4 Alignment**: Engineering rigor meets clinical science.

<!-- PREAMBLE_END -->

# Mindful Breathing MCP Server

This Node.js application is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. It enables AI assistants to access data about breathing techniques and use tools to retrieve specific exercise details.

## Capabilities

- **Resources**: `breathing://techniques` returns a list of available exercises.
- **Tools**: `get_technique_details` returns phase durations for a specific exercise.
- **Prompts**: `breathing_coach` sets the context for an AI to act as a breathing guide.

## Usage

1.  Build: `npm install && npm run build`
2.  Run: `npm start` (This will start the STDIO transport, meant for use by an MCP client).

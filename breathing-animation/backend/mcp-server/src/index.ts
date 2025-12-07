import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListResourcesRequestSchema,
    ListToolsRequestSchema,
    ReadResourceRequestSchema,
    ListPromptsRequestSchema,
    GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

interface BreathingTechnique {
    name: string;
    phases: { name: string; duration: number }[];
    description: string;
}

const TECHNIQUES: Record<string, BreathingTechnique> = {
    "box-breathing": {
        name: "Box Breathing",
        phases: [
            { name: "Inhale", duration: 4 },
            { name: "Hold", duration: 4 },
            { name: "Exhale", duration: 4 },
            { name: "Hold", duration: 4 },
        ],
        description: "Equal duration phases (4-4-4-4) for focus and stress relief. Visualized as a square.",
    },
    "diaphragmatic": {
        name: "Diaphragmatic Breathing",
        phases: [
            { name: "Inhale", duration: 5 },
            { name: "Exhale", duration: 5 }
        ],
        description: "Deep belly breathing (5-5) for maximum oxygen intake and relaxation."
    },
    "alternate-nostril": {
        name: "Alternate Nostril Breathing",
        phases: [
            { name: "Inhale Left", duration: 4 },
            { name: "Hold", duration: 4 },
            { name: "Exhale Right", duration: 4 },
            { name: "Hold", duration: 4 },
            { name: "Inhale Right", duration: 4 },
            { name: "Hold", duration: 4 },
            { name: "Exhale Left", duration: 4 },
            { name: "Hold", duration: 4 },
        ],
        description: "Balancing technique (Nadi Shodhana) using alternate nostrils."
    }
};

const server = new Server(
    {
        name: "breathing-visualizer-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            resources: {},
            tools: {},
            prompts: {},
        },
    }
);

// List Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "breathing://techniques",
                name: "Breathing Techniques List",
                mimeType: "application/json",
                description: "A list of all available breathing techniques provided by this server.",
            },
        ],
    };
});

// Read Resource
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === "breathing://techniques") {
        return {
            contents: [
                {
                    uri: "breathing://techniques",
                    mimeType: "application/json",
                    text: JSON.stringify(Object.values(TECHNIQUES).map(t => ({ name: t.name, key: t.name.toLowerCase().replace(/ /g, '-') })), null, 2),
                },
            ],
        };
    }
    throw new Error("Resource not found");
});

// List Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_technique_details",
                description: "Get detailed phase durations for a specific breathing technique.",
                inputSchema: {
                    type: "object",
                    properties: {
                        techniqueName: {
                            type: "string",
                            description: "The name/key of the technique (e.g., 'box-breathing', '4-7-8').",
                        },
                    },
                    required: ["techniqueName"],
                },
            },
        ],
    };
});

// Call Tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_technique_details") {
        const rawName = request.params.arguments?.techniqueName;

        // SECURITY: Strict Input Validation (Type Check)
        if (typeof rawName !== 'string') {
            return {
                content: [{ type: "text", text: "Error: techniqueName must be a string." }],
                isError: true,
            };
        }

        // SECURITY: Length Check to prevent buffer overflow/DoS attempts on regex/find
        if (rawName.length > 50) {
            return {
                content: [{ type: "text", text: "Error: techniqueName is too long (max 50 chars)." }],
                isError: true,
            };
        }

        const name = rawName.toLowerCase();

        // SECURITY: Allowlist Validation (Implicit via find)
        // We only match against known keys in our TECHNIQUES const.
        const key = Object.keys(TECHNIQUES).find(k => name.includes(k));

        if (key && TECHNIQUES[key]) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(TECHNIQUES[key], null, 2),
                    },
                ],
            };
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Technique '${name}' not found. Available: ${Object.keys(TECHNIQUES).join(", ")}`,
                },
            ],
            isError: true,
        };
    }
    throw new Error("Tool not found");
});

// List Prompts
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "breathing_coach",
                description: "Acting as a breathing coach using the provided technique.",
                arguments: [
                    {
                        name: "technique",
                        description: "The technique to coach.",
                        required: true
                    }
                ]
            }
        ]
    };
});

// Get Prompt
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name === "breathing_coach") {
        const techniqueName = request.params.arguments?.technique || "box-breathing";
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please act as a mindful breathing coach. Guide me through a session of ${techniqueName}. Use the 'get_technique_details' tool to understand the timing of the phases.`
                    }
                }
            ]
        };
    }
    throw new Error("Prompt not found");
})

const transport = new StdioServerTransport();
await server.connect(transport);

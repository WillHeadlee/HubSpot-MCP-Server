#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const HUBSPOT_BASE = process.env.HUBSPOT_BASE_URL || "https://api.hubapi.com";
const ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

// ─── HTTP Requester ──────────────────────────────────────────────────────────

async function hubspotRequest(method, path, body) {
  if (!ACCESS_TOKEN) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not set. Please configure it in your environment/mcp config.");
  }

  const url = `${HUBSPOT_BASE}${path}`;
  const options = {
    method,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
  };

  if (body && (method === "POST" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, options);
  } catch (err) {
    throw new Error(`Could not reach HubSpot API: ${err.message}. Check your internet connection.`);
  }

  if (res.status === 401) throw new Error("HubSpot Access Token is invalid or missing — check your configuration");
  if (res.status === 403) throw new Error("Access denied — check Private App scopes");
  if (res.status === 404) throw new Error(`Record or path not found: ${path}`);
  if (res.status === 429) throw new Error("HubSpot rate limit hit — please wait a moment and try again");

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${detail}`);
  }

  if (res.status === 204 || res.headers.get("content-length") === "0") return {};

  return res.json();
}

// ─── Formatting Helpers ──────────────────────────────────────────────────────

function toText(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function toError(err) {
  return { content: [{ type: "text", text: err.message }], isError: true };
}

// ─── Tool Definitions ────────────────────────────────────────────────────────

const TOOLS = [
  // Contacts
  {
    name: "search_contacts",
    description: "Search for HubSpot contacts by name or email",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search term" },
        limit: { type: "number", default: 20 },
      },
      required: ["query"],
    },
  },
  {
    name: "get_contact",
    description: "Get full details for a single contact by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Contact ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_contact",
    description: "Create a new contact in HubSpot",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string" },
        firstname: { type: "string" },
        lastname: { type: "string" },
        phone: { type: "string" },
      },
      required: ["email"],
    },
  },
  {
    name: "list_contacts",
    description: "List all contacts in HubSpot",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 20 },
      },
    },
  },
  // Deals
  {
    name: "list_deals",
    description: "List recent deals (donations/grants)",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number", default: 20 },
      },
    },
  },
  {
    name: "get_deal",
    description: "Get details for a specific deal by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Deal ID" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_deal",
    description: "Create a new deal (donation record)",
    inputSchema: {
      type: "object",
      properties: {
        dealname: { type: "string" },
        amount: { type: "string" },
        pipeline: { type: "string" },
        dealstage: { type: "string" },
        closedate: { type: "string", description: "ISO 8601 format" },
      },
      required: ["dealname", "amount"],
    },
  },
  // Companies
  {
    name: "search_companies",
    description: "Search for HubSpot companies",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        limit: { type: "number", default: 20 },
      },
      required: ["query"],
    },
  },
];

// ─── Handler Dispatcher ──────────────────────────────────────────────────────

async function handleTool(name, args) {
  switch (name) {
    case "search_contacts": {
      const body = {
        filterGroups: [{
          filters: [
            { propertyName: "email", operator: "CONTAINS_TOKEN", value: args.query },
            { propertyName: "firstname", operator: "CONTAINS_TOKEN", value: args.query },
            { propertyName: "lastname", operator: "CONTAINS_TOKEN", value: args.query }
          ]
        }],
        limit: args.limit ?? 20
      };
      return toText(await hubspotRequest("POST", "/crm/v3/objects/contacts/search", body));
    }
    case "get_contact": {
      return toText(await hubspotRequest("GET", `/crm/v3/objects/contacts/${args.id}`));
    }
    case "create_contact": {
      return toText(await hubspotRequest("POST", "/crm/v3/objects/contacts", { properties: args }));
    }
    case "list_contacts": {
      return toText(await hubspotRequest("GET", `/crm/v3/objects/contacts?limit=${args.limit ?? 20}`));
    }
    case "list_deals": {
      return toText(await hubspotRequest("GET", `/crm/v3/objects/deals?limit=${args.limit ?? 20}`));
    }
    case "get_deal": {
      return toText(await hubspotRequest("GET", `/crm/v3/objects/deals/${args.id}`));
    }
    case "create_deal": {
      return toText(await hubspotRequest("POST", "/crm/v3/objects/deals", { properties: args }));
    }
    case "search_companies": {
      const body = {
        filterGroups: [{
          filters: [{ propertyName: "name", operator: "CONTAINS_TOKEN", value: args.query }]
        }],
        limit: args.limit ?? 20
      };
      return toText(await hubspotRequest("POST", "/crm/v3/objects/companies/search", body));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── Server Bootstrap ────────────────────────────────────────────────────────

const server = new Server(
  { name: "hubspot-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await handleTool(request.params.name, request.params.arguments ?? {});
  } catch (err) {
    return toError(err);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("HubSpot MCP Server running on stdio");

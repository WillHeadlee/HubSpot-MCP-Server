# HubSpot MCP Server

A high-fidelity Model Context Protocol (MCP) Server for HubSpot CRM, tailored for nonprofit use cases (Donors, Households, Donations).

## Features

- **Contacts:** Search, retrieve, and create contacts (Donors).
- **Deals:** List and record deals (Donations/Grants).
- **Companies:** Search and manage companies (Households/Organizations).

## Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- A **HubSpot Private App Access Token**.
  - Go to **Settings > Integrations > Private Apps** in HubSpot.
  - Create a new Private App with scopes for `crm.objects.contacts`, `crm.objects.deals`, and `crm.objects.companies` (Read and Write).

### 2. Install
```bash
npm install
```

### 3. Configure
Copy `.env.example` to `.env` and add your access token.

## Integrating with AI Clients

### Claude Desktop
```json
{
  "mcpServers": {
    "hubspot-crm": {
      "command": "node",
      "args": ["C:\\path\\to\\HubSpot-MCP-Server\\index.js"],
      "env": {
        "HUBSPOT_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

## License
MIT

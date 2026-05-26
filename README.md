# HubSpot MCP Server

A direct, secure, and high-fidelity Model Context Protocol (MCP) Server for HubSpot CRM, specifically tailored for nonprofit use cases. This server allows AI coding assistants and chat applications (like Claude Desktop, LibreChat, or Open WebUI) to securely interact with your HubSpot portal to search donors (Contacts), manage households/organizations (Companies), and log donations (Deals) locally without any third-party middleware (like Zapier).

---

## Features

- **Contacts (Donors):** Search contacts by name or email, retrieve full profiles, and create new donor records.
- **Deals (Donations):** List recent donations/grants and record new financial contributions directly to your pipelines.
- **Companies:** Search and manage organization or household records.
- **Zero-Middleware Architecture:** Data transits directly between the local AI client and the HubSpot API, reducing security risks and third-party fees.

---

## Installation & Setup

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- A **HubSpot Private App Access Token** or **Service Key**.
  - Go to **Settings > Integrations > Private Apps** in HubSpot.
  - Create a new Private App with scopes for `crm.objects.contacts` (Read/Write), `crm.objects.deals` (Read/Write), and `crm.objects.companies` (Read/Write).

### 2. Install Dependencies
Clone this repository to your local machine, open a terminal in the folder, and run:
```bash
npm install
```

### 3. Configure Environment Variables
Copy the `.env.example` template to create your local `.env` configuration file:
```bash
cp .env.example .env
```
Open `.env` in a text editor and replace the placeholder with your actual HubSpot token:
```env
HUBSPOT_ACCESS_TOKEN=your_private_app_access_token_here
```

---

## Integrating with AI Clients

This server can be integrated into any AI client, editor, or chat interface that supports the Model Context Protocol (MCP).

### 1. Claude Desktop
To utilize this server in the official Claude Desktop application, add the configuration to your `claude_desktop_config.json` file.

**File Location:**
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Configuration:**
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

### 2. Cursor IDE (AI Code Editor)
Cursor supports custom MCP servers directly in its graphical user interface:
1. Open Cursor and navigate to **Settings** > **Features** > **MCP**.
2. Click **+ Add New MCP Server**.
3. Configure the fields in the popup:
   - **Name:** `hubspot-crm`
   - **Type:** `command`
   - **Command:** `node C:\path\to\HubSpot-MCP-Server\index.js`
4. Click **Save**. Note: Ensure `HUBSPOT_ACCESS_TOKEN` is set in your environment.

### 3. Windsurf IDE (AI Code Editor)
Windsurf supports native MCP configurations via its global config file.

**File Location:**
- **Windows:** `%USERPROFILE%\.codeium\windsurf\mcp_config.json`
- **macOS/Linux:** `~/.codeium/windsurf/mcp_config.json`

**Configuration:**
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

### 4. LibreChat (Open-Source Chat UI)
LibreChat allows you to integrate MCP servers directly through its centralized config file `librechat.yaml`.

**Configuration in `librechat.yaml`:**
```yaml
mcpServers:
  hubspot-crm:
    type: "stdio"
    command: "node"
    args: ["C:\\path\\to\\HubSpot-MCP-Server\\index.js"]
    env:
      HUBSPOT_ACCESS_TOKEN: "your_token_here"
```

---

## Security & Data Privacy

Unlike other MCP integrations that route sensitive donor information through third-party services, this server operates on a **direct local pipeline**:
- **Zero Third-Party Storage:** All constituent and donation data is sent directly from your computer to the official HubSpot API over secure, encrypted HTTPS.
- **Principle of Least Privilege:** You control access by managing the scopes assigned to your Private App or Service Key in the HubSpot dashboard.

---

## License

This project is open-source and free to adapt for non-profit organizations under the MIT License.

const { URL } = require('url');

class MCPClient {
  constructor(baseUrl) {
    if (!baseUrl) {
      throw new Error('MCP_SERVER_URL is required');
    }
    this.baseUrl = baseUrl;
  }

  async listTools() {
    return this._request('/tools/list', {});
  }

  async callTool(toolName, args) {
    return this._request('/tools/call', {
      tool: toolName,
      arguments: args
    });
  }

  async _request(path, payload) {
    const endpoint = new URL(path, this.baseUrl).toString();

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`MCP request failed (${response.status}): ${errText}`);
    }

    return response.json();
  }
}

module.exports = MCPClient;

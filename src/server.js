require('dotenv').config();
const express = require('express');
const path = require('path');
const SouthwestAgent = require('./agent');
const MCPClient = require('./mcpClient');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const agent = new SouthwestAgent({
  mcpServerUrl: process.env.MCP_SERVER_URL,
  openAiApiKey: process.env.OPENAI_API_KEY
});

const mcpClient = new MCPClient(process.env.MCP_SERVER_URL);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'southwest-mcp-agent-chatbot' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const message = req.body?.message;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const result = await agent.handleMessage(message);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Chat processing failed',
      details: error.message
    });
  }
});

app.post('/api/mcp/tools/list', async (req, res) => {
  try {
    const tools = await mcpClient.listTools();
    res.json(tools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/mcp/tools/call', async (req, res) => {
  try {
    const { tool, arguments: args } = req.body || {};
    if (!tool) {
      return res.status(400).json({ error: 'tool is required' });
    }

    const result = await mcpClient.callTool(tool, args || {});
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Southwest MCP Agent Chatbot running at http://localhost:${port}`);
});

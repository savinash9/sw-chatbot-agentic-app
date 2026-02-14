const MCPClient = require('./mcpClient');
const ResponsePolisher = require('./polisher');

class SouthwestAgent {
  constructor({ mcpServerUrl, openAiApiKey }) {
    this.mcpClient = new MCPClient(mcpServerUrl);
    this.polisher = new ResponsePolisher(openAiApiKey);
  }

  detectIntent(message) {
    const text = message.toLowerCase();

    if (text.includes('flight') || text.includes('status') || /\bwn\d+/i.test(message)) {
      return 'flight_status';
    }

    if (text.includes('check in') || text.includes('check-in') || text.includes('checkin')) {
      return 'checkin_window';
    }

    if (text.includes('bag') || text.includes('baggage') || text.includes('carry on') || text.includes('carry-on') || text.includes('oversize')) {
      return 'baggage_policy';
    }

    return null;
  }

  extractArgs(intent, message) {
    if (intent === 'flight_status') {
      const flightMatch = message.match(/\b(?:WN|SWA)?\s?(\d{1,4})\b/i);
      const dateMatch = message.match(/\b(\d{4}-\d{2}-\d{2})\b/);

      return {
        flight_number: flightMatch ? `WN${flightMatch[1]}` : null,
        date: dateMatch ? dateMatch[1] : null
      };
    }

    if (intent === 'checkin_window') {
      const departureMatch = message.match(/\b(\d{4}-\d{2}-\d{2}[tT ]\d{2}:\d{2}(?::\d{2})?(?:[zZ]|[+-]\d{2}:?\d{2})?)\b/);
      return {
        departure_time: departureMatch ? departureMatch[1].replace(' ', 'T') : null
      };
    }

    if (intent === 'baggage_policy') {
      let topic = 'checked';
      const text = message.toLowerCase();
      if (text.includes('carry on') || text.includes('carry-on')) {
        topic = 'carryon';
      } else if (text.includes('oversize') || text.includes('over size') || text.includes('large')) {
        topic = 'oversize';
      }

      return { topic };
    }

    return {};
  }

  validateArgs(intent, args) {
    if (intent === 'flight_status' && (!args.flight_number || !args.date)) {
      return 'For flight status, please provide a flight number and date in YYYY-MM-DD format.';
    }

    if (intent === 'checkin_window' && !args.departure_time) {
      return 'For check-in timing, please provide a departure datetime (for example 2026-07-03T14:30:00Z).';
    }

    return null;
  }

  async handleMessage(message) {
    const intent = this.detectIntent(message);

    if (!intent) {
      return {
        intent: null,
        response: 'I can help with flight status, check-in timing, or baggage policy. Please ask about one of those.'
      };
    }

    const args = this.extractArgs(intent, message);
    const validationError = this.validateArgs(intent, args);

    if (validationError) {
      return {
        intent,
        tool: intent,
        toolArgs: args,
        response: validationError
      };
    }

    const toolResponse = await this.mcpClient.callTool(intent, args);
    const polished = await this.polisher.polish({
      userQuery: message,
      toolName: intent,
      toolArguments: args,
      toolResponse
    });

    return {
      intent,
      tool: intent,
      toolArgs: args,
      toolResponse,
      response: polished
    };
  }
}

module.exports = SouthwestAgent;

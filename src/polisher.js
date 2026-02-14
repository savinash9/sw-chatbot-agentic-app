const OpenAI = require('openai');

class ResponsePolisher {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  async polish({ userQuery, toolName, toolArguments, toolResponse }) {
    const completion = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a response polisher for a Southwest Airlines support chatbot. Rewrite the answer clearly and concisely using ONLY facts from tool output. Do not add facts.'
        },
        {
          role: 'user',
          content: [
            `User query: ${userQuery}`,
            `Tool used: ${toolName}`,
            `Tool arguments: ${JSON.stringify(toolArguments)}`,
            `Raw tool response: ${JSON.stringify(toolResponse)}`,
            'Return a polished user-facing answer. If required fields are missing, ask for them.'
          ].join('\n')
        }
      ]
    });

    return completion.choices[0]?.message?.content?.trim() || 'Sorry, I could not format that response.';
  }
}

module.exports = ResponsePolisher;

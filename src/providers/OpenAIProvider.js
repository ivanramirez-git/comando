const axios = require('axios');
const AIProvider = require('../core/AIProvider');

class OpenAIProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.apiKey;
    this.apiBase = config.apiBase || 'https://api.openai.com/v1';
    this.model = config.model || 'gpt-3.5-turbo-instruct';
  }

  async generateCode(prompt) {
    if (!this.isConfigValid()) {
      throw new Error('API Key de OpenAI no configurada');
    }

    const fullPrompt = this.buildPrompt(prompt);

    const response = await axios.post(`${this.apiBase}/completions`, {
      top_p: 1,
      stop: "```",
      temperature: 0,
      suffix: "\n```",
      max_tokens: 1000,
      presence_penalty: 0,
      frequency_penalty: 0,
      model: this.model,
      prompt: fullPrompt
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].text.trim();
  }

  buildPrompt(prompt) {
    let osHint = '';
    if (process.platform === 'darwin') {
      osHint = ' (en macOS)';
    } else if (process.platform === 'linux') {
      osHint = ' (en Linux)';
    } else if (process.platform === 'win32') {
      osHint = ' (en Windows)';
    }

    return `${prompt}${osHint}. Genera ÚNICAMENTE código bash que sea SEGURO y NO cause daños irreparables al sistema. No incluyas explicaciones adicionales. Solo muestra el código bash que debe ejecutarse.`;
  }

  isConfigValid() {
    return Boolean(this.apiKey);
  }

  getName() {
    return 'OpenAI';
  }
}

module.exports = OpenAIProvider;

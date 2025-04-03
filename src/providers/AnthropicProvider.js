const axios = require('axios');
const AIProvider = require('../core/AIProvider');

class AnthropicProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.anthropicApiKey;
    this.apiBase = config.anthropicApiBase || 'https://api.anthropic.com';
    this.model = config.anthropicModel || 'claude-2';
  }

  async generateCode(prompt) {
    if (!this.isConfigValid()) {
      throw new Error('API Key de Anthropic no configurada');
    }

    const fullPrompt = this.buildPrompt(prompt);

    const response = await axios.post(`${this.apiBase}/v1/complete`, {
      prompt: fullPrompt,
      model: this.model,
      max_tokens_to_sample: 1000,
      stop_sequences: ["```"]
    }, {
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    return response.data.completion.trim();
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
    return 'Anthropic Claude';
  }
}

module.exports = AnthropicProvider;

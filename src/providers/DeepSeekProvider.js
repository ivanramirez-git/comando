const axios = require('axios');
const AIProvider = require('../core/AIProvider');
const { OpenAI } = require('openai');

class DeepSeekProvider extends AIProvider {
  constructor(config) {
    super(config);
    this.apiKey = config.deepseekApiKey;
    this.apiBase = config.deepseekApiBase || 'https://api.deepseek.com';
    this.model = config.deepseekModel || 'deepseek-chat';
    this.openai = new OpenAI({
      baseURL: this.apiBase,
      apiKey: this.apiKey
    });
  }

  async generateCode(prompt) {
    if (!this.isConfigValid()) {
      throw new Error('API Key de DeepSeek no configurada');
    }

    const fullPrompt = this.buildPrompt(prompt);

    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          { role: "system", content: "Eres un asistente que genera scripts de shell precisos y funcionales." },
          { role: "user", content: fullPrompt }
        ],
        model: this.model,
      });

      return completion.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`Error de DeepSeek API: ${error.message}`);
    }
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
    return 'DeepSeek';
  }
}

module.exports = DeepSeekProvider;

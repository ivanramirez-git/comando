const axios = require('axios');
const AIProvider = require('../core/AIProvider');

class GeminiProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.geminiApiKey;
        this.apiBase = config.geminiApiBase || 'https://generativelanguage.googleapis.com';
        this.model = config.geminiModel || 'gemini-2.0-flash';
    }

    async generateCode(prompt) {
        if (!this.isConfigValid()) {
            throw new Error('API Key de Google Gemini no configurada');
        }

        const fullPrompt = this.buildPrompt(prompt);

        try {
            const response = await axios.post(
                `${this.apiBase}/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Extraer el texto de la respuesta de Gemini
            const generatedText = response.data.candidates[0].content.parts[0].text;

            // Extraer el bloque de código bash si existe
            const codeMatch = generatedText.match(/```bash\n([\s\S]*?)```/);
            return codeMatch ? codeMatch[1].trim() : generatedText.trim();
        } catch (error) {
            throw new Error(`Error de Gemini API: ${error.response?.data?.error?.message || error.message}`);
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

        return `${prompt}${osHint}. Genera ÚNICAMENTE código bash que sea SEGURO y NO cause daños irreparables al sistema. No incluyas explicaciones adicionales. Solo muestra el código bash que debe ejecutarse. Que el comando bash sea minimalista, si es posible resolverlo en una línea máximo dos. No incluyas ningún comentario.`;
    }

    isConfigValid() {
        return Boolean(this.apiKey);
    }

    getName() {
        return 'Google Gemini';
    }
}

module.exports = GeminiProvider;

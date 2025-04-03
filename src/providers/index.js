const OpenAIProvider = require('./OpenAIProvider');
const AnthropicProvider = require('./AnthropicProvider');
const DeepSeekProvider = require('./DeepSeekProvider');
const GeminiProvider = require('./GeminiProvider');

/**
 * Factory para crear instancias de proveedores de IA
 */
class AIProviderFactory {
  /**
   * Crea un proveedor de IA basado en el tipo especificado
   * @param {string} type - Tipo de proveedor ('openai', 'anthropic', etc.)
   * @param {Object} config - Configuración para el proveedor
   * @returns {AIProvider} - Instancia del proveedor
   */
  static createProvider(type, config) {
    switch (type.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'deepseek':
        return new DeepSeekProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      default:
        throw new Error(`Proveedor de IA no soportado: ${type}`);
    }
  }

  /**
   * Obtiene el proveedor predeterminado según la configuración
   * @param {Object} config - Configuración global
   * @returns {AIProvider} - Instancia del proveedor predeterminado
   */
  static getDefaultProvider(config) {
    const providerType = config.defaultProvider || 'gemini';
    return this.createProvider(providerType, config);
  }
}

module.exports = AIProviderFactory;

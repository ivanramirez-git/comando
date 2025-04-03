/**
 * Interfaz que define las operaciones que cualquier proveedor de IA debe implementar
 */
class AIProvider {
  /**
   * Inicializa el proveedor de IA
   * @param {Object} config - Configuración para el proveedor
   */
  constructor(config) {
    if (this.constructor === AIProvider) {
      throw new Error("No se puede instanciar una clase abstracta");
    }
    this.config = config;
  }

  /**
   * Genera una respuesta basada en el prompt proporcionado
   * @param {string} prompt - El prompt para generar la respuesta
   * @returns {Promise<string>} - La respuesta generada
   */
  async generateCode(prompt) {
    throw new Error("El método generateCode debe ser implementado por las subclases");
  }

  /**
   * Verifica si la configuración del proveedor es válida
   * @returns {boolean} - true si la configuración es válida
   */
  isConfigValid() {
    throw new Error("El método isConfigValid debe ser implementado por las subclases");
  }

  /**
   * Obtiene el nombre del proveedor
   * @returns {string} - Nombre del proveedor
   */
  getName() {
    throw new Error("El método getName debe ser implementado por las subclases");
  }
}

module.exports = AIProvider;

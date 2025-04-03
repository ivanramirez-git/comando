const hljs = require('highlight.js');
const chalk = require('chalk');

/**
 * Clase para formatear la salida de la aplicación
 */
class Formatter {
  /**
   * Formatea y muestra el código con resaltado de sintaxis
   * @param {string} code - Código a formatear
   * @param {string} language - Lenguaje de programación (por defecto: bash)
   */
  static highlightCode(code, language = 'bash') {
    // Dividimos por líneas para un mejor formateo
    const lines = code.split('\n');
    lines.forEach(line => {
      // Filtrar la línea shebang de bash
      if (line.trim() === '#!/bin/bash') {
        return; // Omitir esta línea
      }

      // Resaltado básico de algunos elementos comunes en bash
      let formattedLine = line
        // Resaltar comandos comunes
        .replace(/^([\w\-\.]+)(\s|$)/g, chalk.green('$1$2'))
        // Resaltar cadenas entre comillas
        .replace(/"([^"]*)"/g, chalk.yellow('"$1"'))
        .replace(/'([^']*)'/g, chalk.yellow("'$1'"));

      console.log(formattedLine);
    });
  }

  /**
   * Limpia el código de etiquetas HTML y entidades para mostrarlo en la terminal
   * @param {string} html - Código HTML a limpiar
   * @returns {string} - Código limpio
   */
  static cleanHtmlTags(html) {
    // Eliminar todas las etiquetas HTML
    let clean = html.replace(/<\/?[^>]+(>|$)/g, '');

    // Reemplazar entidades HTML comunes
    clean = clean.replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    return clean;
  }

  /**
   * Muestra un mensaje de error
   * @param {string} message - Mensaje de error
   */
  static showError(message) {
    console.error(chalk.red(`Error: ${message}`));
  }

  /**
   * Muestra un mensaje de advertencia
   * @param {string} message - Mensaje de advertencia
   */
  static showWarning(message) {
    console.warn(chalk.yellow(`Advertencia: ${message}`));
  }

  /**
   * Muestra un mensaje de éxito
   * @param {string} message - Mensaje de éxito
   */
  static showSuccess(message) {
    console.log(chalk.green(message));
  }
}

module.exports = Formatter;

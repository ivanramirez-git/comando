const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class ConfigManager {
  constructor() {
    this.configPath = path.join(os.homedir(), '.comando', 'config.json');
    this.historyPath = path.join(os.homedir(), '.comando', 'history');
    this.ensureConfigDirectoryExists();
  }

  ensureConfigDirectoryExists() {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  loadConfig() {
    // Cargar configuración desde archivo si existe
    let fileConfig = {};
    try {
      if (fs.existsSync(this.configPath)) {
        fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.warn(chalk.yellow(`Error al cargar la configuración: ${error.message}`));
    }

    // Valores por defecto y valores de entorno
    const config = {
      // Configuración general
      defaultProvider: process.env.AI_PROVIDER || fileConfig.defaultProvider || 'gemini',
      shell: process.env.SHELL || '',

      // Configuración de OpenAI
      apiKey: process.env.OPENAI_API_KEY || fileConfig.apiKey, // Solo para OpenAI
      apiBase: process.env.OPENAI_API_BASE || fileConfig.apiBase || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || fileConfig.model || 'gpt-3.5-turbo-instruct',

      // Configuración de Anthropic
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || fileConfig.anthropicApiKey,
      anthropicApiBase: process.env.ANTHROPIC_API_BASE || fileConfig.anthropicApiBase || 'https://api.anthropic.com',
      anthropicModel: process.env.ANTHROPIC_MODEL || fileConfig.anthropicModel || 'claude-2',
      
      // Configuración de DeepSeek
      deepseekApiKey: process.env.DEEPSEEK_API_KEY || fileConfig.deepseekApiKey,
      deepseekApiBase: process.env.DEEPSEEK_API_BASE || fileConfig.deepseekApiBase || 'https://api.deepseek.com',
      deepseekModel: process.env.DEEPSEEK_MODEL || fileConfig.deepseekModel || 'deepseek-chat',
      
      // Configuración de Gemini
      geminiApiKey: process.env.GEMINI_API_KEY || fileConfig.geminiApiKey,
      geminiApiBase: process.env.GEMINI_API_BASE || fileConfig.geminiApiBase || 'https://generativelanguage.googleapis.com',
      geminiModel: process.env.GEMINI_MODEL || fileConfig.geminiModel || 'gemini-2.0-flash',

      // Otras configuraciones...
      ...fileConfig
    };

    return config;
  }

  saveConfig(config) {
    // Filtrar solo los valores que queremos guardar
    const configToSave = {
      defaultProvider: config.defaultProvider,
      apiKey: config.apiKey,
      apiBase: config.apiBase,
      model: config.model,
      anthropicApiKey: config.anthropicApiKey,
      anthropicApiBase: config.anthropicApiBase,
      anthropicModel: config.anthropicModel,
      deepseekApiKey: config.deepseekApiKey,
      deepseekApiBase: config.deepseekApiBase,
      deepseekModel: config.deepseekModel,
      geminiApiKey: config.geminiApiKey,
      geminiApiBase: config.geminiApiBase,
      geminiModel: config.geminiModel
    };

    try {
      fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2));
      return true;
    } catch (error) {
      console.error(chalk.red(`Error al guardar la configuración: ${error.message}`));
      return false;
    }
  }

  writeToHistory(code) {
    try {
      if (!fs.existsSync(path.dirname(this.historyPath))) {
        fs.mkdirSync(path.dirname(this.historyPath), { recursive: true });
      }
      fs.appendFileSync(this.historyPath, `${new Date().toISOString()}: ${code}\n\n`);
    } catch (error) {
      // Fallar silenciosamente si no podemos escribir en el historial
    }

    // También intentar escribir en el historial del shell
    this.writeToShellHistory(code);
  }

  writeToShellHistory(code) {
    let historyFile = '';

    switch (this.loadConfig().shell) {
      case '/bin/bash':
        historyFile = path.join(process.env.HOME || '', '.bash_history');
        break;
      case '/bin/zsh':
        historyFile = path.join(process.env.HOME || '', '.zsh_history');
        break;
      default:
        return; // No supported shell found
    }

    try {
      fs.appendFileSync(historyFile, `${code}\n`);
    } catch (error) {
      // Silently fail if we can't write to history
    }
  }
}

module.exports = new ConfigManager();

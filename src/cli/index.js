const { program } = require('commander');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const AIProviderFactory = require('../providers');
const configManager = require('../config/config');
const Formatter = require('../utils/formatter');

class CLI {
  constructor() {
    this.config = configManager.loadConfig();
    this.setupCommander();
  }

  setupCommander() {
    program
      .version('0.1.0')
      .description('Genera scripts de bash desde la línea de comandos')
      .argument('[prompt...]', 'Descripción del comando a ejecutar')
      .option('-y, --force', 'Ejecutar el programa generado sin pedir confirmación')
      .option('-p, --provider <provider>', 'Especificar proveedor de IA a utilizar (openai, anthropic, deepseek, gemini)')
      .option('-c, --config', 'Configurar los ajustes del CLI')
      .action((promptArgs) => {
        this.promptArgs = promptArgs;
      })
      .parse();
  }

  async run() {
    const options = program.opts();
    
    // Manejar la configuración si se solicita
    if (options.config) {
      await this.configureSettings();
      return;
    }
    
    // Verificar si se proporciona un prompt
    if (!this.promptArgs || this.promptArgs.length === 0) {
      this.showUsage();
      return;
    }
    
    const prompt = this.promptArgs.join(' ');
    const providerType = options.provider || this.config.defaultProvider || 'openai';
    
    try {
      // Crear el proveedor de IA según la configuración
      const aiProvider = AIProviderFactory.createProvider(providerType, this.config);
      
      // Verificar si la configuración es válida
      if (!aiProvider.isConfigValid()) {
        Formatter.showError(`El proveedor ${aiProvider.getName()} requiere una API key. Por favor, configura la CLI con 'comando --config'.`);
        process.exit(1);
      }
      
      // Generar el código con el proveedor seleccionado
      await this.generateAndRunCode(aiProvider, prompt, options);
      
    } catch (error) {
      Formatter.showError(error.response?.data?.error?.message || error.message);
      process.exit(1);
    }
  }
  
  showUsage() {
    console.log(chalk.yellow('⚠️  Debe proporcionar un prompt para generar un comando.'));
    console.log('\nUso básico:');
    console.log(chalk.green('  comando "buscar todos los archivos que contienen texto"'));
    console.log('\nOpciones disponibles:');
    console.log(chalk.cyan('  -y, --force      ') + 'Ejecutar el comando generado sin pedir confirmación');
    console.log(chalk.cyan('  -p, --provider   ') + 'Especificar el proveedor de IA (openai, anthropic, deepseek, gemini)');
    console.log(chalk.cyan('  -c, --config     ') + 'Configurar los ajustes de la aplicación');
    console.log(chalk.cyan('  -h, --help       ') + 'Mostrar esta ayuda');
    console.log(chalk.cyan('  -V, --version    ') + 'Mostrar la versión');
    
    console.log('\nEjemplos:');
    console.log(chalk.green('  comando "listar archivos ordenados por tamaño"'));
    console.log(chalk.green('  comando --provider gemini "encontrar procesos que consumen más memoria"'));
    console.log(chalk.green('  comando --force "crear un backup de este directorio"'));
  }
  
  async generateAndRunCode(aiProvider, prompt, options) {
    // Iniciar spinner de carga
    const spinner = ora(`Generando comando con ${aiProvider.getName()}...`).start();
    
    try {
      // Generar código con el proveedor de IA
      const code = await aiProvider.generateCode(prompt);
      spinner.succeed(chalk.green(`¡Código generado con ${aiProvider.getName()}!`));
      
      // Mostrar el código con resaltado de sintaxis
      Formatter.highlightCode(code);
      
      // Preguntar si se quiere ejecutar el código
      let shouldRun = options.force;
      if (!shouldRun) {
        const answer = await inquirer.prompt([{
          type: 'confirm',
          name: 'execute',
          message: chalk.gray('>> ¿Ejecutar el programa generado?'),
          default: true,
          prefix: ''  // Esto elimina el signo de interrogación
        }]);
        shouldRun = answer.execute;
      }
      
      if (shouldRun) {
        // Guardar el comando en el historial
        configManager.writeToHistory(code);
        
        // Ejecutar el código
        await this.executeCode(code);
      }
    } catch (error) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  }
  
  async executeCode(code) {
    // Mostrar spinner durante la ejecución
    const executeSpinner = ora('Ejecutando...').start();
    
    // Crear un archivo temporal para el script
    const tempScriptPath = path.join(__dirname, '..', '..', '.tmp.sh');
    fs.writeFileSync(tempScriptPath, code);
    fs.chmodSync(tempScriptPath, '755');

    // Ejecutar el script
    return new Promise((resolve, reject) => {
      const child = spawn('bash', ['-c', code], {
        stdio: ['inherit', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (exitCode) => {
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(tempScriptPath);
        } catch (err) {
          // Ignorar error si no se puede eliminar
        }
        
        if (exitCode === 0) {
          executeSpinner.succeed(chalk.green('Comando ejecutado correctamente'));
          if (stdout) console.log(stdout);
          resolve();
        } else {
          executeSpinner.fail(chalk.red('El programa ha generado un error.'));
          if (stderr) console.error(stderr);
          reject(new Error(`Código de salida: ${exitCode}`));
        }
      });
    });
  }
  
  async configureSettings() {
    const currentConfig = configManager.loadConfig();
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultProvider',
        message: 'Selecciona el proveedor de IA predeterminado:',
        choices: ['openai', 'anthropic', 'deepseek', 'gemini'],
        default: currentConfig.defaultProvider || 'gemini'
      },
      {
        type: 'input',
        name: 'apiKey',
        message: 'API Key de OpenAI:',
        default: currentConfig.apiKey || '',
        when: (answers) => answers.defaultProvider === 'openai'
      },
      {
        type: 'input',
        name: 'anthropicApiKey',
        message: 'API Key de Anthropic:',
        default: currentConfig.anthropicApiKey || '',
        when: (answers) => answers.defaultProvider === 'anthropic'
      },
      {
        type: 'input',
        name: 'deepseekApiKey',
        message: 'API Key de DeepSeek:',
        default: currentConfig.deepseekApiKey || '',
        when: (answers) => answers.defaultProvider === 'deepseek'
      },
      {
        type: 'input',
        name: 'geminiApiKey',
        message: 'API Key de Google Gemini:',
        default: currentConfig.geminiApiKey || '',
        when: (answers) => answers.defaultProvider === 'gemini'
      }
    ]);
    
    // Actualizar configuración
    const newConfig = { ...currentConfig, ...answers };
    
    if (configManager.saveConfig(newConfig)) {
      Formatter.showSuccess('Configuración guardada correctamente.');
    } else {
      Formatter.showError('Error al guardar la configuración.');
    }
  }
}

module.exports = new CLI();

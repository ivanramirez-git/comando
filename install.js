#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const https = require('https');
const crypto = require('crypto');

async function main() {
  // Determinar si estamos en macOS u otro sistema
  const isMac = process.platform === 'darwin';

  // Definir la estructura de directorios
  const homeDir = os.homedir();
  const comandoDir = path.join(homeDir, '.comando');
  const binDir = path.join(comandoDir, 'bin');
  const binPath = path.join(binDir, 'comando');

  console.log(`Creando directorios de instalación en ${comandoDir}...`);

  // Crear la estructura de directorios
  try {
    fs.mkdirSync(comandoDir, { recursive: true });
    fs.mkdirSync(binDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Error al crear directorios: ${err.message}`);
      process.exit(1);
    }
  }

  // Crear el archivo binario
  console.log('Creando binario ejecutable...');
  try {
    // Contenido del script ejecutable con modo producción y sin warnings
    const binContent = `#!/usr/bin/env bash
# Script generado por el instalador de Comando

# Configurar NODE_ENV=production y desactivar warnings
export NODE_ENV=production
exec node --no-warnings --no-deprecation "${path.resolve(__dirname)}/index.js" "$@"
`;

    // Escribir el archivo binario
    fs.writeFileSync(binPath, binContent);
    // Hacer el binario ejecutable
    fs.chmodSync(binPath, '755');
    console.log(`Binario creado en ${binPath}`);

  } catch (err) {
    console.error(`Error al crear el binario: ${err.message}`);
    process.exit(1);
  }

  // Determinar el archivo de perfil de shell
  let profilePath;
  const shell = process.env.SHELL || '';

  if (shell.includes('zsh')) {
    profilePath = path.join(homeDir, '.zshrc');
  } else if (shell.includes('bash')) {
    profilePath = path.join(homeDir, '.bashrc');
  } else if (shell.includes('fish')) {
    profilePath = path.join(homeDir, '.config', 'fish', 'config.fish');
  } else {
    console.warn(`No se pudo detectar el shell, agregue manualmente ${binDir} a su PATH.`);
  }

  // Agregar el directorio bin al PATH si es necesario
  if (profilePath) {
    try {
      const profileContent = fs.readFileSync(profilePath, 'utf8');
      const pathEntry = `export PATH="$PATH:${binDir}"`;

      if (!profileContent.includes(binDir)) {
        fs.appendFileSync(profilePath, `\n# Agregado por comando installer\n${pathEntry}\n`);
        console.log(`Se agregó ${binDir} al PATH en ${profilePath}`);
        console.log(`Para aplicar los cambios, ejecute: source ${profilePath}`);
      }
    } catch (err) {
      console.warn(`No se pudo modificar ${profilePath}: ${err.message}`);
    }
  }

  // Instalar dependencias
  try {
    console.log('Instalando dependencias del proyecto...');
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });

    // Registrar la instalación en el sistema de contactos
    try {
      await registerInstallation();
      console.log('Instalación registrada en el sistema de contactos.');
    } catch (err) {
      console.log(`Nota: No se pudo registrar la instalación en el sistema: ${err.message}`);
    }

    console.log('Instalación completada con éxito.');
    console.log(`\nPara utilizar comando, reinicie su terminal o ejecute:`);
    console.log(`  source ${profilePath}`);
    console.log(`\nLuego podrá usar: comando para saber cuanto es 1+1`);
  } catch (err) {
    console.error(`Error durante la instalación: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Genera un identificador único usando crypto nativo
 * @returns {string} Un identificador único
 */
function generateUniqueId(length = 8) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Registra la instalación en el sistema de contactos
 * @returns {Promise<void>}
 */
async function registerInstallation() {
  // Recopilar información sobre la instalación
  const installationInfo = {
    nombre: 'Instalación Comando',
    correo: `installation-${generateUniqueId()}@comando.app`,
    mensaje: `Nueva instalación de Comando:\n- Sistema: ${os.platform()} ${os.release()}\n- Arquitectura: ${os.arch()}\n- Versión Node: ${process.version}\n- Fecha: ${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Usar el módulo https nativo para enviar la solicitud
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(installationInfo);
    
    const options = {
      hostname: 'api.freeloz.com',
      path: '/contactos',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`Error del servidor: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(data);
    req.end();
  });
}

// Ejecutar la función principal y manejar cualquier error
main().catch(err => {
  console.error(`Error inesperado: ${err.message}`);
  process.exit(1);
});

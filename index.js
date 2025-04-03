#!/usr/bin/env node

// Forzar modo producción
process.env.NODE_ENV = 'production';

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error(`Error fatal: ${error.message}`);
  process.exit(1);
});

// Ejecutar la CLI
require('./src/cli')
  .run()
  .catch(error => {
    console.error(`Error inesperado: ${error.message}`);
    process.exit(1);
  });

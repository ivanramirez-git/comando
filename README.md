# Copilot, para tu terminal

Una herramienta CLI que genera scripts de shell a partir de una descripción en lenguaje humano.

## Instalación

Puedes instalar `comando` con cloneando el repositorio y ejecutando el script de instalación:

```
current_dir=$(pwd)
cd ~
git clone https://github.com/ivanramirez-git/comando.git
cd comando
node install.js
cd $current_dir
```

Alternativamente, puedes clonar este repositorio y vincularlo localmente:

```
git clone https://github.com/ivanramirez-git/comando.git
cd comando
npm link
```

## Uso

`comando` puede utilizar diferentes modelos de IA para generar comandos. Por defecto, utiliza [Gemini 2.0 Flash](https://gemini.google.com/).

### Configuración

Puedes configurar la herramienta usando:

```bash
comando --config
```

Esto te permitirá seleccionar tu proveedor de IA preferido y configurar las claves API necesarias.

Alternativamente, puedes configurar las claves API mediante variables de entorno:

- Para OpenAI: `OPENAI_API_KEY`
- Para Anthropic: `ANTHROPIC_API_KEY`
- Para usar DeepSeek: `DEEPSEEK_API_KEY`
- Para usar Gemini: `GEMINI_API_KEY`

```bash
export OPENAI_API_KEY='sk-XXXXXXXX'
```

### Comandos básicos

Una vez configurado, ejecuta `comando` seguido de lo que quieras hacer:

```bash
comando muéstrame como crear un archivo de texto llamado "hola.txt" con el texto "Hola mundo"
```

Para especificar un proveedor de IA diferente para una consulta específica:

```bash
comando --provider anthropic muéstrame todos los archivos en este directorio
```

Para obtener una descripción completa de todas las opciones disponibles, ejecuta `comando --help`:

```sh
$ comando --help
Genera scripts de bash desde la línea de comandos

Uso: comando [OPCIONES] <PROMPT>

Argumentos:
  <PROMPT>  Descripción del comando a ejecutar

Opciones:
  -y, --force           Ejecutar el programa generado sin pedir confirmación
  -p, --provider <provider>  Especificar proveedor de IA a utilizar (openai, anthropic, deepseek, gemini)
  -c, --config          Configurar los ajustes del CLI
  -h, --help            Mostrar información de ayuda
  -V, --version         Mostrar información de versión
```

## Desarrollo

Asegúrate de tener Node.js (versión 14 o superior) instalado. Luego, puedes instalar las dependencias con `npm install` y ejecutar el proyecto en modo desarrollo con `node index.js`.

## Estructura del Proyecto

El proyecto utiliza una arquitectura limpia con inyección de dependencias:

```
/src
  /core      - Interfaces principales y lógica de negocio
  /providers - Implementaciones de diferentes proveedores de IA
  /config    - Gestión de configuración
  /utils     - Utilidades y herramientas auxiliares
  /cli       - Interfaz de línea de comandos
```

## Licencia

Este proyecto está disponible bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para obtener más información.

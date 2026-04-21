# Constants Directory

Este directorio contiene archivos de configuración y constantes centralizadas para la aplicación.

## AppConfig.ts

Archivo centralizado para la configuración de la aplicación, incluyendo:

- **Número de versión de la app**
- Nombre de la aplicación
- Información de copyright
- Variables de entorno

### Uso

```typescript
import { AppConfig, getVersionString, getCopyrightText } from '../constants/AppConfig';

// Obtener versión
const version = AppConfig.VERSION; // "0.0.1"
const versionWithPrefix = getVersionString(); // "v0.0.1"
const versionWithoutPrefix = getVersionString(false); // "0.0.1"

// Obtener nombre de la app
const appName = AppConfig.APP_NAME; // "Ice Cream Management"

// Obtener copyright
const copyright = getCopyrightText(); // "© 2024 Ice Cream Management"
```

### Actualizar la versión de la aplicación

Para actualizar la versión de la aplicación, edita únicamente el archivo `AppConfig.ts`:

```typescript
export const AppConfig = {
  VERSION: '1.0.0', // ← Cambia esta línea
  // ...
};
```

**No es necesario actualizar el `package.json`** - toda la lógica de versión se maneja aquí.

### Helpers disponibles

- `getVersionString(includePrefix?: boolean)` - Retorna la versión con o sin prefijo "v"
- `getCopyrightText()` - Retorna el texto de copyright formateado
- `getAppTitle()` - Retorna el título completo de la app con versión

## Otros archivos de constantes

- **Fonts.ts** - Configuración de fuentes y tamaños
- **utils.ts** - Utilidades y constantes generales (CURRENCY_SYMBOL, screens, etc.)
- **navigation/screens.ts** - Nombres de pantallas para navegación

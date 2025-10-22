# Sistema de Migraciones - Ice Cream Management App

## ¿Qué es esto?

Este es un sistema de migraciones similar a Prisma o TypeORM, pero adaptado para React Native con SQLite. Permite gestionar cambios en el esquema de la base de datos de forma controlada y versionada.

## ¿Cómo funciona?

1. **Tabla de control**: Se crea una tabla `migrations` que registra qué migraciones se han ejecutado
2. **Archivos de migración**: Cada cambio en la BD se define en un archivo separado
3. **Ejecución automática**: Al presionar el botón "Ejecutar Migraciones", solo se ejecutan las pendientes
4. **Reversibilidad**: Cada migración tiene un método `up` (aplicar) y `down` (revertir)

## Estructura de una migración

```typescript
import {Migration} from '../database/Migration.interface';

export const migration_XXX_nombre_descriptivo: Migration = {
  version: XXX, // Número secuencial único
  name: 'nombre_descriptivo',

  // Aplicar cambios
  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'CREATE TABLE ...',
          [],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  },

  // Revertir cambios
  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE ...',
          [],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  },
};
```

## Cómo agregar una nueva migración

### Paso 1: Crear el archivo de migración

Crea un archivo en `src/migrations/` con el formato:
```
00X_nombre_descriptivo.ts
```

Donde `X` es el siguiente número secuencial disponible.

### Paso 2: Definir la migración

```typescript
import {Migration} from '../database/Migration.interface';

export const migration_002_add_user_preferences: Migration = {
  version: 2,
  name: 'add_user_preferences',

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        // Crear nueva tabla
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          [],
          () => {
            console.log('Tabla user_preferences creada');
            resolve();
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS user_preferences',
          [],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  },
};
```

### Paso 3: Registrar en el índice

Edita `src/migrations/index.ts`:

```typescript
import {Migration} from '../database/Migration.interface';
import {migration_001_create_product_schedules} from './001_create_product_schedules';
import {migration_002_add_user_preferences} from './002_add_user_preferences'; // Importar nueva

export const allMigrations: Migration[] = [
  migration_001_create_product_schedules,
  migration_002_add_user_preferences, // Agregar aquí
];
```

### Paso 4: Ejecutar desde la app

1. Ir a la pantalla "Backup" desde el menú lateral
2. Presionar el botón "Ejecutar Migraciones"
3. Confirmar la ejecución

## Ejemplos de operaciones comunes

### Crear una nueva tabla

```typescript
up: async (db: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS nueva_tabla (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        [],
        () => resolve(),
        (_: any, error: any) => reject(error),
      );
    });
  });
},
```

### Agregar una columna

```typescript
up: async (db: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        'ALTER TABLE product ADD COLUMN nueva_columna TEXT DEFAULT NULL',
        [],
        () => resolve(),
        (_: any, error: any) => reject(error),
      );
    });
  });
},
```

### Insertar datos iniciales

```typescript
up: async (db: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `INSERT INTO configuracion (key, value) VALUES
         ('app_version', '1.0.0'),
         ('theme', 'dark')`,
        [],
        () => resolve(),
        (_: any, error: any) => reject(error),
      );
    });
  });
},
```

### Múltiples operaciones en una migración

```typescript
up: async (db: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      // Operación 1: Crear tabla
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tabla1 (...)',
        [],
        () => {
          // Operación 2: Insertar datos
          tx.executeSql(
            'INSERT INTO tabla1 (...) VALUES (...)',
            [],
            () => {
              // Operación 3: Crear índice
              tx.executeSql(
                'CREATE INDEX idx_nombre ON tabla1(nombre)',
                [],
                () => resolve(),
                (_: any, error: any) => reject(error),
              );
            },
            (_: any, error: any) => reject(error),
          );
        },
        (_: any, error: any) => reject(error),
      );
    });
  });
},
```

## Migración Existente: add_product_schedules

La primera migración (001) agrega campos de horario directamente a la tabla `product`:

### Campos agregados a la tabla `product`:
- `monday`: Disponible el lunes (0/1, default: 1)
- `tuesday`: Disponible el martes (0/1, default: 1)
- `wednesday`: Disponible el miércoles (0/1, default: 1)
- `thursday`: Disponible el jueves (0/1, default: 1)
- `friday`: Disponible el viernes (0/1, default: 1)
- `saturday`: Disponible el sábado (0/1, default: 1)
- `sunday`: Disponible el domingo (0/1, default: 1)

**Por defecto**: Todos los productos están disponibles todos los días (todos los campos = 1)

### Ejemplo de uso:

```sql
-- Producto disponible solo lunes, miércoles y viernes
UPDATE product
SET monday = 1, tuesday = 0, wednesday = 1,
    thursday = 0, friday = 1, saturday = 0, sunday = 0
WHERE product_id = 1;

-- Producto solo disponible fines de semana
UPDATE product
SET monday = 0, tuesday = 0, wednesday = 0, thursday = 0,
    friday = 0, saturday = 1, sunday = 1
WHERE product_id = 2;

-- Ver horarios de un producto
SELECT name, monday, tuesday, wednesday, thursday, friday, saturday, sunday
FROM product
WHERE product_id = 1;
```

## Buenas prácticas

1. **Nunca modifiques una migración ya ejecutada**: Crea una nueva
2. **Usa números secuenciales**: 001, 002, 003, etc.
3. **Nombres descriptivos**: Que indiquen qué hace la migración
4. **Siempre implementa `down`**: Para poder revertir si es necesario
5. **Prueba antes en desarrollo**: Asegúrate que funcione antes de distribuir
6. **Haz backup antes**: Siempre crea un backup antes de ejecutar migraciones

## Troubleshooting

### "La migración ya se ejecutó"
- El sistema detecta automáticamente las migraciones ejecutadas
- No hace nada si todas están aplicadas

### "Error al ejecutar migración"
- Revisa los logs en la consola
- El error muestra qué migración falló
- Las migraciones anteriores quedan aplicadas
- Corrige el error y vuelve a intentar

### "Necesito revertir una migración"
- Actualmente no hay UI para revertir
- Puedes hacerlo manualmente desde código usando `migrationService.rollbackMigration()`

## Roadmap futuro

- [ ] UI para ver migraciones ejecutadas
- [ ] Botón para revertir última migración
- [ ] Exportar/importar migraciones entre dispositivos
- [ ] Validación de integridad antes de ejecutar

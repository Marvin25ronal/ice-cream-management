# Sistema de Migraciones - Documentación

## 📁 Estructura de Carpetas

```
src/
├── database/
│   ├── Migration.interface.ts      # Interface para definir migraciones
│   └── MigrationService.ts         # Lógica del sistema de migraciones
│
└── migrations/
    ├── README.md                    # Guía completa de uso
    ├── index.ts                     # Registro de todas las migraciones
    └── 001_create_product_schedules.ts  # Primera migración
```

## 🎯 Organización

### `src/database/` - Lógica del Sistema
Contiene la infraestructura y servicios para manejar migraciones:
- **Migration.interface.ts**: Define el tipo `Migration` con `version`, `name`, `up()`, `down()`
- **MigrationService.ts**: Servicio que ejecuta, registra y controla las migraciones

### `src/migrations/` - Archivos de Migración
Contiene solo los archivos de migración individuales:
- **index.ts**: Exporta array `allMigrations[]` con todas las migraciones
- **00X_nombre.ts**: Cada archivo de migración numerado secuencialmente

## 🚀 Uso Rápido

### Para ejecutar migraciones:
1. Abre la app
2. Menú → "Backup"
3. Presiona "Ejecutar Migraciones"

### Para crear nueva migración:
1. Crea `src/migrations/002_nombre.ts`
2. Importa `Migration` de `../database/Migration.interface`
3. Agrégala a `src/migrations/index.ts`
4. Ejecuta desde la app

## 📊 Migración Actual

### 001_add_product_schedules
Agrega campos de horario directamente a la tabla `product`:

**Campos agregados a la tabla `product`:**
- `monday` - Disponible el lunes (0/1, default: 1)
- `tuesday` - Disponible el martes (0/1, default: 1)
- `wednesday` - Disponible el miércoles (0/1, default: 1)
- `thursday` - Disponible el jueves (0/1, default: 1)
- `friday` - Disponible el viernes (0/1, default: 1)
- `saturday` - Disponible el sábado (0/1, default: 1)
- `sunday` - Disponible el domingo (0/1, default: 1)

**Por defecto**: Todos los productos están disponibles todos los días (todos los campos = 1)

**Uso:**
```sql
-- Producto solo disponible lunes, miércoles y viernes
UPDATE product
SET monday=1, tuesday=0, wednesday=1, thursday=0, friday=1, saturday=0, sunday=0
WHERE product_id = 1;

-- Producto solo disponible fines de semana
UPDATE product
SET monday=0, tuesday=0, wednesday=0, thursday=0, friday=0, saturday=1, sunday=1
WHERE product_id = 2;
```

## 🎨 UI Modernizada

La pantalla de mantenimiento (`MaintenancePage`) ahora incluye:
- ✅ Diseño moderno con gradientes vibrantes
- ✅ Cards con sombras y efectos visuales
- ✅ Íconos mejorados con círculos destacados
- ✅ Badges para estados de procesamiento
- ✅ Diseño responsivo para tablets
- ✅ Separación clara de secciones (Migraciones / Backups)

**Colores por acción:**
- 🟣 Migraciones: Purple gradient
- 🟢 Crear Backup: Green gradient
- 🔵 Seleccionar Archivo: Blue gradient
- 🔴 Restaurar Backup: Red gradient (warning)

## 🔧 Importaciones Correctas

### En archivos de migración (`src/migrations/*.ts`):
```typescript
import {Migration} from '../database/Migration.interface';
```

### En `src/migrations/index.ts`:
```typescript
import {Migration} from '../database/Migration.interface';
import {migration_001_create_product_schedules} from './001_create_product_schedules';
```

### En páginas que usan migraciones:
```typescript
import {migrationService} from '../database/MigrationService';
import {allMigrations} from '../migrations';
```

## ✨ Características

1. **Automático**: Solo ejecuta migraciones pendientes
2. **Versionado**: Tabla `migrations` registra las ejecutadas
3. **Seguro**: Si una falla, detiene la ejecución
4. **Reversible**: Método `down()` para revertir
5. **UI Intuitiva**: Botón simple en la app

## 📝 Ejemplo de Nueva Migración

```typescript
// src/migrations/002_add_product_rating.ts
import {Migration} from '../database/Migration.interface';

export const migration_002_add_product_rating: Migration = {
  version: 2,
  name: 'add_product_rating',

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'ALTER TABLE product ADD COLUMN rating REAL DEFAULT 0',
          [],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  },

  down: async (db: any): Promise<void> => {
    // SQLite no soporta DROP COLUMN
    return Promise.resolve();
  },
};
```

Luego agregarlo en `src/migrations/index.ts`:
```typescript
export const allMigrations: Migration[] = [
  migration_001_create_product_schedules,
  migration_002_add_product_rating, // ← Nuevo
];
```

## 🎓 Más Información

Ver documentación completa en `src/migrations/README.md`

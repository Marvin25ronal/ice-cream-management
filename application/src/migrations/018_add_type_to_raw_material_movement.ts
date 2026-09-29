import { Migration } from '../database/Migration.interface';

/**
 * Migración 018: Agrega tipo a movimientos de materia prima
 *
 * `type`: 'purchase' (entrada por compra, ver "Agregar stock") o
 * 'adjustment' (rectificación de conteo físico, ej. producto dañado o
 * merma), mismo concepto que cash_register.type. Los movimientos
 * existentes se asumen compras.
 */
export const migration_018_add_type_to_raw_material_movement: Migration = {
  version: 18,
  name: 'add_type_to_raw_material_movement',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            "ALTER TABLE raw_material_movement ADD COLUMN type TEXT NOT NULL DEFAULT 'purchase'",
            [],
            () => {
              console.log('Columna type agregada a raw_material_movement');
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al agregar type:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 018:', error);
          reject(error);
        },
      );
    });
  },

  down: async (): Promise<void> => {
    // SQLite no soporta DROP COLUMN de forma directa; se deja sin revertir.
    return Promise.resolve();
  },
};

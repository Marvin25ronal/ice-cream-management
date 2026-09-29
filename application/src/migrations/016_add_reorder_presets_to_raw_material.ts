import { Migration } from '../database/Migration.interface';

/**
 * Migración 016: Agrega presets de recompra a materia prima
 *
 * `reorder_presets`: cantidades típicas en las que se compra el insumo
 * (ej. "[20,30,50]" para bolsas de conos de esos tamaños), guardadas como
 * JSON en un TEXT. Permite seleccionar la cantidad al reabastecer en vez
 * de escribirla cada vez. No incluye precio a propósito: el costo se
 * ingresa en cada compra porque cambia según el proveedor.
 */
export const migration_016_add_reorder_presets_to_raw_material: Migration = {
  version: 16,
  name: 'add_reorder_presets_to_raw_material',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            "ALTER TABLE raw_material ADD COLUMN reorder_presets TEXT NOT NULL DEFAULT '[]'",
            [],
            () => {
              console.log('Columna reorder_presets agregada a raw_material');
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al agregar reorder_presets:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 016:', error);
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

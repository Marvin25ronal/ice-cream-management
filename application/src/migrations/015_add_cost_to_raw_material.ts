import { Migration } from '../database/Migration.interface';

/**
 * Migración 015: Agrega costo a materia prima
 *
 * `raw_material.avg_cost`: costo promedio ponderado por unidad, recalculado
 * en cada compra (ver RawMaterialService.registerMovement). Permite saber
 * el valor del inventario y, más adelante, el costo de producción de cada
 * producto según la materia prima que consuma.
 *
 * `raw_material_movement.unit_cost`: costo por unidad pagado en esa
 * compra específica, para auditar de dónde salió el costo promedio.
 */
export const migration_015_add_cost_to_raw_material: Migration = {
  version: 15,
  name: 'add_cost_to_raw_material',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'ALTER TABLE raw_material ADD COLUMN avg_cost REAL NOT NULL DEFAULT 0',
            [],
            () => {
              console.log('Columna avg_cost agregada a raw_material');
              tx.executeSql(
                'ALTER TABLE raw_material_movement ADD COLUMN unit_cost REAL',
                [],
                () => {
                  console.log(
                    'Columna unit_cost agregada a raw_material_movement',
                  );
                  resolve();
                },
                (_: any, error: any) => {
                  console.error('Error al agregar unit_cost:', error);
                  reject(error);
                },
              );
            },
            (_: any, error: any) => {
              console.error('Error al agregar avg_cost:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 015:', error);
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

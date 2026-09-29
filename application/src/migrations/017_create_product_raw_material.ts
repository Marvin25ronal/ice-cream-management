import { Migration } from '../database/Migration.interface';

/**
 * Migración 017: Crear tabla de receta producto-materia prima
 *
 * `product_raw_material` guarda cuánta materia prima consume cada
 * producto por unidad vendida (ej. "Helado 1 bola" -> 1 Cono). Es la base
 * para descontar el inventario automáticamente al cobrar una orden.
 */
export const migration_017_create_product_raw_material: Migration = {
  version: 17,
  name: 'create_product_raw_material',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS product_raw_material (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              product_id INTEGER NOT NULL REFERENCES product(product_id),
              raw_material_id INTEGER NOT NULL REFERENCES raw_material(raw_material_id),
              quantity REAL NOT NULL
            )`,
            [],
            () => {
              console.log('Tabla product_raw_material creada exitosamente');
              resolve();
            },
            (_: any, error: any) => {
              console.error(
                'Error al crear tabla product_raw_material:',
                error,
              );
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 017:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS product_raw_material',
          [],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  },
};

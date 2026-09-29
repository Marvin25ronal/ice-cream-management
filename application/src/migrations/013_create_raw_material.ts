import { Migration } from '../database/Migration.interface';

/**
 * Migración 013: Crear tablas de materia prima (insumos)
 *
 * `raw_material`: catálogo de insumos (ej. "Cono", "Vaso 8oz") con su
 * stock actual y unidad de medida.
 * `raw_material_movement`: bitácora de entradas (compras) y ajustes de
 * cada insumo, para poder auditar cómo llegó el stock a su valor actual.
 */
export const migration_013_create_raw_material: Migration = {
  version: 13,
  name: 'create_raw_material',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS raw_material (
              raw_material_id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              unit TEXT NOT NULL DEFAULT 'Unidad',
              stock REAL NOT NULL DEFAULT 0,
              active INTEGER NOT NULL DEFAULT 1,
              "order" INTEGER NOT NULL DEFAULT 0,
              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
            [],
            () => {
              console.log('Tabla raw_material creada exitosamente');
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS raw_material_movement (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  raw_material_id INTEGER NOT NULL REFERENCES raw_material(raw_material_id),
                  quantity REAL NOT NULL,
                  reason TEXT,
                  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  user_id INTEGER
                )`,
                [],
                () => {
                  console.log(
                    'Tabla raw_material_movement creada exitosamente',
                  );
                  resolve();
                },
                (_: any, error: any) => {
                  console.error(
                    'Error al crear tabla raw_material_movement:',
                    error,
                  );
                  reject(error);
                },
              );
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla raw_material:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 013:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS raw_material_movement',
          [],
          () => {
            tx.executeSql(
              'DROP TABLE IF EXISTS raw_material',
              [],
              () => resolve(),
              (_: any, error: any) => reject(error),
            );
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  },
};

import { Migration } from '../database/Migration.interface';

/**
 * Migración 014: Agrega foto y descripción a materia prima
 *
 * `image`: ruta local de la fotografía (filesystem), mismo patrón que
 * Product.image. `description`: para qué se usa el insumo, ej. "Se usa
 * para servir helados de 1 y 2 bolas".
 */
export const migration_014_add_image_description_to_raw_material: Migration = {
  version: 14,
  name: 'add_image_description_to_raw_material',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'ALTER TABLE raw_material ADD COLUMN image TEXT',
            [],
            () => {
              console.log('Columna image agregada a raw_material');
              tx.executeSql(
                'ALTER TABLE raw_material ADD COLUMN description TEXT',
                [],
                () => {
                  console.log('Columna description agregada a raw_material');
                  resolve();
                },
                (_: any, error: any) => {
                  console.error('Error al agregar description:', error);
                  reject(error);
                },
              );
            },
            (_: any, error: any) => {
              console.error('Error al agregar image:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 014:', error);
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

import { Migration } from '../database/Migration.interface';

/**
 * Migración 009: Crear tabla de estado de la app (key-value)
 *
 * Tabla genérica chica para guardar valores simples que deben persistir
 * entre aperturas de la app (ej. usuario activo actual y la fecha en que
 * se seleccionó), sin depender de una librería externa de storage.
 */
export const migration_009_create_app_state: Migration = {
  version: 9,
  name: 'create_app_state',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS app_state (
              key TEXT PRIMARY KEY,
              value TEXT
            )`,
            [],
            () => {
              console.log('Tabla app_state creada exitosamente');
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla app_state:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 009:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS app_state',
          [],
          () => {
            console.log('Tabla app_state eliminada');
            resolve();
          },
          (_: any, error: any) => {
            reject(error);
          },
        );
      });
    });
  },
};

import { Migration } from '../database/Migration.interface';

/**
 * Migración 008: Crear tabla de sesiones de usuario (registro de llegada)
 *
 * Guarda, una vez por usuario por día, la hora a la que fue seleccionado
 * por primera vez esa fecha ("hora de llegada").
 */
export const migration_008_create_user_sessions: Migration = {
  version: 8,
  name: 'create_user_sessions',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS user_session (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER NOT NULL,
              date TEXT NOT NULL,
              arrival_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(user_id, date),
              FOREIGN KEY (user_id) REFERENCES user(user_id)
            )`,
            [],
            () => {
              console.log('Tabla user_session creada exitosamente');
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla user_session:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 008:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS user_session',
          [],
          () => {
            console.log('Tabla user_session eliminada');
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

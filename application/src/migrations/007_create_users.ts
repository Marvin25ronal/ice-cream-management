import { Migration } from '../database/Migration.interface';

/**
 * Migración 007: Crear tabla de usuarios
 *
 * Usuarios simples (sin contraseña) para saber quién está operando la app.
 * Se siembran 3 usuarios iniciales.
 */
export const migration_007_create_users: Migration = {
  version: 7,
  name: 'create_users',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS user (
              user_id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              active INTEGER NOT NULL DEFAULT 1,
              "order" INTEGER NOT NULL DEFAULT 0
            )`,
            [],
            () => {
              console.log('Tabla user creada exitosamente');
              tx.executeSql(
                `INSERT INTO user (name, active, "order") VALUES
                  ('Usuario 1', 1, 0),
                  ('Usuario 2', 1, 1),
                  ('Usuario 3', 1, 2)`,
                [],
                () => {
                  console.log('Usuarios iniciales creados');
                  resolve();
                },
                (_: any, error: any) => {
                  console.error('Error al sembrar usuarios iniciales:', error);
                  reject(error);
                },
              );
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla user:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 007:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS user',
          [],
          () => {
            console.log('Tabla user eliminada');
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

import { Migration } from '../database/Migration.interface';

/**
 * Migración 006: Crear tabla de control de caja
 *
 * Crea la tabla `cash_register` para registrar la apertura de caja
 * (saldo inicial de un turno) y las rectificaciones/ajustes posteriores
 * del efectivo físico contado.
 */
export const migration_006_create_cash_register: Migration = {
  version: 6,
  name: 'create_cash_register',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS cash_register (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              amount REAL NOT NULL,
              type TEXT NOT NULL CHECK(type IN ('opening', 'adjustment')),
              reason TEXT,
              date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`,
            [],
            () => {
              console.log('Tabla cash_register creada exitosamente');
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla cash_register:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 006:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS cash_register',
          [],
          () => {
            console.log('Tabla cash_register eliminada');
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

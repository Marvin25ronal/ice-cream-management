import {Migration} from '../database/Migration.interface';

/**
 * Migración 004: Crear tabla de gastos
 *
 * Crea la tabla `expense` para registrar gastos diarios.
 * Tiene FK hacia expense_type.
 */
export const migration_004_create_expenses: Migration = {
  version: 4,
  name: 'create_expenses',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS expense (
              expense_id INTEGER PRIMARY KEY AUTOINCREMENT,
              amount REAL NOT NULL,
              date DATETIME NOT NULL,
              notes TEXT,
              expense_type_id INTEGER NOT NULL,
              FOREIGN KEY (expense_type_id) REFERENCES expense_type(expense_type_id)
            )`,
            [],
            () => {
              console.log('Tabla expense creada exitosamente');
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla expense:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 004:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS expense',
          [],
          () => {
            console.log('Tabla expense eliminada');
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

import { Migration } from '../database/Migration.interface';

/**
 * Migración 010: Etiquetar órdenes y movimientos de caja con el usuario
 *
 * Agrega la columna user_id a "Order" y a cash_register para saber quién
 * hizo cada venta / apertura / rectificación de caja. Nullable porque las
 * filas existentes no tienen usuario asociado.
 */
export const migration_010_add_user_id_to_order_and_cash_register: Migration = {
  version: 10,
  name: 'add_user_id_to_order_and_cash_register',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'ALTER TABLE "Order" ADD COLUMN user_id INTEGER',
            [],
            () => {
              console.log('Columna user_id agregada a Order');
              tx.executeSql(
                'ALTER TABLE cash_register ADD COLUMN user_id INTEGER',
                [],
                () => {
                  console.log('Columna user_id agregada a cash_register');
                  resolve();
                },
                (_: any, error: any) => {
                  console.error('Error al alterar tabla cash_register:', error);
                  reject(error);
                },
              );
            },
            (_: any, error: any) => {
              console.error('Error al alterar tabla Order:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 010:', error);
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

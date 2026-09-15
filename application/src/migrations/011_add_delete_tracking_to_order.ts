import { Migration } from '../database/Migration.interface';

/**
 * Migración 011: Permitir "eliminar" órdenes (borrado suave)
 *
 * Agrega deleted / deleted_at / deleted_by_user_id a "Order". No se borra
 * la fila: se marca como eliminada para que deje de aparecer en el listado
 * de órdenes y en los reportes (ver OrderService.getAllOrders), pero se
 * conserva el historial de quién la eliminó y cuándo.
 */
export const migration_011_add_delete_tracking_to_order: Migration = {
  version: 11,
  name: 'add_delete_tracking_to_order',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'ALTER TABLE "Order" ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0',
            [],
            () => {
              console.log('Columna deleted agregada a Order');
              tx.executeSql(
                'ALTER TABLE "Order" ADD COLUMN deleted_at DATETIME',
                [],
                () => {
                  console.log('Columna deleted_at agregada a Order');
                  tx.executeSql(
                    'ALTER TABLE "Order" ADD COLUMN deleted_by_user_id INTEGER',
                    [],
                    () => {
                      console.log(
                        'Columna deleted_by_user_id agregada a Order',
                      );
                      resolve();
                    },
                    (_: any, error: any) => {
                      console.error(
                        'Error al agregar deleted_by_user_id:',
                        error,
                      );
                      reject(error);
                    },
                  );
                },
                (_: any, error: any) => {
                  console.error('Error al agregar deleted_at:', error);
                  reject(error);
                },
              );
            },
            (_: any, error: any) => {
              console.error('Error al agregar deleted:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 011:', error);
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

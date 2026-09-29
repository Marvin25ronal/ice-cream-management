import { Migration } from '../database/Migration.interface';

/**
 * Migración 012: Corrige el status de órdenes ya pagadas
 *
 * Bug: OrderService.payOrder guardaba `status = paymentMethod` en vez de
 * `status = OrderStatus.COMPLETED (1)`. Como PaymentMethod.CARD = 2 y
 * PaymentMethod.MIX = 3, las órdenes pagadas con tarjeta quedaban con
 * status 2 (se mostraban como "Cancelado") y las mixtas con status 3
 * (se mostraban como "Desconocido"). Solo el efectivo (CASH = 1) coincidía
 * por casualidad con el status "Completado".
 *
 * Toda orden con payment_date asignado fue pagada exitosamente vía
 * payOrder, así que cualquiera de esas con status distinto de 1 es
 * víctima de este bug y se corrige aquí.
 */
export const migration_012_fix_order_status_for_paid_orders: Migration = {
  version: 12,
  name: 'fix_order_status_for_paid_orders',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'UPDATE "Order" SET status = 1 WHERE payment_date IS NOT NULL AND status != 1',
            [],
            (_: any, result: any) => {
              console.log(
                `Órdenes corregidas (status -> Completado): ${result.rowsAffected}`,
              );
              resolve();
            },
            (_: any, error: any) => {
              console.error('Error al corregir status de órdenes:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 012:', error);
          reject(error);
        },
      );
    });
  },

  down: async (): Promise<void> => {
    // No reversible: no se puede recuperar el status incorrecto original.
    return Promise.resolve();
  },
};

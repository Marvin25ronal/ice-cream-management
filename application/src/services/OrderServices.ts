import { Between } from 'typeorm';
import { Order } from '../entity/Order.entity';
import { connectToDatabase } from '../store/db/Database';
import { OrderDetail } from '../entity/OrderDetail.entity';
import { OrderPayment } from '../entity/OrderPayment';
import { ProductRawMaterialService } from './ProductRawMaterialService';
import { RawMaterialService } from './RawMaterialService';
export enum PaymentMethod {
  CASH = 1,
  CARD = 2,
  MIX = 3,
}
export enum OrderStatus {
  PENDING = 0,
  COMPLETED = 1,
  CANCELED = 2,
}
export class OrderService {
  private productRawMaterialService = new ProductRawMaterialService();
  private rawMaterialService = new RawMaterialService();

  private async getDatabase() {
    return await connectToDatabase();
  }

  /**
   * Descuenta (signo -1) o revierte (signo +1) la materia prima que
   * consumen los productos de una orden, según la receta configurada en
   * cada producto (ver ProductRawMaterialService). "Best effort": los
   * errores se loggean pero nunca rechazan la promesa, ya que se llama
   * después de que la operación principal (pago/borrado) ya se guardó.
   */
  private async adjustRawMaterialForOrderDetails(
    orderDetails: OrderDetail[] | undefined,
    sign: 1 | -1,
    orderId: number,
    reasonPrefix: string,
    userId?: number | null,
  ): Promise<void> {
    if (!orderDetails || orderDetails.length === 0) {
      return;
    }
    for (const detail of orderDetails) {
      try {
        const recipe = await this.productRawMaterialService.getForProduct(
          detail.product_id,
        );
        for (const ingredient of recipe) {
          const quantity = sign * ingredient.quantity * detail.quantity;
          try {
            await this.rawMaterialService.registerMovement(
              ingredient.raw_material_id,
              quantity,
              `${reasonPrefix} #${orderId}`,
              userId ?? null,
              null,
              'sale',
            );
          } catch (error) {
            console.error(
              `Error ajustando materia prima ${ingredient.raw_material_id} para orden ${orderId}:`,
              error,
            );
          }
        }
      } catch (error) {
        console.error(
          `Error obteniendo receta del producto ${detail.product_id} para orden ${orderId}:`,
          error,
        );
      }
    }
  }
  getOrder(order_id: number) {
    return new Promise<Order | null>(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .findOne(Order, {
          where: {
            order_id: order_id,
          },
          relations: {
            orderDetails: true,
            orderPayment: true,
          },
        })
        .then(order => {
          console.log('ORDER');
          console.log(order);
          resolve(order);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  payOrder(
    orderId: number,
    paymentMethod: PaymentMethod,
    cash: number,
    card: number,
    userId?: number,
  ) {
    return new Promise<Order | null>(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .findOne(Order, {
          where: {
            order_id: orderId,
          },
          relations: {
            orderDetails: true,
          },
        })
        .then(order => {
          if (order) {
            order.status = OrderStatus.COMPLETED;
            order.payment_date = new Date();
            order.payment_method = paymentMethod;
            if (userId != null) {
              order.user_id = userId;
            }
            let orderPayment = new OrderPayment();
            orderPayment.payment_method = paymentMethod;
            orderPayment.cash = cash;
            orderPayment.card = card;
            orderPayment.order = order;
            order.orderPayment = [orderPayment];

            db?.manager
              .save(order)
              .then(async savedOrder => {
                await this.adjustRawMaterialForOrderDetails(
                  order.orderDetails,
                  -1,
                  orderId,
                  'Venta - Orden',
                  userId,
                );
                resolve(savedOrder);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            reject('Order not found');
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  incrementsPrintNumber(orderId: number) {
    return new Promise<Order | null>(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .findOne(Order, {
          where: {
            order_id: orderId,
          },
          relations: {
            orderDetails: true,
            orderPayment: true,
          },
        })
        .then(order => {
          if (order) {
            order.print_number = order.print_number + 1;
            db?.manager
              .save(order)
              .then(order => {
                resolve(order);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            reject('Order not found');
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  /**
   * Borrado suave: la orden deja de aparecer en el listado y en los
   * reportes (ver getAllOrders), pero se conserva en la base de datos
   * junto con quién la eliminó y cuándo.
   */
  deleteOrder(orderId: number, deletedByUserId: number) {
    return new Promise<Order | null>(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .findOne(Order, {
          where: {
            order_id: orderId,
          },
          relations: {
            orderDetails: true,
          },
        })
        .then(order => {
          if (order) {
            const wasCompleted = order.payment_date != null;
            order.deleted = 1;
            order.deleted_at = new Date();
            order.deleted_by_user_id = deletedByUserId;

            db?.manager
              .save(order)
              .then(async savedOrder => {
                if (wasCompleted) {
                  await this.adjustRawMaterialForOrderDetails(
                    order.orderDetails,
                    1,
                    orderId,
                    'Reversión - Orden eliminada',
                    deletedByUserId,
                  );
                }
                resolve(savedOrder);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            reject('Order not found');
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  }
  getAllOrders(start_date: string, end_date: string) {
    //string start_date format 'DD/MM/YYYY
    let start = this.parseStringToDate(start_date);
    let end = this.parseStringToDate(end_date);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    return new Promise<Order[] | null>(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .find(Order, {
          relations: {
            orderDetails: true,
            orderPayment: true,
          },
          order: {
            creation_date: 'DESC',
          },
          where: {
            creation_date: Between(start, end),
            deleted: 0,
          },
        })
        .then(orders => {
          resolve(orders);
        })
        .catch(error => {
          reject(error);
        });
    });
    //get all order detail
  }
  private parseStringToDate(dateString: string) {
    let parts = dateString.split('/');
    const date = new Date(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10),
    );
    return date;
  }
}

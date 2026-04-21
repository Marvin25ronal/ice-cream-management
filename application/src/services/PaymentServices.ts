import { Order } from '../entity/Order.entity';
import { OrderDetail } from '../entity/OrderDetail.entity';
import { connectToDatabase } from '../store/db/Database';

export class PaymentServices {
  private async getDatabase() {
    return await connectToDatabase();
  }
  saveOrder(order: Order) {
    return new Promise<Order>(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .save(order)
        .then(order => {
          resolve(order);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  saveOrderDetail(orderDetail: OrderDetail) {
    return new Promise(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .save(orderDetail)
        .then(orderDetail => {
          resolve(orderDetail);
        })
        .catch(error => {
          reject(error);
        });
    });
  }
}

import { Order } from "../entity/Order.entity";
import { connectToDatabase } from "../store/db/Database";

export class OrderService {
    private async getDatabase() {
        return await connectToDatabase();
    }
    getOrder(order_id: number) {
        return new Promise<Order | null>(async (resolve, reject) => {
            let db = await this.getDatabase();
            db?.manager.findOne(Order, {
                where: {
                    order_id: order_id
                }
            }).then((order) => {
                resolve(order)
            }).catch((error) => {
                reject(error)
            })
        })
    }
}
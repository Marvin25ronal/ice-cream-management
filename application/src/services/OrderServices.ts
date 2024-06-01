import { Between } from "typeorm";
import { Order } from "../entity/Order.entity";
import { connectToDatabase } from "../store/db/Database";
import { OrderDetail } from "../entity/OrderDetail.entity";
import { OrderPayment } from "../entity/OrderPayment";
export enum PaymentMethod {
    CASH = 1,
    CARD = 2,
    MIX = 3
}
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
                },
                relations:{
                    orderDetails:true,
                    orderPayment:true
                }
            }).then((order) => {
                resolve(order)
            }).catch((error) => {
                reject(error)
            })
        })
    }
    payOrder(orderId: number, paymentMethod: PaymentMethod, cash: number, card: number) {
        return new Promise<Order | null>(async (resolve, reject) => {
            let db = await this.getDatabase();
            db?.manager.findOne(Order, {
                where: {
                    order_id: orderId
                }
            }).then((order) => {
                if (order) {
                    order.status = paymentMethod
                    order.payment_date = new Date()
                    order.payment_method = paymentMethod
                    let orderPayment = new OrderPayment()
                    orderPayment.payment_method = paymentMethod
                    orderPayment.cash = cash
                    orderPayment.card = card
                    orderPayment.order = order
                    order.orderPayment = [orderPayment]

                    db?.manager.save(order).then((order) => {
                        resolve(order)
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    reject('Order not found')
                }
            }).catch((error) => {
                reject(error)
            })
        })
    }
    incrementsPrintNumber(orderId: number) {
        return new Promise<Order | null>(async (resolve, reject) => {
            let db = await this.getDatabase();
            db?.manager.findOne(Order, {
                where: {
                    order_id: orderId
                },
                relations:{
                    orderDetails:true,
                    orderPayment:true
                }
            }).then((order) => {
                if (order) {
                    order.print_number = order.print_number + 1
                    db?.manager.save(order).then((order) => {
                        resolve(order)
                    }).catch((error) => {
                        reject(error)
                    })
                } else {
                    reject('Order not found')
                }
            }).catch((error) => {
                reject(error)
            })
        })
    }
    getAllOrders(start_date: string, end_date: string) {
        //string start_date format 'DD/MM/YYYY
        let start = this.parseStringToDate(start_date)
        let end = this.parseStringToDate(end_date)
        end.setDate(end.getDate() + 1);
        end.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        return new Promise<Order[] | null>(async (resolve, reject) => {
            let db = await this.getDatabase();
            db?.manager.find(Order, {

                relations: {
                    orderDetails: true,
                    orderPayment: true
                },
                order:{
                    creation_date: 'DESC'
                },
                // where: {
                //     creation_date: Between(start, end)
                // }
            }).then((orders) => {
                resolve(orders)
            }).catch((error) => {
                reject(error)
            })
        }
        )
        //get all order detail

    }
    private parseStringToDate(dateString: string) {
        let parts = dateString.split('/')
        const date = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        return date
    }


}
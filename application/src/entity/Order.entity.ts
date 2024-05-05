import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OrderDetail } from "./OrderDetail.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    order_id: number

    @Column()
    total: number

    @Column()
    creation_date: Date

    @Column()
    status: number // 0: pending, 1: payment, 2: canceled

    @Column()
    payment_method: number // 0: cash, 1: credit card

    @Column()
    payment_date: Date

    @Column()
    print_number: number

    @OneToMany(() => OrderDetail, orderDetail => orderDetail.order_id)
    orderDetails: OrderDetail[]
}
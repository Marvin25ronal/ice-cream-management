import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./Order.entity";

@Entity({ name: 'OrderPayment' })
export class OrderPayment {
    @PrimaryGeneratedColumn()
    order_payment_id: number

    @Column()
    payment_method: number


    @Column()
    cash: number

    @Column()
    card: number

   
    @ManyToOne(() => Order, order => order.orderPayment)
    @JoinColumn({ name: 'order_id' })
    order: Order
}
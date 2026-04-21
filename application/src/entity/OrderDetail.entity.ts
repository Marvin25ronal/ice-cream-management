import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './Order.entity';

@Entity({ name: 'OrderDetail' })
export class OrderDetail {
  @PrimaryGeneratedColumn()
  order_detail_id: number;

  @Column()
  product_id: number;

  @Column()
  product_name: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @ManyToOne(() => Order, order => order.orderDetails)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}

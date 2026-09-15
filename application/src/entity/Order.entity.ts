import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderDetail } from './OrderDetail.entity';
import { OrderPayment } from './OrderPayment';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  order_id: number;

  @Column()
  total: number;

  @Column()
  creation_date: Date;

  @Column()
  status: number; // 0: pending, 1: payment, 2: canceled

  @Column()
  payment_method: number; // 0: cash, 1: credit card

  @Column()
  payment_date: Date;

  @Column()
  print_number: number;

  /** Usuario que cobró la orden (agregado en migración 010). */
  @Column({ nullable: true })
  user_id?: number;

  /**
   * Borrado suave (migración 011): en vez de borrar la fila, se marca como
   * eliminada para que deje de aparecer en el listado y en los reportes,
   * conservando quién la eliminó y cuándo.
   */
  @Column({ default: 0 })
  deleted?: number;

  @Column({ nullable: true })
  deleted_at?: Date;

  @Column({ nullable: true })
  deleted_by_user_id?: number;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, {
    cascade: true,
  })
  orderDetails: OrderDetail[];

  @OneToMany(() => OrderPayment, orderPaymement => orderPaymement.order, {
    cascade: true,
  })
  @JoinColumn({ name: 'order_payment_id' })
  orderPayment: OrderPayment[];
}

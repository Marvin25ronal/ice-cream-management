import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './Category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  image: string; // Reutilizado: nombre para legacy, path completo para filesystem/url

  // New image system field - added by automatic migration at app startup
  @Column({ nullable: true, default: 'legacy' })
  image_type?: string; // 'legacy' | 'filesystem' | 'url'

  @Column()
  creation_date: Date;

  @Column()
  last_update: Date;

  @Column()
  order: number;

  // Day availability fields (added by migration 001)
  @Column({ default: 1 })
  monday: number;

  @Column({ default: 1 })
  tuesday: number;

  @Column({ default: 1 })
  wednesday: number;

  @Column({ default: 1 })
  thursday: number;

  @Column({ default: 1 })
  friday: number;

  @Column({ default: 1 })
  saturday: number;

  @Column({ default: 1 })
  sunday: number;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  constructor(
    product_id: number,
    name: string,
    price: number,
    image: string,
    creation_date: Date,
    last_update: Date,
    category: Category,
    order: number,
    monday: number = 1,
    tuesday: number = 1,
    wednesday: number = 1,
    thursday: number = 1,
    friday: number = 1,
    saturday: number = 1,
    sunday: number = 1,
  ) {
    this.product_id = product_id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.creation_date = creation_date;
    this.last_update = last_update;
    this.category = category;
    this.order = order;
    this.monday = monday;
    this.tuesday = tuesday;
    this.wednesday = wednesday;
    this.thursday = thursday;
    this.friday = friday;
    this.saturday = saturday;
    this.sunday = sunday;
  }
}

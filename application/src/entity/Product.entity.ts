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
  image: string;

  @Column()
  creation_date: Date;

  @Column()
  last_update: Date;

  @Column()
  order: number;

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
  ) {
    this.product_id = product_id;
    this.name = name;
    this.price = price;
    this.image = image;
    this.creation_date = creation_date;
    this.last_update = last_update;
    this.category = category;
    this.order = order;
  }
}

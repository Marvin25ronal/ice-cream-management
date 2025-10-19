import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './Product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  category_id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  order: number;

  @Column()
  parent_id: number | null;

  @Column()
  image: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];

  constructor(
    category_id: number,
    name: string,
    description: string,
    order: number,
    parent_id: number | null,
    image: string,
    products: Product[],
  ) {
    this.category_id = category_id;
    this.name = name;
    this.description = description;
    this.order = order;
    this.parent_id = parent_id;
    this.image = image;
    this.products = products;
  }
}

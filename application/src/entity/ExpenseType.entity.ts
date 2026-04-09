import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expense } from './Expense.entity';

@Entity('expense_type')
export class ExpenseType {
  @PrimaryGeneratedColumn()
  expense_type_id: number;

  @Column()
  name: string;

  @Column({nullable: true})
  description: string;

  @Column({default: 1})
  active: number; // 1=active, 0=inactive (soft-delete)

  @Column({default: 0})
  order: number;

  @Column({default: 0})
  is_custom: number; // 1 = requires notes (e.g. "Otros")

  @Column({default: 'cash'})
  icon: string; // MaterialCommunityIcons name

  @Column({default: '#FF6348'})
  color: string; // Hex color

  @OneToMany(() => Expense, expense => expense.expenseType)
  expenses: Expense[];
}

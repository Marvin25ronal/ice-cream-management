import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {ExpenseType} from './ExpenseType.entity';

@Entity('expense')
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column({type: 'real'})
  amount: number;

  @Column()
  date: Date;

  @Column({nullable: true})
  notes: string;

  @Column()
  expense_type_id: number;

  @ManyToOne(() => ExpenseType, expenseType => expenseType.expenses)
  @JoinColumn({name: 'expense_type_id'})
  expenseType: ExpenseType;
}

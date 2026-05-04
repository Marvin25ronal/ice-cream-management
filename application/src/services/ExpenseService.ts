import {Between} from 'typeorm';
import {connectToDatabase} from '../store/db/Database';
import {Expense} from '../entity/Expense.entity';

export class ExpenseService {
  private async getDatabase() {
    return await connectToDatabase();
  }

  private parseStringToDate(dateString: string): Date {
    const parts = dateString.split('/');
    return new Date(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10),
    );
  }

  getByDate(date: string): Promise<Expense[]> {
    return this.getByDateRange(date, date);
  }

  getByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return new Promise(async (resolve, reject) => {
      const start = this.parseStringToDate(startDate);
      const end = this.parseStringToDate(endDate);
      end.setDate(end.getDate() + 1);
      end.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);

      const db = await this.getDatabase();
      db?.manager
        .find(Expense, {
          relations: {expenseType: true},
          where: {date: Between(start, end)},
          order: {date: 'DESC'},
        })
        .then(resolve)
        .catch(reject);
    });
  }

  getTotalByDate(date: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      this.getByDate(date)
        .then(expenses =>
          resolve(expenses.reduce((acc, e) => acc + e.amount, 0)),
        )
        .catch(reject);
    });
  }

  create(
    expenseTypeId: number,
    amount: number,
    notes?: string,
  ): Promise<Expense> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const expense = new Expense();
      expense.expense_type_id = expenseTypeId;
      expense.amount = amount;
      expense.date = new Date();
      expense.notes = notes ?? '';

      db?.manager
        .save(expense)
        .then(resolve)
        .catch(reject);
    });
  }

  delete(expenseId: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db?.manager
        .delete(Expense, {expense_id: expenseId})
        .then(() => resolve())
        .catch(reject);
    });
  }
}

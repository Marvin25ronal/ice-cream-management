import {connectToDatabase} from '../store/db/Database';
import {ExpenseType} from '../entity/ExpenseType.entity';

export class ExpenseTypeService {
  private async getDatabase() {
    return await connectToDatabase();
  }

  getAll(): Promise<ExpenseType[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db?.manager
        .find(ExpenseType, {
          where: {active: 1},
          order: {order: 'ASC'},
        })
        .then(resolve)
        .catch(reject);
    });
  }

  getById(id: number): Promise<ExpenseType | null> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db?.manager
        .findOne(ExpenseType, {where: {expense_type_id: id}})
        .then(resolve)
        .catch(reject);
    });
  }

  create(
    name: string,
    description?: string,
    isCustom: number = 0,
    icon: string = 'cash',
    color: string = '#FF6348',
  ): Promise<ExpenseType> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const existing = await db?.manager.find(ExpenseType, {
        where: {active: 1},
        order: {order: 'DESC'},
      });
      const maxOrder =
        existing && existing.length > 0 ? existing[0].order + 1 : 0;

      const type = new ExpenseType();
      type.name = name;
      type.description = description ?? '';
      type.active = 1;
      type.order = maxOrder;
      type.is_custom = isCustom;
      type.icon = icon;
      type.color = color;

      db?.manager
        .save(type)
        .then(resolve)
        .catch(reject);
    });
  }

  update(id: number, data: Partial<ExpenseType>): Promise<ExpenseType> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const type = await db?.manager.findOne(ExpenseType, {
        where: {expense_type_id: id},
      });
      if (!type) {
        reject(new Error('Tipo de gasto no encontrado'));
        return;
      }
      Object.assign(type, data);
      db?.manager
        .save(type)
        .then(resolve)
        .catch(reject);
    });
  }

  deactivate(id: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const type = await db?.manager.findOne(ExpenseType, {
        where: {expense_type_id: id},
      });
      if (!type) {
        reject(new Error('Tipo de gasto no encontrado'));
        return;
      }
      type.active = 0;
      db?.manager
        .save(type)
        .then(() => resolve())
        .catch(reject);
    });
  }
}

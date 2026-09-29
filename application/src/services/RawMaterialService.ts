import { openDatabase } from 'react-native-sqlite-storage';
import { RawMaterial } from '../entity/RawMaterial.entity';
import { RawMaterialMovement } from '../entity/RawMaterialMovement.entity';

export interface RawMaterialInput {
  name: string;
  unit: string;
  description?: string | null;
  image?: string | null;
  reorderPresets?: number[];
}

export interface RawMaterialMovementDetail extends RawMaterialMovement {
  raw_material_name: string;
  raw_material_unit: string;
  user_name: string | null;
}

const parsePresets = (value: any): number[] => {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter(n => typeof n === 'number')
      : [];
  } catch {
    return [];
  }
};

/**
 * Maneja el catálogo de materia prima y sus movimientos de inventario
 * (`raw_material` / `raw_material_movement`, ver migración 013), con SQL
 * crudo, mismo patrón que UserService/CashRegisterService.
 */
export class RawMaterialService {
  private db: any;

  private async getDatabase() {
    if (!this.db) {
      this.db = await openDatabase({
        name: 'IceCreamDatabase.db',
        location: 'default',
      });
    }
    return this.db;
  }

  private rowToRawMaterial(row: any): RawMaterial {
    return {
      raw_material_id: row.raw_material_id,
      name: row.name,
      unit: row.unit,
      stock: row.stock,
      avg_cost: row.avg_cost ?? 0,
      active: !!row.active,
      order: row.order,
      image: row.image != null ? row.image : null,
      description: row.description != null ? row.description : null,
      reorder_presets: parsePresets(row.reorder_presets),
    };
  }

  private rowToMovement(row: any): RawMaterialMovement {
    return {
      id: row.id,
      raw_material_id: row.raw_material_id,
      quantity: row.quantity,
      type:
        row.type === 'adjustment' || row.type === 'sale'
          ? row.type
          : 'purchase',
      unit_cost: row.unit_cost != null ? row.unit_cost : null,
      reason: row.reason != null ? row.reason : '',
      date: new Date(row.date),
      user_id: row.user_id != null ? row.user_id : null,
    };
  }

  /** Todas las materias primas (para administración), ordenadas. */
  getAll(): Promise<RawMaterial[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM raw_material ORDER BY "order" ASC, raw_material_id ASC',
          [],
          (_: any, results: any) => {
            const items: RawMaterial[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              items.push(this.rowToRawMaterial(results.rows.item(i)));
            }
            resolve(items);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Solo materias primas activas (para usarlas al vincular un producto). */
  getActive(): Promise<RawMaterial[]> {
    return this.getAll().then(items => items.filter(i => i.active));
  }

  /** Crea una materia prima nueva, con stock inicial en 0. */
  create(data: RawMaterialInput): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT COALESCE(MAX("order"), -1) AS maxOrder FROM raw_material',
          [],
          (_: any, results: any) => {
            const nextOrder = results.rows.item(0).maxOrder + 1;
            tx.executeSql(
              'INSERT INTO raw_material (name, unit, description, image, reorder_presets, stock, active, "order") VALUES (?, ?, ?, ?, ?, 0, 1, ?)',
              [
                data.name,
                data.unit,
                data.description ?? null,
                data.image ?? null,
                JSON.stringify(data.reorderPresets ?? []),
                nextOrder,
              ],
              () => resolve(),
              (_2: any, error: any) => reject(error),
            );
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Edita nombre, unidad, descripción e imagen (el stock no se toca aquí). */
  update(rawMaterialId: number, data: RawMaterialInput): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'UPDATE raw_material SET name = ?, unit = ?, description = ?, image = ?, reorder_presets = ? WHERE raw_material_id = ?',
          [
            data.name,
            data.unit,
            data.description ?? null,
            data.image ?? null,
            JSON.stringify(data.reorderPresets ?? []),
            rawMaterialId,
          ],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Desactiva/reactiva una materia prima (no se borra, conserva historial). */
  setActive(rawMaterialId: number, active: boolean): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'UPDATE raw_material SET active = ? WHERE raw_material_id = ?',
          [active ? 1 : 0, rawMaterialId],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * Registra un movimiento de inventario (positivo = compra/entrada,
   * negativo = ajuste/merma), actualiza el stock actual y, si se indica
   * el costo unitario de la compra, recalcula el costo promedio
   * ponderado de la materia prima. Todo en una sola transacción.
   */
  registerMovement(
    rawMaterialId: number,
    quantity: number,
    reason: string,
    userId?: number | null,
    unitCost?: number | null,
    type: 'purchase' | 'adjustment' | 'sale' = 'purchase',
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const date = new Date().toISOString();
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'SELECT stock, avg_cost FROM raw_material WHERE raw_material_id = ?',
            [rawMaterialId],
            (_: any, results: any) => {
              if (results.rows.length === 0) {
                reject(new Error('Materia prima no encontrada'));
                return;
              }
              const current = results.rows.item(0);
              const currentStock = current.stock ?? 0;
              const currentAvgCost = current.avg_cost ?? 0;
              const newStock = currentStock + quantity;

              let newAvgCost = currentAvgCost;
              if (unitCost != null && unitCost > 0 && quantity > 0) {
                newAvgCost =
                  newStock > 0
                    ? (currentStock * currentAvgCost + quantity * unitCost) /
                      newStock
                    : unitCost;
              }

              tx.executeSql(
                'INSERT INTO raw_material_movement (raw_material_id, quantity, type, unit_cost, reason, date, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                  rawMaterialId,
                  quantity,
                  type,
                  unitCost ?? null,
                  reason,
                  date,
                  userId ?? null,
                ],
                () => {
                  tx.executeSql(
                    'UPDATE raw_material SET stock = ?, avg_cost = ? WHERE raw_material_id = ?',
                    [newStock, newAvgCost, rawMaterialId],
                    () => resolve(),
                    (_2: any, error: any) => reject(error),
                  );
                },
                (_2: any, error: any) => reject(error),
              );
            },
            (_: any, error: any) => reject(error),
          );
        },
        (error: any) => reject(error),
      );
    });
  }

  /**
   * Rectifica el stock al conteo físico real (ej. producto dañado, merma
   * o diferencia de inventario): calcula la diferencia contra el stock
   * actual y la registra como un movimiento tipo 'adjustment', sin tocar
   * el costo promedio.
   */
  rectifyStock(
    rawMaterialId: number,
    actualStock: number,
    reason: string,
    userId?: number | null,
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT stock FROM raw_material WHERE raw_material_id = ?',
          [rawMaterialId],
          (_: any, results: any) => {
            if (results.rows.length === 0) {
              reject(new Error('Materia prima no encontrada'));
              return;
            }
            const currentStock = results.rows.item(0).stock ?? 0;
            const delta = actualStock - currentStock;
            if (delta === 0) {
              resolve();
              return;
            }
            this.registerMovement(
              rawMaterialId,
              delta,
              reason,
              userId,
              null,
              'adjustment',
            )
              .then(resolve)
              .catch(reject);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Historial de movimientos de una materia prima, más reciente primero. */
  getMovements(rawMaterialId: number): Promise<RawMaterialMovement[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM raw_material_movement WHERE raw_material_id = ? ORDER BY date DESC',
          [rawMaterialId],
          (_: any, results: any) => {
            const movements: RawMaterialMovement[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              movements.push(this.rowToMovement(results.rows.item(i)));
            }
            resolve(movements);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * Historial global de movimientos de todas las materias primas (compras
   * y rectificaciones), con el nombre del insumo y del usuario que lo
   * registró, más reciente primero. Para la pantalla de Administración.
   */
  getAllMovements(limit = 300): Promise<RawMaterialMovementDetail[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT rmm.*, rm.name AS material_name, rm.unit AS material_unit,
                  u.name AS user_name
           FROM raw_material_movement rmm
           JOIN raw_material rm ON rm.raw_material_id = rmm.raw_material_id
           LEFT JOIN user u ON u.user_id = rmm.user_id
           ORDER BY rmm.date DESC
           LIMIT ?`,
          [limit],
          (_: any, results: any) => {
            const movements: RawMaterialMovementDetail[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const row = results.rows.item(i);
              movements.push({
                ...this.rowToMovement(row),
                raw_material_name: row.material_name,
                raw_material_unit: row.material_unit,
                user_name: row.user_name != null ? row.user_name : null,
              });
            }
            resolve(movements);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }
}

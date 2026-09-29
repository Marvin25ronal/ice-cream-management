import { openDatabase } from 'react-native-sqlite-storage';

export interface ProductRawMaterialConfig {
  id: number;
  product_id: number;
  raw_material_id: number;
  quantity: number;
  raw_material_name: string;
  raw_material_unit: string;
}

export interface ProductRawMaterialConfigInput {
  raw_material_id: number;
  quantity: number;
}

/**
 * Maneja la receta de cada producto (qué materia prima consume y en qué
 * cantidad por unidad vendida), tabla `product_raw_material` (ver
 * migración 017), con SQL crudo, mismo patrón que RawMaterialService.
 */
export class ProductRawMaterialService {
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

  private rowToConfig(row: any): ProductRawMaterialConfig {
    return {
      id: row.id,
      product_id: row.product_id,
      raw_material_id: row.raw_material_id,
      quantity: row.quantity,
      raw_material_name: row.name,
      raw_material_unit: row.unit,
    };
  }

  /** Receta actual de un producto, con el nombre/unidad de cada insumo. */
  getForProduct(productId: number): Promise<ProductRawMaterialConfig[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT prm.id, prm.product_id, prm.raw_material_id, prm.quantity,
                  rm.name, rm.unit
           FROM product_raw_material prm
           JOIN raw_material rm ON rm.raw_material_id = prm.raw_material_id
           WHERE prm.product_id = ?
           ORDER BY rm.name ASC`,
          [productId],
          (_: any, results: any) => {
            const configs: ProductRawMaterialConfig[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              configs.push(this.rowToConfig(results.rows.item(i)));
            }
            resolve(configs);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * Reemplaza toda la receta de un producto por la lista dada (borra las
   * asociaciones anteriores e inserta las nuevas), en una sola transacción.
   */
  setForProduct(
    productId: number,
    configs: ProductRawMaterialConfigInput[],
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'DELETE FROM product_raw_material WHERE product_id = ?',
            [productId],
            () => {
              if (configs.length === 0) {
                resolve();
                return;
              }
              let remaining = configs.length;
              let failed = false;
              configs.forEach(config => {
                tx.executeSql(
                  'INSERT INTO product_raw_material (product_id, raw_material_id, quantity) VALUES (?, ?, ?)',
                  [productId, config.raw_material_id, config.quantity],
                  () => {
                    remaining -= 1;
                    if (remaining === 0 && !failed) {
                      resolve();
                    }
                  },
                  (_: any, error: any) => {
                    if (!failed) {
                      failed = true;
                      reject(error);
                    }
                  },
                );
              });
            },
            (_: any, error: any) => reject(error),
          );
        },
        (error: any) => reject(error),
      );
    });
  }
}

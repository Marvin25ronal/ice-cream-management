import {Migration} from '../database/Migration.interface';

/**
 * Migración 003: Crear tabla de tipos de gastos con datos semilla
 *
 * Crea la tabla `expense_type` con categorías predeterminadas.
 * is_custom=1 indica que requiere campo de notas obligatorio (como "Otros").
 */
export const migration_003_create_expense_types: Migration = {
  version: 3,
  name: 'create_expense_types',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS expense_type (
              expense_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              active INTEGER DEFAULT 1,
              "order" INTEGER DEFAULT 0,
              is_custom INTEGER DEFAULT 0
            )`,
            [],
            () => {
              console.log('Tabla expense_type creada');
              // Insertar datos semilla
              const seeds = [
                ['Ingredientes', 'Compra de ingredientes y materiales', 1, 0, 0],
                ['Agua', 'Pago de agua', 1, 1, 0],
                ['Luz', 'Pago de electricidad', 1, 2, 0],
                ['Personal', 'Pago de salarios y personal', 1, 3, 0],
                ['Transporte', 'Gastos de transporte y envíos', 1, 4, 0],
                ['Mantenimiento', 'Mantenimiento de equipos', 1, 5, 0],
                ['Otros', 'Otros gastos no categorizados', 1, 6, 1],
              ];
              let inserted = 0;
              seeds.forEach(seed => {
                tx.executeSql(
                  `INSERT OR IGNORE INTO expense_type (name, description, active, "order", is_custom)
                   SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM expense_type WHERE name = ?)`,
                  [...seed, seed[0]],
                  () => {
                    inserted++;
                    if (inserted === seeds.length) {
                      console.log('Datos semilla de expense_type insertados');
                      resolve();
                    }
                  },
                  (_: any, error: any) => {
                    console.error('Error al insertar semilla expense_type:', error);
                    reject(error);
                  },
                );
              });
            },
            (_: any, error: any) => {
              console.error('Error al crear tabla expense_type:', error);
              reject(error);
            },
          );
        },
        (error: any) => {
          console.error('Error en transacción migración 003:', error);
          reject(error);
        },
      );
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DROP TABLE IF EXISTS expense_type',
          [],
          () => {
            console.log('Tabla expense_type eliminada');
            resolve();
          },
          (_: any, error: any) => {
            reject(error);
          },
        );
      });
    });
  },
};

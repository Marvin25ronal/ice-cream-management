import {Migration} from '../database/Migration.interface';

/**
 * Migración 005: Agregar columnas icon y color a expense_type
 * y actualizar valores por defecto de los tipos semilla.
 *
 * Ambas columnas se agregan de forma segura con IF NOT EXISTS
 * equivalente (capturando el error si ya existen).
 */
export const migration_005_add_icon_to_expense_type: Migration = {
  version: 5,
  name: 'add_icon_color_to_expense_type',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    // Seed data: [name, icon, color]
    const seedUpdates: [string, string, string][] = [
      ['Ingredientes', 'food-apple',          '#00B894'],
      ['Agua',         'water',               '#74B9FF'],
      ['Luz',          'lightning-bolt',      '#FDCB6E'],
      ['Personal',     'account-group',       '#A29BFE'],
      ['Transporte',   'truck',               '#FF8C42'],
      ['Mantenimiento','wrench',              '#636E72'],
      ['Otros',        'dots-horizontal-circle', '#FF6348'],
    ];

    const addColumn = (columnDef: string): Promise<void> =>
      new Promise(resolve => {
        db.transaction((tx: any) => {
          tx.executeSql(
            `ALTER TABLE expense_type ADD COLUMN ${columnDef}`,
            [],
            () => resolve(),
            () => resolve(), // columna ya existe → ignorar
          );
        });
      });

    const updateSeeds = (): Promise<void> =>
      new Promise((resolve, reject) => {
        db.transaction(
          (tx: any) => {
            let done = 0;
            seedUpdates.forEach(([name, icon, color]) => {
              tx.executeSql(
                `UPDATE expense_type SET icon = ?, color = ? WHERE name = ?`,
                [icon, color, name],
                () => {
                  done++;
                  if (done === seedUpdates.length) resolve();
                },
                (_: any, err: any) => {
                  console.error('Error actualizando semilla:', err);
                  done++;
                  if (done === seedUpdates.length) resolve();
                },
              );
            });
          },
          (err: any) => {
            console.error('Error en transacción seeds 005:', err);
            resolve(); // No bloquear el arranque
          },
        );
      });

    await addColumn("icon TEXT DEFAULT 'cash'");
    await addColumn("color TEXT DEFAULT '#FF6348'");
    await updateSeeds();
    console.log('Migración 005 completada: icon + color en expense_type');
  },

  down: async (_db: any): Promise<void> => {
    console.log('SQLite no soporta DROP COLUMN — migración 005 no revertible');
    return Promise.resolve();
  },
};

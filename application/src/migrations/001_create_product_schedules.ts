import { Migration } from '../database/Migration.interface';

/**
 * Migración 001: Agregar horarios de disponibilidad a productos
 *
 * Agrega columnas a la tabla `product` para configurar
 * en qué días de la semana estará disponible cada producto.
 *
 * Campos agregados:
 * - monday, tuesday, wednesday, thursday, friday, saturday, sunday:
 *   Booleanos (0 o 1) que indican si el producto está disponible ese día
 *   Por defecto todos los días están habilitados (1)
 */
export const migration_001_create_product_schedules: Migration = {
  version: 1,
  name: 'add_product_schedules',
  forceOnStartup: true,

  up: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        // Agregar columna monday
        tx.executeSql(
          'ALTER TABLE product ADD COLUMN monday INTEGER DEFAULT 1',
          [],
          () => {
            console.log('Columna monday agregada');

            // Agregar columna tuesday
            tx.executeSql(
              'ALTER TABLE product ADD COLUMN tuesday INTEGER DEFAULT 1',
              [],
              () => {
                console.log('Columna tuesday agregada');

                // Agregar columna wednesday
                tx.executeSql(
                  'ALTER TABLE product ADD COLUMN wednesday INTEGER DEFAULT 1',
                  [],
                  () => {
                    console.log('Columna wednesday agregada');

                    // Agregar columna thursday
                    tx.executeSql(
                      'ALTER TABLE product ADD COLUMN thursday INTEGER DEFAULT 1',
                      [],
                      () => {
                        console.log('Columna thursday agregada');

                        // Agregar columna friday
                        tx.executeSql(
                          'ALTER TABLE product ADD COLUMN friday INTEGER DEFAULT 1',
                          [],
                          () => {
                            console.log('Columna friday agregada');

                            // Agregar columna saturday
                            tx.executeSql(
                              'ALTER TABLE product ADD COLUMN saturday INTEGER DEFAULT 1',
                              [],
                              () => {
                                console.log('Columna saturday agregada');

                                // Agregar columna sunday
                                tx.executeSql(
                                  'ALTER TABLE product ADD COLUMN sunday INTEGER DEFAULT 1',
                                  [],
                                  () => {
                                    console.log('Columna sunday agregada');
                                    console.log(
                                      'Todas las columnas de horario agregadas exitosamente',
                                    );
                                    resolve();
                                  },
                                  (_: any, error: any) => {
                                    console.error(
                                      'Error al agregar columna sunday:',
                                      error,
                                    );
                                    reject(error);
                                  },
                                );
                              },
                              (_: any, error: any) => {
                                console.error(
                                  'Error al agregar columna saturday:',
                                  error,
                                );
                                reject(error);
                              },
                            );
                          },
                          (_: any, error: any) => {
                            console.error(
                              'Error al agregar columna friday:',
                              error,
                            );
                            reject(error);
                          },
                        );
                      },
                      (_: any, error: any) => {
                        console.error(
                          'Error al agregar columna thursday:',
                          error,
                        );
                        reject(error);
                      },
                    );
                  },
                  (_: any, error: any) => {
                    console.error(
                      'Error al agregar columna wednesday:',
                      error,
                    );
                    reject(error);
                  },
                );
              },
              (_: any, error: any) => {
                console.error('Error al agregar columna tuesday:', error);
                reject(error);
              },
            );
          },
          (_: any, error: any) => {
            console.error('Error al agregar columna monday:', error);
            reject(error);
          },
        );
      });
    });
  },

  down: async (db: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      // SQLite no soporta DROP COLUMN directamente
      // Para revertir esta migración, necesitarías recrear la tabla completa
      // Por simplicidad, solo registramos un mensaje
      console.log(
        'ADVERTENCIA: SQLite no soporta DROP COLUMN. Para revertir esta migración, necesitas recrear la tabla product manualmente.',
      );
      resolve();
    });
  },
};

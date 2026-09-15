import { openDatabase } from 'react-native-sqlite-storage';
import { User } from '../entity/User.entity';

/**
 * Maneja usuarios (selección simple, sin contraseña), a través de las
 * tablas `user`, `user_session` (registro de llegada) y `app_state`
 * (usuario activo persistido). SQL crudo, mismo patrón que
 * CashRegisterService/MigrationService.
 */
export class UserService {
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

  private rowToUser(row: any): User {
    const user = new User();
    user.user_id = row.user_id;
    user.name = row.name;
    user.active = !!row.active;
    user.order = row.order;
    return user;
  }

  /** Fecha local en formato YYYY-MM-DD, usada como "día" para asistencia. */
  private todayKey(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Todos los usuarios (para administración), ordenados. */
  getAll(): Promise<User[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM user ORDER BY "order" ASC, user_id ASC',
          [],
          (_: any, results: any) => {
            const users: User[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              users.push(this.rowToUser(results.rows.item(i)));
            }
            resolve(users);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Solo usuarios activos, para la pantalla de selección. */
  getActive(): Promise<User[]> {
    return this.getAll().then(users => users.filter(u => u.active));
  }

  create(name: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT COALESCE(MAX("order"), -1) AS maxOrder FROM user',
          [],
          (_: any, results: any) => {
            const nextOrder = results.rows.item(0).maxOrder + 1;
            tx.executeSql(
              'INSERT INTO user (name, active, "order") VALUES (?, 1, ?)',
              [name, nextOrder],
              () => resolve(),
              (_2: any, error: any) => reject(error),
            );
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  rename(userId: number, name: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'UPDATE user SET name = ? WHERE user_id = ?',
          [name, userId],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Desactiva/reactiva un usuario (no se borra, para no perder el historial). */
  setActive(userId: number, active: boolean): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'UPDATE user SET active = ? WHERE user_id = ?',
          [active ? 1 : 0, userId],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * true si el usuario tiene historial (órdenes cobradas, movimientos de
   * caja o días con sesión registrada). Un usuario con historial no se
   * puede eliminar de verdad sin perder esos registros.
   */
  private hasHistory(userId: number): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT
            (SELECT COUNT(*) FROM "Order" WHERE user_id = ?) +
            (SELECT COUNT(*) FROM cash_register WHERE user_id = ?) +
            (SELECT COUNT(*) FROM user_session WHERE user_id = ?) AS total`,
          [userId, userId, userId],
          (_: any, results: any) => resolve(results.rows.item(0).total > 0),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * Elimina un usuario definitivamente. Solo permitido si no tiene
   * historial (ver hasHistory) — si lo tiene, lanza un error 'HAS_HISTORY'
   * para que la pantalla ofrezca desactivarlo en su lugar.
   */
  async delete(userId: number): Promise<void> {
    const hasHistory = await this.hasHistory(userId);
    if (hasHistory) {
      throw new Error('HAS_HISTORY');
    }
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'DELETE FROM user WHERE user_id = ?',
          [userId],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * Usuario activo persistido, solo si corresponde al día de hoy.
   * Si la última selección fue en un día anterior, devuelve null
   * (así la pantalla de selección vuelve a mostrarse obligatoriamente).
   */
  getActiveUserForToday(): Promise<User | null> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          "SELECT value FROM app_state WHERE key = 'active_user_id'",
          [],
          (_: any, userResult: any) => {
            tx.executeSql(
              "SELECT value FROM app_state WHERE key = 'active_date'",
              [],
              (_2: any, dateResult: any) => {
                const userId =
                  userResult.rows.length > 0
                    ? Number(userResult.rows.item(0).value)
                    : null;
                const date =
                  dateResult.rows.length > 0
                    ? dateResult.rows.item(0).value
                    : null;
                if (userId == null || date !== this.todayKey()) {
                  resolve(null);
                  return;
                }
                tx.executeSql(
                  'SELECT * FROM user WHERE user_id = ?',
                  [userId],
                  (_3: any, userRow: any) => {
                    resolve(
                      userRow.rows.length > 0
                        ? this.rowToUser(userRow.rows.item(0))
                        : null,
                    );
                  },
                  (_3: any, error: any) => reject(error),
                );
              },
              (_2: any, error: any) => reject(error),
            );
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /**
   * Marca a `userId` como usuario activo (persistido) y, si es la primera
   * vez que se selecciona hoy, registra su hora de llegada.
   */
  selectUser(userId: number): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const today = this.todayKey();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM user WHERE user_id = ?',
          [userId],
          (_: any, userRow: any) => {
            if (userRow.rows.length === 0) {
              reject(new Error('Usuario no encontrado'));
              return;
            }
            const user = this.rowToUser(userRow.rows.item(0));
            tx.executeSql(
              'INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)',
              ['active_user_id', String(userId)],
              () => {
                tx.executeSql(
                  'INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)',
                  ['active_date', today],
                  () => {
                    tx.executeSql(
                      'INSERT OR IGNORE INTO user_session (user_id, date) VALUES (?, ?)',
                      [userId, today],
                      () => resolve(user),
                      (_2: any, error: any) => reject(error),
                    );
                  },
                  (_2: any, error: any) => reject(error),
                );
              },
              (_2: any, error: any) => reject(error),
            );
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }
}

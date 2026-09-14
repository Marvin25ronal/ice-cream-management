import { openDatabase } from 'react-native-sqlite-storage';
import { CashRegister } from '../entity/CashRegister.entity';

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-11.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 *
 * Maneja la tabla `cash_register` (ver migración 006) con SQL crudo,
 * igual patrón que MigrationService.
 */
export class CashRegisterService {
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

  private rowToRecord(row: any): CashRegister {
    const record = new CashRegister();
    record.id = row.id;
    record.amount = row.amount;
    record.type = row.type;
    record.reason = row.reason != null ? row.reason : '';
    record.date = new Date(row.date);
    return record;
  }

  /** Último registro (apertura o rectificación) = saldo actual de caja. */
  getCurrent(): Promise<CashRegister | null> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM cash_register ORDER BY date DESC LIMIT 1',
          [],
          (_: any, results: any) => {
            if (results.rows.length !== 0) {
              resolve(this.rowToRecord(results.rows.item(0)));
            } else {
              resolve(null);
            }
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Historial completo, más reciente primero. */
  getAll(): Promise<CashRegister[]> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT * FROM cash_register ORDER BY date DESC',
          [],
          (_: any, results: any) => {
            const records: CashRegister[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              records.push(this.rowToRecord(results.rows.item(i)));
            }
            resolve(records);
          },
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Configura el saldo inicial de caja (apertura de turno). */
  registerOpening(amount: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const date = new Date().toISOString();
      db.transaction((tx: any) => {
        tx.executeSql(
          "INSERT INTO cash_register (amount, type, reason, date) VALUES (?, 'opening', '', ?)",
          [amount, date],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }

  /** Rectifica el saldo de caja indicando el motivo del ajuste. */
  registerAdjustment(amount: number, reason: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const db = await this.getDatabase();
      const date = new Date().toISOString();
      db.transaction((tx: any) => {
        tx.executeSql(
          "INSERT INTO cash_register (amount, type, reason, date) VALUES (?, 'adjustment', ?, ?)",
          [amount, reason, date],
          () => resolve(),
          (_: any, error: any) => reject(error),
        );
      });
    });
  }
}

import {openDatabase} from 'react-native-sqlite-storage';
import {Migration} from './Migration.interface';

export class MigrationService {
  private db: any;

  constructor() {
    this.db = null;
  }

  private async getDatabase() {
    if (!this.db) {
      this.db = await openDatabase({
        name: 'IceCreamDatabase.db',
        location: 'default',
      });
    }
    return this.db;
  }

  async createMigrationsTable(): Promise<void> {
    const db = await this.getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL UNIQUE,
            name TEXT NOT NULL,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
          [],
          () => {
            console.log('Tabla de migraciones creada o ya existe');
            resolve();
          },
          (_: any, error: any) => {
            console.error('Error al crear tabla de migraciones:', error);
            reject(error);
          },
        );
      });
    });
  }

  async getExecutedMigrations(): Promise<number[]> {
    const db = await this.getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT version FROM migrations ORDER BY version ASC',
          [],
          (_: any, results: any) => {
            const versions: number[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              versions.push(results.rows.item(i).version);
            }
            console.log('Migraciones ejecutadas:', versions);
            resolve(versions);
          },
          (_: any, error: any) => {
            console.error('Error al obtener migraciones ejecutadas:', error);
            reject(error);
          },
        );
      });
    });
  }

  async recordMigration(version: number, name: string): Promise<void> {
    const db = await this.getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'INSERT INTO migrations (version, name) VALUES (?, ?)',
          [version, name],
          () => {
            console.log(`Migración ${version} - ${name} registrada`);
            resolve();
          },
          (_: any, error: any) => {
            console.error('Error al registrar migración:', error);
            reject(error);
          },
        );
      });
    });
  }

  async removeMigration(version: number): Promise<void> {
    const db = await this.getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'DELETE FROM migrations WHERE version = ?',
          [version],
          () => {
            console.log(`Migración ${version} eliminada del registro`);
            resolve();
          },
          (_: any, error: any) => {
            console.error('Error al eliminar migración:', error);
            reject(error);
          },
        );
      });
    });
  }

  async runMigrations(migrations: Migration[]): Promise<{
    success: boolean;
    executed: number;
    errors: string[];
  }> {
    try {
      // Crear tabla de migraciones si no existe
      await this.createMigrationsTable();

      // Obtener migraciones ya ejecutadas
      const executedVersions = await this.getExecutedMigrations();

      // Filtrar migraciones pendientes
      const pendingMigrations = migrations
        .filter(m => !executedVersions.includes(m.version))
        .sort((a, b) => a.version - b.version);

      if (pendingMigrations.length === 0) {
        console.log('No hay migraciones pendientes');
        return {success: true, executed: 0, errors: []};
      }

      console.log(
        `Ejecutando ${pendingMigrations.length} migraciones pendientes...`,
      );

      const db = await this.getDatabase();
      const errors: string[] = [];
      let executed = 0;

      // Ejecutar migraciones una por una
      for (const migration of pendingMigrations) {
        try {
          console.log(
            `Ejecutando migración ${migration.version}: ${migration.name}`,
          );
          await migration.up(db);
          await this.recordMigration(migration.version, migration.name);
          executed++;
          console.log(
            `Migración ${migration.version} ejecutada exitosamente`,
          );
        } catch (error: any) {
          const errorMsg = `Error en migración ${migration.version} (${migration.name}): ${error.message}`;
          console.error(errorMsg);
          errors.push(errorMsg);
          // Detener ejecución si hay error
          break;
        }
      }

      return {
        success: errors.length === 0,
        executed,
        errors,
      };
    } catch (error: any) {
      console.error('Error general en migraciones:', error);
      return {
        success: false,
        executed: 0,
        errors: [error.message],
      };
    }
  }

  async rollbackMigration(migration: Migration): Promise<void> {
    const db = await this.getDatabase();

    try {
      console.log(
        `Revertiendo migración ${migration.version}: ${migration.name}`,
      );
      await migration.down(db);
      await this.removeMigration(migration.version);
      console.log(`Migración ${migration.version} revertida exitosamente`);
    } catch (error) {
      console.error('Error al revertir migración:', error);
      throw error;
    }
  }
}

export const migrationService = new MigrationService();

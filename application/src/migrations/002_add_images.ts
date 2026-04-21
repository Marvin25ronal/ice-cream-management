import { Migration } from "../database/Migration.interface";

export const migration_002_add_images: Migration = {
    version: 2,
    name: "add_legacy_image_columns",
    forceOnStartup: true, // CRÍTICO: Esta migración debe ejecutarse al iniciar la app
    up: async (db: any): Promise<void> => {
        return new Promise((resolve, reject) => {
            // ALTER TABLE product ADD COLUMN image_type TEXT DEFAULT 'legacy';
            db.transaction((tx: any) => {
                tx.executeSql(
                    "ALTER TABLE product ADD COLUMN image_type TEXT DEFAULT 'legacy'",
                    [],
                    () => {
                        console.log("Columna image_type agregada a la tabla product");
                        resolve();
                    },
                    (_: any, error: any) => {
                        console.error("Error al agregar la columna image_type:", error);
                        reject(error);
                        return false;
                    }
                )

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
}
export interface Migration {
  version: number;
  name: string;
  up: (db: any) => Promise<void>;
  down: (db: any) => Promise<void>;
  /**
   * Si es true, esta migración se ejecutará automáticamente al iniciar la app
   * Usar solo para migraciones críticas que DEBEN ejecutarse para que la app funcione
   */
  forceOnStartup?: boolean;
}

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-11.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 *
 * Registro de caja: apertura de turno y rectificaciones (ajustes) de efectivo físico.
 * No es una entidad de TypeORM: se maneja con SQL crudo vía react-native-sqlite-storage,
 * igual que el sistema de migraciones (ver src/database/MigrationService.ts).
 */
export class CashRegister {
  id!: number;
  amount!: number;
  type!: 'opening' | 'adjustment';
  reason!: string;
  date!: Date;
}

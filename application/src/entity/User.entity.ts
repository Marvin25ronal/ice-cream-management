/**
 * Usuario de la app (selección simple, sin contraseña) — se usa para saber
 * quién está operando la caja en cada momento y a qué hora llegó cada día.
 * No es una entidad de TypeORM: se maneja con SQL crudo vía
 * react-native-sqlite-storage, igual que CashRegister/MigrationService.
 */
export class User {
  user_id!: number;
  name!: string;
  active!: boolean;
  order!: number;
}

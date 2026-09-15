import { Migration } from '../database/Migration.interface';
import { migration_001_create_product_schedules } from './001_create_product_schedules';
import { migration_002_add_images } from './002_add_images';
import { migration_003_create_expense_types } from './003_create_expense_types';
import { migration_004_create_expenses } from './004_create_expenses';
import { migration_005_add_icon_to_expense_type } from './005_add_icon_to_expense_type';
import { migration_006_create_cash_register } from './006_create_cash_register';
import { migration_007_create_users } from './007_create_users';
import { migration_008_create_user_sessions } from './008_create_user_sessions';
import { migration_009_create_app_state } from './009_create_app_state';
import { migration_010_add_user_id_to_order_and_cash_register } from './010_add_user_id_to_order_and_cash_register';
import { migration_011_add_delete_tracking_to_order } from './011_add_delete_tracking_to_order';

/**
 * Lista de todas las migraciones disponibles
 * IMPORTANTE: Agregar nuevas migraciones al final del array
 * y asegurarse de que el número de versión sea secuencial
 */
export const allMigrations: Migration[] = [
  migration_001_create_product_schedules,
  migration_002_add_images,
  migration_003_create_expense_types,
  migration_004_create_expenses,
  migration_005_add_icon_to_expense_type,
  migration_006_create_cash_register,
  migration_007_create_users,
  migration_008_create_user_sessions,
  migration_009_create_app_state,
  migration_010_add_user_id_to_order_and_cash_register,
  migration_011_add_delete_tracking_to_order,
];

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
import { migration_012_fix_order_status_for_paid_orders } from './012_fix_order_status_for_paid_orders';
import { migration_013_create_raw_material } from './013_create_raw_material';
import { migration_014_add_image_description_to_raw_material } from './014_add_image_description_to_raw_material';
import { migration_015_add_cost_to_raw_material } from './015_add_cost_to_raw_material';
import { migration_016_add_reorder_presets_to_raw_material } from './016_add_reorder_presets_to_raw_material';
import { migration_017_create_product_raw_material } from './017_create_product_raw_material';
import { migration_018_add_type_to_raw_material_movement } from './018_add_type_to_raw_material_movement';

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
  migration_012_fix_order_status_for_paid_orders,
  migration_013_create_raw_material,
  migration_014_add_image_description_to_raw_material,
  migration_015_add_cost_to_raw_material,
  migration_016_add_reorder_presets_to_raw_material,
  migration_017_create_product_raw_material,
  migration_018_add_type_to_raw_material_movement,
];

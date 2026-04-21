import {Migration} from '../database/Migration.interface';
import {migration_001_create_product_schedules} from './001_create_product_schedules';
import {migration_002_add_images} from './002_add_images';
import {migration_003_create_expense_types} from './003_create_expense_types';
import {migration_004_create_expenses} from './004_create_expenses';
import {migration_005_add_icon_to_expense_type} from './005_add_icon_to_expense_type';

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
];

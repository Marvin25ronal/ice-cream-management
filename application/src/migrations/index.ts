import {Migration} from '../database/Migration.interface';
import {migration_001_create_product_schedules} from './001_create_product_schedules';
import { migration_002_add_images } from './002_add_images';

/**
 * Lista de todas las migraciones disponibles
 * IMPORTANTE: Agregar nuevas migraciones al final del array
 * y asegurarse de que el número de versión sea secuencial
 */
export const allMigrations: Migration[] = [
  migration_001_create_product_schedules,
  migration_002_add_images,
  // Agregar aquí nuevas migraciones en orden secuencial
  // migration_002_nombre_de_la_migracion,
  // migration_003_nombre_de_la_migracion,
];

/**
 * Receta de un producto: cuánta materia prima consume por cada unidad
 * vendida (ej. "Helado 1 bola" consume 1 Cono + 60 g de Helado). Se usa
 * para descontar el inventario automáticamente al cobrar una orden.
 *
 * No es una entidad de TypeORM: se maneja con SQL crudo vía
 * react-native-sqlite-storage, igual que RawMaterial. `product` sí es una
 * entidad de TypeORM, pero la relación se resuelve aquí manualmente.
 */
export class ProductRawMaterial {
  id!: number;
  product_id!: number;
  raw_material_id!: number;
  /** Cantidad consumida por cada unidad vendida del producto. */
  quantity!: number;
}

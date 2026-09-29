/**
 * Materia prima (insumo) que se descuenta del inventario al venderse un
 * producto que la use, por ejemplo un "Cono" o "Vaso 8oz". `stock` es la
 * cantidad actual disponible; se ajusta mediante movimientos (ver
 * RawMaterialMovement) en lugar de editarse directamente.
 *
 * No es una entidad de TypeORM: se maneja con SQL crudo vía
 * react-native-sqlite-storage, igual que User/CashRegister.
 */
export class RawMaterial {
  raw_material_id!: number;
  name!: string;
  /** Unidad de medida: 'Unidad', 'g', 'kg', 'ml', 'L', etc. */
  unit!: string;
  stock!: number;
  /** Costo promedio ponderado por unidad, recalculado en cada compra. */
  avg_cost!: number;
  active!: boolean;
  order!: number;
  /** Ruta local de la foto (filesystem), igual patrón que Product.image. */
  image?: string | null;
  /** Para qué se usa, ej. "Se usa para servir helados de 1 y 2 bolas". */
  description?: string | null;
  /**
   * Cantidades típicas en las que se compra este insumo (ej. [20, 30, 50]
   * para bolsas de conos), para seleccionarlas rápido al registrar una
   * compra en vez de escribir la cantidad cada vez. No incluye precio:
   * el costo se ingresa en cada compra porque cambia según el proveedor.
   */
  reorder_presets!: number[];
}

/**
 * Movimiento de inventario de una materia prima: entradas (compras) con
 * cantidad positiva, o ajustes/consumos con cantidad negativa. El stock
 * actual de RawMaterial es la suma de todos sus movimientos.
 *
 * No es una entidad de TypeORM: se maneja con SQL crudo vía
 * react-native-sqlite-storage, igual que CashRegister.
 */
export class RawMaterialMovement {
  id!: number;
  raw_material_id!: number;
  quantity!: number;
  /**
   * 'purchase' = entrada por compra, 'adjustment' = rectificación de
   * conteo, 'sale' = descuento (o reversión) automático por venta de un
   * producto que usa esta materia prima en su receta.
   */
  type!: 'purchase' | 'adjustment' | 'sale';
  /** Costo por unidad pagado en esta compra (null si no se registró costo). */
  unit_cost?: number | null;
  reason!: string;
  date!: Date;
  user_id?: number | null;
}

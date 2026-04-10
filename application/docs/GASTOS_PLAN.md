# Plan de Implementación: Módulo de Gastos

> Basado en: `docs/GASTOS.MD`  
> Fecha de planificación: 2026-04-08  
> Versión actual del sistema: 1.3.0 (rama `develop`)

---

## Resumen Ejecutivo

Se integrará un módulo completo de **gestión de gastos** al sistema existente. El módulo consta de tres pilares:

1. **Mantenimiento de tipos de gastos** — catálogo configurable de categorías de gasto.
2. **Registro diario de gastos** — los usuarios seleccionan un tipo y registran el monto.
3. **Reporte de cierre del día actualizado** — ventas menos gastos, imprimible con la impresora térmica existente.

---

## Estado Actual del Sistema

### Lo que ya existe (reutilizable)

| Componente | Ubicación | Relevancia para Gastos |
|---|---|---|
| TypeORM + SQLite | `src/store/db/Database.ts` | Base de datos a usar para las nuevas entidades |
| Sistema de migraciones | `src/database/MigrationService.ts` + `src/migrations/` | Crear tablas nuevas sin tocar el DB bundled |
| `DailyReport` page | `src/pages/DailyReport.tsx` | Se extenderá para mostrar gastos y neto |
| `PrintService` | `src/services/PrintService.ts` | Se extenderá con método de cierre diario |
| `OrderFilter` component | `src/components/Order/OrderFilter.tsx` | Reutilizable para filtrar gastos por fecha |
| `DrawerNavigator` | `src/routes/DrawerNavigator.tsx` | Agregar nueva entrada "Gastos" al menú lateral |
| Constantes de pantallas | `src/constants/navigation/screeens.ts` | Agregar nuevas rutas |
| Componentes UI genéricos | `src/components/UI/` | `ButtonComponent`, `CustomInputComponent`, `ModalComponent`, `GenericModal` |
| Theme / estilos | `src/styles/Theme.ts` | Estilos consistentes con el resto del app |
| `CURRENCY_SYMBOL` | `src/constants/utils.ts` | Para mostrar montos correctamente |

### Lo que NO existe (hay que crear)

- Entidades: `ExpenseType`, `Expense`
- Servicios: `ExpenseTypeService`, `ExpenseService`
- Pantallas: mantenimiento de tipos, registro de gastos, historial de gastos
- Migración de base de datos para las dos nuevas tablas
- Extensión del reporte diario con sección de gastos
- Método de impresión del cierre del día

---

## Arquitectura de la Solución

```
DrawerNavigator
├── Cobradora (existente)
├── Ordenes (existente)
├── FEL (existente)
├── Reportes Diarios (existente → MODIFICAR para incluir gastos)
├── Gastos (NUEVO)
│   ├── GastosPage — registro de gastos del día
│   └── HistorialGastosPage — lista de gastos registrados
├── Mantenimiento → Tipos de Gastos (NUEVO dentro del stack existente)
├── Editar Productos (existente)
└── Backup (existente)
```

---

## Modelo de Datos

### Entidad: `ExpenseType` (Tipos de Gasto)

Catálogo configurable. El usuario puede definir sus propias categorías.

```typescript
// src/entity/ExpenseType.entity.ts
@Entity()
export class ExpenseType {
  @PrimaryGeneratedColumn()
  expense_type_id: number;

  @Column()
  name: string;              // Ej: "Ingredientes", "Luz", "Agua", "Personal"

  @Column({ nullable: true })
  description: string;       // Descripción opcional

  @Column({ default: true })
  active: boolean;           // Para soft-delete, no borrar físicamente

  @Column({ default: 0 })
  order: number;             // Para ordenar en la lista

  @OneToMany(() => Expense, expense => expense.expenseType)
  expenses: Expense[];
}
```

**Registro especial:** Debe existir por defecto un tipo llamado **"Otros"** que habilita un campo de texto libre al registrar el gasto.

### Entidad: `Expense` (Gastos)

Historial de gastos registrados por día.

```typescript
// src/entity/Expense.entity.ts
@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column()
  amount: number;            // Monto del gasto (positivo)

  @Column()
  date: Date;                // Fecha/hora del registro

  @Column({ nullable: true })
  notes: string;             // Texto libre (obligatorio si tipo es "Otros")

  @ManyToOne(() => ExpenseType, expenseType => expenseType.expenses)
  @JoinColumn({ name: 'expense_type_id' })
  expenseType: ExpenseType;

  @Column()
  expense_type_id: number;   // FK explícita para queries
}
```

---

## Fases de Implementación

---

### FASE 1 — Base de Datos

**Objetivo:** Crear las tablas en SQLite sin romper la base existente.

**Archivos a crear:**
- `src/entity/ExpenseType.entity.ts`
- `src/entity/Expense.entity.ts`
- `src/migrations/003_create_expense_types.ts`
- `src/migrations/004_create_expenses.ts`

**Tareas:**

1. Crear entidad `ExpenseType` con los campos descritos arriba.
2. Crear entidad `Expense` con los campos descritos arriba.
3. Crear migración `003_create_expense_types`:
   - Crea tabla `expense_type`
   - Inserta datos semilla: `["Ingredientes", "Agua", "Luz", "Personal", "Transporte", "Otros"]`
4. Crear migración `004_create_expenses`:
   - Crea tabla `expense`
   - FK hacia `expense_type(expense_type_id)`
5. Registrar ambas entidades en `src/store/db/Database.ts` (array `entities`).
6. Registrar ambas migraciones en `src/migrations/index.ts`.

**Consideraciones:**
- El sistema ya tiene `MigrationService` que aplica migraciones pendientes al iniciar el app.
- `synchronize: false` en TypeORM — todo cambio de esquema debe ir en migración.
- Las migraciones deben ser idempotentes (usar `CREATE TABLE IF NOT EXISTS`).

---

### FASE 2 — Servicios (Capa de Acceso a Datos)

**Objetivo:** Encapsular toda la lógica de base de datos en la capa de servicios.

**Archivos a crear:**
- `src/services/ExpenseTypeService.ts`
- `src/services/ExpenseService.ts`

#### `ExpenseTypeService` — métodos requeridos:

```typescript
getAll(): Promise<ExpenseType[]>           // Lista todos los tipos activos, ordenados por `order`
getById(id: number): Promise<ExpenseType>
create(name: string, description?: string): Promise<ExpenseType>
update(id: number, data: Partial<ExpenseType>): Promise<ExpenseType>
deactivate(id: number): Promise<void>      // Soft-delete (active = false)
reorder(ids: number[]): Promise<void>      // Actualiza el campo `order`
```

#### `ExpenseService` — métodos requeridos:

```typescript
getByDate(date: string): Promise<Expense[]>               // Gastos del día
getByDateRange(start: string, end: string): Promise<Expense[]>
getTotalByDate(date: string): Promise<number>             // Suma total del día
create(expenseTypeId: number, amount: number, notes?: string): Promise<Expense>
delete(expenseId: number): Promise<void>
```

**Consideraciones:**
- Seguir el mismo patrón que `OrderService`: métodos devuelven `Promise`, acceso a DB vía `connectToDatabase()`.
- El formato de fecha en `getAllOrders` usa `DD/MM/YYYY` — usar el mismo formato para consistencia.

---

### FASE 3 — Mantenimiento de Tipos de Gastos

**Objetivo:** Pantalla CRUD para que el usuario administre sus categorías de gasto.

**Archivos a crear:**
- `src/pages/ExpenseTypeMaintenance.tsx`
- `src/components/Expenses/ExpenseTypeListItem.tsx`

**Flujo de la pantalla:**

```
ExpenseTypeMaintenance
├── Header con botón "+ Agregar Tipo"
├── Lista de tipos activos (FlatList)
│   └── ExpenseTypeListItem
│       ├── Nombre del tipo
│       ├── Descripción (si tiene)
│       ├── Botón editar → abre modal
│       └── Botón eliminar → confirmación → soft-delete
└── Modal de creación/edición
    ├── Input: Nombre (requerido)
    ├── Input: Descripción (opcional)
    └── Botones: Guardar / Cancelar
```

**Acceso desde la app:**
- Agregar opción "Tipos de Gastos" dentro del stack de **Mantenimiento** existente (`src/routes/MaintenanceStack.tsx`).
- Alternativamente, dentro del drawer como ítem independiente si el flujo lo amerita.

**Componentes UI a reutilizar:**
- `GenericModal` (`src/components/UI/GenericModal.tsx`) para el formulario de crear/editar.
- `CustomInputComponent` para los campos de texto.
- `ButtonComponent` para acciones.

---

### FASE 4 — Registro y Visualización de Gastos del Día

**Objetivo:** Pantalla principal del módulo donde el usuario registra gastos y ve el historial del día.

**Archivos a crear:**
- `src/pages/GastosPage.tsx`
- `src/components/Expenses/ExpenseListItem.tsx`
- `src/components/Expenses/RegisterExpenseModal.tsx`

**Flujo de la pantalla:**

```
GastosPage
├── Selector de fecha (reutilizar OrderFilter o componente propio)
├── Resumen del día
│   ├── Total gastos del día: Q XX.XX
│   └── Número de gastos registrados: N
├── Botón "+ Registrar Gasto" → abre RegisterExpenseModal
├── Lista de gastos del día (FlatList)
│   └── ExpenseListItem
│       ├── Ícono/color del tipo de gasto
│       ├── Nombre del tipo
│       ├── Notas (si existen)
│       ├── Monto
│       ├── Hora de registro
│       └── Botón eliminar (con confirmación)
└── RegisterExpenseModal
    ├── Lista/selector de tipos de gasto (botones tipo chip o lista)
    ├── Input: Monto (numérico, requerido)
    ├── Input: Notas (texto libre)
    │   └── [Obligatorio si tipo === "Otros"]
    └── Botones: Guardar / Cancelar
```

**Consideraciones UX:**
- Los tipos de gasto deben mostrarse como botones visuales (chips), no un dropdown, para velocidad de entrada.
- El campo "Notas" aparece siempre pero se vuelve obligatorio cuando el tipo seleccionado es "Otros".
- Al guardar, la lista se actualiza inmediatamente (optimistic update o refetch).
- Mostrar confirmación antes de eliminar un gasto.

**Navegación:**
- Agregar `GASTOS_STACK = 'Gastos'` y `GASTOS = 'Registro de Gastos'` en `src/constants/navigation/screeens.ts`.
- Crear `src/routes/GastosNavigator.tsx` como Stack Navigator (similar a `DailyReportNavigator`).
- Registrar en `DrawerNavigator` con ícono apropiado (sugerencia: `MaterialCommunityIcons` → `"cash-minus"` o `"bank-minus"`).

---

### FASE 5 — Actualización del Reporte Diario

**Objetivo:** Integrar los gastos al reporte existente `DailyReport.tsx` para mostrar el balance neto del día.

**Archivo a modificar:**
- `src/pages/DailyReport.tsx`

**Cambios requeridos:**

1. **Importar y usar `ExpenseService`** para obtener gastos del mismo rango de fechas que las órdenes.

2. **Agregar estado:**
   ```typescript
   const [totalExpenses, setTotalExpenses] = useState(0);
   const [expenses, setExpenses] = useState<Expense[]>([]);
   const [netBalance, setNetBalance] = useState(0);  // total ventas - total gastos
   ```

3. **Calcular neto** cuando cambien `total` o `totalExpenses`:
   ```typescript
   useEffect(() => {
     setNetBalance(total - totalExpenses);
   }, [total, totalExpenses]);
   ```

4. **Nueva sección visual en el reporte** (insertar después de "Ingresos del Día"):

   ```
   ── Sección: Gastos del Día ──────────────────────
   [ Card rojo ] Total Gastos        Q XX.XX
   
   ── Sección: Balance del Día ─────────────────────
   [ Card verde/rojo ] Neto (Ventas - Gastos)  Q XX.XX
   
   ── Sección: Detalle de Gastos ───────────────────
   Lista de gastos con tipo, notas y monto
   ```

5. **Sincronizar filtro de fecha:** La llamada a `ExpenseService.getByDateRange()` debe usar las mismas fechas que `getOrders()`. Extraer la lógica de parseo en ambas llamadas dentro de la función `getOrders` del componente.

**Color del neto:**
- Verde si `netBalance >= 0`
- Rojo si `netBalance < 0`

---

### FASE 6 — Impresión del Cierre del Día

**Objetivo:** Agregar método a `PrintService` para imprimir el resumen diario completo: ventas, gastos y neto.

**Archivo a modificar:**
- `src/services/PrintService.ts`

**Nuevo método:** `printDailySummary`

```typescript
async printDailySummary(
  date: string,
  totalSales: number,
  cash: number,
  card: number,
  expenses: Expense[],
  totalExpenses: number,
  netBalance: number
): Promise<void>
```

**Formato del ticket de cierre:**

```
================================
    CIERRE DEL DÍA
    [NOMBRE DEL NEGOCIO]
================================
Fecha: DD/MM/YYYY

-- VENTAS --
Total Ventas:        Q XXX.XX
  Efectivo:          Q XXX.XX
  Tarjeta:           Q XXX.XX

-- GASTOS --
[Tipo de Gasto]      Q XX.XX
[Tipo de Gasto]      Q XX.XX
[Tipo] - [Nota]      Q XX.XX
...
Total Gastos:        Q XXX.XX

================================
NETO DEL DÍA:        Q XXX.XX
================================

[Firma/Línea en blanco para firma]
================================
```

**Dónde agregar el botón de impresión:**
- En `DailyReport.tsx`, agregar un `FloatingActionButton` o botón en el header con ícono de impresora.
- Reutilizar el flujo de `PrintService.initPrinter()` → `connectPrinter()` → `printDailySummary()`.
- Si la impresora no está disponible, mostrar el alert existente `AlertFunctions.showNoPrinter()`.

---

## Orden de Implementación Recomendado

```
Fase 1 (DB)
    → Fase 2 (Servicios)
        → Fase 3 (Mantenimiento tipos) ──┐
        → Fase 4 (Registro gastos)       ├── Paralelo
                                         ↓
                                    Fase 5 (Reporte)
                                         ↓
                                    Fase 6 (Impresión)
```

Las fases 3 y 4 pueden desarrollarse en paralelo porque no dependen entre sí (ambas dependen de Fase 1 y 2). Las fases 5 y 6 dependen de que los datos de gastos ya existan y sean accesibles.

---

## Checklist de Implementación

### Fase 1 — Base de Datos
- [ ] Crear `src/entity/ExpenseType.entity.ts`
- [ ] Crear `src/entity/Expense.entity.ts`
- [ ] Crear `src/migrations/003_create_expense_types.ts` con datos semilla
- [ ] Crear `src/migrations/004_create_expenses.ts`
- [ ] Registrar entidades en `src/store/db/Database.ts`
- [ ] Registrar migraciones en `src/migrations/index.ts`
- [ ] Verificar que las migraciones corren correctamente en app fresh install

### Fase 2 — Servicios
- [ ] Crear `src/services/ExpenseTypeService.ts` con todos los métodos
- [ ] Crear `src/services/ExpenseService.ts` con todos los métodos
- [ ] Validar que los queries retornan datos correctos

### Fase 3 — Mantenimiento Tipos
- [ ] Crear `src/components/Expenses/ExpenseTypeListItem.tsx`
- [ ] Crear `src/pages/ExpenseTypeMaintenance.tsx`
- [ ] Agregar pantalla al stack de Mantenimiento (`src/routes/MaintenanceStack.tsx`)
- [ ] Agregar constante de navegación en `screeens.ts`

### Fase 4 — Registro de Gastos
- [ ] Crear `src/components/Expenses/ExpenseListItem.tsx`
- [ ] Crear `src/components/Expenses/RegisterExpenseModal.tsx`
- [ ] Crear `src/pages/GastosPage.tsx`
- [ ] Agregar constantes en `screeens.ts` (`GASTOS_STACK`, `GASTOS`)
- [ ] Crear `src/routes/GastosNavigator.tsx`
- [ ] Agregar entrada "Gastos" en `DrawerNavigator.tsx` con ícono y color
- [ ] Agregar case en `getMenuItemData()` del DrawerNavigator

### Fase 5 — Reporte Diario
- [ ] Importar `ExpenseService` en `DailyReport.tsx`
- [ ] Agregar estados `totalExpenses`, `expenses`, `netBalance`
- [ ] Modificar función `getOrders` para también cargar gastos
- [ ] Agregar sección "Gastos del Día" al render
- [ ] Agregar sección "Balance Neto" al render
- [ ] Agregar sección "Detalle de Gastos" al render
- [ ] Aplicar colores dinámicos al neto (verde/rojo)

### Fase 6 — Impresión
- [ ] Agregar método `printDailySummary` en `PrintService.ts`
- [ ] Agregar botón de impresión en `DailyReport.tsx`
- [ ] Conectar botón con `PrintService` respetando flujo de init/connect
- [ ] Validar formato del ticket en impresora física

---

## Notas Técnicas Importantes

1. **Formato de fechas:** El sistema usa `DD/MM/YYYY` como string para queries (ver `OrderService.parseStringToDate`). Los nuevos servicios deben seguir el mismo formato para poder reutilizar `OrderFilter`.

2. **TypeORM decorators:** Siempre seguir el patrón existente de entidades. Los decoradores requieren `reflect-metadata` y la configuración de Babel ya está lista.

3. **No usar `synchronize: true`:** Todos los cambios de esquema van en migraciones numeradas en `src/migrations/`.

4. **Soft-delete en ExpenseType:** No eliminar físicamente los tipos de gasto porque los registros históricos de `Expense` tienen FK a ellos. Usar `active = false`.

5. **Impresión:** La biblioteca `react-native-ect-thermal-receipt-printer` requiere conexión USB activa. El flujo siempre debe ser: `initPrinter()` → `connectPrinter()` → método de impresión.

6. **Tipo "Otros":** Implementar la lógica de campo obligatorio de notas por nombre (`name === 'Otros'`), no por ID, ya que el ID puede variar entre instalaciones si los seeds se insertan en distinto orden. Agregar un campo `is_custom: boolean` en la entidad para marcarlo explícitamente.

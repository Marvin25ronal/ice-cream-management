# Plan de Reestructuración: Módulo de Reportes

> Fecha: 2026-04-08  
> Versión actual: 1.3.0  
> Basado en: análisis del `DailyReport.tsx` existente + esquema de base de datos

---

## 1. Diagnóstico del Estado Actual

### Problema
`DailyReport.tsx` es una pantalla monolítica de ~970 líneas que mezcla todos los datos en un solo scroll:
- Métricas de órdenes
- Ingresos (total, efectivo, tarjeta)
- KPIs (ticket promedio, hora pico, tasa conversión)
- Top 10 productos (bar chart + lista)
- Distribución de métodos de pago (pie chart)
- Frecuencia de órdenes por hora (line chart)
- Gastos del día (agregado en la sesión anterior)
- Balance neto + botón de impresión

**Consecuencias:**
- Información abrumadora en un solo lugar
- Difícil de leer rápido (hay que hacer mucho scroll)
- No permite comparar o explorar un aspecto específico
- Tiempo de renderizado alto (carga todos los charts a la vez)
- El `OrderFilter` no es intuitivo para todos los contextos

### Lo que ya existe y se puede reutilizar

| Elemento | Dónde está | Reutilizable |
|---|---|---|
| `OrderFilter` | `src/components/Order/OrderFilter.tsx` | Sí, como componente de filtro de fecha genérico |
| `OrderService.getAllOrders()` | `src/services/OrderServices.ts` | Sí |
| `ExpenseService.getByDateRange()` | `src/services/ExpenseService.ts` | Sí |
| Cálculos de KPIs | `DailyReport.tsx` (inline) | Mover a servicios |
| `PrintService.printDailySummary()` | `src/services/PrintService.ts` | Sí |
| Componentes de gráficas | `react-native-chart-kit` instalado | Sí |
| `LinearGradient` | Instalado | Sí |
| `react-native-reanimated` v3 | Instalado | Sí |

---

## 2. Arquitectura Propuesta

### Estructura de navegación nueva

```
DrawerNavigator
└── REPORTES_STACK  (antes "Reportes Diarios")
    └── ReportesNavigator (Stack)
        ├── ReportesHub          ← Pantalla principal / landing
        ├── ReporteVentas        ← Solo ventas y métodos de pago
        ├── ReporteProductos     ← Ranking productos más vendidos
        ├── ReporteCategorias    ← Ventas agrupadas por categoría
        └── ReporteGastos        ← Gastos, neto y cierre del día
```

### Filosofía de diseño

- **Hub → Sub-reporte:** El usuario llega a un hub con 4 cards visuales. Cada card muestra el KPI más importante de ese reporte como preview. Toca la card → entra al reporte completo.
- **Filtro de fecha local a cada reporte:** Cada sub-pantalla tiene su propio `DateFilter` liviano. Sin depender del filtro global.
- **Un chart por pantalla:** Cada reporte tiene exactamente un gráfico principal, sin saturar.
- **Carga lazy:** Los charts solo renderizan cuando la pantalla está en foco (`useFocusEffect`).
- **Performance:** Todos los items de lista con `React.memo` + `useCallback`. `StyleSheet.create` sin objetos inline.

### Paleta de colores por reporte

| Reporte | Color primario | Gradiente |
|---|---|---|
| Ventas | `#27AE60` → `#2ECC71` | Verde |
| Productos | `#8B5CF6` → `#A78BFA` | Violeta |
| Categorías | `#F59E0B` → `#FCD34D` | Ámbar |
| Gastos & Cierre | `#FF6348` → `#FF8C42` | Coral (ya establecido) |

---

## 3. Pantallas en Detalle

---

### 3.1 `ReportesHub` — Pantalla de entrada

**Objetivo:** Vista de un vistazo del día, con acceso rápido a cada reporte.

```
┌────────────────────────────────────┐
│  HOY – Martes 8 de abril          │
│  [Filtro de fecha rápido: Hoy / Semana / Mes] │
├──────────────┬─────────────────────┤
│ 💰 VENTAS   │  Q. 1,250.00       │
│ 47 órdenes  │  ──────────────>    │
├──────────────┼─────────────────────┤
│ 🏆 PRODUCTOS│  🍦 Fresa #1       │
│ Top vendido  │  ──────────────>    │
├──────────────┼─────────────────────┤
│ 📂 CATEGORÍAS│  Paletas 38%      │
│ Mayor ingreso │  ──────────────>   │
├──────────────┼─────────────────────┤
│ 💸 GASTOS   │  Q. 320.00         │
│ Neto: Q. 930 │  ──────────────>    │
└──────────────┴─────────────────────┘
```

**Comportamiento:**
- Las 4 cards muestran el KPI más relevante del día actual al entrar.
- Toca una card → navega al reporte correspondiente con la misma fecha cargada.
- El filtro de fecha en el hub actualiza los KPIs de las 4 cards simultáneamente.
- Cada card tiene el color y gradiente del reporte al que pertenece.
- `useFocusEffect` recarga los KPIs cada vez que el usuario regresa al hub.

**Datos necesarios:**
```
totalVentas    ← sum(order.total) WHERE payment_date NOT NULL
topProducto    ← nombre del producto con más unidades vendidas
topCategoria   ← nombre de categoría con mayor revenue
totalGastos    ← sum(expense.amount)
neto           ← totalVentas - totalGastos
```

---

### 3.2 `ReporteVentas` — Reporte de Ventas

**Objetivo:** Análisis completo de lo vendido, sin mezclar gastos ni productos.

**Secciones:**

```
[DateFilter rápido]

── RESUMEN ──────────────────────────
  Total vendido:        Q. 1,250.00
  Órdenes completadas:  47
  Órdenes canceladas:   3
  Ticket promedio:      Q. 26.60

── MÉTODOS DE PAGO ──────────────────
  [PieChart: Efectivo vs Tarjeta]
  Efectivo:  Q. 890.00  (71%)
  Tarjeta:   Q. 360.00  (29%)

── ACTIVIDAD POR HORA ───────────────
  [LineChart: órdenes/hora 08:00-22:00]
  Hora pico: 13:00 (12 órdenes)

── KPIs ─────────────────────────────
  Ticket promedio:      Q. 26.60
  Productos por orden:  2.4
  Tasa de conversión:   94%
```

**Chart principal:** LineChart de frecuencia de órdenes por hora.  
**Chart secundario:** PieChart efectivo vs tarjeta.

---

### 3.3 `ReporteProductos` — Productos Más Vendidos

**Objetivo:** Ranking de productos por unidades vendidas o por revenue.

**Secciones:**

```
[DateFilter rápido]
[Toggle: Ordenar por CANTIDAD | INGRESOS]

── TOP PRODUCTOS ─────────────────────
  [BarChart horizontal con top 10]

  #1  Paleta de Fresa
      48 uds  ·  Q. 480.00

  #2  Helado de Vainilla
      35 uds  ·  Q. 385.00

  #3  Cono de Chocolate
      29 uds  ·  Q. 290.00
  ...

── ESTADÍSTICAS ──────────────────────
  Productos distintos vendidos: 18
  Producto sin ventas hoy: 4
  Precio promedio vendido: Q. 10.50
```

**Chart principal:** BarChart horizontal (mejor para nombres largos).  
**Interactividad:** Toggle cantidad/ingresos reordena la lista y actualiza el chart.

**Query necesaria (SQL directo vía TypeORM raw query):**
```sql
SELECT
  od.product_id,
  od.product_name,
  SUM(od.quantity)           AS total_qty,
  SUM(od.quantity * od.price) AS total_revenue
FROM OrderDetail od
JOIN "order" o ON od.order_id = o.order_id
WHERE o.payment_date IS NOT NULL
  AND o.creation_date BETWEEN ? AND ?
GROUP BY od.product_id, od.product_name
ORDER BY total_qty DESC
LIMIT 20
```

> **Nota:** `OrderDetail` ya guarda `product_id` y `product_name`, por lo que no se necesita join adicional a `Product` para este reporte. El nombre queda guardado en el momento de la venta, lo que además preserva el historial si el producto cambia de nombre.

---

### 3.4 `ReporteCategorias` — Ventas por Categoría

**Objetivo:** Ver qué categorías generan más ingresos y unidades.

**Secciones:**

```
[DateFilter rápido]

── DISTRIBUCIÓN POR CATEGORÍA ────────
  [PieChart o BarChart por categoría]

  📂 Paletas
     Revenue: Q. 620.00  (49%)
     Unidades: 62

  🍦 Helados
     Revenue: Q. 430.00  (34%)
     Unidades: 43

  🥤 Bebidas
     Revenue: Q. 200.00  (16%)
     Unidades: 20

── DETALLE ────────────────────────────
  Total categorías activas: 3
  Categoría sin ventas: 1
```

**Query necesaria (join de 3 tablas):**
```sql
SELECT
  c.category_id,
  c.name                     AS category_name,
  SUM(od.quantity)           AS total_qty,
  SUM(od.quantity * od.price) AS total_revenue
FROM OrderDetail od
JOIN product p  ON od.product_id  = p.product_id
JOIN category c ON p.category_id  = c.category_id
JOIN "order"  o ON od.order_id    = o.order_id
WHERE o.payment_date IS NOT NULL
  AND o.creation_date BETWEEN ? AND ?
GROUP BY c.category_id, c.name
ORDER BY total_revenue DESC
```

> **Limitación conocida:** Si un producto fue eliminado de la DB después de la venta, el join fallará y esa línea no aparecerá. Mitigación: usar `LEFT JOIN` y agrupar los nulos como "Sin categoría".

**Chart principal:** PieChart coloreado por categoría (más intuitivo para proporciones).

---

### 3.5 `ReporteGastos` — Gastos y Cierre del Día

**Objetivo:** Vista limpia de gastos + cálculo del cierre + impresión. (Ya implementado parcialmente.)

**Rediseño respecto a lo actual (integrado en DailyReport):**

```
[DateFilter rápido]

── RESUMEN ──────────────────────────
  Total Ventas:          Q. 1,250.00
  Total Gastos:          Q. 320.00
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NETO DEL DÍA:          Q. 930.00  ✅

── GASTOS REGISTRADOS ───────────────
  [Lista de gastos con ícono+color del tipo]
  🔴 Ingredientes  Q. 180.00  09:30
  🔵 Agua          Q. 45.00   08:00
  🟡 Luz           Q. 95.00   08:00

── DESGLOSE POR TIPO ────────────────
  [BarChart horizontal: gasto por tipo]

── ACCIONES ─────────────────────────
  [🖨️ Imprimir Cierre del Día]
```

**Diferencias clave con el diseño actual:**
- El neto está al tope (lo más importante), no al fondo después de scrollear.
- Agrega un BarChart de gastos por tipo (visualmente útil).
- Queda en su propia pantalla, sin mezclar con ventas ni productos.

---

## 4. Servicios Necesarios

### Nuevo: `ReportService` (`src/services/ReportService.ts`)

Centraliza todas las queries de reportes. Usa raw SQL vía `connectToDatabase()` para las queries complejas con joins.

```typescript
interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  avgTicket: number;
  cash: number;
  card: number;
  peakHour: string;
  conversionRate: number;
  avgProductsPerOrder: number;
  ordersByHour: number[];      // array de 15 valores (08:00-22:00)
}

interface ProductRanking {
  product_id: number;
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

interface CategorySales {
  category_id: number;
  category_name: string;
  total_qty: number;
  total_revenue: number;
  percentage: number;         // calculado en el servicio
}

interface HubKPIs {
  totalVentas: number;
  totalOrdenes: number;
  topProduct: string;
  topCategory: string;
  totalGastos: number;
  neto: number;
}

class ReportService {
  getSalesSummary(start: string, end: string): Promise<SalesSummary>
  getProductRanking(start: string, end: string, limit?: number): Promise<ProductRanking[]>
  getCategorySales(start: string, end: string): Promise<CategorySales[]>
  getHubKPIs(start: string, end: string): Promise<HubKPIs>
}
```

**Estrategia de queries:**
- `getSalesSummary`: usa TypeORM `find` con `Between` (como el actual `OrderService.getAllOrders`) + cálculos en JS. Sin raw SQL.
- `getProductRanking`: raw SQL con `GROUP BY` (TypeORM no tiene aggregation directa).
- `getCategorySales`: raw SQL con JOIN de 3 tablas.
- `getHubKPIs`: compone `getSalesSummary` + top de `getProductRanking` + top de `getCategorySales` + `ExpenseService`.

### Acceso a raw SQL en TypeORM

```typescript
const db = await connectToDatabase();
const result = await db.query(`SELECT ... `, [param1, param2]);
```

---

## 5. Componentes Compartidos Nuevos

### `ReportDateFilter` (`src/components/Reports/ReportDateFilter.tsx`)
Versión simplificada y unificada del `OrderFilter` existente. Chips de **Hoy / Semana / Mes / Personalizado**. Devuelve `{ start: string, end: string }`. Reutilizable en todos los sub-reportes.

**Diferencia clave con el actual `OrderFilter`:** No tiene el formulario react-hook-form ni el input de texto manual. Solo chips + calendar picker para "Personalizado". Más limpio y rápido.

### `KpiCard` (`src/components/Reports/KpiCard.tsx`)
Card con gradiente, ícono, valor principal y label. Memoizada. Reemplaza las `MetricCard` y `RevenueCard` inline del actual `DailyReport`.

### `ReportSectionTitle` (`src/components/Reports/ReportSectionTitle.tsx`)
Título de sección con línea decorativa coloreada. Evita duplicar el mismo `Text` con estilos repetidos.

---

## 6. Migración del `DailyReport` Existente

El archivo `DailyReport.tsx` **no se elimina inmediatamente**. La estrategia es:

1. Crear las 5 pantallas nuevas (`ReportesHub`, `ReporteVentas`, `ReporteProductos`, `ReporteCategorias`, `ReporteGastos`).
2. Actualizar `DailyReportNavigator` → `ReportesNavigator` para incluir todas las pantallas.
3. Actualizar el drawer para que apunte al nuevo stack.
4. Una vez que todo funciona, eliminar `DailyReport.tsx`.

El código de cálculo de KPIs del `DailyReport.tsx` se **mueve al `ReportService`**, no se duplica.

---

## 7. Consideraciones Técnicas

### Performance (vercel-react-native-skills)

| Regla | Aplicación en Reportes |
|---|---|
| `list-performance-item-memo` | `ProductRankingItem`, `CategoryItem`, `ExpenseItem` todos con `React.memo` |
| `list-performance-callbacks` | Todos los handlers en `useCallback` |
| `list-performance-inline-objects` | Cero objetos `{ }` dentro de `renderItem` |
| `animation-gpu-properties` | Solo `transform` y `opacity` para animaciones de entrada |
| `react-state-minimize` | Cada pantalla subscribe solo al estado que necesita |
| `rendering-no-falsy-and` | Usar ternarios en vez de `&&` para condicionales |
| `ui-pressable` | `Pressable` en vez de `TouchableOpacity` en todos lados |

### Carga de datos

- Cada pantalla usa `useFocusEffect` + `useCallback` para recargar cuando entra en foco.
- Los charts solo se renderizan cuando `loading === false` (evita el flash de 0s).
- El Hub carga sus 4 KPIs en paralelo con `Promise.all`.

### Charts disponibles (`react-native-chart-kit`)
- `LineChart` → Ventas por hora
- `BarChart` → Productos más vendidos, Gastos por tipo
- `PieChart` → Métodos de pago, Categorías

### Limitación de `react-native-chart-kit`
Los labels largos en el eje X/Y del BarChart se cortan. Para `ReporteProductos`, usar el chart solo con índices (`#1, #2...`) y la lista debajo con nombres completos (como ya hace el `DailyReport` actual). Documentado como patrón a mantener.

---

## 8. Actualización del Drawer

El ítem en el drawer cambia:
- Nombre: `"Reportes Diarios"` → `"Reportes"`  
- Ícono: `Ionicons "analytics"` → `MaterialCommunityIcons "chart-box"` (más general)
- Color: `#F59E0B` (ámbar) — se mantiene

---

## 9. Plan de Implementación por Fases

### Fase 1 — Servicios (base de todo)
- [ ] Crear `src/services/ReportService.ts` con `getSalesSummary`, `getProductRanking`, `getCategorySales`, `getHubKPIs`
- [ ] Mover la lógica de cálculo de KPIs desde `DailyReport.tsx` a `ReportService`
- [ ] Probar queries con datos reales

### Fase 2 — Componentes compartidos
- [ ] Crear `src/components/Reports/ReportDateFilter.tsx`
- [ ] Crear `src/components/Reports/KpiCard.tsx`
- [ ] Crear `src/components/Reports/ReportSectionTitle.tsx`

### Fase 3 — Sub-pantallas (paralelo)
- [ ] Crear `src/pages/Reports/ReportesHub.tsx`
- [ ] Crear `src/pages/Reports/ReporteVentas.tsx`
- [ ] Crear `src/pages/Reports/ReporteProductos.tsx`
- [ ] Crear `src/pages/Reports/ReporteCategorias.tsx`
- [ ] Crear `src/pages/Reports/ReporteGastos.tsx`

### Fase 4 — Navegación
- [ ] Agregar constantes en `screeens.ts`: `REPORTES_HUB`, `REPORTE_VENTAS`, `REPORTE_PRODUCTOS`, `REPORTE_CATEGORIAS`, `REPORTE_GASTOS`
- [ ] Crear `src/routes/ReportesNavigator.tsx` con las 5 pantallas
- [ ] Actualizar `DrawerNavigator.tsx`: reemplazar `DailyReportNavigator` por `ReportesNavigator`
- [ ] Actualizar label e ícono del drawer

### Fase 5 — Limpieza
- [ ] Eliminar `src/pages/DailyReport.tsx` (una vez verificado todo)
- [ ] Eliminar `src/routes/DailyReportNavigator.tsx`
- [ ] Limpiar imports huérfanos

---

## 10. Checklist de Implementación

### Servicios
- [ ] `ReportService.getSalesSummary(start, end)` → `SalesSummary`
- [ ] `ReportService.getProductRanking(start, end, limit)` → `ProductRanking[]`
- [ ] `ReportService.getCategorySales(start, end)` → `CategorySales[]`
- [ ] `ReportService.getHubKPIs(start, end)` → `HubKPIs`

### Componentes
- [ ] `ReportDateFilter` — chips Hoy/Semana/Mes + personalizado
- [ ] `KpiCard` — memoizado, recibe gradientColors, icon, value, label
- [ ] `ReportSectionTitle` — memoizado

### Pantallas
- [ ] `ReportesHub` — 4 cards navegables + filtro de fecha + `useFocusEffect`
- [ ] `ReporteVentas` — LineChart + PieChart + KPIs
- [ ] `ReporteProductos` — BarChart + lista memoizada + toggle Cantidad/Ingresos
- [ ] `ReporteCategorias` — PieChart + lista + porcentajes
- [ ] `ReporteGastos` — neto destacado + lista gastos + BarChart tipos + botón imprimir

### Navegación
- [ ] 5 constantes nuevas en `screeens.ts`
- [ ] `ReportesNavigator.tsx`
- [ ] Drawer actualizado

### Limpieza
- [ ] `DailyReport.tsx` eliminado
- [ ] `DailyReportNavigator.tsx` eliminado

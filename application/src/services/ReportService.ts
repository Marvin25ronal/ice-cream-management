import { connectToDatabase } from '../store/db/Database';
import { OrderService } from './OrderServices';
import { ExpenseService } from './ExpenseService';
import { Product } from '../entity/Product.entity';
import { Category } from '../entity/Category.entity';

export interface SalesSummary {
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
  ordersByHour: number[]; // 15 values: 08:00-22:00
}

export interface ProductRanking {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  /** Desde raíz hasta categoría del producto, ej. "Conos › Capuchinos" */
  category_path: string;
  total_qty: number;
  total_revenue: number;
}

export interface CategorySales {
  category_id: number;
  category_name: string;
  total_qty: number;
  total_revenue: number;
  percentage: number;
}

export interface HubKPIs {
  totalVentas: number;
  totalOrdenes: number;
  topProduct: string;
  topCategory: string;
  totalGastos: number;
  neto: number;
}

const _orderService = new OrderService();
const _expenseService = new ExpenseService();

export class ReportService {
  async getSalesSummary(start: string, end: string): Promise<SalesSummary> {
    const orders = await _orderService.getAllOrders(start, end);

    const completed = orders.filter((o: any) => o.payment_date != null);

    const totalRevenue = completed.reduce(
      (acc: number, o: any) => acc + o.total,
      0,
    );

    const cash = completed
      .filter((o: any) => o.payment_method === 1 || o.payment_method === 3)
      .reduce(
        (acc: number, o: any) =>
          acc +
          (o.orderPayment ?? []).reduce((a: number, p: any) => a + p.cash, 0),
        0,
      );

    const card = completed
      .filter((o: any) => o.payment_method === 2 || o.payment_method === 3)
      .reduce(
        (acc: number, o: any) =>
          acc +
          (o.orderPayment ?? []).reduce((a: number, p: any) => a + p.card, 0),
        0,
      );

    // Orders by hour 08:00-22:00
    const hourSlots: Record<string, number> = {};
    for (let h = 8; h <= 22; h++) {
      hourSlots[`${h < 10 ? '0' : ''}${h}:00`] = 0;
    }
    orders.forEach((o: any) => {
      const d = new Date(o.creation_date);
      const hKey = `${String(d.getHours()).padStart(2, '0')}:00`;
      if (hourSlots[hKey] !== undefined) {
        hourSlots[hKey]++;
      }
    });
    const ordersByHour = Object.values(hourSlots);

    const maxQty = ordersByHour.length > 0 ? Math.max(...ordersByHour) : 0;
    const peakHourKey =
      maxQty > 0
        ? (Object.keys(hourSlots).find(k => hourSlots[k] === maxQty) ?? '')
        : '';

    const totalProducts = completed.reduce((acc: number, o: any) => {
      return (
        acc +
        (o.orderDetails ?? []).reduce(
          (s: number, d: any) => s + d.quantity,
          0,
        )
      );
    }, 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      completedOrders: completed.length,
      cancelledOrders: orders.length - completed.length,
      avgTicket:
        completed.length > 0 ? totalRevenue / completed.length : 0,
      cash,
      card,
      peakHour: peakHourKey,
      conversionRate:
        orders.length > 0
          ? (completed.length / orders.length) * 100
          : 0,
      avgProductsPerOrder:
        completed.length > 0 ? totalProducts / completed.length : 0,
      ordersByHour,
    };
  }

  async getProductRanking(
    start: string,
    end: string,
    limit?: number,
  ): Promise<ProductRanking[]> {
    const [orders, db] = await Promise.all([
      _orderService.getAllOrders(start, end),
      connectToDatabase(),
    ]);
    const completed = (orders ?? []).filter((o: any) => o.payment_date != null);

    const [catalog, allCategories] = await Promise.all([
      db.manager.find(Product, {relations: {category: true}}),
      db.manager.find(Category),
    ]);

    const catById = new Map(allCategories.map(c => [c.category_id, c]));

    const buildCategoryPath = (leafId: number): string => {
      if (!leafId) {
        return 'Sin categoría';
      }
      const names: string[] = [];
      let id: number | null = leafId;
      const seen = new Set<number>();
      while (id != null && id > 0) {
        if (seen.has(id)) {
          break;
        }
        seen.add(id);
        const c = catById.get(id);
        if (!c) {
          break;
        }
        names.push(c.name);
        id = c.parent_id;
      }
      if (names.length === 0) {
        return 'Sin categoría';
      }
      return names.reverse().join(' › ');
    };

    const productCatMap = new Map<
      number,
      {id: number; name: string; path: string}
    >();
    for (const p of catalog) {
      const leafId = p.category?.category_id ?? 0;
      const leafName = p.category?.name ?? 'Sin categoría';
      productCatMap.set(p.product_id, {
        id: leafId,
        name: leafName,
        path: buildCategoryPath(leafId),
      });
    }

    const map = new Map<number, ProductRanking>();
    for (const order of completed) {
      for (const detail of order.orderDetails ?? []) {
        const cat = productCatMap.get(detail.product_id) ?? {
          id: 0,
          name: 'Sin categoría',
          path: 'Sin categoría',
        };
        const existing = map.get(detail.product_id);
        if (existing) {
          existing.total_qty += detail.quantity;
          existing.total_revenue += detail.quantity * detail.price;
        } else {
          map.set(detail.product_id, {
            product_id: detail.product_id,
            product_name: detail.product_name,
            category_id: cat.id,
            category_name: cat.name,
            category_path: cat.path,
            total_qty: detail.quantity,
            total_revenue: detail.quantity * detail.price,
          });
        }
      }
    }
    const sorted = [...map.values()].sort((a, b) => b.total_qty - a.total_qty);
    if (limit !== undefined) {
      return sorted.slice(0, limit);
    }
    return sorted;
  }

  async getCategorySales(
    start: string,
    end: string,
  ): Promise<CategorySales[]> {
    const [orders, db] = await Promise.all([
      _orderService.getAllOrders(start, end),
      connectToDatabase(),
    ]);
    const completed = (orders ?? []).filter((o: any) => o.payment_date != null);

    const products = await db.manager.find(Product, { relations: { category: true } });
    const productCatMap = new Map<number, { id: number; name: string }>();
    for (const p of products) {
      productCatMap.set(p.product_id, {
        id: p.category?.category_id ?? 0,
        name: p.category?.name ?? 'Sin categoría',
      });
    }

    const map = new Map<number, { name: string; qty: number; revenue: number }>();
    for (const order of completed) {
      for (const detail of (order.orderDetails ?? [])) {
        const cat = productCatMap.get(detail.product_id) ?? { id: 0, name: 'Sin categoría' };
        const existing = map.get(cat.id);
        if (existing) {
          existing.qty += detail.quantity;
          existing.revenue += detail.quantity * detail.price;
        } else {
          map.set(cat.id, {
            name: cat.name,
            qty: detail.quantity,
            revenue: detail.quantity * detail.price,
          });
        }
      }
    }

    const grandTotal = [...map.values()].reduce((acc, v) => acc + v.revenue, 0);

    return [...map.entries()]
      .map(([id, v]) => ({
        category_id: id,
        category_name: v.name,
        total_qty: v.qty,
        total_revenue: v.revenue,
        percentage: grandTotal > 0 ? (v.revenue / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);
  }

  async getHubKPIs(start: string, end: string): Promise<HubKPIs> {
    const [summary, products, categories, expenses] = await Promise.all([
      this.getSalesSummary(start, end),
      this.getProductRanking(start, end, 1),
      this.getCategorySales(start, end),
      _expenseService.getByDateRange(start, end),
    ]);

    const totalGastos = expenses.reduce(
      (acc: number, e: any) => acc + e.amount,
      0,
    );

    return {
      totalVentas: summary.totalRevenue,
      totalOrdenes: summary.completedOrders,
      topProduct: products[0]?.product_name ?? '—',
      topCategory: categories[0]?.category_name ?? '—',
      totalGastos,
      neto: summary.totalRevenue - totalGastos,
    };
  }
}

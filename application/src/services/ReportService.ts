import {connectToDatabase} from '../store/db/Database';
import {OrderService} from './OrderServices';
import {ExpenseService} from './ExpenseService';

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
  private parseStringToDate(dateString: string): Date {
    const parts = dateString.split('/');
    return new Date(
      parseInt(parts[2], 10),
      parseInt(parts[1], 10) - 1,
      parseInt(parts[0], 10),
    );
  }

  private toSqlDate(dateStr: string): string {
    const parts = dateStr.split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')} 00:00:00`;
  }

  private toSqlEndDate(dateStr: string): string {
    const date = this.parseStringToDate(dateStr);
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} 00:00:00`;
  }

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
    limit = 20,
  ): Promise<ProductRanking[]> {
    const db = await connectToDatabase();
    const startSql = this.toSqlDate(start);
    const endSql = this.toSqlEndDate(end);
    const rows: any[] = await db.query(
      `SELECT od.product_id, od.product_name,
              SUM(od.quantity)            AS total_qty,
              SUM(od.quantity * od.price) AS total_revenue
       FROM OrderDetail od
       JOIN "order" o ON od.order_id = o.order_id
       WHERE o.payment_date IS NOT NULL
         AND o.creation_date >= ? AND o.creation_date < ?
       GROUP BY od.product_id, od.product_name
       ORDER BY total_qty DESC
       LIMIT ?`,
      [startSql, endSql, limit],
    );
    return rows.map(r => ({
      product_id: Number(r.product_id),
      product_name: String(r.product_name ?? ''),
      total_qty: Number(r.total_qty ?? 0),
      total_revenue: Number(r.total_revenue ?? 0),
    }));
  }

  async getCategorySales(
    start: string,
    end: string,
  ): Promise<CategorySales[]> {
    const db = await connectToDatabase();
    const startSql = this.toSqlDate(start);
    const endSql = this.toSqlEndDate(end);
    const rows: any[] = await db.query(
      `SELECT
         COALESCE(c.category_id, 0)       AS category_id,
         COALESCE(c.name, 'Sin categoría') AS category_name,
         SUM(od.quantity)                 AS total_qty,
         SUM(od.quantity * od.price)      AS total_revenue
       FROM OrderDetail od
       JOIN "order" o ON od.order_id     = o.order_id
       LEFT JOIN product p  ON od.product_id = p.product_id
       LEFT JOIN category c ON p.category_id = c.category_id
       WHERE o.payment_date IS NOT NULL
         AND o.creation_date >= ? AND o.creation_date < ?
       GROUP BY COALESCE(c.category_id, 0), COALESCE(c.name, 'Sin categoría')
       ORDER BY total_revenue DESC`,
      [startSql, endSql],
    );

    const grandTotal = rows.reduce(
      (acc: number, r: any) => acc + Number(r.total_revenue ?? 0),
      0,
    );

    return rows.map(r => {
      const rev = Number(r.total_revenue ?? 0);
      return {
        category_id: Number(r.category_id),
        category_name: String(r.category_name),
        total_qty: Number(r.total_qty ?? 0),
        total_revenue: rev,
        percentage: grandTotal > 0 ? (rev / grandTotal) * 100 : 0,
      };
    });
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

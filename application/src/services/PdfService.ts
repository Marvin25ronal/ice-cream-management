import { NativeModules } from 'react-native';
import { Expense } from '../entity/Expense.entity';
import { CURRENCY_SYMBOL } from '../constants/utils';
import { AppConfig } from '../constants/AppConfig';

// react-native-print no trae tipos consistentes con su implementación real
// (su .d.ts describe una API que no coincide con el módulo nativo expuesto).
// El módulo nativo real es NativeModules.RNPrint con un método print({html}).
const RNPrint: {
  print: (options: { html: string; jobName?: string }) => Promise<any>;
} = NativeModules.RNPrint;

export interface DailySummaryPdfData {
  date: string;
  totalSales: number;
  cash: number;
  card: number;
  expenses: Expense[];
  totalExpenses: number;
  netBalance: number;
  physicalCash: number;
}

/**
 * Genera el "Cierre del día" como documento (para cuando no se puede
 * imprimir en la impresora térmica) usando el diálogo nativo de impresión
 * de Android (react-native-print), que incluye "Guardar como PDF" entre
 * las impresoras disponibles — desde ahí Android también deja compartir
 * el PDF directamente. No se eligió una librería que genere el PDF de
 * forma silenciosa porque las disponibles hoy en npm ya no son compatibles
 * con la versión de React Native de este proyecto (requieren arquitectura
 * nueva); esta librería usa el bridge clásico y sí es compatible.
 */
export class PdfService {
  async openPrintDialog(data: DailySummaryPdfData): Promise<void> {
    const html = this.buildDailySummaryHtml(data);
    await RNPrint.print({
      html,
      jobName: `Cierre del día - ${data.date}`,
    });
  }

  private buildDailySummaryHtml(data: DailySummaryPdfData): string {
    const rows = data.expenses.length
      ? data.expenses
          .map(e => {
            const label = e.notes
              ? `${e.expenseType?.name ?? 'Gasto'} - ${e.notes}`
              : e.expenseType?.name ?? 'Gasto';
            return `<tr><td>${this.escape(
              label,
            )}</td><td class="right">${CURRENCY_SYMBOL} ${e.amount.toFixed(
              2,
            )}</td></tr>`;
          })
          .join('')
      : '<tr><td colspan="2" class="muted">Sin gastos registrados</td></tr>';

    const netoClass = data.netBalance >= 0 ? 'positive' : 'negative';

    // Conciliación de caja física: lo que ya había + efectivo de ventas -
    // gastos pagados = lo que debería haber en caja ahora.
    const expectedCash = data.physicalCash + data.cash - data.totalExpenses;
    const expectedCashClass = expectedCash >= 0 ? 'positive' : 'negative';

    return `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Helvetica, Arial, sans-serif; color: #2D3436; padding: 32px; }
            h1 { font-size: 22px; margin: 0 0 4px 0; }
            .sub { color: #636E72; margin-bottom: 24px; font-size: 13px; }
            h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #636E72; margin: 24px 0 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px 4px; border-bottom: 1px solid #EEE; font-size: 14px; }
            .right { text-align: right; }
            .muted { color: #B2BEC3; text-align: center; }
            .bold { font-weight: bold; }
            .neto { font-size: 22px; font-weight: bold; padding: 20px 0 4px 0; margin-top: 16px; border-top: 2px solid #2D3436; display: flex; justify-content: space-between; }
            .positive { color: #27AE60; }
            .negative { color: #E74C3C; }
          </style>
        </head>
        <body>
          <h1>Cierre del día</h1>
          <div class="sub">${this.escape(
            AppConfig.APP_NAME,
          )} &middot; ${this.escape(data.date)}</div>

          <h2>Ventas</h2>
          <table>
            <tr><td class="bold">Total Ventas</td><td class="right bold">${CURRENCY_SYMBOL} ${data.totalSales.toFixed(
      2,
    )}</td></tr>
            <tr><td>Efectivo</td><td class="right">${CURRENCY_SYMBOL} ${data.cash.toFixed(
      2,
    )}</td></tr>
            <tr><td>Tarjeta</td><td class="right">${CURRENCY_SYMBOL} ${data.card.toFixed(
      2,
    )}</td></tr>
          </table>

          <h2>Gastos</h2>
          <table>
            ${rows}
            <tr><td class="bold">Total Gastos</td><td class="right bold">${CURRENCY_SYMBOL} ${data.totalExpenses.toFixed(
      2,
    )}</td></tr>
          </table>

          <h2>Caja</h2>
          <table>
            <tr><td>Saldo en caja</td><td class="right">${CURRENCY_SYMBOL} ${data.physicalCash.toFixed(
      2,
    )}</td></tr>
            <tr><td>+ Efectivo de ventas</td><td class="right">${CURRENCY_SYMBOL} ${data.cash.toFixed(
      2,
    )}</td></tr>
            <tr><td>- Gastos pagados</td><td class="right">${CURRENCY_SYMBOL} ${data.totalExpenses.toFixed(
      2,
    )}</td></tr>
            <tr><td class="bold ${expectedCashClass}">Físico en caja ahora</td><td class="right bold ${expectedCashClass}">${CURRENCY_SYMBOL} ${expectedCash.toFixed(
      2,
    )}</td></tr>
            <tr><td>Tarjeta (al banco)</td><td class="right">${CURRENCY_SYMBOL} ${data.card.toFixed(
      2,
    )}</td></tr>
          </table>

          <div class="neto ${netoClass}">
            <span>Neto del día</span>
            <span>${CURRENCY_SYMBOL} ${data.netBalance.toFixed(2)}</span>
          </div>
        </body>
      </html>
    `;
  }

  private escape(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

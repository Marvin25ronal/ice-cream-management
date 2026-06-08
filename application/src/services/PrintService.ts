import {
  IUSBPrinter,
  USBPrinter,
  COMMANDS,
  ColumnAlignment,
} from 'react-native-ect-thermal-receipt-printer';
import {AlertFunctions} from '../shared/AlertsFunctions';
import {Order} from '../entity/Order.entity';
import {Expense} from '../entity/Expense.entity';
import {CURRENCY_SYMBOL} from '../constants/utils';
import {AppConfig} from '../constants/AppConfig';
const BOLD_ON = COMMANDS.TEXT_FORMAT.TXT_BOLD_ON;
const PRINT_TIME = 300;
export class PrintService {
  printer: IUSBPrinter | null = null;
  constructor() {}
  async initPrinter() {
    await USBPrinter.init()
      .then(async () => {
        await USBPrinter.getDeviceList().then(async printers => {
          this.printer = printers[0];
        });
      })
      .catch(error => {
        console.log(error);
        AlertFunctions.showNoPrinter();
      });
  }
  async connectPrinter() {
    if (this.printer) {
      await USBPrinter.connectPrinter(
        this.printer.vendor_id,
        this.printer.product_id,
      )
        .then(() => {
          AlertFunctions.showPrinterConnected();
        })
        .catch(error => {
          AlertFunctions.showErrorConnectPrinter();
        });
    } else {
      AlertFunctions.showNoPrinter();
    }
  }
  // async printOrder(order: Order) {
  //     if (this.printer) {
  //         await USBPrinter.printText('<CM>Heladeria Cathy<CM>')
  //         await USBPrinter.printText('<CM>------------------<CM>')
  //         await setTimeout(async () => {
  //             await USBPrinter.printText(`<CD>Orden: ${order.order_id}</CD>`)
  //             await USBPrinter.printText(`<C>Fecha: ${order.creation_date}</C>`)
  //         }, PRINT_TIME);

  //         await setTimeout(async () => {
  //             let orderList = []
  //             let columnAlignment = [
  //                 ColumnAlignment.LEFT,
  //                 ColumnAlignment.RIGHT,
  //             ]
  //             let count = 1
  //             for (let i = 0; i < order.orderDetails.length; i++) {
  //                 const element = order.orderDetails[i];
  //                 for (let j = 0; j < element.quantity; j++) {
  //                     orderList.push([`${count++}. ${element.product_name}`, `${CURRENCY_SYMBOL}${element.price}`])
  //                 }
  //             }
  //             let columnWidth = [20, 10]
  //             const header = ['Producto', 'Precio']
  //             /// await time
  //             //creamos un delay para que la impresora pueda imprimir el texto

  //             await USBPrinter.printColumnsText(header, columnWidth, columnAlignment, [
  //                 `${BOLD_ON}`,
  //                 ''
  //             ]);
  //             for (let i = 0; i < orderList.length; i++) {
  //                 await USBPrinter.printColumnsText(orderList[i], columnWidth, columnAlignment, [
  //                     `${BOLD_ON}`,
  //                     ''
  //                 ])
  //             }
  //             await setTimeout(async () => {
  //                 await USBPrinter.printText(`<CM>Total: ${CURRENCY_SYMBOL}${order.total}</CM>`)
  //                 await USBPrinter.printBill(`<C>Gracias por su visita, esperamos que vuelva</C>`);
  //             }, PRINT_TIME);
  //         }, PRINT_TIME);

  //     } else {
  //         AlertFunctions.showNoPrinter()
  //     }
  // }
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  async printOrder(order: Order) {
    if (this.printer) {
      await USBPrinter.printText('<CM>Sarita Pacific Villa Hermosa<CM>');
      await USBPrinter.printText('<CM>------------------<CM>');

      await this.delay(PRINT_TIME);

      await USBPrinter.printText(`<CD>Orden: ${order.order_id}</CD>`);
      await USBPrinter.printText(`<C>Fecha: ${order.creation_date}</C>`);

      await this.delay(PRINT_TIME);

      let orderList = [];
      let columnAlignment = [ColumnAlignment.LEFT, ColumnAlignment.RIGHT];
      let count = 1;
      for (let i = 0; i < order.orderDetails.length; i++) {
        const element = order.orderDetails[i];
        for (let j = 0; j < element.quantity; j++) {
          orderList.push([
            `${count++}. ${element.product_name}`,
            `${CURRENCY_SYMBOL}${element.price}`,
          ]);
        }
      }
      let columnWidth = [20, 10];
      const header = ['Producto', 'Precio'];

      await USBPrinter.printColumnsText(header, columnWidth, columnAlignment, [
        `${BOLD_ON}`,
        '',
      ]);
      await this.delay(PRINT_TIME);
      for (let i = 0; i < orderList.length; i++) {
        await USBPrinter.printColumnsText(
          orderList[i],
          columnWidth,
          columnAlignment,
          [`${BOLD_ON}`, ''],
        );
        await this.delay(PRINT_TIME / 2);
      }

      await this.delay(PRINT_TIME);

      await USBPrinter.printText(
        `<CM>Total: ${CURRENCY_SYMBOL}${order.total}</CM>`,
      );
      await this.delay(PRINT_TIME);
      await USBPrinter.printBill(
        '<C>Gracias por su visita, esperamos que vuelva</C>',
      );
    } else {
      AlertFunctions.showNoPrinter();
    }
  }

  printTicket(order: Order | null) {}

  async printDailySummary(
    date: string,
    totalSales: number,
    cash: number,
    card: number,
    expenses: Expense[],
    totalExpenses: number,
    netBalance: number,
  ): Promise<void> {
    if (!this.printer) {
      AlertFunctions.showNoPrinter();
      return;
    }

    const separator = '================================';
    const thin = '--------------------------------';

    await USBPrinter.printText(`<CM>${separator}<CM>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<CM>CIERRE DEL DÍA<CM>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<CM>${AppConfig.APP_NAME}<CM>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<CM>${separator}<CM>`);
    await this.delay(PRINT_TIME);

    await USBPrinter.printText(`<C>Fecha: ${date}<C>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<CM>${thin}<CM>`);
    await this.delay(PRINT_TIME);

    // Ventas
    await USBPrinter.printText(`<B>-- VENTAS --<B>`);
    await this.delay(PRINT_TIME);
    const colWidths = [22, 10];
    const colAlign = [ColumnAlignment.LEFT, ColumnAlignment.RIGHT];

    await USBPrinter.printColumnsText(
      ['Total Ventas:', `${CURRENCY_SYMBOL}${totalSales.toFixed(2)}`],
      colWidths,
      colAlign,
      [`${BOLD_ON}`, ''],
    );
    await this.delay(PRINT_TIME);
    await USBPrinter.printColumnsText(
      ['  Efectivo:', `${CURRENCY_SYMBOL}${cash.toFixed(2)}`],
      colWidths,
      colAlign,
      ['', ''],
    );
    await this.delay(PRINT_TIME);
    await USBPrinter.printColumnsText(
      ['  Tarjeta:', `${CURRENCY_SYMBOL}${card.toFixed(2)}`],
      colWidths,
      colAlign,
      ['', ''],
    );
    await this.delay(PRINT_TIME);

    // Gastos
    await USBPrinter.printText(`<CM>${thin}<CM>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<B>-- GASTOS --<B>`);
    await this.delay(PRINT_TIME);
    if (expenses.length === 0) {
      await USBPrinter.printText(`<C>Sin gastos registrados<C>`);
      await this.delay(PRINT_TIME);
    } else {
      for (const expense of expenses) {
        const label = expense.notes
          ? `${expense.expenseType?.name} - ${expense.notes}`.slice(0, 20)
          : (expense.expenseType?.name ?? 'Gasto').slice(0, 20);
        await USBPrinter.printColumnsText(
          [label, `${CURRENCY_SYMBOL}${expense.amount.toFixed(2)}`],
          colWidths,
          colAlign,
          ['', ''],
        );
        await this.delay(PRINT_TIME);
      }
    }
    await USBPrinter.printColumnsText(
      ['Total Gastos:', `${CURRENCY_SYMBOL}${totalExpenses.toFixed(2)}`],
      colWidths,
      colAlign,
      [`${BOLD_ON}`, ''],
    );
    await this.delay(PRINT_TIME);

    // Neto
    await USBPrinter.printText(`<CM>${separator}<CM>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printColumnsText(
      ['NETO DEL DÍA:', `${CURRENCY_SYMBOL}${netBalance.toFixed(2)}`],
      colWidths,
      colAlign,
      [`${BOLD_ON}`, `${BOLD_ON}`],
    );
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<CM>${separator}<CM>`);
    await this.delay(PRINT_TIME);

    await USBPrinter.printText(`<C> <C>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printText(`<C>Firma: ____________________<C>`);
    await this.delay(PRINT_TIME);
    await USBPrinter.printBill(`<C> <C>`);
  }
}

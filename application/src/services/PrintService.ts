import { IUSBPrinter, USBPrinter, COMMANDS, ColumnAlignment } from "react-native-ect-thermal-receipt-printer";
import { AlertFunctions } from "../shared/AlertsFunctions";
import { Order } from "../entity/Order.entity";
import { CURRENCY_SYMBOL } from "../constants/utils";
const BOLD_ON = COMMANDS.TEXT_FORMAT.TXT_BOLD_ON;
export class PrintService {
    printer: IUSBPrinter | null = null
    constructor() { }
    async initPrinter() {
        await USBPrinter.init().then(async () => {
            await USBPrinter.getDeviceList().then(async (printers) => {
                this.printer = printers[0]
            })
        }).catch((error) => {
            console.log(error)
            AlertFunctions.showNoPrinter()
        })
    }
    async connectPrinter() {
        if (this.printer) {
            await USBPrinter.connectPrinter(this.printer.vendor_id, this.printer.product_id).then(() => {
                AlertFunctions.showPrinterConnected()
            }).catch((error) => {
                AlertFunctions.showErrorConnectPrinter()
            })
        } else {
            AlertFunctions.showNoPrinter()
        }
    }
    async printOrder(order: Order) {
        if (this.printer) {

            // USBPrinter.printText('<CM>Heladeria Cathy<CM>')
            // USBPrinter.printBill(`<CD>Orden: ${order.order_id}</CD>`)
            // USBPrinter.printBill(`<C>Fecha: ${order.creation_date}</C>`)
            this.printHeader(order)
            let orderList = []
            let columnAlignment = [
                ColumnAlignment.LEFT,
                ColumnAlignment.RIGHT,
            ]
            for (let i = 0; i < order.orderDetails.length; i++) {
                const element = order.orderDetails[i];
                for (let j = 0; j < element.quantity; j++) {
                    orderList.push([`1. ${element.product_name}`, `${CURRENCY_SYMBOL}${element.price}`])
                }
            }
            let columnWidth = [20, 10]
            const header = ['Producto', 'Precio']
            /// await time
            //creamos un delay para que la impresora pueda imprimir el texto
            setTimeout(() => {
                console.log('esperamos')
            }, 1000)

            await USBPrinter.printColumnsText(header, columnWidth, columnAlignment, [
                `${BOLD_ON}`,
                ''
            ]);
            setTimeout(() => {
                console.log('esperamos')
            }, 1000)
            for (let i = 0; i < orderList.length; i++) {
                setTimeout(() => {
                    console.log('esperamos')
                }, 1000)
                await USBPrinter.printColumnsText(orderList[i], columnWidth, columnAlignment, [
                    `${BOLD_ON}`,
                    ''
                ])
            }

            setTimeout(() => {
                console.log('esperamos')
            }, 1000)
            USBPrinter.printBill(`<CM>Total: ${CURRENCY_SYMBOL}${order.total}</CM>`)
            setTimeout(() => {
                console.log('esperamos')
            }, 1000)
            await USBPrinter.printBill(`<C>Gracias por su visita, esperamos que vuelva</C>`);
        } else {
            AlertFunctions.showNoPrinter()
        }
    }
    private printHeader(order: Order) {
        USBPrinter.printText('<CB>Heladeria Cathy<CB>')
        setTimeout(() => {
            console.log('esperamos')
        }, 1000)
        USBPrinter.printBill(`<CD>Orden: ${order.order_id}</CD>`)
        setTimeout(() => {
            console.log('esperamos')
        }, 1000)
        USBPrinter.printBill(`<C>Fecha: ${order.creation_date}</C>`)
    }

    printTicket(order: Order | null) {

    }

}
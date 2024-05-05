import Toast from "react-native-toast-message";

export  class AlertFunctions {
    static showOrderSaved() {
        Toast.show({
            type: 'success',
            text1: 'Orden guardada',
            text2: 'La orden ha sido guardada correctamente'
        })
    }
    static showOrderError() {
        Toast.show({
            type: 'error',
            text1: 'Error al guardar la orden',
            text2: 'Ha ocurrido un error al guardar la orden'
        })
    }
    static showNoPrinter() {
        Toast.show({
            type: 'error',
            text1: 'No se ha encontrado impresora',
            text2: 'No se ha encontrado ninguna impresora conectada, por favor conecte una impresora e intente de nuevo'
        })
    }

    static showErrorInitPrinter() {
        Toast.show({
            type: 'error',
            text1: 'Error al inicializar la impresora',
            text2: 'Ha ocurrido un error al inicializar la impresora'
        })
    }
    static showPrinterConnected() {
        Toast.show({
            type: 'success',
            text1: 'Impresora conectada',
            text2: 'La impresora se ha conectado correctamente'
        })
    }
    static showErrorConnectPrinter() {
        Toast.show({
            type: 'error',
            text1: 'Error al conectar la impresora',
            text2: 'Ha ocurrido un error al conectar la impresora'
        })
    }
    static orderNotFound() {
        Toast.show({
            type: 'error',
            text1: 'Orden no encontrada',
            text2: 'La orden no ha sido encontrada'
        })
    }
}
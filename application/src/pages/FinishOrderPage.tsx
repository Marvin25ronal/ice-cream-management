import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store/redux/store'
import { Fonts, FontsSize } from '../constants/Fonts'
import { PrintService } from '../services/PrintService'
import { OrderService } from '../services/OrderServices'
import { clearCart } from '../store/redux/carReducer'
import { clearOrder } from '../store/redux/orderReducer'
import { useNavigation } from '@react-navigation/native'
import { Utils } from '../constants/utils'
import { RootStackParamList } from '../routes/StackNavigator'
import { StackNavigationProp } from '@react-navigation/stack'


const FinishOrderPage = () => {
    const theme = useSelector((state: RootState) => state.theme.value)
    const orderId = useSelector((state: RootState) => state.order.value)
    const dispatch = useDispatch()
    const [printService] = useState(new PrintService())
    const [orderService] = useState(new OrderService())
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',

        },
        text: {
            color: theme.LABEL_FORM_COLOR,
            fontSize: FontsSize.x2xl,
            fontFamily: Fonts.LatoBold
        },
        optionsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 40,
        },
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            borderRadius: 10,
            width: 'auto',
            padding: 30,
            marginTop: 100,
            borderWidth: 5,
            borderColor: 'white',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
        },
        cardText: {
            color: 'white',
            fontSize: FontsSize.large,
            fontFamily: Fonts.LatoBold,
        }
    })
    useEffect(() => {
        printService.initPrinter().then(() => {
            printService.connectPrinter()
        })
    }, [])
    const printTicket = async () => {
        await orderService.incrementsPrintNumber(orderId).then((order) => {
            if (order)
                printService.printOrder(order)
        })
    }
    const clearShoppingCart = async () => {
        dispatch(clearCart())
        dispatch(clearOrder())
    }
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                Selecciona una opción
            </Text>
            <View style={styles.optionsContainer}>
                {/* <TouchableOpacity style={[styles.card, { backgroundColor: theme.CLEAN_BUTTON_COLOR }]}>
                    <Text style={styles.cardText}>
                        Imprimir ticket
                    </Text>
                </TouchableOpacity> */}
                <TouchableOpacity style={[styles.card, { backgroundColor: theme.EDIT_BUTTON_COLOR }]}
                    onPress={() => {
                        printTicket()
                    }}
                >
                    <Text style={styles.cardText}>
                        Imprimir Orden
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.card, { backgroundColor: theme.PAY_BUTTON_COLOR }]} onPress={() => {
                    clearShoppingCart()
                    navigation.navigate(Utils.screens.HOME, { reload: true })
                }} >
                    <Text style={styles.cardText}>
                        Finalizar compra
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default FinishOrderPage


import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AgrupatedProducts } from '../../pages/EditShoppingCartPage'
import { useDispatch, useSelector } from 'react-redux';
import { themeInterface } from '../../interface/themeInterface';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL, Utils } from '../../constants/utils';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import { useNavigation } from '@react-navigation/native';
import { Order } from '../../entity/Order.entity';
import { PaymentServices } from '../../services/PaymentServices';
import { AlertFunctions } from '../../shared/AlertsFunctions';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../routes/StackNavigator';
import { OrderDetail } from '../../entity/OrderDetail.entity';
import { setOrder } from '../../store/redux/orderReducer';
import { PrintService } from '../../services/PrintService';
import moment from 'moment-timezone';


const ResumeShopping = ({ elements }: { elements: AgrupatedProducts[] }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    let existOrder = useSelector((state: any) => state.order.value)
    const dispatch = useDispatch()
    const [paymentService] = useState(new PaymentServices())
    const [printerService] = useState(new PrintService())
    const [total, setTotal] = useState(0)
    useEffect(() => {
        const totalPrices = elements.reduce((total, item) => {
            // Sumar el precio de cada producto en la propiedad `products` del elemento
            return total + item.products.reduce((subtotal, product) => subtotal + product.price, 0);
        }, 0);
        setTotal(totalPrices)
    }, [elements])
    useEffect(() => {
        printerService.initPrinter().then(() => {
            printerService.connectPrinter().then(() => {
                console.log('printer connected')
            })
        })
    }, [])
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const saveOrder = async () => {
        console.log('Exist order', existOrder)
        if (existOrder == - 1) {
            const neworder = new Order();
            neworder.total = total;
            neworder.status = 0;
            const now = new Date();
            const offset = now.getTimezoneOffset();
            neworder.creation_date = new Date(now.getTime() - (offset * 60 * 1000));
            neworder.print_number = 0;
            let orderDetails = []
            for (const element of elements) {
                const product = element.products[0]
                const orderDetail = new OrderDetail();
                orderDetail.product_id = product.product_id;
                orderDetail.quantity = element.products.length;
                orderDetail.price = product.price;
                orderDetail.product_name = product.name;
                orderDetail.order = neworder;
                orderDetails.push(orderDetail)
            }
            neworder.orderDetails = [...orderDetails]

            await paymentService.saveOrder(neworder).then(async (order) => {

                dispatch(setOrder(order.order_id))
                console.log('Order saved', order)
                AlertFunctions.showOrderSaved()
                // //imprimimos la orden   
                console.log('Mi ordern id', order.order_id)
                await printerService.printOrder(order)
                existOrder = order.order_id
                navigation.navigate(Utils.screens.PAYMENT)
            })
        } else {
            console.log('Ya existe una orden')
            navigation.navigate(Utils.screens.PAYMENT)
        }

    }

    const styles = StyleSheet.create({
        cardContainer: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            paddingHorizontal: 10,
            paddingVertical: 5,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginVertical: 10,
            borderRadius: 10,
            margin: 10,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'space-between',
            height: '100%',
        },
        totalContainer: {
            marginTop: 10,
            alignItems: 'center',
            flexGrow: 2,
            justifyContent: 'center'
        },
        totalTitle: {
            fontFamily: Fonts.LatoRegular,
            color: theme.MODAL_TEXT_COLOR,
            fontSize: FontsSize.xxl
        },
        price: {
            fontFamily: Fonts.LatoBold,
            color: theme.MODAL_TEXT_COLOR,
            fontSize: FontsSize.x2xl,
            marginTop: 20
        },
        actionsContainer: {
            flexDirection: 'column',
            width: '100%'
        },
        button: {
            backgroundColor: 'blue',
            paddingHorizontal: 20,
            justifyContent: 'center',
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 5,
            borderColor: theme.HEADER_TEXT_COLOR,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            paddingVertical: 10,
            marginTop: 20,
            width: '100%',

        },


    })
    return (
        <View style={styles.cardContainer}>
            <View style={styles.totalContainer}>
                <Text style={styles.totalTitle}>Total</Text>
                <Text style={styles.price}>
                    {CURRENCY_SYMBOL} {total}
                </Text>
            </View>
            <View style={styles.actionsContainer}>
                {/* <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.CANCEL_BUTTON_COLOR }}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <IconSelector icon_class={type_class_icon.FontAwesome5} icon='backspace' size={30} color={'white'} />
                </TouchableOpacity> */}
                {
                    total > 0 && (
                        <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.CONFIRM_BUTTON_COLOR }} onPress={saveOrder} >
                            <IconSelector icon_class={type_class_icon.Feather} icon='shopping-cart' size={30} color={'white'} />
                        </TouchableOpacity>
                    )
                }

            </View>
        </View>
    )
}

export default ResumeShopping


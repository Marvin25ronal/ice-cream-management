import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { Fonts, FontsSize } from '../../constants/Fonts'
import { TextInput } from 'react-native-gesture-handler'
import { CURRENCY_SYMBOL, Utils } from '../../constants/utils'
import { OrderService, PaymentMethod } from '../../services/OrderServices'
import { Order } from '../../entity/Order.entity'
import { AlertFunctions } from '../../shared/AlertsFunctions'
import CustomInputComponent from '../UI/CustomInputComponent'
import { useForm } from 'react-hook-form'
import { type_class_icon } from '../UI/IconSelector'
import { error } from 'console'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../routes/StackNavigator'

const CashForm = ({ card = false, mix = false }: { card?: boolean, mix?: boolean }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const orderId: number = useSelector((state: any) => state.order.value)
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
    const [total, setTotal] = useState(0)
    const [orderService] = useState(new OrderService())
    const [order, setOrder] = useState<Order | null>(null)
    const { control, watch, handleSubmit } = useForm()
    useEffect(() => {
        console.log('Order id', orderId)
        orderService.getOrder(orderId).then((order) => {
            if (order) {
                setTotal(order.total)
                setOrder(order)
                console.log(order)
            } else {
                AlertFunctions.orderNotFound()
            }
        })
    }, [orderId])
    const styles = StyleSheet.create({
        container: {
            flexDirection: 'column',
            padding: 10,
            justifyContent: 'space-between'
        },
        label: {
            fontSize: 20,
            fontFamily: Fonts.LatoBlack,
            color: theme.LABEL_FORM_COLOR

        },
        amount: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20
        },
        textAmount: {
            fontSize: FontsSize.xxl,
            fontFamily: Fonts.LatoBlack,
            color: theme.LABEL_FORM_COLOR
        },
        button: {
            backgroundColor: theme.CONFIRM_BUTTON_COLOR,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
        },
        buttonTextColor: {
            fontSize: FontsSize.extraLarge,
            fontFamily: Fonts.LatoBlack,
            color: 'white'
        },
        textWithCard: {
            fontSize: FontsSize.medium,
            fontFamily: Fonts.LatoRegular,
            color: theme.LABEL_FORM_COLOR
        },
        cardContainer: {
            flex: 1,
            flexDirection: 'column',
            padding: 10,
            gap: 50,
        }
    })
    const pay = (data: any) => {
        if (order) {
            if (card) {
                orderService.payOrder(orderId, PaymentMethod.CARD, 0, total).then((response) => {
                    AlertFunctions.orderPayed()
                    navigation.navigate(Utils.screens.FINISH_ORDER)
                }).catch((error) => {
                    AlertFunctions.orderCanNotPay()
                })
            } else if (mix) {
                orderService.payOrder(orderId, PaymentMethod.MIX, parseFloat(data.cash), parseFloat(data.card)).then((response) => {
                    AlertFunctions.orderPayed()
                    navigation.navigate(Utils.screens.FINISH_ORDER)
                }).catch((error) => {
                    AlertFunctions.orderCanNotPay()
                })

            } else {
                orderService.payOrder(orderId, PaymentMethod.CASH, parseFloat(data.cash), 0).then((response) => {
                    AlertFunctions.orderPayed()
                    navigation.navigate(Utils.screens.FINISH_ORDER)
                }).catch((error) => {
                    AlertFunctions.orderCanNotPay()
                })
            }

        }
    }
    if (card)
        return (
            <View style={styles.cardContainer}>
                <Text style={styles.textAmount}>
                    Pago con tarjeta
                </Text>
                <Text style={styles.textWithCard}>
                    Realize el cobro con la terminal, y presione el boton de abajo
                </Text>
                <TouchableOpacity style={styles.button}
                    onPress={handleSubmit(pay)}
                >
                    <Text style={styles.buttonTextColor}>
                        Cobrar
                    </Text>
                </TouchableOpacity>
            </View>
        )
    if (mix)
        return (
            <View style={styles.container}>
                <Text style={styles.label}>Monto a cobrar</Text>
                <View style={styles.amount}>
                    <Text style={styles.textAmount}>
                        {CURRENCY_SYMBOL} {total.toFixed(2)}
                    </Text>
                </View>
                <Text style={styles.label}>Efectivo</Text>
                <CustomInputComponent
                    control={control}
                    name={'cash'}
                    icon_class={type_class_icon.FontAwesome5}
                    icon_name='coins'
                    rules={{ required: 'Campo requerido' }}
                    place_holder='Efectivo'
                    keyboardType='numeric'
                    fontSize={30}
                    iconSize={30}
                />
                <Text style={styles.label}>Tarjeta</Text>
                <CustomInputComponent
                    control={control}
                    name={'card'}
                    icon_class={type_class_icon.FontAwesome5}
                    icon_name='credit-card'
                    rules={{ required: 'Campo requerido' }}
                    place_holder='Monto a cobrar en tarjeta'
                    keyboardType='numeric'
                    fontSize={30}
                    iconSize={30}
                />
                <Text style={styles.label}>Vuelto</Text>
               
                <View style={styles.amount}>
                    <Text style={styles.textAmount}>
                        {
                            watch('cash') ?
                                parseFloat(watch('cash')) + parseFloat(watch('card')) - total >= 0 ?
                                    (CURRENCY_SYMBOL + (parseFloat(watch('cash')) + parseFloat(watch('card')) - total).toFixed(2))
                                    : 'ERROR AL INGRESAR EL MONTO'
                                : CURRENCY_SYMBOL + 0
                        }
                    </Text>
                </View>
                <View>
                    <TouchableOpacity style={styles.button}
                        onPress={handleSubmit(pay)}
                    >
                        <Text style={styles.buttonTextColor}>
                            Cobrar
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Monto a cobrar</Text>
            <View style={styles.amount}>
                <Text style={styles.textAmount}>
                    {CURRENCY_SYMBOL} {total.toFixed(2)}
                </Text>
            </View>
            <Text style={styles.label}>Efectivo</Text>
            <CustomInputComponent
                control={control}
                name={'cash'}
                icon_class={type_class_icon.FontAwesome5}
                icon_name='coins'
                rules={{ required: 'Campo requerido' }}
                place_holder='Efectivo'
                keyboardType='numeric'
            />
            <Text style={styles.label}>Vuelto</Text>
            <View style={styles.amount}>
                <Text style={styles.textAmount}>
                    {
                        watch('cash') ?
                            parseFloat(watch('cash')) - total >= 0 ?
                                (CURRENCY_SYMBOL + (parseFloat(watch('cash')) - total).toFixed(2))
                                : 'ERROR AL INGRESAR EL MONTO'
                            : CURRENCY_SYMBOL + 0
                    }
                </Text>
            </View>
            <View>
                <TouchableOpacity style={styles.button}
                    onPress={handleSubmit(pay)}
                >
                    <Text style={styles.buttonTextColor}>
                        Cobrar
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CashForm


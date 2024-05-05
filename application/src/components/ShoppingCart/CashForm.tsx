import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { Fonts, FontsSize } from '../../constants/Fonts'
import { TextInput } from 'react-native-gesture-handler'
import { CURRENCY_SYMBOL } from '../../constants/utils'
import { OrderService } from '../../services/OrderServices'
import { Order } from '../../entity/Order.entity'
import { AlertFunctions } from '../../shared/AlertsFunctions'
import CustomInputComponent from '../UI/CustomInputComponent'
import { useForm } from 'react-hook-form'
import { type_class_icon } from '../UI/IconSelector'

const CashForm = () => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const orderId: number = useSelector((state: any) => state.order.value)
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
            flex: 1,
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
            alignItems: 'center'
        },
        textAmount: {
            fontSize: FontsSize.x2xl,
            fontFamily: Fonts.LatoBlack,
            color: theme.LABEL_FORM_COLOR
        },
        button: {
            backgroundColor: theme.CONFIRM_BUTTON_COLOR,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10
        },
        buttonTextColor: {
            fontSize: FontsSize.extraLarge,
            fontFamily: Fonts.LatoBlack,
            color: 'white'
        }
    })
    const pay = () => {

    }
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
                            parseFloat(watch('cash')) - total > 0 ?
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


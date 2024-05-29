import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Order } from '../../entity/Order.entity'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/redux/store'
import { Fonts, FontsSize } from '../../constants/Fonts'
import { CURRENCY_SYMBOL } from '../../constants/utils'
import IconSelector, { type_class_icon } from '../UI/IconSelector'

const OrderResumeCard = ({ order }: { order: Order }) => {
    const theme = useSelector((state: RootState) => state.theme.value)
    const styles = StyleSheet.create({
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            flex: 1,
            marginBottom: 20,
            marginHorizontal: 5
        },
        noOrderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            borderBottomColor: theme.DIVIDER_COLOR,
            borderBottomWidth: 1,
            marginBottom: 10,
            padding: 10
        },
        noOrderText: {
            color: 'black',
            fontSize: FontsSize.extraLarge,
            fontFamily: Fonts.LatoBlack,
        },
        secondContainer: {
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-around',
            padding: 10
        },
        description: {
            color: 'black',
            fontSize: FontsSize.large,
            fontFamily: Fonts.LatoRegular,
        },
        price: {
            color: 'black',
            fontSize: FontsSize.extraLarge,
            fontFamily: Fonts.LatoBold,
        },
        dateContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            marginBottom: 10,
            borderBottomColor: theme.DIVIDER_COLOR,
            borderBottomWidth: 1
        }
    })
    const getIcon = (type: number | null) => {
        switch (type) {
            case 1:
                return 'money-bill-wave'
            case 2:
                return 'credit-card'
            case 3:
                return 'cash-register'
            default:
                return 'times-circle'
        }
    }
    const getColor = (type: number | null) => {
        switch (type) {
            case 1:
                return 'green'
            case 2:
                return 'blue'
            case 3:
                return 'orange'
            default:
                return 'red'
        }
    }
    return (
        <View style={styles.card}>
            <View style={styles.noOrderContainer}>
                <Text style={styles.noOrderText}>
                    No.  {order.order_id}
                </Text>
            </View>
            <View style={styles.dateContainer}>
                <Text style={styles.description}>
                    {order.creation_date.toLocaleString()}
                </Text>
            </View>
            <View style={styles.secondContainer}>
                <View>
                    <Text style={styles.price}>
                        {CURRENCY_SYMBOL}   {order.total}
                    </Text>
                </View>
                <View>
                    <IconSelector icon_class={type_class_icon.FontAwesome5} icon={getIcon(order.payment_method)} size={30} color={getColor(order.payment_method)} />
                </View>
            </View>
        </View>
    )
}

export default OrderResumeCard


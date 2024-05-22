import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CustomInputComponent from '../UI/CustomInputComponent'
import { useForm } from 'react-hook-form'
import { type_class_icon } from '../UI/IconSelector'
import { TouchableOpacity } from 'react-native-gesture-handler'
import ButtonComponent from '../UI/ButtonComponent'
import Animated from 'react-native-reanimated'
import { OrderService } from '../../services/OrderServices'
import { format } from '@formkit/tempo'

const OrderFilter = () => {
    const { control } = useForm()
    const [orderService] = useState(new OrderService())

    const styles = StyleSheet.create({
        filtersContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 5,
            paddingHorizontal: 20,
            gap: 10,
        },
        scrollContainer: {
            flex: 1
        }
    })
    useEffect(() => {
        const date = new Date()
        orderService.getAllOrders(format(date, "DD/MM/YYYY"), format(date, "DD/MM/YYYY")).then((orders) => {
            console.log(orders)
        }
        )

    }, [])

    return (
        <>

            <View style={styles.filtersContainer}>
                <CustomInputComponent
                    control={control}
                    rules={{ required: 'This field is required' }}
                    icon_class={type_class_icon.FontAwesome}
                    icon_name='search'
                    name='date'
                    place_holder='Fecha'
                    keyboardType='default'
                    fontSize={22}
                    width={'40%'}
                    type='date'
                    defaultValue={new Date().toLocaleDateString()}
                    disabled={true}
                />
                <ButtonComponent text='Buscar' onPress={() => { }} />

            </View>
            <Animated.ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                style={styles.scrollContainer}
            >

            </Animated.ScrollView>
        </>
    )
}

export default OrderFilter

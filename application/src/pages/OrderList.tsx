import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { OrderService } from '../services/OrderServices'
import OrderFilter from '../components/Order/OrderFilter'

import { CreateBackup } from '../store/db/Database'
import { Order } from '../entity/Order.entity'
import OrderResumeCard from '../components/Order/OrderResumeCard'

const OrderList = () => {
    const [orderService] = useState(new OrderService())
    const [orders, setOrders] = useState<Order[]>([])
    useEffect(() => {

        getOrders(null)
    }, [])
    const getOrders = (data: any) => {
        console.log('data de getOrders', data)
        orderService.getAllOrders('05/20/2024', '05/20/2024').then((orders) => {
            console.log('MIS ORDENES')
            console.log(orders)
            if (orders != null)
                setOrders(orders)
        }
        ).catch((error) => {
            console.log(error)
        })
    }
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            // justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        },
        flatListContainer: {
            width: '100%',
            padding: 10,
            gap: 10,
            rowGap: 10,
        }
    })
    return (
        <View style={styles.container}>

            <OrderFilter getOrders={getOrders} />
            <FlatList
                data={orders}
                renderItem={({ item }) => (
                    <OrderResumeCard order={item} />
                )}
                style={styles.flatListContainer}
                numColumns={2}
                contentContainerStyle={{padding:20}}
            />
        </View>
    )
}

export default OrderList


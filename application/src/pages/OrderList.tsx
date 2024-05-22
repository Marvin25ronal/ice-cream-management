import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { OrderService } from '../services/OrderServices'
import OrderFilter from '../components/Order/OrderFilter'

import { CreateBackup } from '../store/db/Database'

const OrderList = () => {
    const [orderService] = useState(new OrderService())
    useEffect(() => {
        orderService.getAllOrders('05/20/2024','05/20/2024').then((orders) => {
            console.log('MIS ORDENES')
            console.log(orders)
        }
        ).catch((error) => {
            console.log(error)
        })

    }, [])
    const styles = StyleSheet.create({
        container: {
            flex: 1,
           // justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
        },
      
    })
    return (
        <View style={styles.container}>
           
            <OrderFilter />
            <View>

            </View>
        </View>
    )
}

export default OrderList


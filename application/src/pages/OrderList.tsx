import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { OrderService } from '../services/OrderServices';
import OrderFilter from '../components/Order/OrderFilter';

import { CreateBackup } from '../store/db/Database';
import { Order } from '../entity/Order.entity';
import OrderResumeCard from '../components/Order/OrderResumeCard';

const OrderList = () => {
  const [orderService] = useState(new OrderService());
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    getOrders(null);
  }, []);
  const getOrders = (data: any) => {
    let date: string = data?.date;
    if (date == null) {
      date = new Date().toLocaleDateString();
    }
    let start = '';
    let end = '';
    if (date.indexOf('-') != -1) {
      start = date.split('-')[0];
      end = date.split('-')[1];
    } else {
      start = date;
      end = date;
    }
    orderService
      .getAllOrders(start, end)
      .then(orders => {
        console.log('MIS ORDENES');
        console.log(orders);
        if (orders != null) {
          setOrders(orders);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };
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
    },
  });
  return (
    <View style={styles.container}>
      <OrderFilter getOrders={getOrders} />
      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderResumeCard order={item} />}
        style={styles.flatListContainer}
        numColumns={2}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
};

export default OrderList;

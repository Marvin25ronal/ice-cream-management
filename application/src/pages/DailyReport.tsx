import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Order } from '../entity/Order.entity'
import { OrderService } from '../services/OrderServices'
import OrderFilter from '../components/Order/OrderFilter'
import Animated from 'react-native-reanimated'
import { Fonts, FontsSize } from '../constants/Fonts'
import { useSelector } from 'react-redux'
import { RootState } from '../store/redux/store'
import { CURRENCY_SYMBOL } from '../constants/utils'
import { LineChart } from 'react-native-chart-kit'
import { format } from '@formkit/tempo'
const hours = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
]
const DailyReport = () => {
  const theme = useSelector((state: RootState) => state.theme.value)
  const [orderService] = useState(new OrderService())
  const [orders, setOrders] = useState<Order[]>([])
  const [orderProduced, setOrderProduced] = useState(0)
  const [orderWithError, setOrderWithError] = useState(0)
  const [total, setTotal] = useState(0)
  const [totalCard, setTotalCard] = useState(0)
  const [orderCard, setOrderCard] = useState(0)
  const [cash, setCash] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ordersFrecuencyData, setOrdersFrecuencyData] = useState([])
  useEffect(() => {
    getOrders(null)
  }, [])
  useEffect(() => {
    let produced = orders.filter((order) => order.payment_date != null)
    setOrderProduced(produced.length)
    setOrderWithError(orders.length - produced.length)
    setTotal(produced.reduce((acc, order) => acc + order.total, 0))
    let cardOrders = produced.filter((order) => order.payment_method == 2 || order.payment_method == 3)
    setTotalCard(cardOrders.reduce((acc, order) => acc + order.orderPayment.reduce((acc2, pay) => acc2 + pay.card, 0), 0))
    setOrderCard(cardOrders.length)

    let cashOrders = produced.filter((order) => order.payment_method == 1 || order.payment_method == 3)

    setCash(cashOrders.reduce((acc, order) => acc + order.orderPayment.reduce((acc2, pay) => acc2 + pay.cash, 0), 0))

  }, [orders])
  const initializeHourSlots = () => {
    const hours: any = {};
    for (let hour = 8; hour <= 22; hour++) {
      const formattedHour = hour < 10 ? `0${hour}:00` : `${hour}:00`;
      hours[formattedHour] = 0;
    }
    return hours;
  };
  const groupOrdersByHour = (orders: Order[]) => {
    return orders.reduce((acc: any, order: Order) => {
      const hour = format(order.creation_date, 'HH:00')
      if (!acc[hour]) {
        acc[hour] = 0
      }
      acc[hour]++
      return acc

    }, {})
  }
  //make graph data
  useEffect(() => {
    const baseHours = initializeHourSlots();
    const grouped = groupOrdersByHour(orders);
    const ordersByHour = { ...baseHours, ...grouped };
    console.log('ORDENES POR HORA')
    console.log(ordersByHour)
    setOrdersFrecuencyData(Object.values(ordersByHour))
    setLoading(true)
  }, [orders])
  const getOrders = (data: any) => {
    let date: string = data?.date
    if (date == null) {
      date = new Date().toLocaleDateString()
    }
    let start = ''
    let end = ''
    if (date.indexOf('-') != -1) {
      start = date.split('-')[0]
      end = date.split('-')[1]
    } else {
      start = date
      end = date
    }
    orderService.getAllOrders(start, end).then((orders) => {
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
    dashboardContainer: {
      flex: 1,
      flexDirection: 'column',
      width: '100%',
    },
    rowContainer: {
      flexDirection: 'row',
      flex: 1,
      width: '100%',
      padding: 10,
      gap: 10,
      justifyContent: 'center'
    },
    titleCard: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBlack,
      color: '#6c757d',
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
      padding: 15,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flex: 1,
    },
    indicatorText: {
      fontSize: FontsSize.x2xl,
      fontFamily: Fonts.LatoBlack,
      color: 'black',
    }
  })
  return (
    <View style={styles.container}>
      <OrderFilter getOrders={getOrders} />
      <Animated.ScrollView style={styles.dashboardContainer}>
        <View style={[styles.rowContainer]}>
          <View style={[styles.card]}>
            <Text style={styles.indicatorText}>
              {orders.length}
            </Text>
            <Text style={styles.titleCard}>
              Número de órdenes
            </Text>
          </View>
          <View style={[styles.card,]}>
            <Text style={styles.indicatorText}>
              {orderProduced}
            </Text>
            <Text style={styles.titleCard}>
              Órdenes procesadas
            </Text>
          </View>
          <View style={[styles.card,]}>
            <Text style={[styles.indicatorText]}>
              {orderCard}
            </Text>
            <Text style={[styles.titleCard]}>
              Total con tarjeta
            </Text>
          </View>
          <View style={[styles.card,]}>
            <Text style={[styles.indicatorText, { color: '#bc4749' }]}>
              {orderWithError}
            </Text>
            <Text style={styles.titleCard}>
              Órdenes con error
            </Text>
          </View>

        </View>
        <View style={styles.rowContainer}>
          <View style={[styles.card,]}>
            <Text style={[styles.indicatorText, { color: '#55a630' }]}>
              {CURRENCY_SYMBOL} {total}
            </Text>
            <Text style={[styles.titleCard]}>
              Total de venta
            </Text>
          </View>
          <View style={[styles.card,]}>
            <Text style={[styles.indicatorText, { color: '#1e6091' }]}>
              {CURRENCY_SYMBOL} {totalCard}
            </Text>
            <Text style={[styles.titleCard]}>
              Total con tarjeta
            </Text>
          </View>
          <View style={[styles.card,]}>
            <Text style={[styles.indicatorText, { color: '#2d2a32' }]}>
              {CURRENCY_SYMBOL} {cash}
            </Text>
            <Text style={[styles.titleCard]}>
              Total en efectivo
            </Text>
          </View>

        </View>
        <View style={styles.rowContainer}>
          {
            loading ==true && (
              <LineChart
                data={{
                  labels: hours,
                  datasets: [
                    {
                      data: ordersFrecuencyData
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.9} // from react-native
                height={500}
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "#e26a00",
                  backgroundGradientFrom: "#001d3d",
                  backgroundGradientTo: "#003566",
                  decimalPlaces: 1, // optional, defaults to 2dp
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#1e96fc"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            )
          }


        </View>
      </Animated.ScrollView>
    </View>
  )
}

export default DailyReport

const styles = StyleSheet.create({})
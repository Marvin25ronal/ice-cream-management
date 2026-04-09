import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Order} from '../entity/Order.entity';
import {Expense} from '../entity/Expense.entity';
import {OrderService} from '../services/OrderServices';
import {ExpenseService} from '../services/ExpenseService';
import OrderFilter from '../components/Order/OrderFilter';
import Animated from 'react-native-reanimated';
import { Fonts, FontsSize } from '../constants/Fonts';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { CURRENCY_SYMBOL } from '../constants/utils';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format } from '@formkit/tempo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import {PrintService} from '../services/PrintService';
import Toast from 'react-native-toast-message';

const printService = new PrintService();

const hours = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
];

const expenseServiceInstance = new ExpenseService();

const DailyReport = () => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const [orderService] = useState(new OrderService());
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderProduced, setOrderProduced] = useState(0);
  const [orderWithError, setOrderWithError] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalCard, setTotalCard] = useState(0);
  const [orderCard, setOrderCard] = useState(0);
  const [cash, setCash] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [printing, setPrinting] = useState(false);
  const [ordersFrecuencyData, setOrdersFrecuencyData] = useState([]);
  const [topProducts, setTopProducts] = useState<
    { name: string; quantity: number; revenue: number }[]
  >([]);
  const [averageTicket, setAverageTicket] = useState(0);
  const [averageProductsPerOrder, setAverageProductsPerOrder] = useState(0);
  const [peakHour, setPeakHour] = useState('');
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    getOrders(null);
  }, []);

  useEffect(() => {
    let produced = orders.filter(order => order.payment_date != null);
    setOrderProduced(produced.length);
    setOrderWithError(orders.length - produced.length);
    setTotal(produced.reduce((acc, order) => acc + order.total, 0));
    let cardOrders = produced.filter(
      order => order.payment_method == 2 || order.payment_method == 3,
    );
    setTotalCard(
      cardOrders.reduce(
        (acc, order) =>
          acc + order.orderPayment.reduce((acc2, pay) => acc2 + pay.card, 0),
        0,
      ),
    );
    setOrderCard(cardOrders.length);

    let cashOrders = produced.filter(
      order => order.payment_method == 1 || order.payment_method == 3,
    );

    setCash(
      cashOrders.reduce(
        (acc, order) =>
          acc + order.orderPayment.reduce((acc2, pay) => acc2 + pay.cash, 0),
        0,
      ),
    );
  }, [orders]);

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
      const hour = format(order.creation_date, 'HH:00');
      if (!acc[hour]) {
        acc[hour] = 0;
      }
      acc[hour]++;
      return acc;
    }, {});
  };

  useEffect(() => {
    const baseHours = initializeHourSlots();
    const grouped = groupOrdersByHour(orders);
    const ordersByHour = { ...baseHours, ...grouped };
    setOrdersFrecuencyData(Object.values(ordersByHour));
    setLoading(true);

    // Calcular productos más vendidos
    const productMap = new Map<
      string,
      { name: string; quantity: number; revenue: number }
    >();

    orders.forEach(order => {
      if (order.payment_date != null && order.orderDetails) {
        order.orderDetails.forEach(detail => {
          const existing = productMap.get(detail.product_name);
          if (existing) {
            existing.quantity += detail.quantity;
            existing.revenue += detail.price * detail.quantity;
          } else {
            productMap.set(detail.product_name, {
              name: detail.product_name,
              quantity: detail.quantity,
              revenue: detail.price * detail.quantity,
            });
          }
        });
      }
    });

    const topProductsArray = Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
    setTopProducts(topProductsArray);

    // Calcular KPIs
    const producedOrders = orders.filter(order => order.payment_date != null);

    // Ticket promedio
    if (producedOrders.length > 0) {
      const avgTicket = total / producedOrders.length;
      setAverageTicket(avgTicket);
    }

    // Productos por orden promedio
    const totalProducts = producedOrders.reduce((acc, order) => {
      return (
        acc +
        (order.orderDetails?.reduce(
          (sum, detail) => sum + detail.quantity,
          0,
        ) || 0)
      );
    }, 0);

    if (producedOrders.length > 0) {
      setAverageProductsPerOrder(totalProducts / producedOrders.length);
    }

    // Hora pico
    const hourValues = Object.values(ordersByHour) as number[];
    const maxOrders = Math.max(...hourValues);
    const peakHourKey = Object.keys(ordersByHour).find(
      key => ordersByHour[key] === maxOrders,
    );
    if (peakHourKey && maxOrders > 0) {
      setPeakHour(peakHourKey);
    }

    // Tasa de conversión
    if (orders.length > 0) {
      const conversion = (producedOrders.length / orders.length) * 100;
      setConversionRate(conversion);
    }
  }, [orders, total]);

  useEffect(() => {
    setTotalExpenses(expenses.reduce((acc, e) => acc + e.amount, 0));
  }, [expenses]);

  useEffect(() => {
    setNetBalance(total - totalExpenses);
  }, [total, totalExpenses]);

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
        if (orders != null) {
          setOrders(orders);
        }
      })
      .catch(error => {
        console.log(error);
      });
    expenseServiceInstance
      .getByDateRange(start, end)
      .then(data => setExpenses(data))
      .catch(error => console.log('Error gastos:', error));
  };

  const handlePrintClose = async () => {
    setPrinting(true);
    try {
      await printService.initPrinter();
      await printService.connectPrinter();
      const dateStr = new Date().toLocaleDateString();
      await printService.printDailySummary(
        dateStr,
        total,
        cash,
        totalCard,
        expenses,
        totalExpenses,
        netBalance,
      );
    } catch (e) {
      Toast.show({type: 'error', text1: 'Error al imprimir cierre'});
    } finally {
      setPrinting(false);
    }
  };

  const MetricCard = ({
    icon,
    iconFamily = 'MaterialCommunityIcons',
    value,
    label,
    gradientColors,
    iconColor,
    valueColor,
  }: {
    icon: string;
    iconFamily?: 'MaterialCommunityIcons' | 'FontAwesome5';
    value: string | number;
    label: string;
    gradientColors: string[];
    iconColor: string;
    valueColor: string;
  }) => (
    <View style={styles.metricCard}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.metricGradient}>
        <View style={[styles.iconBadge, { backgroundColor: iconColor }]}>
          {iconFamily === 'FontAwesome5' ? (
            <FontAwesome5 name={icon} size={22} color="white" />
          ) : (
            <Icon name={icon} size={28} color="white" />
          )}
        </View>
        <View style={styles.metricContent}>
          <Text style={[styles.metricValue, { color: valueColor }]}>
            {value}
          </Text>
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
      </LinearGradient>
    </View>
  );

  const RevenueCard = ({
    icon,
    value,
    label,
    gradientColors,
    iconColor,
  }: {
    icon: string;
    value: string | number;
    label: string;
    gradientColors: string[];
    iconColor: string;
  }) => (
    <View style={styles.revenueCard}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.revenueGradient}>
        <View style={styles.revenueHeader}>
          <View
            style={[styles.revenueIconBadge, { backgroundColor: iconColor }]}>
            <Icon name={icon} size={24} color="white" />
          </View>
          <Text style={styles.revenueLabel}>{label}</Text>
        </View>
        <Text style={styles.revenueValue}>
          {CURRENCY_SYMBOL}{' '}
          {typeof value === 'number' ? value.toFixed(2) : value}
        </Text>
      </LinearGradient>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
    },
    dashboardContainer: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
      color: '#2d3436',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
      gap: 12,
    },
    metricCard: {
      width: '47%',
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    metricGradient: {
      padding: 16,
      minHeight: 140,
      justifyContent: 'space-between',
    },
    iconBadge: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    metricContent: {
      marginTop: 8,
    },
    metricValue: {
      fontSize: 36,
      fontFamily: Fonts.LatoBlack,
      marginBottom: 4,
    },
    metricLabel: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoRegular,
      color: '#5a6978',
      lineHeight: 20,
    },
    revenueSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    revenueCard: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    revenueGradient: {
      padding: 20,
    },
    revenueHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    revenueIconBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    revenueLabel: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
      color: '#2d3436',
      flex: 1,
    },
    revenueValue: {
      fontSize: 40,
      fontFamily: Fonts.LatoBlack,
      color: '#27ae60',
    },
    chartContainer: {
      paddingHorizontal: 12,
      paddingVertical: 16,
    },
    chartCard: {
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    chartIconBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#ff6b9d',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    chartTitle: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
      color: '#2d3436',
      flex: 1,
    },
    productList: {
      marginTop: 16,
      gap: 8,
    },
    productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      padding: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#667eea',
    },
    productRank: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#667eea',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    productRankText: {
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.medium,
      color: '#ffffff',
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.medium,
      color: '#2d3436',
      marginBottom: 4,
    },
    productStats: {
      fontFamily: Fonts.LatoRegular,
      fontSize: FontsSize.small,
      color: '#6c757d',
    },
    paymentSummary: {
      marginTop: 16,
      gap: 12,
    },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    paymentDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    paymentLabel: {
      fontFamily: Fonts.LatoRegular,
      fontSize: FontsSize.medium,
      color: '#495057',
      flex: 1,
    },
    paymentValue: {
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.medium,
      color: '#2d3436',
    },
    chartStyle: {
      borderRadius: 16,
      marginVertical: 8,
    },
    greenDot: {
      backgroundColor: '#27ae60',
    },
    blueDot: {
      backgroundColor: '#3498db',
    },
    expenseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff5f2',
      padding: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#FF6348',
      marginBottom: 8,
      gap: 10,
    },
    expenseDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    expenseAmount: {
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.medium,
      color: '#E74C3C',
    },
    printSection: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    printBtn: {
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#FF6348',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.35,
      shadowRadius: 6,
    },
    printBtnPressed: {
      opacity: 0.85,
    },
    printBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingVertical: 16,
    },
    printBtnText: {
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.large,
      color: '#FFF',
    },
  });

  return (
    <View style={styles.container}>
      <OrderFilter getOrders={getOrders} />
      <Animated.ScrollView
        style={styles.dashboardContainer}
        showsVerticalScrollIndicator={false}>
        {/* Orders Metrics Section */}
        <Text style={styles.sectionTitle}>Resumen de Órdenes</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="receipt"
            value={orders.length}
            label="Número de órdenes"
            gradientColors={['#ffeaa7', '#fdcb6e']}
            iconColor="#fdcb6e"
            valueColor="#2d3436"
          />
          <MetricCard
            icon="check-circle"
            value={orderProduced}
            label="Órdenes procesadas"
            gradientColors={['#a7f3d0', '#6ee7b7']}
            iconColor="#10b981"
            valueColor="#065f46"
          />
          <MetricCard
            icon="credit-card"
            iconFamily="FontAwesome5"
            value={orderCard}
            label="Pagos con tarjeta"
            gradientColors={['#ddd6fe', '#c4b5fd']}
            iconColor="#8b5cf6"
            valueColor="#5b21b6"
          />
          <MetricCard
            icon="alert-circle"
            value={orderWithError}
            label="Órdenes con error"
            gradientColors={['#fecaca', '#fca5a5']}
            iconColor="#ef4444"
            valueColor="#991b1b"
          />
        </View>

        {/* Revenue Section */}
        <Text style={styles.sectionTitle}>Ingresos del Día</Text>
        <View style={styles.revenueSection}>
          <RevenueCard
            icon="cash-multiple"
            value={total}
            label="Total de Ventas"
            gradientColors={['#d4f4dd', '#c7f0d8']}
            iconColor="#27ae60"
          />
          <RevenueCard
            icon="credit-card-check"
            value={totalCard}
            label="Total con Tarjeta"
            gradientColors={['#e3f2fd', '#bbdefb']}
            iconColor="#2196f3"
          />
          <RevenueCard
            icon="cash"
            value={cash}
            label="Total en Efectivo"
            gradientColors={['#fff9e6', '#fff3cd']}
            iconColor="#f59e0b"
          />
        </View>

        {/* Gastos del Día */}
        <Text style={styles.sectionTitle}>Gastos del Día</Text>
        <View style={styles.revenueSection}>
          <RevenueCard
            icon="cash-minus"
            value={totalExpenses}
            label="Total Gastos"
            gradientColors={['#fce4e4', '#fdd5d5']}
            iconColor="#E74C3C"
          />
        </View>

        {/* Balance Neto */}
        <Text style={styles.sectionTitle}>Balance del Día</Text>
        <View style={styles.revenueSection}>
          <View style={styles.revenueCard}>
            <LinearGradient
              colors={
                netBalance >= 0 ? ['#d4f4dd', '#c7f0d8'] : ['#fce4e4', '#fdd5d5']
              }
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.revenueGradient}>
              <View style={styles.revenueHeader}>
                <View
                  style={[
                    styles.revenueIconBadge,
                    {
                      backgroundColor:
                        netBalance >= 0 ? '#27ae60' : '#E74C3C',
                    },
                  ]}>
                  <Icon
                    name={netBalance >= 0 ? 'trending-up' : 'trending-down'}
                    size={24}
                    color="white"
                  />
                </View>
                <Text style={styles.revenueLabel}>Neto (Ventas − Gastos)</Text>
              </View>
              <Text
                style={[
                  styles.revenueValue,
                  {color: netBalance >= 0 ? '#27ae60' : '#E74C3C'},
                ]}>
                {CURRENCY_SYMBOL} {Math.abs(netBalance).toFixed(2)}
                {netBalance < 0 ? ' ▼' : ''}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Detalle gastos */}
        {expenses.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Detalle de Gastos</Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View
                    style={[
                      styles.chartIconBadge,
                      {backgroundColor: '#E74C3C'},
                    ]}>
                    <Icon name="format-list-bulleted" size={24} color="white" />
                  </View>
                  <Text style={styles.chartTitle}>Gastos registrados</Text>
                </View>
                <View style={styles.productList}>
                  {expenses.map((expense, index) => (
                    <View key={expense.expense_id} style={styles.expenseItem}>
                      <View
                        style={[
                          styles.expenseDot,
                          {backgroundColor: '#FF6348'},
                        ]}
                      />
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>
                          {expense.expenseType?.name ?? 'Gasto'}
                        </Text>
                        {!!expense.notes && (
                          <Text style={styles.productStats}>
                            {expense.notes}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.expenseAmount}>
                        {CURRENCY_SYMBOL} {expense.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* KPIs Section */}
        <Text style={styles.sectionTitle}>
          Indicadores Clave de Rendimiento
        </Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="ticket-percent"
            value={`${CURRENCY_SYMBOL}${averageTicket.toFixed(2)}`}
            label="Ticket Promedio"
            gradientColors={['#d1f2eb', '#a7e9d7']}
            iconColor="#16a085"
            valueColor="#0e6655"
          />
          <MetricCard
            icon="cart"
            value={averageProductsPerOrder.toFixed(1)}
            label="Productos por Orden"
            gradientColors={['#fce5cd', '#f9cb9c']}
            iconColor="#f39c12"
            valueColor="#b9770e"
          />
          <MetricCard
            icon="clock-time-four"
            value={peakHour || '--:--'}
            label="Hora Pico del Día"
            gradientColors={['#ffd6e7', '#ffb3d9']}
            iconColor="#e91e63"
            valueColor="#880e4f"
          />
          <MetricCard
            icon="chart-line-variant"
            value={`${conversionRate.toFixed(1)}%`}
            label="Tasa de Conversión"
            gradientColors={['#d5e8f7', '#b3d9f2']}
            iconColor="#3498db"
            valueColor="#1a5490"
          />
        </View>

        {/* Top Products Section */}
        {loading && topProducts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Top 10 Productos Más Vendidos
            </Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartIconBadge}>
                    <Icon name="trophy" size={24} color="white" />
                  </View>
                  <Text style={styles.chartTitle}>Ranking de Productos</Text>
                </View>
                <BarChart
                  data={{
                    labels: topProducts.map((_p, i) => `#${i + 1}`),
                    datasets: [
                      {
                        data: topProducts.map(p => p.quantity),
                      },
                    ],
                  }}
                  width={Dimensions.get('window').width - 80}
                  height={320}
                  yAxisLabel=""
                  yAxisSuffix=""
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#667eea',
                    backgroundGradientTo: '#764ba2',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                  style={styles.chartStyle}
                  showValuesOnTopOfBars
                  fromZero
                />
                {/* Product names list */}
                <View style={styles.productList}>
                  {topProducts.map((product, index) => (
                    <View key={index} style={styles.productItem}>
                      <View style={styles.productRank}>
                        <Text style={styles.productRankText}>#{index + 1}</Text>
                      </View>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{product.name}</Text>
                        <Text style={styles.productStats}>
                          {product.quantity} vendidos • {CURRENCY_SYMBOL}
                          {product.revenue.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Payment Methods Comparison */}
        {loading && (
          <>
            <Text style={styles.sectionTitle}>
              Distribución de Métodos de Pago
            </Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartIconBadge}>
                    <Icon name="wallet" size={24} color="white" />
                  </View>
                  <Text style={styles.chartTitle}>Efectivo vs Tarjeta</Text>
                </View>
                <PieChart
                  data={[
                    {
                      name: 'Efectivo',
                      amount: cash,
                      color: '#27ae60',
                      legendFontColor: '#2d3436',
                      legendFontSize: 14,
                    },
                    {
                      name: 'Tarjeta',
                      amount: totalCard,
                      color: '#3498db',
                      legendFontColor: '#2d3436',
                      legendFontSize: 14,
                    },
                  ]}
                  width={Dimensions.get('window').width - 80}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                  style={{
                    borderRadius: 16,
                  }}
                />
                <View style={styles.paymentSummary}>
                  <View style={styles.paymentRow}>
                    <View style={[styles.paymentDot, styles.greenDot]} />
                    <Text style={styles.paymentLabel}>Efectivo:</Text>
                    <Text style={styles.paymentValue}>
                      {CURRENCY_SYMBOL}
                      {cash.toFixed(2)} (
                      {total > 0 ? ((cash / total) * 100).toFixed(1) : 0}%)
                    </Text>
                  </View>
                  <View style={styles.paymentRow}>
                    <View style={[styles.paymentDot, styles.blueDot]} />
                    <Text style={styles.paymentLabel}>Tarjeta:</Text>
                    <Text style={styles.paymentValue}>
                      {CURRENCY_SYMBOL}
                      {totalCard.toFixed(2)} (
                      {total > 0 ? ((totalCard / total) * 100).toFixed(1) : 0}
                      %)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Chart Section */}
        {loading && (
          <>
            <Text style={styles.sectionTitle}>
              Frecuencia de Órdenes por Hora
            </Text>
            <View style={styles.chartContainer}>
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartIconBadge}>
                    <Icon name="chart-line" size={24} color="white" />
                  </View>
                  <Text style={styles.chartTitle}>Actividad del Día</Text>
                </View>
                <LineChart
                  data={{
                    labels: hours,
                    datasets: [
                      {
                        data: ordersFrecuencyData,
                      },
                    ],
                  }}
                  width={Dimensions.get('window').width - 80}
                  height={420}
                  yAxisInterval={1}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ff6b9d',
                    backgroundGradientTo: '#c9184a',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(255, 255, 255, ${opacity})`,
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: '#ffffff',
                      fill: '#fff3e0',
                    },
                    propsForBackgroundLines: {
                      strokeWidth: 1,
                      stroke: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                  bezier
                  style={{
                    borderRadius: 16,
                  }}
                  withVerticalLines={false}
                  withHorizontalLabels={true}
                  withVerticalLabels={true}
                  fromZero
                />
              </View>
            </View>
          </>
        )}

        {/* Botón imprimir cierre */}
        <View style={styles.printSection}>
          <Pressable
            style={({pressed}) => [
              styles.printBtn,
              pressed && styles.printBtnPressed,
            ]}
            onPress={handlePrintClose}
            disabled={printing}>
            <LinearGradient
              colors={['#FF6348', '#FF8C42']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.printBtnGradient}>
              <Icon name="printer" size={22} color="#FFF" />
              <Text style={styles.printBtnText}>
                {printing ? 'Imprimiendo...' : 'Imprimir Cierre del Día'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Bottom Spacing */}
        <View style={{height: 24}} />
      </Animated.ScrollView>
    </View>
  );
};

export default DailyReport;

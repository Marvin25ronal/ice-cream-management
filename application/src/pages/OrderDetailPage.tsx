import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { Fonts, FontsSize } from '../constants/Fonts';
import { CURRENCY_SYMBOL } from '../constants/utils';
import IconSelector, { type_class_icon } from '../components/UI/IconSelector';
import LinearGradient from 'react-native-linear-gradient';
import { OrderService } from '../services/OrderServices';
import { Order } from '../entity/Order.entity';
import { PrintService } from '../services/PrintService';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../routes/StackNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OrderDetail'
>;

const OrderDetailPage = () => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const route = useRoute<OrderDetailRouteProp>();
  const navigation = useNavigation<OrderDetailNavigationProp>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [orderService] = useState(new OrderService());
  const [printService] = useState(new PrintService());

  const orderId = route.params?.orderId;

  useEffect(() => {
    loadOrderDetails();
    printService.initPrinter().then(() => {
      printService.connectPrinter().then(() => {
        console.log('printer connected');
      });
    });
    // Initialize printer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    try {
      const orderData = await orderService.getOrder(orderId);
      if (orderData) {
        setOrder(orderData);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReprint = async () => {
    if (!order) return;

    setIsPrinting(true);
    try {
      printService.printOrder(order);
      // Reload order to get updated print_number
      await loadOrderDetails();
    } catch (error) {
      console.error('Error printing order:', error);
    } finally {
      setIsPrinting(false);
    }
  };

  const getStatusConfig = () => {
    if (!order) return { label: '', gradientColors: [] };

    switch (order.status) {
      case 0:
        return {
          label: 'Pendiente',
          icon: 'clock',
          gradientColors: ['#FF8A5B', '#FFB700'],
        };
      case 1:
        return {
          label: 'Completado',
          icon: 'check-circle',
          gradientColors: ['#06D6A0', '#52B788'],
        };
      case 2:
        return {
          label: 'Cancelado',
          icon: 'times-circle',
          gradientColors: ['#EF476F', '#FF6D8F'],
        };
      default:
        return {
          label: 'Desconocido',
          icon: 'question-circle',
          gradientColors: ['#6C757D', '#ADB5BD'],
        };
    }
  };

  const getPaymentMethodLabel = () => {
    if (!order) return '';
    switch (order.payment_method) {
      case 1:
        return 'Efectivo';
      case 2:
        return 'Tarjeta';
      case 3:
        return 'Mixto';
      default:
        return 'Desconocido';
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusConfig = getStatusConfig();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
    },
    scrollContent: {
      padding: SCREEN_WIDTH >= 768 ? 24 : 16,
      paddingBottom: 40,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Header Card
    headerCard: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      marginBottom: 20,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    gradientHeader: {
      padding: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderNumberSection: {
      flex: 1,
    },
    orderNumberLabel: {
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 4,
    },
    orderNumber: {
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.xxxl : FontsSize.xxl,
      fontFamily: Fonts.LatoBlack,
      color: '#FFFFFF',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoBold,
    },
    headerContent: {
      padding: 20,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    infoColumn: {
      flex: 1,
    },
    infoLabel: {
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
      marginBottom: 6,
    },
    infoValue: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoBold,
      color: theme.MODAL_TEXT_COLOR,
    },
    divider: {
      height: 1,
      backgroundColor: theme.DIVIDER_COLOR,
      marginVertical: 16,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 2,
      borderTopColor: '#c9184a',
    },
    totalLabel: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBlack,
      color: theme.MODAL_TEXT_COLOR,
    },
    totalValue: {
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.xxxl : FontsSize.xxl,
      fontFamily: Fonts.LatoBlack,
      color: '#c9184a',
    },
    // Products Card
    productsCard: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    sectionTitle: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBlack,
      color: theme.MODAL_TEXT_COLOR,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    productItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.DIVIDER_COLOR,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoBold,
      color: theme.MODAL_TEXT_COLOR,
      marginBottom: 4,
    },
    productQuantity: {
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
    },
    productPrice: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoBold,
      color: '#c9184a',
    },
    // Print Button
    reprintButton: {
      marginTop: 10,
      borderRadius: 16,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#7209B7',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    reprintGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 24,
      gap: 12,
    },
    reprintButtonText: {
      color: '#FFFFFF',
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBlack,
    },
    printCountBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    printCountText: {
      color: '#FFFFFF',
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoBold,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.SPLASH_SCREEN_BACKGROUND_COLOR}
        />
        <Text style={[styles.infoLabel, { marginTop: 16 }]}>
          Cargando orden...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.infoLabel}>Orden no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <LinearGradient
            colors={statusConfig.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientHeader}>
            <View style={styles.orderNumberSection}>
              <Text style={styles.orderNumberLabel}>Orden</Text>
              <Text style={styles.orderNumber}>#{order.order_id}</Text>
            </View>
            <View style={styles.statusBadge}>
              <IconSelector
                icon_class={type_class_icon.FontAwesome5}
                icon={statusConfig.icon}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.statusText}>{statusConfig.label}</Text>
            </View>
          </LinearGradient>

          <View style={styles.headerContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>
                  {formatDate(order.creation_date)}
                </Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>
                  {formatTime(order.creation_date)}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Método de Pago</Text>
                <Text style={styles.infoValue}>{getPaymentMethodLabel()}</Text>
              </View>
              <View style={styles.infoColumn}>
                <Text style={styles.infoLabel}>Impresiones</Text>
                <Text style={styles.infoValue}>{order.print_number}</Text>
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {CURRENCY_SYMBOL} {order.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Products Card */}
        <View style={styles.productsCard}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {order.orderDetails &&
            order.orderDetails.map((detail, index) => (
              <View key={index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {detail?.product_name || 'Producto'}
                  </Text>
                  <Text style={styles.productQuantity}>
                    Cantidad: {detail.quantity} x {CURRENCY_SYMBOL}
                    {detail?.price.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.productPrice}>
                  {CURRENCY_SYMBOL}{' '}
                  {(detail.quantity * (detail?.price || 0)).toFixed(2)}
                </Text>
              </View>
            ))}
        </View>

        {/* Reprint Button */}
        <TouchableOpacity
          style={styles.reprintButton}
          onPress={handleReprint}
          disabled={isPrinting}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#7209B7', '#B185DB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.reprintGradient}>
            {isPrinting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.reprintButtonText}>Imprimiendo...</Text>
              </>
            ) : (
              <>
                <IconSelector
                  icon_class={type_class_icon.FontAwesome5}
                  icon="print"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.reprintButtonText}>Reimprimir Orden</Text>
                <View style={styles.printCountBadge}>
                  <Text style={styles.printCountText}>
                    #{order.print_number}
                  </Text>
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OrderDetailPage;

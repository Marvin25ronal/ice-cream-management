import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import React from 'react';
import { Order } from '../../entity/Order.entity';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/redux/store';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL } from '../../constants/utils';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OrderResumeCardProps {
  order: Order;
  onPress?: () => void;
}

const OrderResumeCard = ({ order, onPress }: OrderResumeCardProps) => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Determine card width based on screen size
  const getCardWidth = () => {
    if (SCREEN_WIDTH >= 1024) {
      // Tablet landscape: 3 columns with gaps
      return (SCREEN_WIDTH - 80) / 3;
    } else if (SCREEN_WIDTH >= 768) {
      // Tablet portrait: 2 columns with gaps
      return (SCREEN_WIDTH - 60) / 2;
    } else {
      // Phone: 2 columns with smaller gaps
      return (SCREEN_WIDTH - 50) / 2;
    }
  };

  // Get status configuration
  const getStatusConfig = () => {
    switch (order.status) {
      case 0: // Pending
        return {
          label: 'Pendiente',
          icon: 'clock',
          iconClass: type_class_icon.FontAwesome5,
          gradientColors: [
            theme.ORDER_STATUS_PENDING_PRIMARY,
            theme.ORDER_STATUS_PENDING_SECONDARY,
          ],
          badgeGradient: ['#FF8A5B', '#FFB700'],
        };
      case 1: // Payment/In Progress
        return {
          label: 'Completado',
          icon: 'check-circle',
          iconClass: type_class_icon.FontAwesome5,
          gradientColors: [
            theme.ORDER_STATUS_COMPLETED_PRIMARY,
            theme.ORDER_STATUS_COMPLETED_SECONDARY,
          ],
          badgeGradient: ['#06D6A0', '#52B788'],
        };
      case 2: // Canceled
        return {
          label: 'Cancelado',
          icon: 'times-circle',
          iconClass: type_class_icon.FontAwesome5,
          gradientColors: [
            theme.ORDER_STATUS_CANCELLED_PRIMARY,
            theme.ORDER_STATUS_CANCELLED_SECONDARY,
          ],
          badgeGradient: ['#EF476F', '#FF6D8F'],
        };
      default:
        return {
          label: 'Desconocido',
          icon: 'question-circle',
          iconClass: type_class_icon.FontAwesome5,
          gradientColors: ['#6C757D', '#ADB5BD'],
          badgeGradient: ['#6C757D', '#ADB5BD'],
        };
    }
  };

  // Get payment method configuration
  const getPaymentConfig = () => {
    switch (order.payment_method) {
      case 1: // Cash
        return {
          icon: 'money-bill-wave',
          label: 'Efectivo',
          color: theme.PAYMENT_CASH_PRIMARY,
          backgroundColor: theme.PAYMENT_CASH_SECONDARY,
        };
      case 2: // Credit Card
        return {
          icon: 'credit-card',
          label: 'Tarjeta',
          color: theme.PAYMENT_CARD_PRIMARY,
          backgroundColor: theme.PAYMENT_CARD_SECONDARY,
        };
      case 3: // Mixed
        return {
          icon: 'cash-register',
          label: 'Mixto',
          color: theme.PAYMENT_MIXED_PRIMARY,
          backgroundColor: theme.PAYMENT_MIXED_SECONDARY,
        };
      default:
        return {
          icon: 'times-circle',
          label: 'N/A',
          color: '#E63946',
          backgroundColor: '#FFCCD5',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const paymentConfig = getPaymentConfig();

  // Format date and time
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Animation handlers
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const cardWidth = getCardWidth();

  const styles = StyleSheet.create({
    cardContainer: {
      width: cardWidth,
      marginBottom: 16,
      marginHorizontal: 6,
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: statusConfig.gradientColors[0],
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    gradientHeader: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    orderNumberContainer: {
      flex: 1,
    },
    orderNumberLabel: {
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoRegular,
      marginBottom: 4,
    },
    orderNumber: {
      color: '#FFFFFF',
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.extraLarge : FontsSize.large,
      fontFamily: Fonts.LatoBlack,
      letterSpacing: 0.5,
    },
    statusBadge: {
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusText: {
      color: '#FFFFFF',
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoBold,
    },
    contentContainer: {
      padding: 16,
    },
    dateTimeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      borderRadius: 12,
      padding: 12,
    },
    dateTimeIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: statusConfig.gradientColors[0],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    dateTimeTextContainer: {
      flex: 1,
    },
    dateText: {
      color: theme.MODAL_TEXT_COLOR,
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.medium : FontsSize.small,
      fontFamily: Fonts.LatoBold,
      marginBottom: 2,
    },
    timeText: {
      color: theme.LABEL_FORM_COLOR,
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoRegular,
    },
    divider: {
      height: 1,
      backgroundColor: theme.DIVIDER_COLOR,
      marginVertical: 12,
    },
    bottomSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priceContainer: {
      flex: 1,
    },
    priceLabel: {
      color: theme.LABEL_FORM_COLOR,
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoRegular,
      marginBottom: 4,
    },
    price: {
      color: theme.SPLASH_SCREEN_BACKGROUND_COLOR,
      fontSize:
        SCREEN_WIDTH >= 768 ? FontsSize.extraLarge + 4 : FontsSize.extraLarge,
      fontFamily: Fonts.LatoBlack,
      letterSpacing: 0.5,
    },
    paymentMethodContainer: {
      alignItems: 'center',
      backgroundColor: paymentConfig.backgroundColor,
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 14,
      minWidth: 80,
    },
    paymentLabel: {
      color: paymentConfig.color,
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.extraSmall : 10,
      fontFamily: Fonts.LatoBold,
      marginTop: 4,
      textAlign: 'center',
    },
    printCounterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.DIVIDER_COLOR,
      gap: 8,
    },
    printIconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#F3E5F5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    printCounterText: {
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoRegular,
      color: '#7209B7',
    },
  });

  const CardContent = (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      <View style={styles.card}>
        {/* Gradient Header with Order Number and Status */}
        <LinearGradient
          colors={statusConfig.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}>
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumberLabel}>Orden</Text>
            <Text style={styles.orderNumber}>#{order.order_id}</Text>
          </View>
          <LinearGradient
            colors={statusConfig.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statusBadge}>
            <IconSelector
              icon_class={statusConfig.iconClass}
              icon={statusConfig.icon}
              size={SCREEN_WIDTH >= 768 ? 14 : 12}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>{statusConfig.label}</Text>
          </LinearGradient>
        </LinearGradient>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Date and Time */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeIconContainer}>
              <IconSelector
                icon_class={type_class_icon.FontAwesome5}
                icon="calendar-alt"
                size={18}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.dateTimeTextContainer}>
              <Text style={styles.dateText}>
                {formatDate(order.creation_date)}
              </Text>
              <Text style={styles.timeText}>
                {formatTime(order.creation_date)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Price and Payment Method */}
          <View style={styles.bottomSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Total</Text>
              <Text style={styles.price}>
                {CURRENCY_SYMBOL} {order.total.toFixed(2)}
              </Text>
            </View>
            <View style={styles.paymentMethodContainer}>
              <IconSelector
                icon_class={type_class_icon.FontAwesome5}
                icon={paymentConfig.icon}
                size={SCREEN_WIDTH >= 768 ? 24 : 20}
                color={paymentConfig.color}
              />
              <Text style={styles.paymentLabel}>{paymentConfig.label}</Text>
            </View>
          </View>

          {/* Print Counter */}
          <View style={styles.printCounterContainer}>
            <View style={styles.printIconCircle}>
              <IconSelector
                icon_class={type_class_icon.FontAwesome5}
                icon="print"
                size={14}
                color="#7209B7"
              />
            </View>
            <Text style={styles.printCounterText}>
              Impreso {order.print_number}{' '}
              {order.print_number === 1 ? 'vez' : 'veces'}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  // If onPress is provided, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

export default OrderResumeCard;

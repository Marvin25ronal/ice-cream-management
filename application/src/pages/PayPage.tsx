import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../constants/Fonts';
import { themeInterface } from '../interface/themeInterface';
import CashForm from '../components/ShoppingCart/CashForm';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { OrderService } from '../services/OrderServices';
import { CURRENCY_SYMBOL } from '../constants/utils';

type PaymentMethodType = 'cash' | 'card' | 'mix';

interface PaymentMethodOption {
  id: PaymentMethodType;
  label: string;
  icon: string;
  gradientColors: string[];
  description: string;
}

const PayPage = () => {
  const orderId: number = useSelector((state: any) => state.order.value);
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType>('cash');
  const [total, setTotal] = useState(0);
  const [orderService] = useState(new OrderService());
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    orderService.getOrder(orderId).then(orderData => {
      if (orderData) {
        setTotal(orderData.total);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const paymentMethods: PaymentMethodOption[] = [
    {
      id: 'cash',
      label: 'Efectivo',
      icon: 'cash-multiple',
      gradientColors: ['#38b000', '#70e000'],
      description: 'Billetes y monedas',
    },
    {
      id: 'card',
      label: 'Tarjeta',
      icon: 'credit-card',
      gradientColors: ['#d946ef', '#f0abfc'],
      description: 'Débito o crédito',
    },
    {
      id: 'mix',
      label: 'Mixto',
      icon: 'wallet',
      gradientColors: ['#f97316', '#fbbf24'],
      description: 'Efectivo + Tarjeta',
    },
  ];

  const { width, height } = dimensions;
  /** Tablets en apaisado: más ancho que alto y pantalla suficiente (incluye ~10" en landscape) */
  const isLandscapeTablet = width >= 600 && width > height;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
    },
    scrollContent: {
      flex: isLandscapeTablet ? 1 : undefined,
      minHeight: isLandscapeTablet ? 0 : undefined,
      padding: isLandscapeTablet ? 20 : 16,
      paddingBottom: 40,
    },
    landscapeContainer: {
      flex: 1,
      flexDirection: 'row',
      gap: 24,
      alignItems: 'stretch',
      minHeight: 0,
    },
    leftColumn: {
      flex: 0.35,
      minWidth: 0,
      gap: 16,
    },
    rightColumn: {
      flex: 1,
      minWidth: 0,
      minHeight: 0,
      gap: 16,
      padding: 10,
    },
    portraitContainer: {
      gap: 24,
    },
    // Header/Total Section
    totalContainer: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      padding: isLandscapeTablet ? 20 : 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#f0f0f0',
    },
    totalLabel: {
      fontSize: isLandscapeTablet ? FontsSize.medium : FontsSize.large,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    totalAmount: {
      fontSize: isLandscapeTablet ? 40 : 48,
      fontFamily: Fonts.LatoBlack,
      color: '#c9184a',
      textShadowColor: 'rgba(201, 24, 74, 0.2)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    // Payment Methods Section
    paymentMethodsContainer: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: isLandscapeTablet ? FontsSize.medium : FontsSize.large,
      fontFamily: Fonts.LatoBold,
      color: theme.LABEL_FORM_COLOR,
      marginBottom: 8,
    },
    paymentMethodsGrid: {
      flexDirection: isLandscapeTablet ? 'column' : 'row',
      gap: 12,
    },
    paymentMethodCard: {
      borderRadius: 16,
      overflow: 'hidden',
      minHeight: isLandscapeTablet ? 100 : 120,
      flex: isLandscapeTablet ? undefined : 1,
    },
    paymentMethodGradient: {
      padding: isLandscapeTablet ? 14 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isLandscapeTablet ? 100 : 120,
      position: 'relative',
      flexDirection: isLandscapeTablet ? 'row' : 'column',
      gap: isLandscapeTablet ? 12 : 8,
    },
    paymentMethodContent: {
      alignItems: 'center',
      gap: 6,
      flexDirection: isLandscapeTablet ? 'row' : 'column',
    },
    paymentMethodTextContainer: {
      alignItems: isLandscapeTablet ? 'flex-start' : 'center',
    },
    paymentMethodIcon: {
      marginBottom: isLandscapeTablet ? 0 : 4,
    },
    paymentMethodLabel: {
      fontSize: isLandscapeTablet ? FontsSize.medium : FontsSize.large,
      fontFamily: Fonts.LatoBold,
      color: '#ffffff',
      textAlign: isLandscapeTablet ? 'left' : 'center',
    },
    paymentMethodDescription: {
      fontSize: isLandscapeTablet ? FontsSize.small - 2 : FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: '#ffffff',
      opacity: 0.9,
      textAlign: isLandscapeTablet ? 'left' : 'center',
    },
    selectedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unselectedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
    // Form Section
    formContainer: {
      flex: isLandscapeTablet ? 1 : undefined,
      minHeight: isLandscapeTablet ? 0 : undefined,
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      padding: isLandscapeTablet ? 20 : 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      borderWidth: 1,
      borderColor: '#f0f0f0',
      overflow: 'hidden',
    },
    helpText: {
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
      opacity: 0.7,
      textAlign: isLandscapeTablet ? 'left' : 'center',
      marginTop: 4,
    },
  });

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
  };

  const renderContent = () => {
    if (isLandscapeTablet) {
      // Tablet Landscape: Two-column layout - NO SCROLL
      return (
        <View style={styles.scrollContent}>
          <View style={styles.landscapeContainer}>
            {/* Left Column: Payment Methods */}
            <View style={styles.leftColumn}>
              <View style={styles.paymentMethodsContainer}>
                <Text style={styles.sectionTitle}>Método de Pago</Text>
                <View style={styles.paymentMethodsGrid}>
                  {paymentMethods.map(method => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedMethod === method.id}
                      onSelect={handleMethodSelect}
                      isLandscape={isLandscapeTablet}
                    />
                  ))}
                </View>
                <Text style={styles.helpText}>
                  Selecciona el método de pago
                </Text>
              </View>
            </View>

            {/* Right Column: scroll para que mixto/efectivo no pierdan el botón Cobrar */}
            <ScrollView
              style={{flex: 1, minHeight: 0}}
              contentContainerStyle={{flexGrow: 1, paddingBottom: 16}}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator>
              <View style={styles.rightColumn}>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>
                    {CURRENCY_SYMBOL} {total.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.formContainer}>
                  {selectedMethod === 'cash' && <CashForm hideTotal />}
                  {selectedMethod === 'card' && <CashForm card hideTotal />}
                  {selectedMethod === 'mix' && <CashForm mix hideTotal />}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      );
    } else {
      // Phone/Portrait: Single column with scroll
      return (
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}>
          <View style={styles.scrollContent}>
            <View style={styles.portraitContainer}>
              {/* Total Display */}
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total a Pagar</Text>
                <Text style={styles.totalAmount}>
                  {CURRENCY_SYMBOL} {total.toFixed(2)}
                </Text>
              </View>

              {/* Payment Method Selection */}
              <View style={styles.paymentMethodsContainer}>
                <Text style={styles.sectionTitle}>Método de Pago</Text>
                <View style={styles.paymentMethodsGrid}>
                  {paymentMethods.map(method => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedMethod === method.id}
                      onSelect={handleMethodSelect}
                      isLandscape={false}
                    />
                  ))}
                </View>
                <Text style={styles.helpText}>
                  Selecciona el método de pago que prefieras
                </Text>
              </View>

              {/* Payment Form */}
              <View style={styles.formContainer}>
                {selectedMethod === 'cash' && <CashForm hideTotal />}
                {selectedMethod === 'card' && <CashForm card hideTotal />}
                {selectedMethod === 'mix' && <CashForm mix hideTotal />}
              </View>
            </View>
          </View>
        </ScrollView>
      );
    }
  };

  return (
    <View style={[styles.container, isLandscapeTablet && {flex: 1}]}>
      {renderContent()}
    </View>
  );
};

// Payment Method Card Component
interface PaymentMethodCardProps {
  method: PaymentMethodOption;
  isSelected: boolean;
  onSelect: (id: PaymentMethodType) => void;
  isLandscape: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
  isLandscape,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(scale.value, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  });

  const handlePress = () => {
    scale.value = 0.95;
    setTimeout(() => {
      scale.value = 1;
    }, 100);
    onSelect(method.id);
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      minHeight: isLandscape ? 100 : 120,
      flex: isLandscape ? undefined : 1,
    },
    cardTouchable: {
      flex: 1,
    },
    gradient: {
      padding: isLandscape ? 14 : 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isLandscape ? 100 : 120,
      position: 'relative',
      flexDirection: isLandscape ? 'row' : 'column',
      gap: isLandscape ? 12 : 8,
    },
    content: {
      alignItems: 'center',
      gap: 6,
      flexDirection: isLandscape ? 'row' : 'column',
      flex: 1,
    },
    textContainer: {
      alignItems: isLandscape ? 'flex-start' : 'center',
      flex: 1,
    },
    icon: {
      marginBottom: isLandscape ? 0 : 4,
    },
    label: {
      fontSize: isLandscape ? FontsSize.medium : FontsSize.large,
      fontFamily: Fonts.LatoBold,
      color: '#ffffff',
      textAlign: isLandscape ? 'left' : 'center',
    },
    description: {
      fontSize: isLandscape ? FontsSize.small - 2 : FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: '#ffffff',
      opacity: 0.9,
      textAlign: isLandscape ? 'left' : 'center',
    },
    selectedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: '#ffffff',
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 4,
    },
    unselectedOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        style={styles.cardTouchable}>
        <LinearGradient
          colors={method.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          <View style={styles.content}>
            <Icon
              name={method.icon}
              size={isLandscape ? 32 : 40}
              color="#ffffff"
              style={styles.icon}
            />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{method.label}</Text>
              <Text style={styles.description}>{method.description}</Text>
            </View>
          </View>

          {isSelected && (
            <View style={styles.selectedBadge}>
              <Icon name="check" size={16} color={method.gradientColors[0]} />
            </View>
          )}

          {!isSelected && <View style={styles.unselectedOverlay} />}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default PayPage;

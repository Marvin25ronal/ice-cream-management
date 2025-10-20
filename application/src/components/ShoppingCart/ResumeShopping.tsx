import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { AgrupatedProducts } from '../../pages/EditShoppingCartPage';
import { useDispatch, useSelector } from 'react-redux';
import { themeInterface } from '../../interface/themeInterface';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL, Utils } from '../../constants/utils';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import { useNavigation } from '@react-navigation/native';
import { Order } from '../../entity/Order.entity';
import { PaymentServices } from '../../services/PaymentServices';
import { AlertFunctions } from '../../shared/AlertsFunctions';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../routes/StackNavigator';
import { OrderDetail } from '../../entity/OrderDetail.entity';
import { setOrder } from '../../store/redux/orderReducer';
import { PrintService } from '../../services/PrintService';
import moment from 'moment-timezone';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

const ResumeShopping = ({ elements }: { elements: AgrupatedProducts[] }) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  let existOrder = useSelector((state: any) => state.order.value);
  const dispatch = useDispatch();
  const [paymentService] = useState(new PaymentServices());
  const [printerService] = useState(new PrintService());
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    const totalPrices = elements.reduce((total, item) => {
      return (
        total +
        item.products.reduce((subtotal, product) => subtotal + product.price, 0)
      );
    }, 0);

    const totalItems = elements.reduce((count, item) => {
      return count + item.products.length;
    }, 0);

    setTotal(totalPrices);
    setItemCount(totalItems);
  }, [elements]);

  useEffect(() => {
    // printerService.initPrinter().then(() => {
    //     printerService.connectPrinter().then(() => {
    //         console.log('printer connected')
    //     })
    // })
  }, []);

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const saveOrder = async () => {
    console.log('Exist order', existOrder);
    if (existOrder == -1) {
      const neworder = new Order();
      neworder.total = total;
      neworder.status = 0;
      console.log('Fecha', moment().tz('America/Guatemala').toDate());
      neworder.creation_date = moment().tz('America/Guatemala').toDate();
      neworder.print_number = 0;
      let orderDetails = [];
      for (const element of elements) {
        const product = element.products[0];
        const orderDetail = new OrderDetail();
        orderDetail.product_id = product.product_id;
        orderDetail.quantity = element.products.length;
        orderDetail.price = product.price;
        orderDetail.product_name = product.name;
        orderDetail.order = neworder;
        orderDetails.push(orderDetail);
      }
      neworder.orderDetails = [...orderDetails];

      await paymentService.saveOrder(neworder).then(async order => {
        dispatch(setOrder(order.order_id));
        console.log('Order saved', order);
        AlertFunctions.showOrderSaved();
        console.log('Mi ordern id', order.order_id);
        existOrder = order.order_id;
        navigation.navigate(Utils.screens.PAYMENT);
      });
    } else {
      console.log('Ya existe una orden');
      navigation.navigate(Utils.screens.PAYMENT);
    }
  };

  const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      margin: 12,
      padding: 24,
      shadowColor: '#c9184a',
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
      flex: 1,
      borderTopWidth: 4,
      borderTopColor: '#e91e63',
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 16,
    },
    headerTitle: {
      fontFamily: Fonts.LatoRegular,
      fontSize: isTablet ? FontsSize.large : FontsSize.medium,
      color: '#6c757d',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 8,
    },
    divider: {
      width: 60,
      height: 3,
      backgroundColor: '#e91e63',
      borderRadius: 2,
    },
    summarySection: {
      alignItems: 'center',
      gap: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f3f5',
    },
    summaryLabel: {
      fontFamily: Fonts.LatoRegular,
      fontSize: isTablet ? FontsSize.large : FontsSize.medium,
      color: '#495057',
    },
    summaryValue: {
      fontFamily: Fonts.LatoBold,
      fontSize: isTablet ? FontsSize.large : FontsSize.medium,
      color: '#2d3436',
    },
    totalSection: {
      backgroundColor: '#fff3f8',
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      marginTop: 8,
      marginBottom: 8,
      borderWidth: 2,
      borderColor: '#ffc2d9',
    },
    totalLabel: {
      fontFamily: Fonts.LatoRegular,
      fontSize: isTablet ? FontsSize.large + 2 : FontsSize.large,
      color: '#868e96',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    totalAmount: {
      fontFamily: Fonts.LatoBlack,
      fontSize: isTablet ? 56 : 48,
      color: '#c9184a',
      letterSpacing: -1,
    },
    currencySymbol: {
      fontSize: isTablet ? 36 : 32,
    },
    actionsContainer: {
      width: '100%',
      gap: 12,
      marginTop: 'auto',
      paddingTop: 20,
    },
    proceedButton: {
      backgroundColor: '#51cf66',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      shadowColor: '#51cf66',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: {
      fontFamily: Fonts.LatoBold,
      fontSize: isTablet ? FontsSize.large + 2 : FontsSize.large,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    emptyStateIcon: {
      marginBottom: 8,
    },
    emptyStateText: {
      fontFamily: Fonts.LatoRegular,
      fontSize: FontsSize.large,
      color: '#adb5bd',
      textAlign: 'center',
    },
    itemCountBadge: {
      backgroundColor: '#e91e63',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginTop: 8,
    },
    itemCountText: {
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.medium,
      color: '#FFFFFF',
    },
  });

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Resumen de orden</Text>
        <View style={styles.divider} />
      </View>

      {total > 0 ? (
        <>
          {/* Summary Section */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{itemCount}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Productos</Text>
              <Text style={styles.summaryValue}>{elements.length}</Text>
            </View>

            {/* Total Display */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Monto Total</Text>
              <Text style={styles.totalAmount}>
                <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
                {total.toFixed(2)}
              </Text>
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={saveOrder}
              activeOpacity={0.8}>
              <IconSelector
                icon_class={type_class_icon.Feather}
                icon="arrow-right-circle"
                size={24}
                color={'white'}
              />
              <Text style={styles.buttonText}>Proceder al pago</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIcon}>
            <IconSelector
              icon_class={type_class_icon.Feather}
              icon="shopping-cart"
              size={64}
              color={'#dee2e6'}
            />
          </View>
          <Text style={styles.emptyStateText}>
            Your cart is empty{'\n'}Add some delicious items!
          </Text>
        </View>
      )}
    </View>
  );
};

export default ResumeShopping;

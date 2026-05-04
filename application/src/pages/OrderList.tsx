import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { OrderService } from '../services/OrderServices';
import OrderFilter from '../components/Order/OrderFilter';
import { Order } from '../entity/Order.entity';
import OrderResumeCard from '../components/Order/OrderResumeCard';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import IconSelector, { type_class_icon } from '../components/UI/IconSelector';
import { Fonts, FontsSize } from '../constants/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OrderStackParamList } from '../routes/OrderStackNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OrderListNavigationProp = StackNavigationProp<
  OrderStackParamList,
  'OrderList'
>;

const OrderList = () => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const navigation = useNavigation<OrderListNavigationProp>();
  const [orderService] = useState(new OrderService());
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    getOrders(null);
  }, []);

  const getOrders = useCallback(
    (data: any) => {
      setIsLoading(true);
      let date: string = data?.date;
      if (date == null) {
        date = new Date().toLocaleDateString('es-GT', {day: '2-digit', month: '2-digit', year: 'numeric'});
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
        })
        .finally(() => {
          setIsLoading(false);
          setIsRefreshing(false);
        });
    },
    [orderService],
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    getOrders(null);
  }, [getOrders]);

  // Calculate number of columns based on screen width
  const getNumColumns = () => {
    if (SCREEN_WIDTH >= 1024) {
      return 3; // Tablet landscape
    } else if (SCREEN_WIDTH >= 768) {
      return 2; // Tablet portrait
    } else {
      return 2; // Phone
    }
  };

  const numColumns = getNumColumns();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
    },
    contentContainer: {
      paddingHorizontal: 12,
      paddingBottom: 20,
      paddingTop: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    loadingText: {
      marginTop: 16,
      color: theme.LABEL_FORM_COLOR,
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoRegular,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 80,
    },
    emptyGradient: {
      width: 140,
      height: 140,
      borderRadius: 70,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    emptyIconCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize:
        SCREEN_WIDTH >= 768 ? FontsSize.extraLarge + 2 : FontsSize.extraLarge,
      fontFamily: Fonts.LatoBlack,
      color: theme.MODAL_TEXT_COLOR,
      marginBottom: 12,
      textAlign: 'center',
    },
    emptyMessage: {
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.medium : FontsSize.small,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={[
          theme.ORDER_EMPTY_STATE_PRIMARY,
          theme.ORDER_EMPTY_STATE_SECONDARY,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.emptyGradient}>
        <View style={styles.emptyIconCircle}>
          <IconSelector
            icon_class={type_class_icon.FontAwesome5}
            icon="ice-cream"
            size={60}
            color={theme.ORDER_ACCENT_COLOR}
          />
        </View>
      </LinearGradient>
      <Text style={styles.emptyTitle}>No hay ordenes</Text>
      <Text style={styles.emptyMessage}>
        No se encontraron ordenes para el periodo seleccionado.{'\n'}
        Intenta buscar en otra fecha o crea una nueva orden.
      </Text>
    </View>
  );

  // Loading state component
  const LoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={theme.SPLASH_SCREEN_BACKGROUND_COLOR}
      />
      <Text style={styles.loadingText}>Cargando ordenes...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <OrderFilter getOrders={getOrders} />

      {isLoading && !isRefreshing ? (
        <LoadingState />
      ) : (
        <FlatList
          data={orders}
          renderItem={({ item }) => (
            <OrderResumeCard
              order={item}
              onPress={() =>
                navigation.navigate('OrderDetail', { orderId: item.order_id })
              }
            />
          )}
          keyExtractor={item => `order-${item.order_id}`}
          numColumns={numColumns}
          key={numColumns} // Force re-render when columns change
          contentContainerStyle={[
            styles.contentContainer,
            orders.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.SPLASH_SCREEN_BACKGROUND_COLOR]}
              tintColor={theme.SPLASH_SCREEN_BACKGROUND_COLOR}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default OrderList;

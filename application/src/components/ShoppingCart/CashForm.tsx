import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { themeInterface } from '../../interface/themeInterface';
import { useDispatch, useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL, Utils } from '../../constants/utils';
import { OrderService, PaymentMethod } from '../../services/OrderServices';
import { Order } from '../../entity/Order.entity';
import { AlertFunctions } from '../../shared/AlertsFunctions';
import CustomInputComponent from '../UI/CustomInputComponent';
import { useForm } from 'react-hook-form';
import { type_class_icon } from '../UI/IconSelector';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../routes/StackNavigator';
import { clearCart } from '../../store/redux/carReducer';
import { clearOrder } from '../../store/redux/orderReducer';
import ModalComponent from '../UI/ModalComponent';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import GenericModal from '../UI/GenericModal';
import { PrintService } from '../../services/PrintService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CashForm = ({
  card = false,
  mix = false,
  hideTotal = false,
}: {
  card?: boolean;
  mix?: boolean;
  hideTotal?: boolean;
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const orderId: number = useSelector((state: any) => state.order.value);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [total, setTotal] = useState(0);
  const [orderService] = useState(new OrderService());
  const [printService] = useState(new PrintService());
  const [order, setOrder] = useState<Order | null>(null);
  const { control, watch, handleSubmit, setValue } = useForm();
  const progress = useSharedValue(0);
  const [visible, setVisible] = useState(false);
  const [reload, setReload] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(true);
  const switchAnimation = useRef(new Animated.Value(1)).current;
  const dispatch = useDispatch();

  // Watch for changes in cash and card fields for mix mode
  const cashValue = watch('cash');
  const cardValue = watch('card');
  const [lastEditedField, setLastEditedField] = useState<
    'cash' | 'card' | null
  >(null);

  useEffect(() => {
    console.log('Order id', orderId);
    printService.initPrinter().then(() => {
      printService.connectPrinter().then(() => {
        console.log('printer connected');
      });
    });
    if (reload === false) {
      orderService.getOrder(orderId).then(orderData => {
        if (orderData) {
          setTotal(orderData.total);
          setOrder(orderData);
          console.log(orderData);
        } else {
          AlertFunctions.orderNotFound();
        }
      });
    }
    setReload(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Set initial cash value when total is loaded (only for cash payment mode)
  useEffect(() => {
    if (total > 0 && !card && !mix) {
      setValue('cash', total.toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Auto-calculate the remaining amount in mix mode
  useEffect(() => {
    if (mix && total > 0 && lastEditedField) {
      if (lastEditedField === 'cash') {
        const cashAmount = parseFloat(cashValue) || 0;
        const remainingForCard = Math.max(0, total - cashAmount);
        setValue('card', remainingForCard.toFixed(2));
      } else if (lastEditedField === 'card') {
        const cardAmount = parseFloat(cardValue) || 0;
        const remainingForCash = Math.max(0, total - cardAmount);
        setValue('cash', remainingForCash.toFixed(2));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cashValue, cardValue, lastEditedField]);
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'column',
      padding: 10,
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 20,
      fontFamily: Fonts.LatoBlack,
      color: theme.LABEL_FORM_COLOR,
    },
    amount: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 5,
    },
    textAmount: {
      fontSize: FontsSize.xxl,
      fontFamily: Fonts.LatoBlack,
      color: theme.LABEL_FORM_COLOR,
    },
    button: {
      backgroundColor: theme.CONFIRM_BUTTON_COLOR,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      width: '30%',

      elevation: 5,
    },
    buttonTextColor: {
      fontSize: FontsSize.extraLarge,
      fontFamily: Fonts.LatoBlack,
      color: 'white',
    },
    textWithCard: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
    },
    cardContainer: {
      flexDirection: 'column',
      padding: 10,
      gap: 20,
      justifyContent: 'space-between',
    },
    printSwitchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 15,
      gap: 10,
    },
    printLabel: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoRegular,
      color: theme.LABEL_FORM_COLOR,
    },
    switchTrack: {
      width: 70,
      height: 35,
      borderRadius: 20,
      padding: 3,
      justifyContent: 'center',
    },
    switchThumb: {
      width: 29,
      height: 29,
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    switchThumbWhite: {
      backgroundColor: '#FFFFFF',
    },
    switchTrackActive: {
      backgroundColor: '#ba181b',
    },
    switchTrackInactive: {
      backgroundColor: '#E0E0E0',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      marginTop: 10,
    },
    errorButton: {
      backgroundColor: theme.ERROR_COLOR,
    },
  });
  const togglePrintSwitch = () => {
    const newValue = !shouldPrint;
    setShouldPrint(newValue);
    Animated.timing(switchAnimation, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const clearShoppingCart = () => {
    setReload(true);
    dispatch(clearCart());
    dispatch(clearOrder());
    navigation.navigate(Utils.screens.HOME, { reload: true });
  };
  const pay = (data: any) => {
    if (order) {
      if (card) {
        orderService
          .payOrder(orderId, PaymentMethod.CARD, 0, total)
          .then(() => {
            if (shouldPrint) {
              printService.printOrder(order);
            }
            AlertFunctions.orderPayed();
            navigation.navigate(Utils.screens.FINISH_ORDER);
          })
          .catch(() => {
            AlertFunctions.orderCanNotPay();
          });
      } else if (mix) {
        orderService
          .payOrder(
            orderId,
            PaymentMethod.MIX,
            parseFloat(data.cash),
            parseFloat(data.card),
          )
          .then(() => {
            if (shouldPrint) {
              printService.printOrder(order);
            }
            AlertFunctions.orderPayed();
            navigation.navigate(Utils.screens.FINISH_ORDER);
          })
          .catch(() => {
            AlertFunctions.orderCanNotPay();
          });
      } else {
        orderService
          .payOrder(orderId, PaymentMethod.CASH, total, 0)
          .then(() => {
            if (shouldPrint) {
              printService.printOrder(order);
            }
            AlertFunctions.orderPayed();
            navigation.navigate(Utils.screens.FINISH_ORDER);
          })
          .catch(() => {
            AlertFunctions.orderCanNotPay();
          });
      }
    }
  };
  if (card) {
    return (
      <>
        <View style={styles.cardContainer}>
          <Text style={styles.textAmount}>Pago con tarjeta</Text>
          <Text style={styles.textWithCard}>
            Realize el cobro con la terminal, y presione el boton de abajo
          </Text>

          <View style={styles.printSwitchContainer}>
            <Icon name="print" size={24} color={theme.LABEL_FORM_COLOR} />
            <Text style={styles.printLabel}>Imprimir ticket</Text>
            <TouchableOpacity
              onPress={togglePrintSwitch}
              activeOpacity={0.8}
              style={[
                styles.switchTrack,
                shouldPrint
                  ? styles.switchTrackActive
                  : styles.switchTrackInactive,
              ]}>
              <Animated.View
                style={[
                  styles.switchThumb,
                  styles.switchThumbWhite,
                  {
                    transform: [
                      {
                        translateX: switchAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 35],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.errorButton]}
              onPress={() => {
                setVisible(true);
                progress.value = withSpring(1);
              }}>
              <Text style={styles.buttonTextColor}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmit(pay)}>
              <Text style={styles.buttonTextColor}>Cobrar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ModalComponent
          visible={visible}
          setVisible={setVisible}
          height={'50%'}
          width={'50%'}
          progress={progress}>
          <GenericModal
            cancel={() => {
              setVisible(false);
              progress.value = withSpring(0);
            }}
            confirm={() => {
              setVisible(false);
              progress.value = withSpring(0);
              clearShoppingCart();
            }}
            text="¿Desea cancelar la orden?"
          />
        </ModalComponent>
      </>
    );
  }
  if (mix) {
    return (
      <>
        <View style={styles.container}>
          {!hideTotal && (
            <>
              <Text style={styles.label}>Monto a cobrar</Text>
              <View style={styles.amount}>
                <Text style={styles.textAmount}>
                  {CURRENCY_SYMBOL} {total.toFixed(2)}
                </Text>
              </View>
            </>
          )}
          <Text style={styles.label}>Efectivo</Text>
          <View onTouchStart={() => setLastEditedField('cash')}>
            <CustomInputComponent
              control={control}
              name={'cash'}
              icon_class={type_class_icon.FontAwesome5}
              icon_name="coins"
              rules={{ required: 'Campo requerido' }}
              place_holder="Efectivo"
              keyboardType="numeric"
              fontSize={30}
              iconSize={30}
            />
          </View>
          <Text style={styles.label}>Tarjeta</Text>
          <View onTouchStart={() => setLastEditedField('card')}>
            <CustomInputComponent
              control={control}
              name={'card'}
              icon_class={type_class_icon.FontAwesome5}
              icon_name="credit-card"
              rules={{ required: 'Campo requerido' }}
              place_holder="Monto a cobrar en tarjeta"
              keyboardType="numeric"
              fontSize={30}
              iconSize={30}
            />
          </View>
          <Text style={styles.label}>Vuelto</Text>

          <View style={styles.amount}>
            <Text style={styles.textAmount}>
              {watch('cash')
                ? parseFloat(watch('cash')) +
                    parseFloat(watch('card')) -
                    total >=
                  0
                  ? CURRENCY_SYMBOL +
                    (
                      parseFloat(watch('cash')) +
                      parseFloat(watch('card')) -
                      total
                    ).toFixed(2)
                  : 'ERROR AL INGRESAR EL MONTO'
                : CURRENCY_SYMBOL + 0}
            </Text>
          </View>

          <View style={styles.printSwitchContainer}>
            <Icon name="print" size={24} color={theme.LABEL_FORM_COLOR} />
            <Text style={styles.printLabel}>Imprimir ticket</Text>
            <TouchableOpacity
              onPress={togglePrintSwitch}
              activeOpacity={0.8}
              style={[
                styles.switchTrack,
                shouldPrint
                  ? styles.switchTrackActive
                  : styles.switchTrackInactive,
              ]}>
              <Animated.View
                style={[
                  styles.switchThumb,
                  styles.switchThumbWhite,
                  {
                    transform: [
                      {
                        translateX: switchAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 35],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.errorButton]}
              onPress={() => {
                setVisible(true);
                progress.value = withSpring(1);
              }}>
              <Text style={styles.buttonTextColor}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmit(pay)}>
              <Text style={styles.buttonTextColor}>Cobrar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ModalComponent
          visible={visible}
          setVisible={setVisible}
          height={'50%'}
          width={'50%'}
          progress={progress}>
          <GenericModal
            cancel={() => {
              setVisible(false);
              progress.value = withSpring(0);
            }}
            confirm={() => {
              setVisible(false);
              progress.value = withSpring(0);
              clearShoppingCart();
            }}
            text="¿Desea cancelar la orden?"
          />
        </ModalComponent>
      </>
    );
  }
  return (
    <>
      <View style={styles.container}>
        {!hideTotal && (
          <>
            <Text style={styles.label}>Monto a cobrar</Text>
            <View style={styles.amount}>
              <Text style={styles.textAmount}>
                {CURRENCY_SYMBOL} {total.toFixed(2)}
              </Text>
            </View>
          </>
        )}
        <Text style={styles.label}>Efectivo</Text>
        <CustomInputComponent
          control={control}
          name={'cash'}
          icon_class={type_class_icon.FontAwesome5}
          icon_name="coins"
          rules={{ required: 'Campo requerido' }}
          place_holder="Efectivo"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Vuelto</Text>
        <View style={styles.amount}>
          <Text style={styles.textAmount}>
            {watch('cash')
              ? parseFloat(watch('cash')) - total >= 0
                ? CURRENCY_SYMBOL +
                  (parseFloat(watch('cash')) - total).toFixed(2)
                : 'ERROR AL INGRESAR EL MONTO'
              : CURRENCY_SYMBOL + 0}
          </Text>
        </View>

        <View style={styles.printSwitchContainer}>
          <Icon name="print" size={24} color={theme.LABEL_FORM_COLOR} />
          <Text style={styles.printLabel}>Imprimir ticket</Text>
          <TouchableOpacity
            onPress={togglePrintSwitch}
            activeOpacity={0.8}
            style={[
              styles.switchTrack,
              shouldPrint
                ? styles.switchTrackActive
                : styles.switchTrackInactive,
            ]}>
            <Animated.View
              style={[
                styles.switchThumb,
                styles.switchThumbWhite,
                {
                  transform: [
                    {
                      translateX: switchAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 35],
                      }),
                    },
                  ],
                },
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={() => {
              setVisible(true);
              progress.value = withSpring(1);
            }}>
            <Text style={styles.buttonTextColor}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSubmit(pay)}>
            <Text style={styles.buttonTextColor}>Cobrar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ModalComponent
        visible={visible}
        setVisible={setVisible}
        height={'50%'}
        width={'50%'}
        progress={progress}>
        <GenericModal
          cancel={() => {
            setVisible(false);
            progress.value = withSpring(0);
          }}
          confirm={() => {
            setVisible(false);
            progress.value = withSpring(0);
            clearShoppingCart();
          }}
          text="¿Desea cancelar la orden?"
        />
      </ModalComponent>
    </>
  );
};

export default CashForm;

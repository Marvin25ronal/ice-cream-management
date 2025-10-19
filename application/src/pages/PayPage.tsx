import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../routes/StackNavigator';
import { SCREENS } from '../constants/navigation/screeens';
import { useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../constants/Fonts';
import PaymentMethodCard from '../components/ShoppingCart/PaymentMethodCard';
import { FlatList } from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { themeInterface } from '../interface/themeInterface';
import CashForm from '../components/ShoppingCart/CashForm';
import { useForm } from 'react-hook-form';

const PayPage = () => {
  const orderId: number = useSelector((state: any) => state.order.value);
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const [option, setOption] = useState(0);

  const progress = useSharedValue(-1);
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      width: '100%',
      padding: 10,
      gap: 10,
    },
    titleContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%',
      height: '8%',
    },
    title: {
      fontSize: FontsSize.xxl,
      fontFamily: Fonts.LatoBold,
      color: '#000',
    },
    cardsContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '20%',
      gap: 10,
      flex: 1,
      borderWidth: 3,
      borderColor: theme.SECTION_BORDER_COLOR,
      borderRadius: 10,
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      paddingVertical: 30,
    },
    paymentMethodContainer: {
      width: '80%',
      borderWidth: 3,
      borderColor: theme.SECTION_BORDER_COLOR,
      borderRadius: 10,
      padding: 10,
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      flexDirection: 'column',
    },
    buttonContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      marginTop: 100,
    },
    button: {
      backgroundColor: 'blue',
      paddingHorizontal: 20,
      justifyContent: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 5,
      borderColor: 'black',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      paddingVertical: 10,
      marginTop: 10,
      width: '50%',
    },
    paymentContainer: {
      width: '100%',
      height: '100%',
      paddingBottom: 10,
      flexDirection: 'row',
      gap: 10,
    },
  });
  return (
    <Animated.ScrollView style={styles.container}>
      {/* <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Selecciona el metodo de pago
        </Text>
      </View> */}
      <View style={styles.paymentContainer}>
        <View style={styles.cardsContainer}>
          <PaymentMethodCard
            width={'70%'}
            optionSelected={option}
            setOption={setOption}
            imageBackground="/paymentMethods/money"
            label="Efectivo"
            progress={progress}
            index={0}
          />
          <PaymentMethodCard
            width={'70%'}
            optionSelected={option}
            setOption={setOption}
            imageBackground="/paymentMethods/card"
            label="Tarjeta de credito"
            progress={progress}
            index={1}
          />
          <PaymentMethodCard
            width={'70%'}
            optionSelected={option}
            setOption={setOption}
            imageBackground="/paymentMethods/mix"
            label="Mixto"
            progress={progress}
            index={2}
          />
        </View>
        <View style={styles.paymentMethodContainer}>
          {option == 0 && <CashForm />}
          {option == 1 && <CashForm card />}
          {option == 2 && <CashForm mix />}
        </View>
      </View>

      {/* {
        option == 2 && (
          <View>
            <Text>
              Ingresa el monto en efectivo
            </Text>

            <Text>
              Ingresa el monto con tarjeta
            </Text>
          </View>
        )
      } */}
      {/* <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text>
            Cobrar
          </Text>
        </TouchableOpacity>
      </View> */}
    </Animated.ScrollView>
  );
};

export default PayPage;

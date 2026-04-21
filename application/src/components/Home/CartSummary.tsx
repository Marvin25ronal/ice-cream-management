import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { themeInterface } from '../../interface/themeInterface';
import { Fonts } from '../../constants/Fonts';
import IconSelector, { type_class_icon } from '../UI/IconSelector';

interface CartSummaryProps {
  onViewCart: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({ onViewCart }) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const shoppingCart: number[] = useSelector(
    (state: any) => state.shoppingCart.value,
  );

  const cartItemCount = shoppingCart.length;

  if (cartItemCount === 0) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      borderRadius: 30,
      overflow: 'hidden',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
    },
    content: {
      width: 70,
      height: 70,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: '#FF006E',
      borderRadius: 18,
      minWidth: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderColor: 'white',
      elevation: 5,
    },
    badgeText: {
      color: 'white',
      fontFamily: Fonts.LatoBlack,
      fontSize: 16,
    },
  });

  return (
    <TouchableOpacity onPress={onViewCart} activeOpacity={0.85}>
      <LinearGradient
        colors={['#7209B7', '#560bad', '#3c096c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}>
        <View style={styles.content}>
          <IconSelector
            icon_class={type_class_icon.Feather}
            color="white"
            icon="shopping-cart"
            size={32}
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartItemCount}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CartSummary;

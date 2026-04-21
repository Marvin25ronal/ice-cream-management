import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Dimensions,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Product } from '../../entity/Product.entity';
import { themeInterface } from '../../interface/themeInterface';
import { useDispatch, useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { AgrupatedProducts } from '../../pages/EditShoppingCartPage';
import { CURRENCY_SYMBOL } from '../../constants/utils';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import {
  addToCart,
  clearCart,
  removeAllProductsId,
  removeFromCart,
  setQuantity,
} from '../../store/redux/carReducer';
import ModalComponent from '../UI/ModalComponent';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import ClearSelectedItemsModal from '../Home/ClearSelectedItemsModal';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

const ShoppingCartListItem = ({
  item,
  edit,
}: {
  item: AgrupatedProducts;
  edit: boolean;
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const progress = useSharedValue(0);
  const [selectedItems, setSelectedItems] = useState<AgrupatedProducts>();
  const [quantity, setQuantityState] = useState(
    item.products.length.toString(),
  );
  const [isFocused, setIsFocused] = useState(false);

  // Update quantity when item changes
  useEffect(() => {
    setQuantityState(item.products.length.toString());
  }, [item.products.length]);

  const handleQuantityChange = (text: string) => {
    // Only allow numeric input
    if (text === '' || /^\d+$/.test(text)) {
      setQuantityState(text);
    }
  };

  const handleQuantitySubmit = () => {
    const newQuantity = parseInt(quantity, 10);
    const currentQuantity = item.products.length;

    if (!isNaN(newQuantity) && newQuantity > 0) {
      if (newQuantity !== currentQuantity) {
        // Use setQuantity to maintain the position in the cart
        dispatch(setQuantity({ productId: item.id, quantity: newQuantity }));
      }
    } else {
      // Reset to current quantity if invalid
      setQuantityState(currentQuantity.toString());
    }
    setIsFocused(false);
  };

  const styles = StyleSheet.create({
    cardContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      marginVertical: 8,
      marginHorizontal: 12,
      padding: 16,
      shadowColor: '#9f86c0',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      borderLeftWidth: 5,
      borderLeftColor: '#e91e63',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    quantitySection: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isTablet ? 100 : 80,
    },
    quantityLabel: {
      fontFamily: Fonts.LatoRegular,
      fontSize: FontsSize.small,
      color: '#6c757d',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    quantityInputContainer: {
      position: 'relative',
    },
    quantityInput: {
      backgroundColor: isFocused ? '#fff3f8' : '#f8f9fa',
      color: '#c9184a',
      fontSize: isTablet ? FontsSize.xxl : FontsSize.large + 6,
      fontFamily: Fonts.LatoBlack,
      paddingHorizontal: 16,
      paddingVertical: 12,
      textAlign: 'center',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isFocused ? '#e91e63' : '#dee2e6',
      minWidth: isTablet ? 80 : 60,
      shadowColor: isFocused ? '#e91e63' : 'transparent',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: isFocused ? 3 : 0,
    },
    contentSection: {
      flex: 1,
      justifyContent: 'center',
      gap: 8,
    },
    productName: {
      fontFamily: Fonts.LatoBold,
      color: '#2d3436',
      fontSize: isTablet ? FontsSize.large + 4 : FontsSize.large,
      marginBottom: 4,
      lineHeight: 26,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 8,
    },
    priceLabel: {
      fontFamily: Fonts.LatoRegular,
      fontSize: FontsSize.small,
      color: '#6c757d',
    },
    priceText: {
      fontFamily: Fonts.LatoBlack,
      color: '#c9184a',
      fontSize: isTablet ? FontsSize.xxl : FontsSize.large + 6,
      letterSpacing: 0.5,
    },
    unitPriceText: {
      fontFamily: Fonts.LatoRegular,
      fontSize: FontsSize.small,
      color: '#adb5bd',
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    actionButton: {
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      width: isTablet ? 50 : 44,
      height: isTablet ? 50 : 44,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    deleteButton: {
      backgroundColor: '#ff6b6b',
    },
    minusButton: {
      backgroundColor: '#ffd93d',
    },
    plusButton: {
      backgroundColor: '#51cf66',
    },
  });

  const addProduct = (productId: number) => {
    dispatch(addToCart(productId));
  };

  const removeProduct = (productId: number) => {
    dispatch(removeFromCart(productId));
  };

  const removeById = (productId: number) => {
    dispatch(removeAllProductsId(productId));
  };

  const totalPrice = item.products[0].price * item.products.length;

  return (
    <>
      <View style={styles.cardContainer}>
        {/* Quantity Section */}
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Qty</Text>
          {edit ? (
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={handleQuantityChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleQuantitySubmit}
              onSubmitEditing={handleQuantitySubmit}
              keyboardType="number-pad"
              selectTextOnFocus
              maxLength={3}
            />
          ) : (
            <View style={[styles.quantityInput, { justifyContent: 'center' }]}>
              <Text
                style={{
                  color: '#c9184a',
                  fontSize: isTablet ? FontsSize.xxl : FontsSize.large + 6,
                  fontFamily: Fonts.LatoBlack,
                }}>
                {item.products.length}
              </Text>
            </View>
          )}
        </View>

        {/* Product Info Section */}
        <View style={styles.contentSection}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.products[0].name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>
              {CURRENCY_SYMBOL}
              {totalPrice.toFixed(2)}
            </Text>
            {item.products.length > 1 && (
              <Text style={styles.unitPriceText}>
                ({CURRENCY_SYMBOL}
                {item.products[0].price.toFixed(2)} each)
              </Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {edit && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                setSelectedItems(item);
                setVisible(true);
                progress.value = withSpring(1);
              }}
              activeOpacity={0.7}>
              <IconSelector
                icon_class={type_class_icon.Feather}
                color="white"
                icon="trash-2"
                size={20}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.minusButton]}
              onPress={() => {
                if (item.products.length === 1) {
                  setSelectedItems(item);
                  setVisible(true);
                  progress.value = withSpring(1);
                } else {
                  removeProduct(item.id);
                }
              }}
              activeOpacity={0.7}>
              <IconSelector
                icon_class={type_class_icon.AntDesign}
                color="white"
                icon="minus"
                size={20}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.plusButton]}
              onPress={() => {
                addProduct(item.id);
              }}
              activeOpacity={0.7}>
              <IconSelector
                icon_class={type_class_icon.AntDesign}
                color="white"
                icon="plus"
                size={20}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ModalComponent
        visible={visible}
        setVisible={setVisible}
        height={'auto'}
        width={'50%'}
        progress={progress}>
        <ClearSelectedItemsModal
          confirm={() => {
            if (selectedItems) {
              removeById(selectedItems.id);
            }
            setVisible(false);
            progress.value = withSpring(0);
          }}
          cancel={() => {
            setVisible(false);
            progress.value = withSpring(0);
          }}
        />
      </ModalComponent>
    </>
  );
};

export default ShoppingCartListItem;

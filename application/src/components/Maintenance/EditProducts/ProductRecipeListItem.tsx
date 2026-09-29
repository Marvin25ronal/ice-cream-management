import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Product } from '../../../entity/Product.entity';
import { CURRENCY_SYMBOL, Utils } from '../../../constants/utils';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { EditProductParamList } from '../../../routes/EditProductNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductImage from '../../UI/ProductImage';

const ProductRecipeListItem = ({ product }: { product: Product }) => {
  const navigation = useNavigation<StackNavigationProp<EditProductParamList>>();

  const styles = StyleSheet.create({
    container: {
      width: '25%',
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      flexDirection: 'column',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#F0F0F0',
    },
    imageContainer: {
      width: '100%',
      height: 80,
      backgroundColor: '#F1FFF9',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    contentContainer: {
      flex: 1,
      padding: 8,
      justifyContent: 'space-between',
    },
    productName: {
      fontSize: 12,
      fontWeight: '700',
      color: '#2C3E50',
      marginBottom: 3,
      letterSpacing: 0.1,
      lineHeight: 14,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
    },
    priceLabel: {
      fontSize: 9,
      color: '#7F8C8D',
      marginRight: 3,
      fontWeight: '500',
    },
    price: {
      fontSize: 14,
      fontWeight: '800',
      color: '#00B894',
      letterSpacing: 0.3,
    },
    bottomSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 6,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    arrowContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#F1FFF9',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate(Utils.screens.PRODUCT_RECIPE_DETAIL, {
            productId: product.product_id,
            productName: product.name,
          });
        }}
        activeOpacity={0.7}>
        <View style={styles.imageContainer}>
          <ProductImage
            product={product}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentContainer}>
          <View>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio</Text>
              <Text style={styles.price}>
                {CURRENCY_SYMBOL} {product.price?.toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.arrowContainer}>
              <Icon name="chevron-right" size={14} color="#00B894" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProductRecipeListItem;

import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { Product } from '../../../entity/Product.entity';
import { CURRENCY_SYMBOL, Utils } from '../../../constants/utils';
import { ImagesDefinition } from '../../../shared/ImagesConstants';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { EditProductParamList } from '../../../routes/EditProductNavigator';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EditProductListItem = ({ product }: { product: Product }) => {
  const navigation = useNavigation<StackNavigationProp<EditProductParamList>>();

  // Formatear fecha de forma más elegante
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Sin fecha';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffTime = today.getTime() - compareDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? 'Hace 1 semana' : `Hace ${weeks} semanas`;
    }
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      flexDirection: 'row',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: '#F0F0F0',
    },
    imageContainer: {
      width: 100,
      height: 100,
      backgroundColor: '#FFF5F5',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 12,
    },
    imageBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      backgroundColor: 'rgba(227, 30, 36, 0.9)',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    contentContainer: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    topSection: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '700',
      color: '#2C3E50',
      marginBottom: 4,
      letterSpacing: 0.2,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    priceLabel: {
      fontSize: 11,
      color: '#7F8C8D',
      marginRight: 4,
      fontWeight: '500',
    },
    price: {
      fontSize: 20,
      fontWeight: '800',
      color: '#E31E24',
      letterSpacing: 0.5,
    },
    bottomSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 11,
      color: '#95A5A6',
      marginLeft: 4,
      fontWeight: '500',
    },
    arrowContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#FFF5F5',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          navigation.navigate(Utils.screens.EDIT_PRODUCT, {
            productId: product.product_id,
          });
        }}
        activeOpacity={0.7}>
        {/* Imagen del producto */}
        <View style={styles.imageContainer}>
          <Image
            source={
              ImagesDefinition.find(img => img.name === product.image)?.image ||
              ImagesDefinition[0].image
            }
            style={styles.image}
            resizeMode="cover"
          />
          {/* Badge opcional - puedes mostrar stock, nuevo, etc */}
          {/* <View style={styles.imageBadge}>
            <Text style={styles.badgeText}>NUEVO</Text>
          </View> */}
        </View>

        {/* Contenido del producto */}
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
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
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={14}
                color="#95A5A6"
              />
              <Text style={styles.dateText}>
                {formatDate(product.last_update)}
              </Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={18} color="#E31E24" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default EditProductListItem;

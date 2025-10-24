import React, { useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { themeInterface } from '../../interface/themeInterface';
import { Fonts } from '../../constants/Fonts';
import NumberIndicator from './NumberIndicator';
import { CURRENCY_SYMBOL } from '../../constants/utils';
import { Product } from '../../entity/Product.entity';
import { ImageStorageService } from '../../services/ImageStorageService';

interface ModernProductCardProps {
  name: string;
  description?: string;
  image: string;
  price?: number;
  onPress: () => void;
  onLongPress?: () => void;
  isProduct?: boolean;
  id: number;
  product?: Product; // Optional: full product object for new image system
}

const ModernProductCard: React.FC<ModernProductCardProps> = ({
  name,
  description,
  image,
  price,
  onPress,
  onLongPress,
  isProduct = false,
  id,
  product,
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const shoppingCart: number[] = useSelector(
    (state: any) => state.shoppingCart.value,
  );
  const dimensions = Dimensions.get('window');
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const styles = StyleSheet.create({
    container: {
      width: isProduct ? '23.5%' : '32%',
      minWidth: isProduct ? 180 : 250,
      padding: 6,
      marginBottom: 14,
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: isProduct ? 24 : 28,
      overflow: 'hidden',
      elevation: isProduct ? 10 : 12,
      shadowColor: isProduct ? '#FF006E' : '#7209B7',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      height: isProduct ? 320 : 180,
      borderWidth: 0,
    },
    imageSection: {
      height: isProduct ? '58%' : '100%',
      position: 'relative',
      overflow: 'hidden',
    },
    imageBackground: {
      width: '100%',
      height: '100%',
    },
    imageGradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    productBadge: {
      position: 'absolute',
      top: 10,
      left: 10,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cartIcon: {
      color: '#FF006E',
      fontFamily: Fonts.LatoBlack,
      fontSize: 12,
      marginRight: 5,
    },
    productBadgeText: {
      color: '#FF006E',
      fontFamily: Fonts.LatoBold,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    contentSection: {
      height: isProduct ? '42%' : 'auto',
      position: 'relative',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    contentGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 2,
      flex: 1,
      justifyContent: 'space-between',
    },
    nameContainer: {
      marginBottom: 8,
    },
    name: {
      color: 'white',
      fontFamily: Fonts.LatoBlack,
      fontSize: isProduct ? 16 : 24,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      lineHeight: isProduct ? 20 : 28,
    },
    priceSection: {
      alignItems: 'center',
    },
    priceLabel: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontFamily: Fonts.LatoRegular,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
    },
    currencySymbol: {
      color: '#FFD60A',
      fontFamily: Fonts.LatoBlack,
      fontSize: 18,
      marginRight: 3,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    price: {
      color: '#FFD60A',
      fontFamily: Fonts.LatoBlack,
      fontSize: 26,
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    accentBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 4,
    },
    categoryBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    categoryBadgeText: {
      color: '#7209B7',
      fontFamily: Fonts.LatoBold,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // Category-specific styles
    categoryImageSection: {
      width: '45%',
      position: 'relative',
    },
    categoryImageGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
    },
    categoryContentSection: {
      width: '55%',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      position: 'relative',
    },
    categoryContentGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    categoryContentWrapper: {
      position: 'relative',
      zIndex: 2,
    },
    categoryBadgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      marginBottom: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    folderIcon: {
      color: '#FF006E',
      fontFamily: Fonts.LatoBlack,
      fontSize: 14,
    },
    categoryName: {
      color: 'white',
      fontFamily: Fonts.LatoBlack,
      fontSize: 24,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      lineHeight: 28,
    },
    categoryDescription: {
      color: 'rgba(255, 255, 255, 0.95)',
      fontFamily: Fonts.LatoRegular,
      fontSize: 13,
      lineHeight: 18,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    chevronContainer: {
      position: 'absolute',
      right: 16,
      top: '50%',
      marginTop: -20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    chevronText: {
      color: 'white',
      fontFamily: Fonts.LatoBlack,
      fontSize: 24,
      marginLeft: 3,
    },
    categoryAccentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
    },
  });

  // Use the new ImageStorageService to get image source (supports both legacy and filesystem)
  // Only pass imageName when product object is not available (backward compatibility)
  const backgroundImage = ImageStorageService.getImageSource(
    product,
    product ? undefined : image
  );

  // Validate backgroundImage
  if (!backgroundImage) {
    console.error('❌ ModernProductCard: backgroundImage is null/undefined for product:', id);
    return null;
  }

  // Render Product Card
  if (isProduct) {
    return (
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        {shoppingCart.find(item => item === id) !== undefined && (
          <NumberIndicator
            elements={shoppingCart.filter(item => item === id).length}
          />
        )}
        <TouchableOpacity
          style={styles.card}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={onLongPress}
          activeOpacity={0.95}>
          {/* Image Section */}
          <View style={styles.imageSection}>
            <ImageBackground source={backgroundImage} style={styles.imageBackground} resizeMode="cover">
              {/* Vibrant Gradient Overlay */}
              <LinearGradient
                colors={[
                  'rgba(255, 0, 110, 0.25)',
                  'rgba(255, 133, 0, 0.3)',
                  'rgba(177, 133, 219, 0.35)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.imageGradientOverlay}
              />

              {/* Product Badge */}
              <View style={styles.productBadge}>
                <Text style={styles.cartIcon}>●</Text>
                <Text style={styles.productBadgeText}>Producto</Text>
              </View>
            </ImageBackground>
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            {/* Gradient Background */}
            <LinearGradient
              colors={[
                'rgba(255, 0, 110, 0.94)',
                'rgba(201, 24, 74, 0.96)',
                'rgba(177, 133, 219, 0.92)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.contentGradient}
            />

            <View style={styles.contentWrapper}>
              {/* Product Name */}
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={2}>
                  {name}
                </Text>
              </View>

              {/* Price Section */}
              {price !== undefined && (
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Precio</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currencySymbol}>{CURRENCY_SYMBOL}</Text>
                    <Text style={styles.price}>{price.toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Accent Bar */}
            <LinearGradient
              colors={['#FFD60A', '#FF8500', '#FF006E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentBar}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Render Category Card (for backward compatibility)
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}>
        <ImageBackground source={backgroundImage} style={{ flex: 1, flexDirection: 'row' }}>
          {/* Image Section with Gradient */}
          <View style={styles.categoryImageSection}>
            <LinearGradient
              colors={[
                'rgba(255, 0, 110, 0.4)',
                'rgba(114, 9, 183, 0.5)',
                'rgba(0, 180, 216, 0.4)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.categoryImageGradient}
            />
          </View>

          {/* Content Section */}
          <View style={styles.categoryContentSection}>
            <LinearGradient
              colors={[
                'rgba(114, 9, 183, 0.96)',
                'rgba(177, 133, 219, 0.94)',
                'rgba(159, 134, 192, 0.96)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.categoryContentGradient}
            />

            {/* Accent Bar */}
            <LinearGradient
              colors={['#FF006E', '#FF8500', '#FFD60A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.categoryAccentBar}
            />

            <View style={styles.categoryContentWrapper}>
              {/* Category Badge */}
              <View style={styles.categoryBadgeContainer}>
                <Text style={styles.folderIcon}>▶</Text>
                <Text style={styles.productBadgeText}>Categoria</Text>
              </View>

              {/* Category Name */}
              <View style={styles.nameContainer}>
                <Text style={styles.categoryName} numberOfLines={2}>
                  {name}
                </Text>
              </View>

              {/* Description */}
              {description && description.length > 0 && (
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {description}
                </Text>
              )}
            </View>

            {/* Chevron Navigation Indicator */}
            <View style={styles.chevronContainer}>
              <Text style={styles.chevronText}>›</Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ModernProductCard;

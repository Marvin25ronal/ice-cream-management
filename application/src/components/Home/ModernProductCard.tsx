import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import { themeInterface } from '../../interface/themeInterface';
import { ImagesDefinition } from '../../shared/ImagesConstants';
import { Fonts, FontsSize } from '../../constants/Fonts';
import NumberIndicator from './NumberIndicator';
import { CURRENCY_SYMBOL } from '../../constants/utils';

interface ModernProductCardProps {
  name: string;
  description?: string;
  image: string;
  price?: number;
  onPress: () => void;
  onLongPress?: () => void;
  isProduct?: boolean;
  id: number;
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
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const shoppingCart: number[] = useSelector(
    (state: any) => state.shoppingCart.value,
  );
  const dimensions = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      width: '24%',
      minWidth: 200,
      padding: 8,
      marginBottom: 10,
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      height: isProduct ? 280 : 220,
      borderWidth: isProduct ? 3 : 2,
      borderColor: isProduct ? '#B185DB' : 'transparent',
    },
    imageBackground: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    gradientOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.2,
    },
    contentContainer: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      paddingBottom: 12,
    },
    nameContainer: {
      backgroundColor: isProduct
        ? 'rgba(114, 9, 183, 0.95)'
        : 'rgba(0, 29, 61, 0.95)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      marginBottom: price ? 8 : 0,
    },
    name: {
      color: 'white',
      fontFamily: Fonts.LatoBold,
      fontSize: isProduct ? 18 : 20,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
    },
    priceLabel: {
      color: 'white',
      fontFamily: Fonts.LatoRegular,
      fontSize: 14,
      marginRight: 6,
    },
    price: {
      color: '#FFE5B4',
      fontFamily: Fonts.LatoBlack,
      fontSize: 24,
      textShadowColor: 'rgba(0, 0, 0, 0.8)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
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
  });

  let backgroundImage = ImagesDefinition.find(img => img.name === image)?.image;

  if (!backgroundImage) {
    backgroundImage = require('../../../assets/images/products/defaultb.png');
  }

  // Define gradient colors based on product or category
  const gradientColors = isProduct
    ? ['rgba(114, 9, 183, 0.3)', 'rgba(177, 133, 219, 0.5)']
    : ['rgba(0, 29, 61, 0.3)', 'rgba(69, 123, 157, 0.5)'];

  return (
    <View style={styles.container}>
      {isProduct && shoppingCart.find(item => item === id) && (
        <NumberIndicator
          elements={shoppingCart.filter(item => item === id).length}
        />
      )}
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.85}>
        <ImageBackground source={backgroundImage} style={styles.imageBackground}>
          <LinearGradient
            colors={gradientColors}
            style={styles.gradientOverlay}
          />

          {!isProduct && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>Categoria</Text>
            </View>
          )}

          <View style={styles.contentContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={2}>
                {name}
              </Text>
            </View>

            {isProduct && price !== undefined && (
              <View style={styles.priceContainer}>
                <LinearGradient
                  colors={['rgba(201, 24, 74, 0.95)', 'rgba(255, 0, 110, 0.95)']}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 12,
                  }}>
                  <Text style={styles.priceLabel}>Precio:</Text>
                  <Text style={styles.price}>{CURRENCY_SYMBOL}{price.toFixed(2)}</Text>
                </LinearGradient>
              </View>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
};

export default ModernProductCard;

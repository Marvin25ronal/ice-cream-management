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
import { ImagesDefinition } from '../../shared/ImagesConstants';
import { Fonts } from '../../constants/Fonts';

interface ModernCategoryCardProps {
  name: string;
  description?: string;
  image: string;
  onPress: () => void;
  id: number;
}

const ModernCategoryCard: React.FC<ModernCategoryCardProps> = ({
  name,
  description,
  image,
  onPress,
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const dimensions = Dimensions.get('window');
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
      width: '32%',
      minWidth: 250,
      padding: 8,
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 28,
      overflow: 'hidden',
      elevation: 12,
      shadowColor: '#7209B7',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      height: 180,
      borderWidth: 3,
      borderColor: 'transparent',
    },
    imageBackground: {
      flex: 1,
      flexDirection: 'row',
    },
    imageSection: {
      width: '45%',
      position: 'relative',
    },
    imageGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
    },
    contentSection: {
      width: '55%',
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      position: 'relative',
    },
    mainGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 2,
    },
    categoryBadge: {
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
      width: 16,
      height: 16,
      marginRight: 6,
    },
    folderIconText: {
      color: '#FF006E',
      fontFamily: Fonts.LatoBlack,
      fontSize: 14,
    },
    categoryBadgeText: {
      color: '#FF006E',
      fontFamily: Fonts.LatoBold,
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    nameContainer: {
      marginBottom: 8,
    },
    name: {
      color: 'white',
      fontFamily: Fonts.LatoBlack,
      fontSize: 18,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      lineHeight: 28,
    },
    description: {
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
    accentBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
    },
  });

  let backgroundImage = ImagesDefinition.find(img => img.name === image)?.image;

  if (!backgroundImage) {
    backgroundImage = require('../../../assets/images/products/defaultb.png');
  }

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.95}>
        <ImageBackground source={backgroundImage} style={styles.imageBackground}>
          {/* Image Section with Gradient */}
          <View style={styles.imageSection}>
            <LinearGradient
              colors={[
                'rgba(255, 0, 110, 0.4)',
                'rgba(114, 9, 183, 0.5)',
                'rgba(0, 180, 216, 0.4)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imageGradient}
            />
          </View>

          {/* Content Section */}
          <View style={styles.contentSection}>
            <LinearGradient
              colors={[
                'rgba(114, 9, 183, 0.96)',
                'rgba(177, 133, 219, 0.94)',
                'rgba(159, 134, 192, 0.96)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.mainGradient}
            />

            {/* Accent Bar */}
            <LinearGradient
              colors={['#FF006E', '#FF8500', '#FFD60A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.accentBar}
            />

            <View style={styles.contentWrapper}>
              {/* Category Badge */}
              <View style={styles.categoryBadge}>
                <Text style={styles.folderIconText}>▶</Text>
                <Text style={styles.categoryBadgeText}>Categoria</Text>
              </View>

              {/* Category Name */}
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={2}>
                  {name}
                </Text>
              </View>

              {/* Description */}
              {description && description.length > 0 && (
                <Text style={styles.description} numberOfLines={2}>
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

export default ModernCategoryCard;

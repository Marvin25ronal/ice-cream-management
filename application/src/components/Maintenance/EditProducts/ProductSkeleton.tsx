import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const ProductSkeleton = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

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
    },
    imageSkeleton: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: '#E1E9EE',
    },
    contentContainer: {
      flex: 1,
      padding: 12,
      justifyContent: 'space-between',
    },
    topSection: {
      flex: 1,
    },
    nameSkeleton: {
      height: 16,
      backgroundColor: '#E1E9EE',
      borderRadius: 4,
      marginBottom: 8,
      width: '80%',
    },
    priceRowSkeleton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    priceLabelSkeleton: {
      height: 11,
      backgroundColor: '#E1E9EE',
      borderRadius: 3,
      width: 40,
      marginRight: 8,
    },
    priceSkeleton: {
      height: 20,
      backgroundColor: '#FFE5E5',
      borderRadius: 4,
      width: 70,
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
    dateSkeleton: {
      height: 11,
      backgroundColor: '#E1E9EE',
      borderRadius: 3,
      width: 80,
    },
    arrowSkeleton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#FFF5F5',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Imagen skeleton */}
        <View style={styles.imageContainer}>
          <Animated.View style={[styles.imageSkeleton, animatedStyle]} />
        </View>

        {/* Contenido skeleton */}
        <View style={styles.contentContainer}>
          <View style={styles.topSection}>
            <Animated.View style={[styles.nameSkeleton, animatedStyle]} />

            <View style={styles.priceRowSkeleton}>
              <Animated.View
                style={[styles.priceLabelSkeleton, animatedStyle]}
              />
              <Animated.View style={[styles.priceSkeleton, animatedStyle]} />
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Animated.View style={[styles.dateSkeleton, animatedStyle]} />
            <Animated.View style={[styles.arrowSkeleton, animatedStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProductSkeleton;

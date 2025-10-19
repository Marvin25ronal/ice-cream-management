import { View, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { themeInterface } from '../../../interface/themeInterface';

const CategoryChooserSkeleton = () => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: '100%',
    },
    box: {
      borderRadius: 10,
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E1E9EE',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      borderWidth: 2,
      borderColor: '#D1D9DE',
    },
    iconSkeleton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#D1D9DE',
      marginBottom: 5,
    },
    textSkeleton: {
      width: 50,
      height: 10,
      borderRadius: 5,
      backgroundColor: '#D1D9DE',
    },
  });

  // Renderizar 4 cajas de skeleton
  const skeletonBoxes = [1, 2, 3, 4];

  return (
    <View style={styles.container}>
      {skeletonBoxes.map((_, index) => (
        <Animated.View key={index} style={[styles.box, animatedStyle]}>
          <View style={styles.iconSkeleton} />
          <View style={styles.textSkeleton} />
        </Animated.View>
      ))}
    </View>
  );
};

export default CategoryChooserSkeleton;

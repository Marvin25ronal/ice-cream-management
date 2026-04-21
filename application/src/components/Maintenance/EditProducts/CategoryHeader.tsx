import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { themeInterface } from '../../../interface/themeInterface';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../../constants/Fonts';

interface CategoryHeaderProps {
  name: string;
}

const CategoryHeader = ({ name }: CategoryHeaderProps) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);

  // Mapeo de íconos por categoría
  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: { [key: string]: string } = {
      Conos: 'ice-cream',
      Especialidades: 'star-circle',
      'Frozen Yogur': 'cup',
      Pastelería: 'cake-variant',
      Envasados: 'package-variant',
      Paletería: 'ice-pop',
      Bebidas: 'cup-water',
      Promociones: 'sale',
      Extras: 'food-fork-drink',
    };
    return iconMap[categoryName] || 'folder';
  };

  // Gradientes rojos vibrantes por categoría
  const getCategoryGradient = (categoryName: string): string[] => {
    const gradientMap: { [key: string]: string[] } = {
      Conos: ['#C9184A', '#DC2F02', '#E85D04'],
      Especialidades: ['#9D0208', '#D00000', '#DC2F02'],
      'Frozen Yogur': ['#A4133C', '#C9184A', '#E63946'],
      Pastelería: ['#B5179E', '#D00000', '#F72585'],
      Envasados: ['#800F2F', '#A4133C', '#C9184A'],
      Paletería: ['#D00000', '#DC2F02', '#E85D04'],
      Bebidas: ['#C1121F', '#DC2F02', '#F48C06'],
      Promociones: ['#E31E24', '#E85D04', '#F77F00'],
      Extras: ['#9D0208', '#C9184A', '#DC2F02'],
    };
    return gradientMap[categoryName] || ['#C9184A', '#DC2F02', '#E85D04'];
  };

  // Color del icono por categoría (tonos rojos más claros)
  const getCategoryIconColor = (categoryName: string): string => {
    const iconColorMap: { [key: string]: string } = {
      Conos: '#E31E24',
      Especialidades: '#DC2F02',
      'Frozen Yogur': '#E63946',
      Pastelería: '#D90429',
      Envasados: '#C9184A',
      Paletería: '#E85D04',
      Bebidas: '#DC2F02',
      Promociones: '#E31E24',
      Extras: '#D00000',
    };
    return iconColorMap[categoryName] || '#DC2F02';
  };

  const styles = StyleSheet.create({
    // Compact wrapper - reduced margins
    fullWidthWrapper: {
      width: '100%',
      marginTop: 12,
      marginBottom: 8,
      paddingHorizontal: 8,
    },
    // Main container with left accent bar
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
      minHeight: 42,
    },
    // Vertical gradient accent bar on the left
    accentBar: {
      width: 5,
      height: '100%',
      position: 'absolute',
      left: 0,
    },
    // Content container
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      paddingVertical: 8,
      paddingLeft: 14,
      paddingRight: 12,
    },
    // Compact icon container
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#FFF5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1.5,
      borderColor: 'rgba(220, 47, 2, 0.15)',
    },
    // Compact badge
    badge: {
      backgroundColor: 'rgba(220, 47, 2, 0.1)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      marginRight: 8,
      borderWidth: 1,
      borderColor: 'rgba(220, 47, 2, 0.2)',
    },
    badgeText: {
      fontFamily: Fonts.LatoBold,
      fontSize: 8,
      color: '#DC2F02',
      letterSpacing: 0.8,
      fontWeight: '700',
    },
    // Text container
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    categoryText: {
      fontFamily: Fonts.LatoBlack,
      fontSize: 14,
      color: '#2D3748',
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    // Subtle divider line at bottom
    dividerLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: 'rgba(220, 47, 2, 0.1)',
    },
  });

  return (
    <View style={styles.fullWidthWrapper}>
      <View style={styles.container}>
        {/* Vertical gradient accent bar */}
        <LinearGradient
          colors={getCategoryGradient(name)}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />

        {/* Content container */}
        <View style={styles.contentContainer}>
          {/* Compact icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getCategoryIcon(name)}
              size={20}
              color={getCategoryIconColor(name)}
            />
          </View>

          {/* Compact badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CAT</Text>
          </View>

          {/* Category name */}
          <View style={styles.textContainer}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {name}
            </Text>
          </View>
        </View>

        {/* Bottom divider line */}
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
};

export default CategoryHeader;

import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { themeInterface } from '../../../interface/themeInterface';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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

  // Color principal por categoría
  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      Conos: '#FFE5E5',
      Especialidades: '#FFF3E0',
      'Frozen Yogur': '#E3F2FD',
      Pastelería: '#F3E5F5',
      Envasados: '#E8F5E9',
      Paletería: '#E0F7FA',
      Bebidas: '#FFF9C4',
      Promociones: '#FFEBEE',
      Extras: '#F1F8E9',
    };
    return colorMap[categoryName] || '#F5F5F5';
  };

  // Color del borde/acento por categoría
  const getCategoryAccentColor = (categoryName: string): string => {
    const accentMap: { [key: string]: string } = {
      Conos: '#FF6B6B',
      Especialidades: '#FFB74D',
      'Frozen Yogur': '#42A5F5',
      Pastelería: '#AB47BC',
      Envasados: '#66BB6A',
      Paletería: '#26C6DA',
      Bebidas: '#FFD54F',
      Promociones: '#EF5350',
      Extras: '#9CCC65',
    };
    return accentMap[categoryName] || '#9E9E9E';
  };

  const styles = StyleSheet.create({
    container: {
      marginHorizontal: 10,
      marginTop: 15,
      marginBottom: 8,
      borderRadius: 12,
      backgroundColor: getCategoryColor(name),
      borderLeftWidth: 4,
      borderLeftColor: getCategoryAccentColor(name),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    categoryText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#2C3E50',
      letterSpacing: 0.3,
    },
    badge: {
      position: 'absolute',
      right: 16,
      top: '50%',
      marginTop: -8,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: getCategoryAccentColor(name),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name={getCategoryIcon(name)}
            size={26}
            color={getCategoryAccentColor(name)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.categoryText}>{name}</Text>
        </View>
        <View style={styles.badge} />
      </View>
    </View>
  );
};

export default CategoryHeader;

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { TreeNode } from '../../../interface/TreeInterface';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Fonts } from '../../../constants/Fonts';
interface CategoryButtonProps {
  category: TreeNode;
  isSelected: boolean;
  onPress: () => void;
  icon: JSX.Element;
}

const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isSelected,
  onPress,
  icon,
}) => {
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
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
    buttonContainer: {
      flex: 1,
      marginHorizontal: 4,
    },
    button: {
      height: 85,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: isSelected ? 10 : 5,
      shadowColor: isSelected ? '#FF006E' : '#7209B7',
      shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
      shadowOpacity: isSelected ? 0.35 : 0.2,
      shadowRadius: isSelected ? 10 : 6,
    },
    unselectedButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 2,
      borderColor: 'rgba(177, 133, 219, 0.25)',
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 10,
      position: 'relative',
    },
    iconContainer: {
      marginBottom: 6,
    },
    categoryName: {
      fontSize: 10,
      fontFamily: isSelected ? Fonts.LatoBlack : Fonts.LatoBold,
      color: isSelected ? 'white' : '#7209B7',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textShadowColor: isSelected ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });

  if (isSelected) {
    return (
      <Animated.View
        style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.button}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.95}>
          <LinearGradient
            colors={[
              'rgba(255, 0, 110, 0.96)',
              'rgba(201, 24, 74, 0.98)',
              'rgba(114, 9, 183, 0.96)',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.contentContainer}>
            <View style={styles.iconContainer}>{icon}</View>
            <Text style={styles.categoryName} numberOfLines={2}>
              {category.name}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.button, styles.unselectedButton]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={styles.categoryName} numberOfLines={2}>
            {category.name}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CategoryProductsChooser = ({
  categories,
  selectedNode,
  setNode,
}: {
  categories: TreeNode | undefined;
  selectedNode: TreeNode | undefined;
  setNode: (node: TreeNode) => void;
}) => {
  const [categoriesTree, setCategories] = useState([] as TreeNode[]);

  useEffect(() => {
    //
    //obtenemos todos los hijos del primer nodo
    const getChildren = (node: TreeNode | undefined) => {
      if (!node) {
        return [];
      }
      let children = node.children || [];
      return children.reduce((acc: any[], child: TreeNode) => {
        acc.push(child);

        return acc;
      }, []);
    };

    setCategories([{ name: 'Todas' }, ...getChildren(categories)]);
  }, [categories]);
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingVertical: 12,
      paddingHorizontal: 8,
      width: '100%',
    },
  });

  const getIcons = (name: string, isSelected: boolean) => {
    const iconColor = isSelected ? 'white' : '#7209B7';
    const iconSize = 28;

    switch (name) {
      case 'Todas':
        return <AntDesign name="inbox" size={iconSize} color={iconColor} />;
      case 'Conos':
        return (
          <FontAwesome6 name="ice-cream" size={iconSize} color={iconColor} />
        );
      case 'Especialidades':
        return (
          <MaterialDesignIcons
            name="food-variant"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'Frozen Yogur':
        return (
          <MaterialIcons name="local-drink" size={iconSize} color={iconColor} />
        );
      case 'Pastelería':
        return (
          <FontAwesome name="birthday-cake" size={iconSize} color={iconColor} />
        );
      case 'Envasados':
        return (
          <MaterialDesignIcons
            name="glass-mug"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'Paletería':
        return <Ionicons name="ice-cream" size={iconSize} color={iconColor} />;
      case 'Bebidas':
        return (
          <MaterialDesignIcons
            name="glass-cocktail"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'Promociones':
        return (
          <MaterialDesignIcons
            name="percent"
            size={iconSize}
            color={iconColor}
          />
        );
      case 'Extras':
        return (
          <MaterialDesignIcons
            name="food-fork-drink"
            size={iconSize}
            color={iconColor}
          />
        );
      default:
        return <AntDesign name="folder1" size={iconSize} color={iconColor} />;
    }
  };

  const isSelected = (categoryName: string): boolean => {
    if (selectedNode?.name === categoryName) {
      return true;
    }
    if (selectedNode === categories && categoryName === 'Todas') {
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      {categoriesTree.map((category: TreeNode, index: number) => {
        const selected = isSelected(category.name);
        return (
          <CategoryButton
            key={index + 'tree'}
            category={category}
            isSelected={selected}
            icon={getIcons(category.name, selected)}
            onPress={() => {
              if (category.name === 'Todas') {
                setNode(categories as TreeNode);
              } else {
                setNode(category);
              }
            }}
          />
        );
      })}
    </View>
  );
};

export default CategoryProductsChooser;

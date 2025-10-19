import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { TreeNode } from '../../../interface/TreeInterface';
import { useSelector } from 'react-redux';
import { themeInterface } from '../../../interface/themeInterface';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
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
      justifyContent: 'space-evenly',
      width: '100%',
    },
    box: {
      borderRadius: 10,
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
      borderWidth: 2,
      borderColor: theme.HEADER_TEXT_COLOR,
    },
    iconText: {
      fontSize: 10,
      color: theme.HEADER_TEXT_COLOR,
      textAlign: 'center',
      marginTop: 5,
    },
  });
  const getIcons = (name: string) => {
    switch (name) {
      case 'Todas':
        return (
          <AntDesign name="inbox" size={30} color={theme.HEADER_TEXT_COLOR} />
        );
      case 'Conos':
        return (
          <FontAwesome6
            name="ice-cream"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Especialidades':
        return (
          <MaterialDesignIcons
            name="food-variant"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Frozen Yogur':
        return (
          <MaterialIcons
            name="local-drink"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Pastelería':
        return (
          <FontAwesome
            name="birthday-cake"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Envasados':
        return (
          <MaterialDesignIcons
            name="glass-mug"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Paletería':
        return (
          <Ionicons
            name="ice-cream"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Bebidas':
        return (
          <MaterialDesignIcons
            name="glass-cocktail"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Promociones':
        return (
          <MaterialDesignIcons
            name="percent"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      case 'Extras':
        return (
          <MaterialDesignIcons
            name="food-fork-drink"
            size={30}
            color={theme.HEADER_TEXT_COLOR}
          />
        );
      default:
        return (
          <AntDesign name="folder1" size={30} color={theme.HEADER_TEXT_COLOR} />
        );
    }
  };
  const getCustomColor = (name: string) => {
    if (selectedNode?.name == name) {
      return theme.SELECTED_EDIT_PRODUCT_BUTTON_COLOR;
    } else if (selectedNode == categories && name == 'Todas') {
      return theme.SELECTED_EDIT_PRODUCT_BUTTON_COLOR;
    }

    return theme.EDIT_PRODUCT_BUTTON_COLOR;
  };
  return (
    <View style={styles.container}>
      {categoriesTree.map((category: TreeNode, index: number) => (
        <View key={index + 'tree'}>
          <TouchableOpacity
            style={[
              styles.box,
              { backgroundColor: getCustomColor(category.name) },
            ]}
            onPress={() => {
              if (category.name == 'Todas') {
                setNode(categories as TreeNode);
              } else {
                setNode(category);
              }
            }}>
            <View>{getIcons(category.name)}</View>
            <Text style={styles.iconText}>{category.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default CategoryProductsChooser;

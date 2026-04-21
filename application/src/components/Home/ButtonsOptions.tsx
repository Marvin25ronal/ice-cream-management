import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';

import IconSelector, { type_class_icon } from '../UI/IconSelector';
import { TreeNode } from '../../interface/TreeInterface';
import { useSelector } from 'react-redux';
import { themeInterface } from '../../interface/themeInterface';
import { Fonts } from '../../constants/Fonts';
import { Product } from '../../entity/Product.entity';
import NumberIndicator from './NumberIndicator';

const ButtonsOptions = ({
  actualNode,
  setActualNode,
  loadTree,
  clearSelectedItems,
  goToPayment,
  goToEditShoppingCart,
}: {
  actualNode: TreeNode | undefined;
  setActualNode: any;
  loadTree: any;
  clearSelectedItems: any;
  goToPayment: any;
  goToEditShoppingCart: any;
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const styles = StyleSheet.create({
    buttonsContainer: {
      width: 'auto',
      flexDirection: 'row',
      justifyContent: 'space-around',
      height: 'auto',
      marginBottom: 10,
    },
    button: {
      backgroundColor: 'blue',
      paddingHorizontal: 20,
      justifyContent: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 5,
      borderColor: theme.HEADER_TEXT_COLOR,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      paddingVertical: 10,
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontFamily: Fonts.LatoBold,
      fontSize: 18,
      marginLeft: 10,
    },
  });
  return (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.HOME_BUTTON_COLOR }}
        onPress={() => {
          loadTree();
        }}>
        <IconSelector
          icon_class={type_class_icon.Feather}
          color="white"
          icon="menu"
          size={20}
        />
        <Text style={styles.buttonText}>Menú</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.BACK_BUTTON_COLOR }}
        onPress={() => {
          if (actualNode && actualNode.parent) {
            setActualNode(actualNode.parent);
          }
        }}>
        <IconSelector
          icon_class={type_class_icon.Ionicons}
          color="white"
          icon="arrow-back"
          size={20}
        />
        <Text style={styles.buttonText}>Atrás</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.CLEAN_BUTTON_COLOR }}
        onPress={clearSelectedItems}>
        <IconSelector
          icon_class={type_class_icon.Feather}
          color="white"
          icon="trash"
          size={20}
        />
        <Text style={styles.buttonText}>Limpiar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.EDIT_BUTTON_COLOR }}
        onPress={goToEditShoppingCart}>
        <IconSelector
          icon_class={type_class_icon.Feather}
          color="white"
          icon="edit"
          size={20}
        />
        <Text style={styles.buttonText}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ ...styles.button, backgroundColor: theme.PAY_BUTTON_COLOR }}
        onPress={goToPayment}>
        <IconSelector
          icon_class={type_class_icon.Ionicons}
          color="white"
          icon="document"
          size={20}
        />
        <Text style={styles.buttonText}>Facturar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonsOptions;

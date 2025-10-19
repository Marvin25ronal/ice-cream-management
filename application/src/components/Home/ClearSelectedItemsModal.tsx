import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { themeInterface } from '../../interface/themeInterface';
import { useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CLEAR_SELECTED_ITEMS_MODAL_MESSAGE } from '../../shared/TextConstants';

const ClearSelectedItemsModal = ({
  confirm,
  cancel,
}: {
  confirm: any;
  cancel: any;
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const styles = StyleSheet.create({
    container: {
      //flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    message: {
      color: theme.MODAL_TEXT_COLOR,
      fontSize: FontsSize.extraLarge,
      fontFamily: Fonts.LatoRegular,
    },
    confirmButton: {
      backgroundColor: theme.CONFIRM_BUTTON_COLOR,
      padding: 20,
      borderRadius: 10,
      marginRight: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    cancelButton: {
      backgroundColor: theme.CANCEL_BUTTON_COLOR,
      padding: 20,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 50,
      width: '100%',
    },
    confirmText: {
      color: theme.CONFIRM_BUTTON_TEXT_COLOR,
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
    },
    cancelText: {
      color: theme.CANCEL_BUTTON_TEXT_COLOR,
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{CLEAR_SELECTED_ITEMS_MODAL_MESSAGE}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={confirm}>
          <Text style={styles.confirmText}>Confirmar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={cancel}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClearSelectedItemsModal;

import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {themeInterface} from '../../interface/themeInterface';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import IconSelector, {type_class_icon} from './IconSelector';

interface GenericModalProps {
  confirm: () => void;
  cancel: () => void;
  text: string;
}

const GenericModal: React.FC<GenericModalProps> = ({confirm, cancel, text}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 8,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#FFF5F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 3,
      borderColor: '#FFE5E5',
    },
    messageContainer: {
      marginBottom: 32,
      alignItems: 'center',
    },
    message: {
      color: theme.MODAL_TEXT_COLOR,
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoRegular,
      textAlign: 'center',
      lineHeight: 28,
      letterSpacing: 0.3,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 12,
    },
    baseButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      minHeight: 56,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.25,
      shadowRadius: 5,
    },
    cancelButton: {
      backgroundColor: '#6C757D',
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonText: {
      color: 'white',
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={styles.container}>
      {/* Warning Icon */}
      <View style={styles.iconContainer}>
        <IconSelector
          icon_class={type_class_icon.MaterialCommunityIcons}
          icon="alert-circle-outline"
          color="#EF476F"
          size={48}
        />
      </View>

      {/* Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.message}>{text}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Cancel Button - Subtle Gray */}
        <TouchableOpacity
          style={[styles.baseButton, styles.cancelButton]}
          onPress={cancel}
          activeOpacity={0.8}>
          <View style={styles.buttonIcon}>
            <IconSelector
              icon_class={type_class_icon.MaterialCommunityIcons}
              icon="close-circle"
              color="white"
              size={22}
            />
          </View>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>

        {/* Confirm Button - Danger Red Gradient */}
        <TouchableOpacity
          style={{flex: 1}}
          onPress={confirm}
          activeOpacity={0.8}>
          <LinearGradient
            colors={['#EF476F', '#c9184a', '#a4133c']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.baseButton}>
            <View style={styles.buttonIcon}>
              <IconSelector
                icon_class={type_class_icon.MaterialCommunityIcons}
                icon="check-circle"
                color="white"
                size={22}
              />
            </View>
            <Text style={styles.buttonText}>Confirmar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GenericModal;

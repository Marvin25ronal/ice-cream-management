import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { ButtonComponentProps } from '../../interface/Props.interface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/redux/store';
import { Fonts, FontsSize } from '../../constants/Fonts';

const ButtonComponent = ({
  text,
  onPress,
  variant = 'primary',
  fontSize,
}: ButtonComponentProps) => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const getTheme = () => {
    switch (variant) {
      case 'primary':
        return theme.PAY_BUTTON_COLOR;
      default:
        return theme.PAY_BUTTON_COLOR;
    }
  };
  const styles = StyleSheet.create({
    button: {
      backgroundColor: getTheme(),
      padding: 20,
      borderRadius: 5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    textButton: {
      color: 'white',
      fontSize: fontSize ?? FontsSize.large,
      fontFamily: Fonts.LatoBold,
    },
  });
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        onPress();
      }}>
      <Text style={styles.textButton}>{text}</Text>
    </TouchableOpacity>
  );
};

export default ButtonComponent;

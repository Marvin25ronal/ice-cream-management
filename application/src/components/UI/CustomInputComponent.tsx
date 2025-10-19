import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { themeInterface } from '../../interface/themeInterface';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/redux/store';
import { Controller, set } from 'react-hook-form';
import { CustomInputProps } from '../../interface/Props.interface';
import IconSelector from './IconSelector';
import { Fonts } from '../../constants/Fonts';
import ModalComponent from './ModalComponent';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import CalendarPicker from 'react-native-calendar-picker';
import ButtonComponent from './ButtonComponent';
import { format } from '@formkit/tempo';

const CustomInputComponent = ({
  type = 'text',
  control,
  rules = {},
  icon_class,
  icon_name,
  name,
  place_holder,
  keyboardType,
  width,
  height,
  fontSize,
  defaultValue,
  disabled,
  iconSize,
}: CustomInputProps) => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const [visible, setVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const progress = useSharedValue(0);

  const styles = StyleSheet.create({
    container: {
      width: width ?? '100%',
      marginVertical: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.INPUT_BACKGROUND_COLOR,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.INPUT_BORDER_COLOR,
      paddingHorizontal: 14,
      paddingVertical: 12,
      shadowColor: theme.INPUT_SHADOW_COLOR,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    inputWrapperFocused: {
      borderColor: theme.INPUT_BORDER_COLOR_FOCUSED,
      backgroundColor: theme.INPUT_BACKGROUND_COLOR_FOCUSED,
      shadowColor: theme.INPUT_SHADOW_COLOR,
      shadowOpacity: 0.2,
      elevation: 5,
    },
    inputWrapperError: {
      borderColor: theme.ERROR_COLOR,
      backgroundColor: theme.INPUT_BACKGROUND_COLOR_ERROR,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.INPUT_ICON_BACKGROUND_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    iconContainerFocused: {
      backgroundColor: theme.INPUT_ICON_BACKGROUND_COLOR_FOCUSED,
    },
    text_input: {
      flex: 1,
      color: '#2C3E50',
      fontFamily: Fonts.LatoRegular,
      fontSize: fontSize ?? 16,
      paddingVertical: 0,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
      marginLeft: 14,
    },
    errorText: {
      color: theme.ERROR_COLOR,
      fontSize: 12,
      fontFamily: Fonts.LatoRegular,
      marginLeft: 4,
    },
    calendarContainer: {
      width: '100%',
      paddingTop: 50,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  if (type === 'text') {
    return (
      <Controller
        control={control}
        rules={rules}
        name={name}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => {
          return (
            <View style={styles.container}>
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && styles.inputWrapperFocused,
                  error && styles.inputWrapperError,
                ]}>
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                  ]}>
                  <IconSelector
                    icon_class={icon_class}
                    color={isFocused ? theme.INPUT_ICON_COLOR_FOCUSED : theme.INPUT_ICON_COLOR}
                    size={iconSize ?? 20}
                    icon={icon_name}
                  />
                </View>
                <TextInput
                  placeholder={place_holder}
                  style={styles.text_input}
                  keyboardType={keyboardType}
                  placeholderTextColor={theme.INPUT_PLACEHOLDER_COLOR}
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur();
                  }}
                  editable={!disabled}
                  defaultValue={defaultValue}
                />
              </View>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {error.message || 'Error'}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    );
  }
  if (type === 'number') {
    return (
      <Controller
        control={control}
        rules={rules}
        name={name}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => {
          return (
            <View style={styles.container}>
              <View
                style={[
                  styles.inputWrapper,
                  isFocused && styles.inputWrapperFocused,
                  error && styles.inputWrapperError,
                ]}>
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                  ]}>
                  <IconSelector
                    icon_class={icon_class}
                    color={isFocused ? theme.INPUT_ICON_COLOR_FOCUSED : theme.INPUT_ICON_COLOR}
                    size={iconSize ?? 20}
                    icon={icon_name}
                  />
                </View>
                <TextInput
                  placeholder={place_holder}
                  style={styles.text_input}
                  keyboardType="numeric"
                  placeholderTextColor={theme.INPUT_PLACEHOLDER_COLOR}
                  value={value?.toString()}
                  onChangeText={text => {
                    const numericValue = text.replace(/[^0-9.]/g, '');
                    onChange(numericValue);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur();
                  }}
                  editable={!disabled}
                  defaultValue={defaultValue?.toString()}
                />
              </View>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {error.message || 'Error'}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    );
  }
  if (type === 'date') {
    return (
      <Controller
        control={control}
        rules={rules}
        name={name}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => {
          return (
            <View style={styles.container}>
              <TouchableOpacity
                onPress={() => {
                  setVisible(true);
                  progress.value = withSpring(1);
                }}
                style={[
                  styles.inputWrapper,
                  error && styles.inputWrapperError,
                ]}
                activeOpacity={0.7}>
                <View style={styles.iconContainer}>
                  <IconSelector
                    icon_class={icon_class}
                    color={theme.INPUT_ICON_COLOR}
                    size={iconSize ?? 20}
                    icon={icon_name}
                  />
                </View>
                <Text
                  style={[
                    styles.text_input,
                    !value && { color: theme.INPUT_PLACEHOLDER_COLOR },
                  ]}>
                  {value || place_holder}
                </Text>
              </TouchableOpacity>
              {error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    {error.message || 'Error'}
                  </Text>
                </View>
              )}
              <ModalComponent
                visible={visible}
                setVisible={setVisible}
                height={'auto'}
                width={'auto'}
                progress={progress}>
                <View style={styles.calendarContainer}>
                  <CalendarPicker
                    width={450}
                    height={600}
                    nextTitleStyle={{ color: theme.COLOR_FORM_ICON }}
                    previousTitleStyle={{ color: theme.COLOR_FORM_ICON }}
                    previousTitle="Anterior"
                    nextTitle="Siguiente"
                    months={[
                      'Enero',
                      'Febrero',
                      'Marzo',
                      'Abril',
                      'Mayo',
                      'Junio',
                      'Julio',
                      'Agosto',
                      'Septiembre',
                      'Octubre',
                      'Noviembre',
                      'Diciembre',
                    ]}
                    textStyle={{ fontFamily: Fonts.LatoRegular }}
                    selectedDayColor={theme.SELECTED_DATE_COLOR}
                    allowRangeSelection={true}
                    selectedDayTextColor="white"
                    weekdays={['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']}
                    onDateChange={(date, type) => {
                      console.log('date', date);
                      console.log('type', type);
                      if (type === 'END_DATE') {
                        onChange(
                          value + ' - ' + format(new Date(date), 'DD/MM/YYYY'),
                        );
                        setVisible(false);
                      } else {
                        value = format(new Date(date), 'DD/MM/YYYY');
                        onChange(format(new Date(date), 'DD/MM/YYYY'));
                      }
                    }}
                  />
                </View>
              </ModalComponent>
            </View>
          );
        }}
      />
    );
  }
};

export default CustomInputComponent;

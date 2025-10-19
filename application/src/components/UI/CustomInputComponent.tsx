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
  const progress = useSharedValue(0);
  const styles = StyleSheet.create({
    action: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.INPUT_BORDER_COLOR,
      borderRadius: 5,
      marginVertical: 10,
      paddingHorizontal: 10,
      width: width ?? '100%',
    },
    text_input: {
      flex: 1,
      color: 'black',
      fontFamily: Fonts.LatoRegular,
      fontSize: fontSize ?? 60,
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
            <>
              <TouchableOpacity
                onPress={() => {
                  setVisible(true);
                  progress.value = withSpring(1);
                }}
                style={[
                  styles.action,
                  {
                    borderColor: error
                      ? theme.ERROR_COLOR
                      : theme.INPUT_BORDER_COLOR,
                  },
                ]}>
                <IconSelector
                  icon_class={icon_class}
                  color={theme.COLOR_FORM_ICON}
                  size={iconSize ?? 60}
                  icon={icon_name}
                />
                <TextInput
                  placeholder={place_holder}
                  style={[styles.text_input]}
                  keyboardType={keyboardType}
                  placeholderTextColor={'grey'}
                  textAlign="center"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!disabled}
                  defaultValue={defaultValue}
                />
              </TouchableOpacity>
              {error && (
                <Text style={{ color: theme.ERROR_COLOR }}>
                  {error.message || 'Error'}
                </Text>
              )}
            </>
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
            <>
              <TouchableOpacity
                onPress={() => {
                  setVisible(true);
                  progress.value = withSpring(1);
                }}
                style={[
                  styles.action,
                  {
                    borderColor: error
                      ? theme.ERROR_COLOR
                      : theme.INPUT_BORDER_COLOR,
                  },
                ]}>
                <IconSelector
                  icon_class={icon_class}
                  color={theme.COLOR_FORM_ICON}
                  size={iconSize ?? 60}
                  icon={icon_name}
                />
                <TextInput
                  placeholder={place_holder}
                  style={[styles.text_input]}
                  keyboardType="numeric"
                  placeholderTextColor={'grey'}
                  textAlign="center"
                  value={value?.toString()}
                  onChangeText={text => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    onChange(numericValue);
                  }}
                  onBlur={onBlur}
                  editable={!disabled}
                  defaultValue={defaultValue?.toString()}
                />
              </TouchableOpacity>
              {error && (
                <Text style={{ color: theme.ERROR_COLOR }}>
                  {error.message || 'Error'}
                </Text>
              )}
            </>
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
            <>
              <TouchableOpacity
                onPress={() => {
                  setVisible(true);
                  progress.value = withSpring(1);
                }}
                style={[
                  styles.action,
                  {
                    borderColor: error
                      ? theme.ERROR_COLOR
                      : theme.INPUT_BORDER_COLOR,
                  },
                ]}>
                <IconSelector
                  icon_class={icon_class}
                  color={theme.COLOR_FORM_ICON}
                  size={fontSize || 60}
                  icon={icon_name}
                />
                <TextInput
                  placeholder={place_holder}
                  style={[styles.text_input]}
                  keyboardType={keyboardType}
                  placeholderTextColor={'grey'}
                  textAlign="center"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!disabled}
                  defaultValue={defaultValue}
                />
              </TouchableOpacity>
              {error && (
                <Text style={{ color: theme.ERROR_COLOR }}>
                  {error.message || 'Error'}
                </Text>
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
                  {/* <View style={{ marginTop: 10, padding: 10 }}>
                                        <ButtonComponent text='Aceptar' onPress={() => {
                                            progress.value = withSpring(0)

                                            setTimeout(() => {
                                                setVisible(false)
                                            }, 300);
                                        }} fontSize={20} variant='primary' />
                                    </View> */}
                </View>
              </ModalComponent>
            </>
          );
        }}
      />
    );
  }
};

export default CustomInputComponent;

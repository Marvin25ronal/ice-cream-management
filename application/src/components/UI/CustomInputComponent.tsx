import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/redux/store'
import { Controller } from 'react-hook-form'
import { CustomInputProps } from '../../interface/Props.interface'
import IconSelector from './IconSelector'
import { Fonts } from '../../constants/Fonts'

const CustomInputComponent = ({ control, rules, icon_class, icon_name, name, place_holder,
    keyboardType

}: CustomInputProps) => {
    const theme = useSelector((state: RootState) => state.theme.value)
    const styles = StyleSheet.create({
        action: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.INPUT_BORDER_COLOR,
            borderRadius: 5,
            marginVertical: 10,
            paddingHorizontal: 10
        },
        text_input: {
            flex: 1,
            color: 'black',
            fontFamily: Fonts.LatoRegular,
            fontSize: 60,
        }
    })
    return (
        <Controller
            control={control}
            rules={rules}
            name={name}
            render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
                return (
                    <>
                        <View style={[styles.action, { borderColor: error ? theme.ERROR_COLOR : theme.INPUT_BORDER_COLOR }]}>
                            <IconSelector icon_class={icon_class}
                                color={theme.COLOR_FORM_ICON}
                                size={60}
                                icon={icon_name} />
                            <TextInput placeholder={place_holder}
                                style={[styles.text_input]}
                                keyboardType={keyboardType}
                                placeholderTextColor={'grey'}
                                textAlign='center'
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                            />
                        </View>
                        {
                            error && <Text style={{ color: theme.ERROR_COLOR }}>{error.message || 'Error'}</Text>
                        }
                    </>

                );
            }}

        />
    )
}

export default CustomInputComponent


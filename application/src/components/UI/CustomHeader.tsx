import { StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface';
import { useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../../constants/Fonts';
import IconSelector, { type_class_icon } from './IconSelector';
import { DrawerActions } from '@react-navigation/native';

const CustomHeader = ({ title, backOption, navigation }: { title: string, backOption: any, navigation: any }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const styles = StyleSheet.create({
        container: {
            backgroundColor: theme.HEADER_COLOR,
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 30,
            flexDirection: 'row',
            height: 55,

        },
        textStyle: {
            color: theme.HEADER_TEXT_COLOR,
            fontFamily: 'Lato-Bold',
            fontSize: FontsSize.large,
            marginLeft: 10
        }
    })
    return (
        <View style={styles.container}>
            {
                !backOption && <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ padding: 5 }}>
                    <IconSelector icon_class={type_class_icon.AntDesign} icon="bars" size={30} color={theme.HEADER_TEXT_COLOR} />
                </TouchableOpacity>
            }
            {
                backOption ? <TouchableOpacity onPress={navigation.goBack} style={{ padding: 5 }}>
                    <IconSelector icon_class={type_class_icon.AntDesign} icon="arrowleft" size={30} color={theme.HEADER_TEXT_COLOR} />
                </TouchableOpacity>
                    : undefined
            }

            <Text style={styles.textStyle}>
                {title}
            </Text>
        </View>
    )
}

export default CustomHeader


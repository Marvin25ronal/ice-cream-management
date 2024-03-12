import { View, Text, useColorScheme } from 'react-native'
import React, { useEffect } from 'react'
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack'
import { Utils } from '../constants/utils';
import HomePage from '../pages/HomePage';
import { themeInterface } from '../interface/themeInterface';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/redux/themeReducer';
import { darkTheme } from '../styles/Theme';
import MenuPage from '../pages/MenuPage';
import { Fonts, FontsSize } from '../constants/Fonts';
const Stack = createStackNavigator();

const StackNavigator = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const dispatch = useDispatch();
    useEffect(() => {
        if (isDarkMode) {
            dispatch(setTheme(darkTheme))
        } else {
            dispatch(setTheme(darkTheme))
        }
    }, [])
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const options: StackNavigationOptions = {
        headerStyle: {
            backgroundColor: theme.HEADER_COLOR,

        },
        headerTitleStyle: {
            color: theme.HEADER_TEXT_COLOR,
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.large
        },
        headerTintColor: theme.HEADER_TEXT_COLOR,
    }
    return (
        <Stack.Navigator>
            <Stack.Screen name={Utils.screens.HOME} component={HomePage} options={options} />
            <Stack.Screen name={Utils.screens.MENU} component={MenuPage} options={options} />
        </Stack.Navigator>
    )
}

export default StackNavigator
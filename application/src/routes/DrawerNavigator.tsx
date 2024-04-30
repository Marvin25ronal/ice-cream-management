import { View, Text, useColorScheme } from 'react-native'
import React, { useEffect } from 'react'
import { DrawerNavigationOptions, createDrawerNavigator } from '@react-navigation/drawer'
import { Utils } from '../constants/utils';
import StackNavigator from './StackNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/redux/themeReducer';
import { darkTheme } from '../styles/Theme';
import { themeInterface } from '../interface/themeInterface';
import { Fonts, FontsSize } from '../constants/Fonts';
import SplashScreen from '../components/UI/SplashScreen';
import { useLoading } from '../shared/LoaderHook';

const Drawer = createDrawerNavigator();
const DrawerNavigator = () => {
    const { loadingState, setFalseLoading, setTrueLoading } = useLoading()
    const isDarkMode = useColorScheme() === 'dark';
    const dispatch = useDispatch();
    useEffect(() => {
        if (isDarkMode) {
            dispatch(setTheme(darkTheme))
        } else {
            dispatch(setTheme(darkTheme))
        }
        setTrueLoading()
    }, [])
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const options: DrawerNavigationOptions = {
        headerStyle: {
            backgroundColor: theme.HEADER_COLOR,

        },
        headerTitleStyle: {
            color: theme.HEADER_TEXT_COLOR,
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.large
        },
        headerTintColor: theme.HEADER_TEXT_COLOR,
        headerShown: false
    }
    return (
        <>
            <SplashScreen callback={setFalseLoading} />
            <Drawer.Navigator>
                <Drawer.Screen name={Utils.screens.HOME_STACK} component={StackNavigator} options={options} />
            </Drawer.Navigator>
        </>

        // 

    )
}

export default DrawerNavigator
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
import SplashScreen from '../components/UI/SplashScreen';
import PayPage from '../pages/PayPage';
import { Product } from '../entity/Product.entity';
import { getHeaderTitle } from '@react-navigation/elements'
import CustomHeader from '../components/UI/CustomHeader';
import EditShoppingCartPage from '../pages/EditShoppingCartPage';
import ToastComponent from '../components/UI/ToastComponent';
import { Order } from '../entity/Order.entity';
export type RootStackParamList = {
    [Utils.screens.HOME]: undefined,
    [Utils.screens.MENU]: undefined,
    // [Utils.screens.PAYMENT]: { products: Product[] }
    [Utils.screens.PAYMENT]: undefined,
    [Utils.screens.EDIT_SHOPPING_CART]: { edit: boolean }
}

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator = () => {
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
        headerShown: true,
        header: ({ navigation, route, options, back }) => {
            const title = getHeaderTitle(options, route.name)
            return <CustomHeader title={title} backOption={back} navigation={navigation} />
        }
    }
    return (
        <>
            <Stack.Navigator>
                <Stack.Screen name={Utils.screens.HOME} component={HomePage} options={options} />
                <Stack.Screen name={Utils.screens.MENU} component={MenuPage} options={options} />
                <Stack.Screen name={Utils.screens.EDIT_SHOPPING_CART} component={EditShoppingCartPage} options={options} />
                <Stack.Screen name={Utils.screens.PAYMENT} component={PayPage} options={options} />
            </Stack.Navigator>
            <ToastComponent />
        </>


    )
}

export default StackNavigator
import { useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import {
  createStackNavigator,
  StackNavigationOptions,
} from '@react-navigation/stack';
import { getHeaderTitle } from '@react-navigation/elements';
import { Utils } from '../constants/utils';
import StackNavigator from './StackNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/redux/themeReducer';
import { darkTheme } from '../styles/Theme';
import { themeInterface } from '../interface/themeInterface';
import { Fonts, FontsSize } from '../constants/Fonts';
import SplashScreen from '../components/UI/SplashScreen';
import { useLoading } from '../shared/LoaderHook';
import OrderStackNavigator from './OrderStackNavigator';
import FelPage from '../pages/FelPage';
import MaintenanceStack from './MaintenanceStack';
import ReportesNavigator from './ReportesNavigator';
import EditProductNavigator from './EditProductNavigator';
import GastosNavigator from './GastosNavigator';
import CajaNavigator from './CajaNavigator';
import MateriaPrimaNavigator from './MateriaPrimaNavigator';
import CustomHeader from '../components/UI/CustomHeader';
import BottomSheetMenu from '../components/Menu/BottomSheetMenu';

const Stack = createStackNavigator();

const DrawerNavigator = () => {
  const { setFalseLoading, setTrueLoading } = useLoading();
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();

  useEffect(() => {
    if (isDarkMode) {
      dispatch(setTheme(darkTheme));
    } else {
      dispatch(setTheme(darkTheme));
    }
    setTrueLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme: themeInterface = useSelector((state: any) => state.theme.value);

  const options: StackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.HEADER_COLOR,
    },
    headerTitleStyle: {
      color: theme.HEADER_TEXT_COLOR,
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.large,
    },
    headerTintColor: theme.HEADER_TEXT_COLOR,
    headerShown: false,
  };

  const felOptions: StackNavigationOptions = {
    headerShown: true,
    header: ({ navigation, route, options: screenOptions }) => {
      const title = getHeaderTitle(screenOptions, route.name);
      return (
        <CustomHeader
          title={title}
          backOption={false}
          navigation={navigation}
        />
      );
    },
  };

  return (
    <>
      <SplashScreen callback={setFalseLoading} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name={Utils.screens.HOME_STACK}
          component={StackNavigator}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.ORDER_STACK}
          component={OrderStackNavigator}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.FEL}
          component={FelPage}
          options={felOptions}
        />
        <Stack.Screen
          name={Utils.screens.REPORTES_STACK}
          component={ReportesNavigator}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.BACKUP}
          component={MaintenanceStack}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.EDIT_LIST_PRODUCT_STACK}
          component={EditProductNavigator}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.GASTOS_STACK}
          component={GastosNavigator}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.CAJA_STACK}
          component={CajaNavigator}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.MATERIA_PRIMA_STACK}
          component={MateriaPrimaNavigator}
          options={options}
        />
      </Stack.Navigator>
      <BottomSheetMenu />
    </>
  );
};

export default DrawerNavigator;

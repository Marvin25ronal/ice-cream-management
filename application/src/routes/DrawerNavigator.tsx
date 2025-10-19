import { View, Text, useColorScheme } from 'react-native';
import React, { useEffect } from 'react';
import {
  DrawerNavigationOptions,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import { Utils } from '../constants/utils';
import StackNavigator from './StackNavigator';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../store/redux/themeReducer';
import { darkTheme } from '../styles/Theme';
import { themeInterface } from '../interface/themeInterface';
import { Fonts, FontsSize } from '../constants/Fonts';
import SplashScreen from '../components/UI/SplashScreen';
import { useLoading } from '../shared/LoaderHook';
import ToastComponent from '../components/UI/ToastComponent';
import OrderStackNavigator from './OrderStackNavigator';
import FelPage from '../pages/FelPage';
import MaintenanceStack from './MaintenanceStack';
import DailyReportNavigator from './DailyReportNavigator';
import EditProductNavigator from './EditProductNavigator';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialDesignIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const getDrawerIcon = (routeName: string) => {
  const iconSize = 20; // Default icon size, can be adjusted as needed
  switch (routeName) {
    case Utils.screens.HOME_STACK:
      return (
        <FontAwesome5 name="cash-register" size={iconSize} color={'black'} />
      ); // Home icon
    case Utils.screens.ORDER_STACK:
      return <Entypo name="documents" size={iconSize} color={'black'} />; // Order icon
    case Utils.screens.FEL:
      return (
        <MaterialDesignIcons
          name="book-check-outline"
          size={iconSize}
          color={'black'}
        />
      );
    case Utils.screens.DAILY_REPORT_STACK:
      return <Ionicons name="analytics" size={iconSize} color={'black'} />; // Daily Report icon
    case Utils.screens.BACKUP:
      return (
        <MaterialDesignIcons
          name="backup-restore"
          size={iconSize}
          color={'black'}
        />
      ); // Maintenance icon
    case Utils.screens.EDIT_LIST_PRODUCT_STACK:
      return <AntDesign name="dropbox" size={iconSize} color={'black'} />;
    default:
      return <Text>?</Text>; // Default icon for unknown routes
  }
};

const Drawer = createDrawerNavigator();
const DrawerNavigator = () => {
  const { loadingState, setFalseLoading, setTrueLoading } = useLoading();
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  useEffect(() => {
    if (isDarkMode) {
      dispatch(setTheme(darkTheme));
    } else {
      dispatch(setTheme(darkTheme));
    }
    setTrueLoading();
  }, []);
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const options: DrawerNavigationOptions = {
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
  const felOptions: DrawerNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.HEADER_COLOR,
    },
    headerTitleStyle: {
      color: theme.HEADER_TEXT_COLOR,
      fontFamily: Fonts.LatoBold,
      fontSize: FontsSize.large,
    },
    headerTintColor: theme.HEADER_TEXT_COLOR,
    headerShown: true,
  };

  return (
    <>
      <SplashScreen callback={setFalseLoading} />
      <Drawer.Navigator
        screenOptions={({ route }) => ({
          ...options,
          drawerIcon: ({ focused, size }) => getDrawerIcon(route.name),
          drawerActiveTintColor: theme.CONFIRM_BUTTON_COLOR,
        })}>
        <Drawer.Screen
          name={Utils.screens.HOME_STACK}
          component={StackNavigator}
          options={options}
        />
        <Drawer.Screen
          name={Utils.screens.ORDER_STACK}
          component={OrderStackNavigator}
          options={options}
        />
        <Drawer.Screen
          name={Utils.screens.FEL}
          component={FelPage}
          options={felOptions}
        />
        <Drawer.Screen
          name={Utils.screens.DAILY_REPORT_STACK}
          component={DailyReportNavigator}
          options={options}
        />
        <Drawer.Screen
          name={Utils.screens.BACKUP}
          component={MaintenanceStack}
          options={options}
        />
        <Drawer.Screen
          name={Utils.screens.EDIT_LIST_PRODUCT_STACK}
          component={EditProductNavigator}
          options={options}
        />
      </Drawer.Navigator>
    </>

    //
  );
};

export default DrawerNavigator;

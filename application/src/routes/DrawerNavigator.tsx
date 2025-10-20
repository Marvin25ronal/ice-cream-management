import { View, Text, useColorScheme, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useEffect } from 'react';
import {
  DrawerNavigationOptions,
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
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
import LinearGradient from 'react-native-linear-gradient';
import { AppConfig, getVersionString, getCopyrightText } from '../constants/AppConfig';

// Menu item interface
interface MenuItemData {
  routeName: string;
  icon: React.ReactNode;
  label: string;
  iconColor: string;
  iconBgColor: string;
}

// Get icon configuration for each route
const getMenuItemData = (routeName: string): MenuItemData => {
  const iconSize = 32;

  switch (routeName) {
    case Utils.screens.HOME_STACK:
      return {
        routeName,
        icon: <FontAwesome5 name="cash-register" size={iconSize} color="#FF6B9D" />,
        label: 'Cobradora',
        iconColor: '#FF6B9D',
        iconBgColor: '#FFE5EC',
      };
    case Utils.screens.ORDER_STACK:
      return {
        routeName,
        icon: <Entypo name="documents" size={iconSize} color="#9D4EDD" />,
        label: 'Ordenes',
        iconColor: '#9D4EDD',
        iconBgColor: '#F3E5FF',
      };
    case Utils.screens.FEL:
      return {
        routeName,
        icon: <MaterialDesignIcons name="book-check-outline" size={iconSize} color="#06B6D4" />,
        label: 'FEL',
        iconColor: '#06B6D4',
        iconBgColor: '#E0F7FA',
      };
    case Utils.screens.DAILY_REPORT_STACK:
      return {
        routeName,
        icon: <Ionicons name="analytics" size={iconSize} color="#F59E0B" />,
        label: 'Reportes Diarios',
        iconColor: '#F59E0B',
        iconBgColor: '#FEF3C7',
      };
    case Utils.screens.BACKUP:
      return {
        routeName,
        icon: <MaterialDesignIcons name="backup-restore" size={iconSize} color="#10B981" />,
        label: 'Backup',
        iconColor: '#10B981',
        iconBgColor: '#D1FAE5',
      };
    case Utils.screens.EDIT_LIST_PRODUCT_STACK:
      return {
        routeName,
        icon: <AntDesign name="dropbox" size={iconSize} color="#EC4899" />,
        label: 'Editar Productos',
        iconColor: '#EC4899',
        iconBgColor: '#FCE7F3',
      };
    default:
      return {
        routeName,
        icon: <Text>?</Text>,
        label: routeName,
        iconColor: '#6B7280',
        iconBgColor: '#F3F4F6',
      };
  }
};

// Custom Drawer Content Component
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { state, navigation } = props;
  const theme: themeInterface = useSelector((state: any) => state.theme.value);

  return (
    <View style={styles.drawerContainer}>
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={['#FF6B9D', '#C44569', '#9D4EDD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <MaterialDesignIcons name="ice-cream" size={48} color="#FFF" />
          <Text style={styles.headerTitle}>{AppConfig.APP_NAME.split(' ')[0]} {AppConfig.APP_NAME.split(' ')[1]}</Text>
          <Text style={styles.headerSubtitle}>{AppConfig.APP_NAME.split(' ')[2]}</Text>
        </View>
      </LinearGradient>

      {/* Menu Items Scrollable Area */}
      <ScrollView
        style={styles.menuScrollView}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const itemData = getMenuItemData(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'drawerItemPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.7}
              style={[
                styles.menuItem,
                isFocused && styles.menuItemActive,
              ]}
            >
              {/* Icon Container with Background */}
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: isFocused ? itemData.iconColor : itemData.iconBgColor },
                ]}
              >
                {React.cloneElement(itemData.icon as React.ReactElement, {
                  color: isFocused ? '#FFFFFF' : itemData.iconColor,
                })}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.menuLabel,
                  isFocused && styles.menuLabelActive,
                ]}
              >
                {itemData.label}
              </Text>

              {/* Active Indicator */}
              {isFocused && <View style={[styles.activeIndicator, { backgroundColor: itemData.iconColor }]} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer Section with Version */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <View style={styles.versionContainer}>
          <MaterialDesignIcons name="information-outline" size={16} color="#9CA3AF" />
          <Text style={styles.versionText}>Version {getVersionString(false)}</Text>
        </View>
        <Text style={styles.copyrightText}>{getCopyrightText()}</Text>
      </View>
    </View>
  );
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
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          drawerStyle: {
            width: 300,
          },
        }}
      >
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
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header Styles
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.LatoBlack,
    color: '#FFFFFF',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Fonts.LatoLight,
    color: '#FFFFFF',
    marginTop: 4,
    opacity: 0.95,
    letterSpacing: 1.5,
  },

  // Menu Styles
  menuScrollView: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#FFF8FA',
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.LatoRegular,
    color: '#374151',
    letterSpacing: 0.3,
  },
  menuLabelActive: {
    fontFamily: Fonts.LatoBold,
    color: '#1F2937',
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    width: 4,
    height: '70%',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },

  // Footer Styles
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: '#FAFAFA',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  versionText: {
    fontSize: 13,
    fontFamily: Fonts.LatoRegular,
    color: '#6B7280',
    marginLeft: 6,
  },
  copyrightText: {
    fontSize: 11,
    fontFamily: Fonts.LatoLight,
    color: '#9CA3AF',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default DrawerNavigator;

import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import { Fonts, FontsSize } from '../constants/Fonts';
import CustomHeader from '../components/UI/CustomHeader';
import { Utils } from '../constants/utils';
import MaintenancePage from '../pages/MaintenancePage';
import { getHeaderTitle } from '@react-navigation/elements';
export type MaintenanceParamList = {
  [Utils.screens.MAINTENANCE]: undefined;
};
const Stack = createStackNavigator<MaintenanceParamList>();
const MaintenanceStack = () => {
  const theme = useSelector((state: RootState) => state.theme.value);
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
    headerShown: true,
    header: ({ navigation, route, options, back }) => {
      const title = getHeaderTitle(options, route.name);
      return (
        <CustomHeader title={title} backOption={back} navigation={navigation} />
      );
    },
  };

  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name={Utils.screens.MAINTENANCE}
          component={MaintenancePage}
          options={options}
        />
      </Stack.Navigator>
    </>
  );
};

export default MaintenanceStack;

const styles = StyleSheet.create({});

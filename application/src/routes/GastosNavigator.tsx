import React from 'react';
import {StyleSheet} from 'react-native';
import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {RootState} from '../store/redux/store';
import {getHeaderTitle} from '@react-navigation/elements';
import CustomHeader from '../components/UI/CustomHeader';
import {Utils} from '../constants/utils';
import GastosPage from '../pages/GastosPage';
import ExpenseTypeMaintenance from '../pages/ExpenseTypeMaintenance';

export type GastosParamList = {
  [Utils.screens.GASTOS]: undefined;
  [Utils.screens.EXPENSE_TYPE_MAINTENANCE]: undefined;
};

const Stack = createStackNavigator<GastosParamList>();

const GastosNavigator = () => {
  const theme = useSelector((state: RootState) => state.theme.value);

  const options: StackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.HEADER_COLOR,
    },
    headerShown: true,
    header: ({navigation, route, options: opts, back}) => {
      const title = getHeaderTitle(opts, route.name);
      return (
        <CustomHeader title={title} backOption={back} navigation={navigation} />
      );
    },
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Utils.screens.GASTOS}
        component={GastosPage}
        options={options}
      />
      <Stack.Screen
        name={Utils.screens.EXPENSE_TYPE_MAINTENANCE}
        component={ExpenseTypeMaintenance}
        options={options}
      />
    </Stack.Navigator>
  );
};

export default GastosNavigator;

const styles = StyleSheet.create({});

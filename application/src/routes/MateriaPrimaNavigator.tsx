import React from 'react';
import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { getHeaderTitle } from '@react-navigation/elements';
import CustomHeader from '../components/UI/CustomHeader';
import { Utils } from '../constants/utils';
import RawMaterialMaintenancePage from '../pages/RawMaterialMaintenancePage';
import RawMaterialHistoryPage from '../pages/RawMaterialHistoryPage';

export type MateriaPrimaParamList = {
  [Utils.screens.MATERIA_PRIMA]: undefined;
  [Utils.screens.MATERIA_PRIMA_HISTORIAL]: undefined;
};

const Stack = createStackNavigator<MateriaPrimaParamList>();

const MateriaPrimaNavigator = () => {
  const theme = useSelector((state: RootState) => state.theme.value);

  const options: StackNavigationOptions = {
    headerStyle: {
      backgroundColor: theme.HEADER_COLOR,
    },
    headerShown: true,
    header: ({ navigation, route, options: opts, back }) => {
      const title = getHeaderTitle(opts, route.name);
      return (
        <CustomHeader title={title} backOption={back} navigation={navigation} />
      );
    },
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name={Utils.screens.MATERIA_PRIMA}
        component={RawMaterialMaintenancePage}
        options={options}
      />
      <Stack.Screen
        name={Utils.screens.MATERIA_PRIMA_HISTORIAL}
        component={RawMaterialHistoryPage}
        options={options}
      />
    </Stack.Navigator>
  );
};

export default MateriaPrimaNavigator;

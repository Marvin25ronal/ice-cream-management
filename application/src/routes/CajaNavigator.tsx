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
import CajaPage from '../pages/CajaPage';

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-11.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 */
export type CajaParamList = {
  [Utils.screens.CAJA]: undefined;
};

const Stack = createStackNavigator<CajaParamList>();

const CajaNavigator = () => {
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
        name={Utils.screens.CAJA}
        component={CajaPage}
        options={options}
      />
    </Stack.Navigator>
  );
};

export default CajaNavigator;

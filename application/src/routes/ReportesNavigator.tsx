import React from 'react';
import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import {useSelector} from 'react-redux';
import {RootState} from '../store/redux/store';
import {getHeaderTitle} from '@react-navigation/elements';
import CustomHeader from '../components/UI/CustomHeader';
import {Utils} from '../constants/utils';
import ReportesHub from '../pages/Reports/ReportesHub';
import ReporteVentas from '../pages/Reports/ReporteVentas';
import ReporteProductos from '../pages/Reports/ReporteProductos';
import ReporteCategorias from '../pages/Reports/ReporteCategorias';
import ReporteGastos from '../pages/Reports/ReporteGastos';

export type ReportesParamList = {
  [Utils.screens.REPORTES_HUB]: undefined;
  [Utils.screens.REPORTE_VENTAS]: {start: string; end: string} | undefined;
  [Utils.screens.REPORTE_PRODUCTOS]: {start: string; end: string} | undefined;
  [Utils.screens.REPORTE_CATEGORIAS]: {start: string; end: string} | undefined;
  [Utils.screens.REPORTE_GASTOS]: {start: string; end: string} | undefined;
};

const Stack = createStackNavigator<ReportesParamList>();

const ReportesNavigator = () => {
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
        name={Utils.screens.REPORTES_HUB}
        component={ReportesHub}
        options={options}
      />
      <Stack.Screen
        name={Utils.screens.REPORTE_VENTAS}
        component={ReporteVentas}
        options={options}
      />
      <Stack.Screen
        name={Utils.screens.REPORTE_PRODUCTOS}
        component={ReporteProductos}
        options={options}
      />
      <Stack.Screen
        name={Utils.screens.REPORTE_CATEGORIAS}
        component={ReporteCategorias}
        options={options}
      />
      <Stack.Screen
        name={Utils.screens.REPORTE_GASTOS}
        component={ReporteGastos}
        options={options}
      />
    </Stack.Navigator>
  );
};

export default ReportesNavigator;

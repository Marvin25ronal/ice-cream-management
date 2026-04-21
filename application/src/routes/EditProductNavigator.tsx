import { View, Text } from 'react-native';
import React from 'react';
import { Utils } from '../constants/utils';
import {
  StackNavigationOptions,
  createStackNavigator,
} from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { Fonts, FontsSize } from '../constants/Fonts';
import { getHeaderTitle } from '@react-navigation/elements';
import CustomHeader from '../components/UI/CustomHeader';
import EditListProducts from '../pages/EditListProducts';
import EditProduct from '../pages/EditProduct';
import AddProduct from '../pages/AddProduct';
import ToastComponent from '../components/UI/ToastComponent';

export type EditProductParamList = {
  [Utils.screens.EDIT_LIST_PRODUCT]: undefined;
  [Utils.screens.EDIT_PRODUCT]: { productId: number } | undefined;
  [Utils.screens.ADD_PRODUCT]: undefined;
};
const Stack = createStackNavigator<EditProductParamList>();
const EditProductNavigator = () => {
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
          name={Utils.screens.EDIT_LIST_PRODUCT}
          component={EditListProducts}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.EDIT_PRODUCT}
          component={EditProduct}
          options={options}
        />
        <Stack.Screen
          name={Utils.screens.ADD_PRODUCT}
          component={AddProduct}
          options={options}
        />
      </Stack.Navigator>
      <ToastComponent />
    </>
  );
};

export default EditProductNavigator;

import { View, Text, useColorScheme } from 'react-native'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { Provider, useDispatch } from 'react-redux';

import { darkTheme } from './src/styles/Theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/redux/store';
import StackScreensNavigator from './src/routes/StackNavigator';
import { PERMISSIONS, request } from 'react-native-permissions';
import { CreateDatabase } from './src/store/db/Database';



const App = () => {

  // useEffect(() => {
  //   if (isDarkMode) {
  //     dispatch(setTheme(darkTheme))
  //   } else {
  //     dispatch(setTheme(darkTheme))
  //   }
  // }, [])
  useEffect(() => {
    CreateDatabase()
  }, [])

  return (
    <Provider store={store}>
      <NavigationContainer>
        <StackScreensNavigator />
      </NavigationContainer>
    </Provider>
  )
}

export default App
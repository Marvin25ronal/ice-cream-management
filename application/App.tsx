import { View, Text, useColorScheme, StatusBar } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';

import { darkTheme } from './src/styles/Theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/redux/store';
import StackScreensNavigator from './src/routes/StackNavigator';
import { PERMISSIONS, request } from 'react-native-permissions';
import { CreateDatabase } from './src/store/db/Database';
import { useLoading } from './src/shared/LoaderHook';
import DrawerNavigator from './src/routes/DrawerNavigator';
import { migrationService } from './src/database/MigrationService';
import { allMigrations } from './src/migrations';

const App = () => {
  // useEffect(() => {
  //   if (isDarkMode) {
  //     dispatch(setTheme(darkTheme))
  //   } else {
  //     dispatch(setTheme(darkTheme))
  //   }
  // }, [])
  useEffect(() => {
    const initializeApp = async () => {
      StatusBar.setHidden(false);

      // Create database first
      await CreateDatabase();

      // Run critical migrations (marked with forceOnStartup=true) after database is created
      await migrationService.runStartupMigrations(allMigrations);
    };

    initializeApp();
  }, []);

  return (
    <>
      <SafeAreaProvider>
        <Provider store={store}>
          <NavigationContainer>
            <DrawerNavigator />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </>
  );
};

export default App;

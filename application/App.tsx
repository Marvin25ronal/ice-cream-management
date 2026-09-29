import {
  ActivityIndicator,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch } from 'react-redux';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/redux/store';
import { CreateDatabase } from './src/store/db/Database';
import DrawerNavigator from './src/routes/DrawerNavigator';
import { migrationService } from './src/database/MigrationService';
import { allMigrations } from './src/migrations';
import { UserService } from './src/services/UserService';
import { setActiveUser } from './src/store/redux/userReducer';
import UserSelectPage from './src/pages/UserSelectPage';
import { navigationRef } from './src/navigation/navigationRef';

const logo = require('./assets/images/app/logo-sarita-1.png');
const userService = new UserService();

/**
 * Antes de mostrar el Drawer, verifica si ya se seleccionó un usuario hoy
 * (ver UserService.getActiveUserForToday). Si no, obliga a elegir uno
 * (queda registrada la hora de "llegada"); si ya se eligió hoy, se
 * restaura ese usuario y se entra directo a la app.
 */
const AppContent = () => {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);
  const [needsUserSelection, setNeedsUserSelection] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      StatusBar.setHidden(false);

      // Create database first
      await CreateDatabase();

      // Run critical migrations (marked with forceOnStartup=true) after database is created
      await migrationService.runStartupMigrations(allMigrations);

      try {
        const activeUser = await userService.getActiveUserForToday();
        if (activeUser) {
          dispatch(setActiveUser(activeUser));
          setNeedsUserSelection(false);
        } else {
          setNeedsUserSelection(true);
        }
      } catch (e) {
        console.error('Error verificando usuario activo:', e);
        setNeedsUserSelection(true);
      } finally {
        setReady(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={logo} style={styles.loadingLogo} resizeMode="contain" />
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (needsUserSelection) {
    return (
      <UserSelectPage
        mandatory
        onSelected={() => setNeedsUserSelection(false)}
      />
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <DrawerNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    gap: 24,
  },
  loadingLogo: {
    width: 140,
    height: 140,
  },
});

import React, { useEffect } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation/navigation';
import { AuthProvider } from './src/store/authContext';
import { theme } from './src/theme/theme';
import './src/i18n/i18n';

import { initDB } from './src/db/db';

export default function App() {

  useEffect(() => {
    console.log("Initializing local SQLite DB...");
    initDB();                    // 🔥 IMPORTANT 🔥
  }, []);

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}

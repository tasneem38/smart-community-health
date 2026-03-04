import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#001F3F',    // Midnight Blue
    secondary: '#FFD700',  // Soft Gold
    background: '#F0F4F8', // Off-White Background
    surface: '#ffffff',
    error: '#B00020',
  }
};

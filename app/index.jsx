import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigation/RootNavigator';
import { ThemeProvider } from './ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
       <RootNavigator />
    </ThemeProvider>
     
  );
}



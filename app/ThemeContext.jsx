import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

export const ThemeContext = createContext();

const lightTheme = {
  mode: 'light',
  background: '#e6f9ef',
  text: '#000',
  inputBackground: '#fff',
  border: '#ccc',
  primary: '#004d00',
  placeholder: '#888',
  icon: '#000',
  card: '#e9f8e7',
  subtext: '#444444',
  statusBarStyle: 'dark-content',
  weatherBoxBackground:  '#fff3e0',
  imagePlaceholderBackground: '#a1a1a1'
};

const darkTheme = {
  mode: 'dark',
  background: '#0D0D0D',
  text: '#fff',
  inputBackground: '#1e1e1e',
  border: '#444',
  primary: '#004d00',
  placeholder: '#aaa',
  icon: '#fff',
  card: '#1A1A1A',
  subtext: '#bbbbbb',
  statusBarStyle: 'light-content',
  weatherBoxBackground:  '#004d00',
  imagePlaceholderBackground: '#1A1A1A'
};

export const ThemeProvider = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [colorScheme]);

  const toggleTheme = () => {
    setTheme(prev =>
      prev.mode === 'dark' ? lightTheme : darkTheme
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

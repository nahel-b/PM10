import React, { createContext, useState, useContext, useEffect } from 'react';
import {Colors} from '../config/Colors';
// Créer un contexte pour le thème
const ThemeContext = createContext('light');
import AsyncStorage from '@react-native-async-storage/async-storage';


export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light'); 
  const [theme,setTheme] = useState(Colors.light);

  


  const toggleTheme = () => {
    setThemeName((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    setTheme((prevTheme) => (prevTheme === Colors.light ? Colors.dark : Colors.light));
  };

  const changeTheme = (newTheme) => 
    {
      setThemeName(newTheme)
      setTheme((prevTheme) => (newTheme === "dark" ? Colors.dark : Colors.light));
      AsyncStorage.setItem("themeName",newTheme)
    }
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeName, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook pour utiliser le contexte du thème
export const useTheme = () => {
  return useContext(ThemeContext);
};
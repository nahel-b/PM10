import React, { createContext, useState, useContext } from 'react';
import {Colors} from '../Colors';
// Créer un contexte pour le thème
const ThemeContext = createContext('light');

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light'); 
  const [theme,setTheme] = useState(Colors.light);

  const toggleTheme = () => {
    setThemeName((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    setTheme((prevTheme) => (prevTheme === Colors.light ? Colors.dark : Colors.light));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook pour utiliser le contexte du thème
export const useTheme = () => {
  return useContext(ThemeContext);
};
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './context/ThemeContext';
import AppNavigator from './AppNavigator';
import { API_URL } from './config';

export default function App() {
  const [isConnected, setIsConnected] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier la connexion Internet
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert('Connexion Internet', 'Vous n\'êtes pas connecté à Internet. Veuillez vous connecter.');
      }
    });

    // Vérifier si l'utilisateur est authentifié
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/checktoken`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          if (data === "true") {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <AppNavigator isAuthenticated={isAuthenticated} />
    </ThemeProvider>
  );
}

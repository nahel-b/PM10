import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Button } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './App/context/ThemeContext';
import { RestaurantProvider, useRestaurant } from './App/context/RestaurantsContext';
import AppNavigator from './App/AppNavigator';
import { API_URL } from './App/config/Config';
import { ToastNotif, ToastObj, ToastHide } from './App/Utils';
import { getAllRestaurants,getAllTypeRestaurants } from './App/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const Principal = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(true);
  const { theme, changeTheme } = useTheme();
  const { restaurants, setRestaurants, setTypeRestaurants } = useRestaurant();


  const loadTheme = async () => {
    const themeName = await AsyncStorage.getItem("themeName");
    if (themeName) {
      changeTheme(themeName);
      console.log(themeName);
    }
  };

  const loadAllRestaurants = async () => {
    try {
      await loadTheme();
      ToastNotif("Récupération des restaurants...", "loading-cricle", { button_background: theme.background, text: theme.text }, theme.text, 10000, "bottom", true);
      
      const restaurants = await getAllRestaurants();
      setRestaurants(restaurants); 
      const typeRestaurants = await getAllTypeRestaurants();
      setTypeRestaurants(typeRestaurants);
      ToastHide(); 
      setIsBackendConnected(true);

    } catch (error) {
      console.error('Erreur lors de la récupération des restaurants:', error);
      ToastNotif("Erreur lors de la récupération des restaurants", "times-circle", { button_background: "red", text: "white" }, "white", 3000);
      //setIsBackendConnected(false);
    }
  };

  const checkAuthentication = async () => {
    await loadTheme();
    loadAllRestaurants();

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
        setIsBackendConnected(false);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    

    checkAuthentication();

    return () => {
      unsubscribe(); 
    };
  }, []);

  const handleRetry = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type', state.isConnected);
      // setIsConnected(state.isConnected);

      //TODO
      setIsConnected(true);
    });
    unsubscribe();
    checkAuthentication();
  };

  if (!isConnected) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text, fontSize: 18 }}>Pas de connexion Internet.</Text>
        <Button title="Réessayer" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  if (!isBackendConnected) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.text, fontSize: 18 }}>Impossible de se connecter au serveur.</Text>
        <Button title="Réessayer" onPress={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator isAuthenticated={isAuthenticated} />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <RestaurantProvider>
        <Principal />
        <ToastObj /> 
      </RestaurantProvider>
    </ThemeProvider>
  );
}

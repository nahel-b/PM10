import React, { useState, useEffect } from 'react';
import { Alert, View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider,useTheme } from './context/ThemeContext';
import { RestaurantProvider,useRestaurant } from './context/RestaurantsContext';
import AppNavigator from './AppNavigator';
import { API_URL } from './config';

import { ToastNotif, ToastObj, ToastHide } from './Utils';
import { getAllRestaurants } from './api';
import { SafeAreaView } from 'react-native-safe-area-context';

const Principal = ({ navigation }) => {
  const [isConnected, setIsConnected] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { theme } = useTheme();
  const { restaurants, setRestaurants} = useRestaurant();

  useEffect(() => {
    // Vérifier la connexion Internet
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        //Alert.alert('Connexion Internet', 'Vous n\'êtes pas connecté à Internet. Veuillez vous connecter.');
        
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

     // Fonction pour récupérer les restaurants
     const loadAllRestaurants = async () => {
      try {
        ToastNotif("Récupération des restaurants...", "loading-cricle", { button_background: theme.background, text: theme.text }, theme.text, 10000,"top",true);
        const response = await getAllRestaurants();
        // const data = await response.json();
        setRestaurants(response); 
        ToastHide(); 
        // Afficher une toast
        // ToastNotif("Restaurants récupérés avec succès", "check-circle", { button_background: "green", text: "white" }, "white", 3000);
      } catch (error) {
        console.error('Erreur lors de la récupération des restaurants:', error);
        ToastNotif("Erreur lors de la récupération des restaurants", "times-circle", { button_background: "red", text: "white" }, "white", 3000);
      }
    };

    loadAllRestaurants();

    checkAuthentication();

    return () => {
      unsubscribe(); 
    };
  }, []);

  return (
    <View style={{flex : 1}}>
      <AppNavigator  isAuthenticated={isAuthenticated} />
      <ToastObj/> 
    </View>
  );
}


export default function App()
{

  return (
    <ThemeProvider>
      <RestaurantProvider>
        <Principal/>
      </RestaurantProvider>
    </ThemeProvider>
  );
}



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
  const [isBackendConnected, setIsBackendConnected] = useState(true); // Par défaut à false pour initialement vérifier la connexion
  const [attente, setAttente] = useState(0);
  const { theme, changeTheme } = useTheme();

  const loadTheme = async () => {
    const themeName = await AsyncStorage.getItem("themeName");
    if (themeName) {
      changeTheme(themeName);
      console.log(themeName);
    }
  };

  useEffect(() => {
    loadTheme();
    const interval = setInterval(() => {
      checkBackendConnection(interval); // Passe l'intervalle pour pouvoir l'arrêter
      setAttente(prevAttente => prevAttente + 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const checkBackendConnection = async (interval) => {
    console.log('Checking backend connection...');
    try {
      const response = await fetch(`${API_URL}/status`);
      const data = await response.json();

      if (data.ok) {
        setIsBackendConnected(true);
        clearInterval(interval); // Arrête l'intervalle si connecté
      } else {
        setIsBackendConnected(false);
      }
    } catch (error) {
      setIsBackendConnected(false);
    }
  };

  if (!isBackendConnected) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: theme.text, fontSize: 18, textAlign: 'center', fontFamily: 'Inter-Bold', marginHorizontal: 20 }}>
          Le Backend charge, faut attendre un peu...
        </Text>
        {attente > 5 && (
          <Text style={{ marginTop: 20, color: theme.dark_gray, textAlign: 'center', fontFamily: 'Inter-Medium', marginHorizontal: 30 }}>
            Je suis pauvre dcp le serveur est gratuit il mets du temps à démarrer
          </Text>
        )}
        <Text style={{ color: theme.blue, marginTop: 30, fontSize: 20, textAlign: 'center', fontFamily: 'Inter-Bold' }}>
          {attente}s
        </Text>

        {[
          "Ca prends des fois 50s",
          "C'est long",
          "Je te fais patienter",
          "La patience est la clef du succes",
          "Je mets des phrases au hasard sur mon ecran",
          "Tu penses aux autres tous les jours mais est ce que tu penses a toi ?",
          "Ca fait 40s courage tu y es presque",
          "Sinon tu peux m'acheter un server stv",
          "Sur une échelle de 1 à 10 quelle est ton type de meuf ???"
        ].map((txt, index) => (
          attente > (index * 5) + 10 && (
            <Text key={index} style={{ marginTop: 15, color: theme.gray, textAlign: 'center', fontFamily: 'Inter-Medium', marginHorizontal: 30 }}>
              {txt}
            </Text>
          )
        ))}
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator isAuthenticated={true} />
    </View>
  );
};

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

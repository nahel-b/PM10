import React, { useState, useEffect,useContext } from 'react';
import { Alert, View, Text, Button } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, useTheme } from './App/context/ThemeContext';
import { RestaurantProvider, useRestaurant } from './App/context/RestaurantsContext';
import { AuthProvider,AuthContext } from './App/context/AuthProvider';
import { BackendProvider, BackendContext, } from './App/context/BackendProvider';
import AppNavigator from './App/AppNavigator';
import { API_URL } from './App/config/Config';
import { ToastNotif, ToastObj, ToastHide } from './App/Utils';
import { getAllRestaurants,getAllTypeRestaurants } from './App/Api';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthScreen from './App/AuthScreen';

const WaitBackendScreen = () => {
  const [attente, setAttente] = useState(0);

  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setAttente((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }
  ,[]);



  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Text adjustsFontSizeToFit numberOfLines={1} style={{ color: theme.text, fontSize: 18, textAlign: 'center', fontFamily: 'Inter-Bold', marginHorizontal: 20 }}>
          Le Backend charge, faut attendre un peu...
        </Text>
        {attente >= 5 && (
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
          "Sur une échelle de 1 à 10 quelle est ton type de meuf ???",
          "J'ai plus d'inspi juste attends"
        ].map((txt, index) => (
          attente >= (index * 5) + 10 && (
            <Text key={index} style={{ marginTop: 15, color: theme.gray, textAlign: 'center', fontFamily: 'Inter-Medium', marginHorizontal: 30 }}>
              {txt}
            </Text>
          )
        ))}
      </SafeAreaView>
  )
};

const Principal = ({ }) => {


  const { isAuthenticated } = useContext(AuthContext);
  const { isBackendConnected,isfirstCheck } = useContext(BackendContext);
  
  


  if (!isBackendConnected && !isfirstCheck) {
    return (
      <WaitBackendScreen />
    );
  }

  if(!isAuthenticated){
    return(
      <AuthScreen/>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <AppNavigator />
    </View>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RestaurantProvider>
        <BackendProvider>
          <AuthProvider>
            <Principal />
            <ToastObj /> 
          </AuthProvider>
        </BackendProvider>
      </RestaurantProvider>
    </ThemeProvider>
  );
}

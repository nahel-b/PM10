import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MapView from './MapView';
import AuthScreen from './AuthScreen';
import AvisView from './Avis/AvisView';
import ReglageView from './ReglageView';
import NewAvisView from './Avis/NewAvisView';
import NewRestaurantView from './NewRestaurantView'
import AdminView from './AdminView'

import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import 'react-native-reanimated';

const Stack = createStackNavigator();


export default function AppNavigator({  }) {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
            
          <Stack.Screen
              name="MapView" 
              component={MapView} 
              options={{
                ...TransitionPresets.ModalSlideFromBottomIOS, // Applique l'effet modal
               
              }}
            />
            <Stack.Screen
              name="AvisView"
              component={AvisView}
              options={{
                ...TransitionPresets.ModalPresentationIOS, // Applique l'effet modal
               
              }}
            />
            <Stack.Screen
              name="ReglageView"
              component={ReglageView}
            />
            {/* Modal navigation for NewAvisView */}
            <Stack.Screen
              name="NewAvisView"
              component={NewAvisView}
              options={{
                ...TransitionPresets.ModalPresentationIOS, // Applique l'effet modal
               
              }}
            />
            <Stack.Screen
              name="NewRestaurantView"
              component={NewRestaurantView}
              options={{
                ...TransitionPresets.ModalPresentationIOS, // Applique l'effet modal
               
              }}
            />

            <Stack.Screen
            name="AdminView"
            component={AdminView}
            options={{
              ...TransitionPresets.ModalPresentationIOS, // Applique l'effet modal
             
            }}
          />
        
          <Stack.Screen name="Auth" component={AuthScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

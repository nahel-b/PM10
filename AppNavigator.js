import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MapView from './MapView';
import AuthScreen from './AuthScreen'; // Remplace AuthModal par un écran de navigation
import AvisView from './AvisView';
import ReglageView from './ReglageView';
const Stack = createStackNavigator();

export default function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...TransitionPresets.ModalSlideFromBottomIOS, // Effet de transition modal
        }}
      >
        {isAuthenticated ? (
          // Pass the restaurants as initialParams to the MapView screen
          <>
          <Stack.Screen 
            name="MapView" 
            component={MapView} 
          />
          <Stack.Screen
            name='AvisView'
            component={AvisView}
            
            />
            <Stack.Screen
            name='ReglageView'
            component={ReglageView}
            
            />
            </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

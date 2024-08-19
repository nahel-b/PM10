import React from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import MapView from './MapView';
import AuthScreen from './AuthScreen';
import AvisView from './AvisView';
import ReglageView from './ReglageView';
import NewAvisView from './NewAvisView';

const Stack = createStackNavigator();

export default function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen 
              name="MapView" 
              component={MapView} 
            />
            <Stack.Screen
              name="AvisView"
              component={AvisView}
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
                presentation: 'modal', // Définit cette screen comme un modal
                ...TransitionPresets.ModalSlideFromBottomIOS, // Applique l'effet modal
                cardStyle: { backgroundColor: 'transparent' }, // Fond transparent
                cardOverlayEnabled: true, // Active l'overlay sombre
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
